import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTransactions } from '../hooks';
import { Button, TypeSelector, TransactionFormFields } from '../components';
import { useToast } from '../contexts/ToastContext';
import { Expense, Currency } from '../types';
import {
  formatCurrencyInput,
  parseCurrencyInput,
  validateTransactionForm,
  FORM_MESSAGES,
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
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    if (formData.amount) {
      const currentAmount = parseCurrencyInput(formData.amount, formData.currency);
      const formattedAmount = formatCurrencyInput(currentAmount.toString(), newCurrency);
      setFormData((prev) => ({ ...prev, currency: newCurrency, amount: formattedAmount }));
    } else {
      setFormData((prev) => ({ ...prev, currency: newCurrency }));
    }
  };

  const handleTypeChange = () => {
    setFormData((prev) => ({ ...prev, category: '' }));
  };

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
      showError(FORM_MESSAGES.NOT_FOUND);
      navigate('/transactions');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loading, transactions.length]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!transaction) {
      showError(FORM_MESSAGES.NOT_FOUND);
      return;
    }

    const validation = validateTransactionForm(formData.amount, formData.category, formData.currency);
    if (!validation.isValid) {
      showError(validation.error || FORM_MESSAGES.REQUIRED_FIELDS);
      return;
    }

    try {
      const parsedAmount = parseCurrencyInput(formData.amount, formData.currency);
      
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        showError(FORM_MESSAGES.INVALID_AMOUNT);
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
      showSuccess(FORM_MESSAGES.TRANSACTION_UPDATED);
      navigate('/transactions');
    } catch (error: any) {
      const errorMessage = error?.message || FORM_MESSAGES.ERROR_UPDATE;
      console.error('[Edit Transaction Page Error]', error);
      showError(errorMessage);
    }
  };

  if (loading || !transaction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>{FORM_MESSAGES.LOADING}</p>
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
          <TypeSelector
            value={formData.type}
            onChange={(type) => handleFieldChange('type', type)}
            onTypeChange={handleTypeChange}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TransactionFormFields
            type={formData.type}
            formData={formData}
            onFieldChange={handleFieldChange}
            onCurrencyChange={handleCurrencyChange}
          />

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

