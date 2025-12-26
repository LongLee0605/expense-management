import { Expense } from '../types';
import { formatDate } from './index';

/**
 * Export transactions to CSV
 */
export const exportToCSV = (transactions: Expense[], filename = 'transactions.csv') => {
  const headers = ['Ngày', 'Loại', 'Danh mục', 'Mô tả', 'Số tiền', 'Loại tiền', 'Tags', 'Ghi chú'];
  
  const rows = transactions.map((t) => [
    formatDate(t.date, t.currency),
    t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
    t.category,
    t.description || '',
    t.amount.toString(),
    t.currency,
    t.tags?.join(', ') || '',
    t.notes || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export transactions to JSON
 */
export const exportToJSON = (transactions: Expense[], filename = 'transactions.json') => {
  const jsonContent = JSON.stringify(transactions, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

