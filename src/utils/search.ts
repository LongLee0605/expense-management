import { Expense } from '../types';

export const searchTransactions = (
  transactions: Expense[],
  query: string
): Expense[] => {
  if (!query.trim()) {
    return transactions;
  }

  const lowerQuery = query.toLowerCase();

  return transactions.filter((transaction) => {
    if (transaction.description?.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    if (transaction.amount.toString().includes(lowerQuery)) {
      return true;
    }

    if (
      transaction.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    ) {
      return true;
    }

    if (transaction.notes?.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    return false;
  });
};


