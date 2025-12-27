import { Currency } from '../../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCurrencyList } from '../../utils';
import { CurrencyInput } from './CurrencyInput';
import { TagInput } from './TagInput';

interface TransactionFormFieldsProps {
  type: 'income' | 'expense';
  formData: {
    amount: string;
    currency: Currency;
    category: string;
    description: string;
    date: string;
    tags?: string[];
    notes?: string;
  };
  onFieldChange: (field: string, value: any) => void;
  onCurrencyChange?: (currency: Currency) => void;
  showTags?: boolean;
  showNotes?: boolean;
}

export const TransactionFormFields = ({
  type,
  formData,
  onFieldChange,
  onCurrencyChange,
  showTags = true,
  showNotes = true,
}: TransactionFormFieldsProps) => {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <>
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
            onCurrencyChange?.(newCurrency);
            onFieldChange('currency', newCurrency);
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

          <CurrencyInput
            value={formData.amount}
            currency={formData.currency}
            onChange={(value) => onFieldChange('amount', value)}
            required
            label={`Số tiền * (${formData.currency})`}
          />

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
          onChange={(e) => onFieldChange('category', e.target.value)}
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
          onChange={(e) => onFieldChange('description', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nhập mô tả (tùy chọn)"
        />
      </div>

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
          onChange={(e) => onFieldChange('date', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {showTags && (
        <TagInput
          tags={formData.tags || []}
          onChange={(tags) => onFieldChange('tags', tags)}
        />
      )}

      {showNotes && (
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
            value={formData.notes || ''}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Thêm ghi chú (tùy chọn)"
          />
        </div>
      )}
    </>
  );
};

