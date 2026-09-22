import React from 'react';
import { AlertTriangle, Check, Loader2, X } from 'lucide-react';

const SyncStatus = ({ syncing, lastSync, pendingCount, conflicts, onDismiss }) => {
  if (!conflicts.length && !syncing && !lastSync) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
      {syncing && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border-l-4 border-blue-400 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <Loader2 size={16} className="animate-spin" />
          Syncing {pendingCount} pending {pendingCount === 1 ? 'item' : 'items'}...
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="mt-4 rounded-lg border-l-4 border-orange-400 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-2">
              <AlertTriangle size={16} />
              {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} detected
            </span>
            <button
              onClick={onDismiss}
              className="rounded p-1 transition hover:bg-orange-100"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {conflicts.map((c, i) => (
              <div key={i} className="rounded-md bg-white/70 p-3 text-xs">
                <div className="mb-1 font-semibold text-orange-900">
                  {c.local.title}
                </div>
                <div className="flex flex-col gap-0.5 text-orange-700">
                  <span>
                    Local: ₹{c.local.amount} @{' '}
                    {new Date(c.local.updatedAt).toLocaleTimeString()}
                  </span>
                  <span>
                    Server: ₹{c.server.amount} @{' '}
                    {new Date(c.server.updatedAt).toLocaleTimeString()}
                  </span>
                  <span className="font-semibold text-green-700">
                    Resolved: ₹{c.resolved.amount} ({c.resolved.resolution})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!syncing && lastSync && pendingCount === 0 && conflicts.length === 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border-l-4 border-green-400 bg-green-50 px-4 py-3 text-sm text-green-700">
          <Check size={16} />
          All changes synced {new Date(lastSync).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default SyncStatus;