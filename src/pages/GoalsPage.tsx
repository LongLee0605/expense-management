import { useState, FormEvent } from 'react';
import { useGoals } from '../hooks';
import { Button, Card } from '../components';
import { useToast } from '../contexts/ToastContext';
import { Goal, Currency } from '../types';
import {
  getCurrencyList,
  generateId,
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  getCurrencyPlaceholder,
  formatDate,
  CURRENCIES,
} from '../utils';

const GoalsPage = () => {
  const { goals, addGoal, deleteGoal } = useGoals();
  const { showError, showSuccess } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currency: 'VND' as Currency,
    currentAmount: '0',
    deadline: '',
    description: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) {
      showError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const goal: Goal = {
      id: generateId(),
      name: formData.name,
      targetAmount: Number(formData.targetAmount),
      currency: formData.currency,
      currentAmount: Number(formData.currentAmount),
      deadline: formData.deadline || undefined,
      description: formData.description || undefined,
    };

    addGoal(goal);
    showSuccess('Thêm mục tiêu thành công!');
    setShowForm(false);
    setFormData({
      name: '',
      targetAmount: '',
      currency: 'VND',
      currentAmount: '0',
      deadline: '',
      description: '',
    });
  };

  const getProgress = (goal: Goal) => {
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const isOverdue = (goal: Goal) => {
    if (!goal.deadline) return false;
    return new Date(goal.deadline) < new Date() && goal.currentAmount < goal.targetAmount;
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Mục tiêu tiết kiệm</h2>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
          {showForm ? 'Hủy' : '+ Thêm mục tiêu'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-xl font-semibold mb-4">Thêm mục tiêu mới</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên mục tiêu *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Mua xe mới"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền mục tiêu * ({formData.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {CURRENCIES[formData.currency]?.symbol || formData.currency}
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.targetAmount}
                    onChange={(e) => {
                      const formatted = formatCurrencyInput(e.target.value, formData.currency);
                      setFormData({ ...formData, targetAmount: formatted });
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
                    if (formData.targetAmount) {
                      const currentTarget = parseCurrencyInput(formData.targetAmount, formData.currency);
                      const formattedTarget = formatCurrencyInput(currentTarget.toString(), newCurrency);
                      const currentCurrent = parseCurrencyInput(formData.currentAmount, formData.currency);
                      const formattedCurrent = formatCurrencyInput(currentCurrent.toString(), newCurrency);
                      setFormData({
                        ...formData,
                        currency: newCurrency,
                        targetAmount: formattedTarget,
                        currentAmount: formattedCurrent,
                      });
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền hiện tại ({formData.currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {CURRENCIES[formData.currency]?.symbol || formData.currency}
                </span>
                <input
                  type="text"
                  min="0"
                  value={formData.currentAmount}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value, formData.currency);
                    setFormData({ ...formData, currentAmount: formatted });
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={getCurrencyPlaceholder(formData.currency)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hạn chót (tùy chọn)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Thêm mô tả về mục tiêu của bạn"
              />
            </div>

            <div className="flex space-x-4">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                Hủy
              </Button>
              <Button type="submit" className="flex-1">
                Thêm mục tiêu
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">Chưa có mục tiêu nào</p>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = getProgress(goal);
            const overdue = isOverdue(goal);
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <Card key={goal.id}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{goal.name}</h3>
                    {goal.description && (
                      <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                    )}
                    {goal.deadline && (
                      <p className={`text-xs mt-1 ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                        Hạn chót: {formatDate(goal.deadline, goal.currency)}
                        {overdue && ' ⚠️ Đã quá hạn'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      deleteGoal(goal.id);
                      showSuccess('Đã xóa mục tiêu thành công!');
                    }}
                    className="text-red-600 hover:text-red-800 ml-4"
                    aria-label="Xóa"
                  >
                    🗑️
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tiến độ:</span>
                    <span className="font-semibold">
                      {formatCurrency(goal.currentAmount, goal.currency)} / {formatCurrency(goal.targetAmount, goal.currency)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Còn lại:</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(remaining, goal.currency)}
                    </span>
                  </div>
                  {progress >= 100 && (
                    <p className="text-sm text-green-600 font-semibold mt-2">🎉 Đã đạt mục tiêu!</p>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GoalsPage;

