import { useState } from 'react';
import { Expense } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../contexts/ToastContext';

interface TransactionItemProps {
  transaction: Expense;
  onDelete: (id: string) => void;
  onEdit: (transaction: Expense) => void;
}

const TransactionItem = ({
  transaction,
  onDelete,
  onEdit,
}: TransactionItemProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { showSuccess } = useToast();
  const categories =
    transaction.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const category = categories.find((c) => c.id === transaction.category);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(transaction.id);
    setShowConfirm(false);
    showSuccess('Đã xóa giao dịch thành công!');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 mb-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                category?.color || 'bg-gray-500'
              }`}
            >
              {category?.icon || '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {transaction.description || category?.name || 'Không có mô tả'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {category?.name || 'Khác'} • {formatDate(transaction.date, transaction.currency)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <div className="text-right">
              <p
                className={`text-lg font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{transaction.currency}</p>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => onEdit(transaction)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Sửa"
              >
                ✏️
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Xóa"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa giao dịch này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

export default TransactionItem;

