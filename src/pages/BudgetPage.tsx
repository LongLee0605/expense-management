import { useState, FormEvent } from 'react';
import { useTransactions, useBudgets } from '../hooks';
import { Button, Card } from '../components';
import { useToast } from '../contexts/ToastContext';
import { Budget, Currency } from '../types';
import {
  EXPENSE_CATEGORIES,
  getCurrencyList,
  generateId,
  getTodayDate,
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  getCurrencyPlaceholder,
  CURRENCIES,
} from '../utils';

const BudgetPage = () => {
  const { transactions } = useTransactions();
  const { budgets, addBudget, deleteBudget, getBudgetStatus } = useBudgets(transactions);
  const { showError, showSuccess } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    currency: 'VND' as Currency,
    period: 'monthly' as 'monthly' | 'yearly',
    startDate: getTodayDate(),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      showError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const budget: Budget = {
      id: generateId(),
      ...formData,
      amount: parseCurrencyInput(formData.amount, formData.currency),
    };

    addBudget(budget);
    setShowForm(false);
    setFormData({
      category: '',
      amount: '',
      currency: 'VND',
      period: 'monthly',
      startDate: getTodayDate(),
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý ngân sách</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hủy' : '+ Thêm ngân sách'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-xl font-semibold mb-4">Thêm ngân sách mới</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn danh mục</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền * ({formData.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {CURRENCIES[formData.currency]?.symbol || formData.currency}
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.amount}
                    onChange={(e) => {
                      const formatted = formatCurrencyInput(e.target.value, formData.currency);
                      setFormData({ ...formData, amount: formatted });
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={getCurrencyPlaceholder(formData.currency)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại tiền *
                </label>
                <select
                  required
                  value={formData.currency}
                  onChange={(e) => {
                    const newCurrency = e.target.value as Currency;
                    if (formData.amount) {
                      const currentAmount = parseCurrencyInput(formData.amount, formData.currency);
                      const formattedAmount = formatCurrencyInput(currentAmount.toString(), newCurrency);
                      setFormData({ ...formData, currency: newCurrency, amount: formattedAmount });
                    } else {
                      setFormData({ ...formData, currency: newCurrency });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {getCurrencyList().map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chu kỳ *
                </label>
                <select
                  required
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'yearly' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Hàng tháng</option>
                  <option value="yearly">Hàng năm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                Hủy
              </Button>
              <Button type="submit" className="flex-1">
                Thêm ngân sách
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {budgets.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">Chưa có ngân sách nào</p>
          </Card>
        ) : (
          budgets.map((budget) => {
            const status = getBudgetStatus(budget);
            const category = EXPENSE_CATEGORIES.find((c) => c.id === budget.category);

            return (
              <Card key={budget.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {category?.icon} {category?.name || budget.category}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(budget.amount, budget.currency)} / {budget.period === 'monthly' ? 'tháng' : 'năm'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      deleteBudget(budget.id);
                      showSuccess('Đã xóa ngân sách thành công!');
                    }}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Xóa"
                  >
                    🗑️
                  </button>
                </div>

                {status ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Đã chi:</span>
                      <span className={`font-semibold ${status.isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatCurrency(status.spent, budget.currency)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          status.isOverBudget ? 'bg-red-500' : status.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(status.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Còn lại:</span>
                      <span className={`font-semibold ${status.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(status.remaining, budget.currency)}
                      </span>
                    </div>
                    {status.isOverBudget && (
                      <p className="text-xs text-red-600 mt-2">⚠️ Đã vượt quá ngân sách!</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Ngân sách chưa bắt đầu hoặc đã kết thúc</p>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetPage;

