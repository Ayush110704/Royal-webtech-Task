const KEYS = {
  EXPENSES: 'expense_manager_expenses',
  SYNC_QUEUE: 'expense_manager_sync_queue',
  CONFLICTS: 'expense_manager_conflicts',
  DEVICE_ID: 'expense_manager_device_id',
};

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

// EXPENSES 

export const getExpenses = () => {
  const parsed = safeParse(localStorage.getItem(KEYS.EXPENSES), []);
  return Array.isArray(parsed) ? parsed : [];
};

export const saveExpenses = (expenses) => {
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  window.dispatchEvent(new Event('expenses-updated'));
};

export const putExpense = (expense) => {
  const all = getExpenses();
  const idx = all.findIndex((e) => e.id === expense.id);
  if (idx >= 0) all[idx] = expense;
  else all.push(expense);
  saveExpenses(all);
  return expense;
};

export const getExpense = (id) => {
  return getExpenses().find((e) => e.id === id) || null;
};

export const deleteExpenseById = (id) => {
  const all = getExpenses().filter((e) => e.id !== id);
  saveExpenses(all);
};

// SYNC QUEUE 

export const getSyncQueue = () => {
  const parsed = safeParse(localStorage.getItem(KEYS.SYNC_QUEUE), []);
  return Array.isArray(parsed) ? parsed : [];
};

export const saveSyncQueue = (queue) => {
  localStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
};

export const queueOperation = (operation) => {
  const queue = getSyncQueue();
  const op = {
    ...operation,
    queueId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: operation.timestamp || Date.now(),
  };
  queue.push(op);
  saveSyncQueue(queue);
  return op;
};

export const removeQueuedOperation = (queueId) => {
  const queue = getSyncQueue().filter((op) => op.queueId !== queueId);
  saveSyncQueue(queue);
};

export const clearSyncQueue = () => {
  saveSyncQueue([]);
};

// CONFLICTS 

export const getConflicts = () => {
  const parsed = safeParse(localStorage.getItem(KEYS.CONFLICTS), []);
  return Array.isArray(parsed) ? parsed : [];
};

export const saveConflicts = (conflicts) => {
  localStorage.setItem(KEYS.CONFLICTS, JSON.stringify(conflicts));
};

export const addConflict = (conflict) => {
  const conflicts = getConflicts();
  conflicts.push({
    ...conflict,
    id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
  saveConflicts(conflicts);
};

export const clearConflicts = () => {
  saveConflicts([]);
};
 

export const getDeviceId = () => {
  let id = localStorage.getItem(KEYS.DEVICE_ID);
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(KEYS.DEVICE_ID, id);
  }
  return id;
};

export { KEYS };