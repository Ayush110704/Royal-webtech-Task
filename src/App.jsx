import React, { useState, useMemo } from 'react';
import { Wallet, FlaskConical, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from './Hooks/useOnlineStatus';
import { useExpenses } from './Hooks/useExpenses';
import { useSync } from './Hooks/useSync';
import ExpenseForm from './Components/ExpenseForm';
import ExpenseList from './Components/ExpenseList';
import SearchFilter from './Components/SearchFilter';
import ConnectionStatus from './Components/ConnectionStatus';
import SyncStatus from './Components/SyncStatus';
import { mockApi, simulateServerEdit } from './utils/mockApi';

const App = () => {
  const isOnline = useOnlineStatus();
  const {
    expenses,
    loading,
    pendingCount,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();
  const sync = useSync(isOnline, pendingCount);

  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.notes || '').toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    if (category !== 'All') {
      result = result.filter((e) => e.category === category);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return parseFloat(b.amount) - parseFloat(a.amount);
        case 'amount-asc':
          return parseFloat(a.amount) - parseFloat(b.amount);
        case 'date-desc':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    return result;
  }, [expenses, search, category, sortBy]);

  const totals = useMemo(() => {
    const total = filteredExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
    const byCategory = filteredExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
      return acc;
    }, {});
    return { total, byCategory };
  }, [filteredExpenses]);

  const handleSubmit = async (data) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, data);
      setEditingExpense(null);
    } else {
      await addExpense(data);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const handleSimulateRemoteEdit = async () => {
    const serverExpenses = await mockApi.getAll();
    if (!serverExpenses.length) {
      alert('Add and sync an expense first, then simulate a remote edit.');
      return;
    }
    const target = serverExpenses[0];
    simulateServerEdit(target.id, {
      amount: (parseFloat(target.amount) + 5).toFixed(2),
      title: target.title + ' (remote)',
    });
    alert(
      `Server now has updated "${target.title}".\nNow edit that same expense locally and sync to see conflict resolution.`
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {/* Header */}
      <header className="bg-black text-white shadow-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Wallet size={22} />
            Expense Manager
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulateRemoteEdit}
              title="Simulate a concurrent edit from another device"
              className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition hover:bg-white/25"
            >
              <FlaskConical size={14} />
              Simulate Conflict
            </button>

            {isOnline && pendingCount > 0 && !sync.syncing && (
              <button
                onClick={() => sync.syncPendingOperations()}
                title="Manually sync pending changes"
                className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition hover:bg-white/25"
              >
                <RefreshCw size={14} />
                Sync Now
              </button>
            )}

            <ConnectionStatus
              isOnline={isOnline}
              pendingCount={pendingCount}
              syncing={sync.syncing}
            />
          </div>
        </div>
      </header>

      {/* Sync banner */}
      <SyncStatus
        syncing={sync.syncing}
        lastSync={sync.lastSync}
        pendingCount={pendingCount}
        conflicts={sync.conflicts}
        onDismiss={sync.dismissConflicts}
      />

      {/* Main */}
      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[380px_1fr]">
        <aside className="flex flex-col gap-6">
          <ExpenseForm
            onSubmit={handleSubmit}
            editingExpense={editingExpense}
            onCancel={() => setEditingExpense(null)}
          />

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="mb-4 text-base font-semibold text-slate-800">
              Summary
            </h3>

            <div className="mb-4 flex items-center justify-between rounded-lg bg-black px-4 py-3 text-lg font-semibold text-white">
  <span className="text-sm font-medium opacity-90">Total</span>
  <strong>₹{totals.total.toFixed(2)}</strong>
</div>

            <div className="space-y-1">
              {Object.entries(totals.byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => (
                  <div
                    key={cat}
                    className="flex justify-between border-b border-dashed border-slate-200 py-1 text-sm text-slate-600 last:border-b-0"
                  >
                    <span>{cat}</span>
                    <span className="font-medium">₹{amt.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <SearchFilter
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              Loading expenses...
            </div>
          ) : (
            <ExpenseList
              expenses={filteredExpenses}
              onEdit={setEditingExpense}
              onDelete={handleDelete}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default App;