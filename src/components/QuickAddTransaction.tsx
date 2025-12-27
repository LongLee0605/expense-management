import { useState, FormEvent } from 'react';
import Card from './Card';
import Button from './Button';
import { TypeSelector, CurrencyInput } from './forms';
import { Expense, Currency } from '../types';
import { useTransactions } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import {
  generateId,
  getTodayDate,
  parseCurrencyInput,
  validateTransactionForm,
  FORM_MESSAGES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../utils';

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

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validation = validateTransactionForm(formData.amount, formData.category, formData.currency);
    if (!validation.isValid) {
      showError(validation.error || FORM_MESSAGES.REQUIRED_FIELDS);
      return;
    }

    const transaction: Expense = {
      id: generateId(),
      amount: parseCurrencyInput(formData.amount, formData.currency),
      currency: formData.currency,
      category: formData.category,
      description: formData.description || categories.find((c) => c.id === formData.category)?.name || '',
      date: getTodayDate(),
      type,
    };

    try {
      await addTransaction(transaction);
      showSuccess(FORM_MESSAGES.TRANSACTION_ADDED);

      setFormData({
        amount: '',
        currency: 'VND',
        category: '',
        description: '',
      });
      setIsOpen(false);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.message || FORM_MESSAGES.ERROR_ADD;
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
        <h3 className="text-lg font-semibold">Thêm giao dịch nhanh</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TypeSelector
          value={type}
          onChange={setType}
          onTypeChange={() => handleFieldChange('category', '')}
        />

        <div className="grid grid-cols-2 gap-4">
          <CurrencyInput
            value={formData.amount}
            currency={formData.currency}
            onChange={(value) => handleFieldChange('amount', value)}
            required
            label="Số tiền *"
            showPlaceholder={false}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại tiền
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleFieldChange('currency', e.target.value as Currency)}
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
            onChange={(e) => handleFieldChange('category', e.target.value)}
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
            onChange={(e) => handleFieldChange('description', e.target.value)}
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

