import { RecurringTransaction } from '../types';

const RECURRING_STORAGE_KEY = 'expense-management-recurring';

export const recurringService = {
  getRecurringTransactions: (): RecurringTransaction[] => {
    try {
      const data = localStorage.getItem(RECURRING_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  },

  saveRecurringTransactions: (transactions: RecurringTransaction[]): void => {
    try {
      localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
    }
  },

  addRecurringTransaction: (transaction: RecurringTransaction): void => {
    const transactions = recurringService.getRecurringTransactions();
    transactions.push(transaction);
    recurringService.saveRecurringTransactions(transactions);
  },

  updateRecurringTransaction: (
    id: string,
    updatedTransaction: RecurringTransaction
  ): void => {
    const transactions = recurringService.getRecurringTransactions();
    const index = transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      transactions[index] = updatedTransaction;
      recurringService.saveRecurringTransactions(transactions);
    }
  },

  deleteRecurringTransaction: (id: string): void => {
    const transactions = recurringService.getRecurringTransactions();
    const filtered = transactions.filter((t) => t.id !== id);
    recurringService.saveRecurringTransactions(filtered);
  },
};


