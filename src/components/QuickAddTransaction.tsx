import { useState, FormEvent } from 'react';
import Card from './Card';
import Button from './Button';
import { Expense, Currency } from '../types';
import { useTransactions } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import { generateId, getTodayDate, formatCurrencyInput, parseCurrencyInput, EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCIES } from '../utils';

interface QuickAddTransactionProps {
  onSuccess?: () => void;
}

const QuickAddTransaction = ({ onSuccess }: QuickAddTransactionProps) => {
  const { addTransaction } = useTransactions();
  const { showSuccess, showError } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'VND' as Currency,
    category: '',
    description: '',
  });

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      showError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const transaction: Expense = {
      id: generateId(),
      amount: parseCurrencyInput(formData.amount, formData.currency),
      currency: formData.currency,
      category: formData.category,
      description: formData.description || categories.find(c => c.id === formData.category)?.name || '',
      date: getTodayDate(),
      type,
    };

    try {
      await addTransaction(transaction);
      showSuccess('Thêm giao dịch thành công!');
      
      setFormData({
        amount: '',
        currency: 'VND',
        category: '',
        description: '',
      });
      setIsOpen(false);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.message || 'Lỗi khi thêm giao dịch. Vui lòng thử lại.';
      console.error('[Quick Add Transaction Error]', error);
      showError(errorMessage);
    }
  };

  if (!isOpen) {
    return (
      <Card>
        <Button
          onClick={() => setIsOpen(true)}
          variant="primary"
          className="w-full"
        >
          ➕ Thêm giao dịch nhanh
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base sm:text-lg font-semibold">Thêm giao dịch nhanh</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              type === 'expense'
                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent'
            }`}
          >
            💸 Chi tiêu
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              type === 'income'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent'
            }`}
          >
            💰 Thu nhập
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền *
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
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại tiền
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="JPY">JPY</option>
              <option value="GBP">GBP</option>
              <option value="CNY">CNY</option>
            </select>
          </div>
        </div>

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
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mô tả (tùy chọn)"
          />
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Thêm
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default QuickAddTransaction;

