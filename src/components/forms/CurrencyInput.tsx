import { Currency } from '../../types';
import { formatCurrencyInput, getCurrencyPlaceholder } from '../../utils/currencyInput';
import { CURRENCIES } from '../../utils/currency';

interface CurrencyInputProps {
  value: string;
  currency: Currency;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  showPlaceholder?: boolean;
}

export const CurrencyInput = ({
  value,
  currency,
  onChange,
  required = false,
  label,
  showPlaceholder = true,
}: CurrencyInputProps) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value, currency);
    onChange(formatted);
  };


  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          {CURRENCIES[currency]?.symbol || currency}
        </span>
        <input
          type="text"
          required={required}
          value={value}
          onChange={handleAmountChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={showPlaceholder ? getCurrencyPlaceholder(currency) : undefined}
        />
      </div>
      {showPlaceholder && (
        <p className="text-xs text-gray-500 mt-1">
          Ví dụ: {getCurrencyPlaceholder(currency)}
        </p>
      )}
    </div>
  );
};

