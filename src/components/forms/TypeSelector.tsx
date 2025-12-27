interface TypeSelectorProps {
  value: 'income' | 'expense';
  onChange: (type: 'income' | 'expense') => void;
  onTypeChange?: () => void;
}

export const TypeSelector = ({ value, onChange, onTypeChange }: TypeSelectorProps) => {
  const handleChange = (type: 'income' | 'expense') => {
    onChange(type);
    onTypeChange?.();
  };

  return (
    <div className="flex gap-2 sm:gap-3 md:gap-4">
      <button
        type="button"
        onClick={() => handleChange('expense')}
        className={`flex-1 py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
          value === 'expense'
            ? 'bg-red-100 text-red-700 border-2 border-red-500'
            : 'bg-gray-100 text-gray-700 border-2 border-transparent'
        }`}
      >
        💸 Chi tiêu
      </button>
      <button
        type="button"
        onClick={() => handleChange('income')}
        className={`flex-1 py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
          value === 'income'
            ? 'bg-green-100 text-green-700 border-2 border-green-500'
            : 'bg-gray-100 text-gray-700 border-2 border-transparent'
        }`}
      >
        💰 Thu nhập
      </button>
    </div>
  );
};

