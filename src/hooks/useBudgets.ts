import { useState, useEffect, useCallback } from 'react';
import { Budget, Expense } from '../types';
import { budgetService } from '../services';

export const useBudgets = (transactions: Expense[]) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBudgets = () => {
      const data = budgetService.getBudgets();
      setBudgets(data);
      setLoading(false);
    };
    loadBudgets();
  }, []);

  const addBudget = useCallback((budget: Budget) => {
    budgetService.addBudget(budget);
    setBudgets((prev) => [...prev, budget]);
  }, []);

  const updateBudget = useCallback((id: string, updatedBudget: Budget) => {
    budgetService.updateBudget(id, updatedBudget);
    setBudgets((prev) => prev.map((b) => (b.id === id ? updatedBudget : b)));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    budgetService.deleteBudget(id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Tính toán chi tiêu thực tế cho từng budget
  const getBudgetStatus = useCallback(
    (budget: Budget) => {
      const now = new Date();
      const startDate = new Date(budget.startDate);
      const endDate = budget.endDate ? new Date(budget.endDate) : null;

      // Kiểm tra xem budget có đang active không
      if (now < startDate || (endDate && now > endDate)) {
        return null; // Budget không active
      }

      // Tính toán period
      let periodStart: Date;
      let periodEnd: Date;

      if (budget.period === 'monthly') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else {
        // yearly
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(now.getFullYear(), 11, 31);
      }

      // Tính tổng chi tiêu trong period
      const spent = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            t.category === budget.category &&
            t.currency === budget.currency &&
            new Date(t.date) >= periodStart &&
            new Date(t.date) <= periodEnd
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;

      return {
        spent,
        remaining,
        percentage,
        isOverBudget: spent > budget.amount,
      };
    },
    [transactions]
  );

  return {
    budgets,
    loading,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetStatus,
  };
};

