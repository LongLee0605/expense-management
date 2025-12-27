import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks';
import { Button, TypeSelector, TransactionFormFields } from '../components';
import { useToast } from '../contexts/ToastContext';
import { Expense, Currency } from '../types';
import {
  generateId,
  getTodayDate,
  parseCurrencyInput,
  validateTransactionForm,
  FORM_MESSAGES,
} from '../utils';

const AddTransactionPage = () => {
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  const { showError, showSuccess } = useToast();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'VND' as Currency,
    category: '',
    description: '',
    date: getTodayDate(),
    tags: [] as string[],
    notes: '',
  });

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    if (formData.amount) {
      const currentAmount = parseCurrencyInput(formData.amount, formData.currency);
      const { formatCurrencyInput } = require('../utils/currencyInput');
      const formattedAmount = formatCurrencyInput(currentAmount.toString(), newCurrency);
      setFormData((prev) => ({ ...prev, currency: newCurrency, amount: formattedAmount }));
    } else {
      setFormData((prev) => ({ ...prev, currency: newCurrency }));
    }
  };

  const handleTypeChange = () => {
    setFormData((prev) => ({ ...prev, category: '' }));
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
      description: formData.description,
      date: formData.date,
      type,
      ...(formData.tags.length > 0 && { tags: formData.tags }),
      ...(formData.notes && { notes: formData.notes }),
    };

    try {
      await addTransaction(transaction);
      showSuccess(FORM_MESSAGES.TRANSACTION_ADDED);
      navigate('/transactions');
    } catch (error: any) {
      const errorMessage = error?.message || FORM_MESSAGES.ERROR_ADD;
      console.error('[Add Transaction Page Error]', error);
      showError(errorMessage);
    }
  };

  return (
    <div className="max-w-full lg:max-w-2xl mx-auto pb-20 w-full lg:px-3">
      <div className="bg-white rounded-lg shadow p-4 sm:p-5 md:p-6 w-full">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 md:mb-6">Thêm giao dịch mới</h2>

        <div className="mb-4 sm:mb-5 md:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại giao dịch
          </label>
          <TypeSelector
            value={type}
            onChange={setType}
            onTypeChange={handleTypeChange}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
          <TransactionFormFields
            type={type}
            formData={formData}
            onFieldChange={handleFieldChange}
            onCurrencyChange={handleCurrencyChange}
          />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
              className="flex-1 w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="flex-1 w-full sm:w-auto">
              Thêm giao dịch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionPage;

