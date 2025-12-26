import { Expense } from '../types';

/**
 * Tìm kiếm giao dịch theo query
 */
export const searchTransactions = (
  transactions: Expense[],
  query: string
): Expense[] => {
  if (!query.trim()) {
    return transactions;
  }

  const lowerQuery = query.toLowerCase();

  return transactions.filter((transaction) => {
    // Tìm trong description
    if (transaction.description?.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Tìm trong category name (cần import categories)
    // Tìm trong amount
    if (transaction.amount.toString().includes(lowerQuery)) {
      return true;
    }

    // Tìm trong tags
    if (
      transaction.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    ) {
      return true;
    }

    // Tìm trong notes
    if (transaction.notes?.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    return false;
  });
};


