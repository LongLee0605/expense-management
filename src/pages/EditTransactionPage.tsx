import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTransactions } from '../hooks';
import { Button } from '../components';
import { useToast } from '../contexts/ToastContext';
import { Expense, Currency } from '../types';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCurrencyList,
  formatCurrencyInput,
  parseCurrencyInput,
  getCurrencyPlaceholder,
  CURRENCIES,
} from '../utils';

const EditTransactionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { transactions, updateTransaction, loading } = useTransactions();
  const { showError, showSuccess } = useToast();
  
  const [transaction, setTransaction] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'VND' as Currency,
    category: '',
    description: '',
    date: '',
    type: 'expense' as 'income' | 'expense',
    tags: [] as string[],
    notes: '',
  });
  const [tagInput, setTagInput] = useState('');

  // Load transaction khi component mount hoặc id thay đổi
  useEffect(() => {
    if (!id) {
      navigate('/transactions');
      return;
    }

    // Đợi transactions load xong
    if (loading || transactions.length === 0) {
      return;
    }

    const found = transactions.find((t) => t.id === id);
    if (found) {
      // Chỉ set nếu chưa có transaction hoặc transaction khác với found
      if (!transaction || transaction.id !== found.id) {
        setTransaction(found);
        setFormData({
          amount: formatCurrencyInput(found.amount.toString(), found.currency),
          currency: found.currency,
          category: found.category,
          description: found.description,
          date: found.date,
          type: found.type,
          tags: found.tags || [],
          notes: found.notes || '',
        });
      }
    } else {
      // Không tìm thấy transaction
      showError('Không tìm thấy giao dịch');
      navigate('/transactions');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loading, transactions.length]);

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !transaction) {
      showError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const parsedAmount = parseCurrencyInput(formData.amount, formData.currency);
      
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        showError('Số tiền không hợp lệ');
        return;
      }

      const updatedTransaction: Expense = {
        ...transaction,
        amount: parsedAmount,
        currency: formData.currency,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        type: formData.type,
        ...(formData.tags.length > 0 && { tags: formData.tags }),
        ...(formData.notes && { notes: formData.notes }),
      };

      await updateTransaction(transaction.id, updatedTransaction);
      showSuccess('Cập nhật giao dịch thành công!');
      navigate('/transactions');
    } catch (error: any) {
      const errorMessage = error?.message || 'Có lỗi xảy ra khi cập nhật giao dịch';
      console.error('[Edit Transaction Page Error]', error);
      showError(errorMessage);
    }
  };

  if (loading || !transaction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Sửa giao dịch</h2>

        {/* Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại giao dịch
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, type: 'expense', category: '' });
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                formData.type === 'expense'
                  ? 'bg-red-100 text-red-700 border-2 border-red-500'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent'
              }`}
            >
              💸 Chi tiêu
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, type: 'income', category: '' });
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                formData.type === 'income'
                  ? 'bg-green-100 text-green-700 border-2 border-green-500'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent'
              }`}
            >
              💰 Thu nhập
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Currency */}
          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Loại tiền tệ *
            </label>
            <select
              id="currency"
              required
              value={formData.currency}
              onChange={(e) => {
                const newCurrency = e.target.value as Currency;
                // Format lại amount khi đổi currency
                const currentAmount = parseCurrencyInput(formData.amount, formData.currency);
                const formattedAmount = formatCurrencyInput(currentAmount.toString(), newCurrency);
                setFormData({ ...formData, currency: newCurrency, amount: formattedAmount });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getCurrencyList().map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Số tiền * ({formData.currency})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {CURRENCIES[formData.currency]?.symbol || formData.currency}
              </span>
              <input
                type="text"
                id="amount"
                required
                value={formData.amount}
                onChange={(e) => {
                  const formatted = formatCurrencyInput(e.target.value, formData.currency);
                  setFormData({ ...formData, amount: formatted });
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={getCurrencyPlaceholder(formData.currency)}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ví dụ: {getCurrencyPlaceholder(formData.currency)}
            </p>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Danh mục *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mô tả
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mô tả (tùy chọn)"
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ngày
            </label>
            <input
              type="date"
              id="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        tags: formData.tags.filter((_, i) => i !== index),
                      })
                    }
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                      setFormData({
                        ...formData,
                        tags: [...formData.tags, tagInput.trim()],
                      });
                      setTagInput('');
                    }
                  }
                }}
                placeholder="Nhập tag và nhấn Enter"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                    setFormData({
                      ...formData,
                      tags: [...formData.tags, tagInput.trim()],
                    });
                    setTagInput('');
                  }
                }}
              >
                Thêm
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ghi chú
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Thêm ghi chú (tùy chọn)"
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/transactions')}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionPage;

