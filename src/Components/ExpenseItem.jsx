import React from 'react';
import { Pencil, X, Circle } from 'lucide-react';

const ExpenseItem = ({ expense, onEdit, onDelete }) => {
  const date = new Date(expense.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const unsynced = !expense.synced;

  return (
    <div
      className={`mb-2 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 transition hover:shadow-md ${
        unsynced
          ? 'border-l-4 border-l-orange-400 bg-orange-50/50 ring-orange-100'
          : 'border-l-4 border-l-transparent ring-slate-200'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-800">
              {expense.title}
            </span>
            {unsynced && (
              <Circle
                size={10}
                fill="currentColor"
                className="animate-pulse text-orange-500"
                aria-label="Pending sync"
              />
            )}
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">
              {expense.category}
            </span>
            <span>{date}</span>
          </div>

          {expense.notes && (
            <div className="mt-1 truncate text-xs italic text-slate-400">
              {expense.notes}
            </div>
          )}
        </div>

        <div className="whitespace-nowrap text-base font-bold text-slate-800">
          ₹{parseFloat(expense.amount).toFixed(2)}
        </div>
      </div>

      <div className="ml-2 flex gap-1">
        <button
          onClick={() => onEdit(expense)}
          title="Edit"
          className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          title="Delete"
          className="rounded-md p-2 text-slate-500 transition hover:bg-red-100 hover:text-red-700"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ExpenseItem;