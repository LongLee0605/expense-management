import { useState, useEffect, useCallback, useMemo } from 'react';
import { Expense, Currency } from '../types';
import { transactionsService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../services';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !user.uid) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const unsubscribe = transactionsService.subscribe(user.uid, (data) => {
      const migratedData = data.map((t) => ({
        ...t,
        currency: ('currency' in t ? t.currency : 'VND') as Currency,
      }));
      setTransactions(migratedData);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);
  const addTransaction = useCallback(
    async (transaction: Expense) => {
      if (!user) return;
      
      try {
        await transactionsService.add(user.uid, transaction);
      } catch (error: any) {
        if (error?.code !== 'permission-denied') {
        }
        storageService.addTransaction(transaction);
        setTransactions((prev) => [...prev, transaction]);
      }
    },
    [user]
  );

  // Xóa giao dịch
  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user) return;
      
      try {
        await transactionsService.delete(user.uid, id);
      } catch (error: any) {
        if (error?.code !== 'permission-denied') {
        }
        storageService.deleteTransaction(id);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    },
    [user]
  );

  // Cập nhật giao dịch
  const updateTransaction = useCallback(
    async (id: string, updatedTransaction: Expense) => {
      if (!user) return;
      
      try {
        await transactionsService.update(user.uid, id, updatedTransaction);
      } catch (error: any) {
        if (error?.code !== 'permission-denied') {
        }
        storageService.updateTransaction(id, updatedTransaction);
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? updatedTransaction : t))
        );
      }
    },
    [user]
  );

  const incomeByCurrency = useMemo(() => {
    const map = new Map<Currency, number>();
    transactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        const current = map.get(t.currency) || 0;
        map.set(t.currency, current + t.amount);
      });
    return map;
  }, [transactions]);

  const expenseByCurrency = useMemo(() => {
    const map = new Map<Currency, number>();
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const current = map.get(t.currency) || 0;
        map.set(t.currency, current + t.amount);
      });
    return map;
  }, [transactions]);

  const balanceByCurrency = useMemo(() => {
    const map = new Map<Currency, number>();
    const allCurrencies = new Set([
      ...Array.from(incomeByCurrency.keys()),
      ...Array.from(expenseByCurrency.keys()),
    ]);

    allCurrencies.forEach((currency) => {
      const income = incomeByCurrency.get(currency) || 0;
      const expense = expenseByCurrency.get(currency) || 0;
      map.set(currency, income - expense);
    });

    return map;
  }, [incomeByCurrency, expenseByCurrency]);

  const totalIncome = useMemo(() => {
    return Array.from(incomeByCurrency.values()).reduce((sum, val) => sum + val, 0);
  }, [incomeByCurrency]);

  const totalExpense = useMemo(() => {
    return Array.from(expenseByCurrency.values()).reduce((sum, val) => sum + val, 0);
  }, [expenseByCurrency]);

  const balance = totalIncome - totalExpense;

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    totalIncome,
    totalExpense,
    balance,
    incomeByCurrency,
    expenseByCurrency,
    balanceByCurrency,
  };
};

