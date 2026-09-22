import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getSyncQueue,
  removeQueuedOperation,
  putExpense,
  addConflict,
  getConflicts,
  clearConflicts,
  getExpenses,
  clearSyncQueue,
} from '../Storage/localStorage';
import { mockApi } from '../utils/mockApi';
import { detectConflict, resolveConflict } from '../utils/conflictResolver';

export const useSync = (isOnline, pendingCount = 0) => {
  const [syncState, setSyncState] = useState({
    syncing: false,
    lastSync: null,
    conflicts: [],
    error: null,
  });
  const syncingRef = useRef(false);

  const refreshConflicts = useCallback(() => {
    setSyncState((s) => ({ ...s, conflicts: getConflicts() }));
  }, []);

  const syncPendingOperations = useCallback(
    async (conflictStrategy = 'last-write-update') => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      setSyncState((s) => ({ ...s, syncing: true, error: null }));

      try {
        const operations = getSyncQueue();
        console.log(' Sync started. Queue size:', operations.length);

        for (const op of operations) {
          try {
            if (op.type === 'create') {
              const server = await mockApi.get(op.expenseId);
              if (server) {
                const resolved = resolveConflict(op.data, server, conflictStrategy);
                addConflict({ local: op.data, server, resolved });
                const serverResult = await mockApi.update(resolved);
                putExpense({
                  ...resolved,
                  synced: true,
                  syncedVersion: serverResult.version,
                  version: serverResult.version,
                  updatedAt: serverResult.updatedAt,
                });
              } else {
                const serverResult = await mockApi.create(op.data);
                putExpense({
                  ...op.data,
                  synced: true,
                  syncedVersion: serverResult.version,
                  version: serverResult.version,
                  updatedAt: serverResult.updatedAt,
                });
              }
            } else if (op.type === 'update') {
              const server = await mockApi.get(op.expenseId);
              if (server && detectConflict(op.data, server)) {
                const resolved = resolveConflict(op.data, server, conflictStrategy);
                addConflict({ local: op.data, server, resolved });
                const serverResult = await mockApi.update(resolved);
                putExpense({
                  ...resolved,
                  synced: true,
                  syncedVersion: serverResult.version,
                  version: serverResult.version,
                  updatedAt: serverResult.updatedAt,
                });
              } else if (server) {
                const serverResult = await mockApi.update(op.data);
                putExpense({
                  ...op.data,
                  synced: true,
                  syncedVersion: serverResult.version,
                  version: serverResult.version,
                  updatedAt: serverResult.updatedAt,
                });
              }
            } else if (op.type === 'delete') {
              await mockApi.delete(op.expenseId);
            }

            removeQueuedOperation(op.queueId);
            console.log('✅ Op synced & removed:', op.queueId);
          } catch (err) {
            console.error('❌ Sync operation failed:', op, err);
          }
        }

        // 🧹 Safety net — force-clear stale queue if everything is synced
        const remaining = getSyncQueue();
        const allExpenses = getExpenses();
        const unsynced = allExpenses.filter((e) => !e.synced);
        if (unsynced.length === 0 && remaining.length > 0) {
          console.warn('🧹 Force-clearing stale queue:', remaining.length);
          clearSyncQueue();
        }

        refreshConflicts();
        setSyncState((s) => ({ ...s, syncing: false, lastSync: Date.now() }));
        window.dispatchEvent(new Event('expenses-updated'));
        console.log('✅ Sync complete. Remaining:', getSyncQueue().length);
      } catch (err) {
        console.error('Sync failed:', err);
        setSyncState((s) => ({ ...s, syncing: false, error: err.message }));
      } finally {
        syncingRef.current = false;
      }
    },
    [refreshConflicts]
  );
 
  useEffect(() => {
    refreshConflicts();
    if (!isOnline) return;
    if (pendingCount === 0) return;

    if (syncingRef.current) {
      const t = setTimeout(() => {
        if (!syncingRef.current && getSyncQueue().length > 0) {
          syncPendingOperations();
        }
      }, 500);
      return () => clearTimeout(t);
    }

    syncPendingOperations(); 
  }, [isOnline, pendingCount]);

  const dismissConflicts = () => {
    clearConflicts();
    setSyncState((s) => ({ ...s, conflicts: [] }));
  };

  return {
    ...syncState,
    syncPendingOperations,
    dismissConflicts,
  };
};