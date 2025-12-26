import { useState, useEffect, useCallback } from 'react';
import { RecurringTransaction } from '../types';
import { recurringService } from '../services';

export const useRecurring = () => {
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecurring = () => {
      const data = recurringService.getRecurringTransactions();
      setRecurringTransactions(data);
      setLoading(false);
    };
    loadRecurring();
  }, []);

  const addRecurringTransaction = useCallback(
    (transaction: RecurringTransaction) => {
      recurringService.addRecurringTransaction(transaction);
      setRecurringTransactions((prev) => [...prev, transaction]);
    },
    []
  );

  const updateRecurringTransaction = useCallback(
    (id: string, updatedTransaction: RecurringTransaction) => {
      recurringService.updateRecurringTransaction(id, updatedTransaction);
      setRecurringTransactions((prev) =>
        prev.map((t) => (t.id === id ? updatedTransaction : t))
      );
    },
    []
  );

  const deleteRecurringTransaction = useCallback((id: string) => {
    recurringService.deleteRecurringTransaction(id);
    setRecurringTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    recurringTransactions,
    loading,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
  };
};


