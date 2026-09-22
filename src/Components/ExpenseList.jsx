import React, { useMemo } from 'react';
import { Inbox } from 'lucide-react';
import ExpenseItem from './ExpenseItem';

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  const grouped = useMemo(() => {
    const groups = {};
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [expenses]);

  const formatMonth = (key) => {
    const [year, month] = key.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const monthTotal = (items) =>
    items.reduce((s, e) => s + parseFloat(e.amount), 0);

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl bg-white py-12 text-center shadow-sm ring-1 ring-slate-200">
        <Inbox
          size={48}
          className="mx-auto mb-3 text-slate-300"
          strokeWidth={1.5}
        />
        <p className="text-slate-700">No expenses found</p>
        <span className="text-sm text-slate-400">
          Try adjusting filters or add a new expense
        </span>
      </div>
    );
  }

  return (
    <div>
      {Object.keys(grouped)
        .sort((a, b) => b.localeCompare(a))
        .map((key) => (
          <div key={key} className="mb-6">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {formatMonth(key)}
              </h3>
              <span className="text-sm font-bold text-indigo-600">
                ₹{monthTotal(grouped[key]).toFixed(2)}
              </span>
            </div>

            {grouped[key].map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ))}
    </div>
  );
};

export default ExpenseList;