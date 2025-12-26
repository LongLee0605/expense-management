import { Expense } from '../types';

const STORAGE_KEY = 'expense-management-data';

export const storageService = {
  /**
   * Lấy tất cả giao dịch từ localStorage
   */
  getTransactions: (): Expense[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  },

  /**
   * Lưu giao dịch vào localStorage
   */
  saveTransactions: (transactions: Expense[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
    }
  },

  /**
   * Thêm giao dịch mới
   */
  addTransaction: (transaction: Expense): void => {
    const transactions = storageService.getTransactions();
    transactions.push(transaction);
    storageService.saveTransactions(transactions);
  },

  /**
   * Xóa giao dịch
   */
  deleteTransaction: (id: string): void => {
    const transactions = storageService.getTransactions();
    const filtered = transactions.filter((t) => t.id !== id);
    storageService.saveTransactions(filtered);
  },

  /**
   * Cập nhật giao dịch
   */
  updateTransaction: (id: string, updatedTransaction: Expense): void => {
    try {
      const transactions = storageService.getTransactions();
      const index = transactions.findIndex((t) => t.id === id);
      if (index !== -1) {
        transactions[index] = updatedTransaction;
        storageService.saveTransactions(transactions);
      }
    } catch (error) {
      throw error;
    }
  },
};

