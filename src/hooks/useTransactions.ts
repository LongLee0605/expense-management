import { useState, useEffect, useCallback, useMemo } from 'react';
import { Expense, Currency } from '../types';
import { storageService } from '../services';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Load transactions từ localStorage
  useEffect(() => {
    const loadTransactions = () => {
      const data = storageService.getTransactions();
      // Migrate old data without currency to VND
      const migratedData = data.map((t) => ({
        ...t,
        currency: ('currency' in t ? t.currency : 'VND') as Currency,
      }));
      setTransactions(migratedData);
      setLoading(false);
    };

    loadTransactions();
  }, []);

  // Thêm giao dịch mới
  const addTransaction = useCallback((transaction: Expense) => {
    storageService.addTransaction(transaction);
    setTransactions((prev) => [...prev, transaction]);
  }, []);

  // Xóa giao dịch
  const deleteTransaction = useCallback((id: string) => {
    storageService.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cập nhật giao dịch
  const updateTransaction = useCallback((id: string, updatedTransaction: Expense) => {
    storageService.updateTransaction(id, updatedTransaction);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? updatedTransaction : t))
    );
  }, []);

  // Tính tổng thu theo từng loại tiền
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

  // Tính tổng chi theo từng loại tiền
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

  // Tính số dư theo từng loại tiền
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

  // Tính tổng thu (tất cả loại tiền - chỉ để tương thích)
  const totalIncome = useMemo(() => {
    return Array.from(incomeByCurrency.values()).reduce((sum, val) => sum + val, 0);
  }, [incomeByCurrency]);

  // Tính tổng chi (tất cả loại tiền - chỉ để tương thích)
  const totalExpense = useMemo(() => {
    return Array.from(expenseByCurrency.values()).reduce((sum, val) => sum + val, 0);
  }, [expenseByCurrency]);

  // Số dư (tất cả loại tiền - chỉ để tương thích)
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

