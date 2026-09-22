import { useState, useEffect, useCallback } from 'react';
import {
  getExpenses,
  putExpense,
  deleteExpenseById,
  queueOperation,
  getSyncQueue,
} from '../Storage/localStorage';

const generateId = () =>
  `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(() => {
    const all = getExpenses();
    setExpenses([...all].sort((a, b) => new Date(b.date) - new Date(a.date)));
    setPendingCount(getSyncQueue().length);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadExpenses();

    const handler = () => loadExpenses();
    window.addEventListener('expenses-updated', handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('expenses-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, [loadExpenses]);

  const addExpense = useCallback(
    async (data) => {
      const now = Date.now();
      const expense = {
        id: generateId(),
        ...data,
        amount: parseFloat(data.amount),
        createdAt: now,
        updatedAt: now,
        synced: false,
        syncedVersion: 0,
        version: 1,
      };

      putExpense(expense);
      queueOperation({
        type: 'create',
        expenseId: expense.id,
        data: expense,
      });

      loadExpenses();
      return expense;
    },
    [loadExpenses]
  );

  const updateExpense = useCallback(
    async (id, data) => {
      const existing = getExpenses().find((e) => e.id === id);
      if (!existing) return null;

      const updated = {
        ...existing,
        ...data,
        amount:
          data.amount !== undefined ? parseFloat(data.amount) : existing.amount,
        updatedAt: Date.now(),
        synced: false,
        version: (existing.version || 1) + 1,
      };

      putExpense(updated);
      queueOperation({
        type: 'update',
        expenseId: updated.id,
        data: updated,
      });

      loadExpenses();
      return updated;
    },
    [loadExpenses]
  );

  const deleteExpense = useCallback(
    async (id) => {
      deleteExpenseById(id);
      queueOperation({
        type: 'delete',
        expenseId: id,
        data: { id },
      });
      loadExpenses();
    },
    [loadExpenses]
  );

  const replaceExpense = useCallback(
    (expense) => {
      putExpense(expense);
      loadExpenses();
    },
    [loadExpenses]
  );

  return {
    expenses,
    loading,
    pendingCount,
    addExpense,
    updateExpense,
    deleteExpense,
    replaceExpense,
    reload: loadExpenses,
  };
};