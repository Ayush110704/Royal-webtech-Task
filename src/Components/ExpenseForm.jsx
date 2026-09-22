import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
];

const ExpenseForm = ({ onSubmit, editingExpense, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingExpense) {
      setForm({
        title: editingExpense.title,
        amount: String(editingExpense.amount),
        category: editingExpense.category,
        date: editingExpense.date,
        notes: editingExpense.notes || '',
      });
    } else {
      setForm({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [editingExpense]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      errs.amount = 'Valid amount required';
    }
    if (!form.date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
    if (!editingExpense) {
      setForm({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: null }));
  };

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-400/30 ${
      errors[field]
        ? 'border-red-400 focus:border-red-400'
        : 'border-slate-300 focus:border-indigo-400'
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        {editingExpense ? 'Edit Expense' : 'Add Expense'}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={handleChange('title')}
            placeholder="e.g., Lunch"
            className={inputClass('title')}
          />
          {errors.title && (
            <span className="mt-1 block text-xs text-red-500">{errors.title}</span>
          )}
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={handleChange('amount')}
            placeholder="0.00"
            className={inputClass('amount')}
          />
          {errors.amount && (
            <span className="mt-1 block text-xs text-red-500">{errors.amount}</span>
          )}
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Category
          </label>
          <select
            value={form.category}
            onChange={handleChange('category')}
            className={inputClass('category')}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={handleChange('date')}
            className={inputClass('date')}
          />
          {errors.date && (
            <span className="mt-1 block text-xs text-red-500">{errors.date}</span>
          )}
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Notes (optional)
        </label>
        <textarea
          value={form.notes}
          onChange={handleChange('notes')}
          placeholder="Additional details..."
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
        />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
        >
          {editingExpense ? 'Update' : 'Add Expense'}
        </button>
        {editingExpense && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;