const REMOTE_KEY = 'mock_server_expenses_db';

const getRemoteDB = () => {
  try {
    return JSON.parse(localStorage.getItem(REMOTE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveRemoteDB = (data) => {
  localStorage.setItem(REMOTE_KEY, JSON.stringify(data));
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const mockApi = {
  async getAll() {
    await delay(300);
    return Object.values(getRemoteDB());
  },

  async get(id) {
    await delay(200);
    const db = getRemoteDB();
    return db[id] || null;
  },

  async create(expense) {
    await delay(300);
    const db = getRemoteDB();
    const serverExpense = {
      ...expense,
      version: 1,
      updatedAt: Date.now(),
    };
    delete serverExpense.synced;
    delete serverExpense.syncedVersion;
    db[expense.id] = serverExpense;
    saveRemoteDB(db);
    return serverExpense;
  },

  async update(expense) {
    await delay(300);
    const db = getRemoteDB();
    const existing = db[expense.id];
    if (!existing) throw new Error('Expense not found on server');
    const updated = {
      ...expense,
      version: (existing.version || 1) + 1,
      updatedAt: Date.now(),
    };
    delete updated.synced;
    delete updated.syncedVersion;
    db[expense.id] = updated;
    saveRemoteDB(db);
    return updated;
  },

  async delete(id) {
    await delay(300);
    const db = getRemoteDB();
    delete db[id];
    saveRemoteDB(db);
    return { success: true };
  },
};
 
export const simulateServerEdit = (id, changes) => {
  const db = getRemoteDB();
  if (db[id]) {
    db[id] = {
      ...db[id],
      ...changes,
      version: (db[id].version || 1) + 1,
      updatedAt: Date.now(),
    };
    saveRemoteDB(db);
  }
};