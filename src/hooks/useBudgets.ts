import { useState, useEffect, useCallback } from 'react';
import { Budget, Expense } from '../types';
import { budgetsService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { budgetService } from '../services';

export const useBudgets = (transactions: Expense[]) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !user.uid) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const unsubscribe = budgetsService.subscribe(user.uid, (data) => {
      setBudgets(data);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const addBudget = useCallback(
    async (budget: Budget) => {
      if (!user) return;
      
      try {
        await budgetsService.add(user.uid, budget);
      } catch (error: any) {
        if (error?.code !== 'permission-denied') {
        }
        budgetService.addBudget(budget);
        setBudgets((prev) => [...prev, budget]);
      }
    },
    [user]
  );

  const updateBudget = useCallback(
    async (id: string, updatedBudget: Budget) => {
      if (!user) return;
      
      try {
        await budgetsService.update(user.uid, id, updatedBudget);
      } catch (error: any) {
        if (error?.code !== 'permission-denied') {
        }
        budgetService.updateBudget(id, updatedBudget);
        setBudgets((prev) => prev.map((b) => (b.id === id ? updatedBudget : b)));
      }
    },
    [user]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      if (!user) return;
      
      try {
        await budgetsService.delete(user.uid, id);
      } catch (error: any) {
        if (error?.code !== 'permission-denied') {
        }
        budgetService.deleteBudget(id);
        setBudgets((prev) => prev.filter((b) => b.id !== id));
      }
    },
    [user]
  );

  const getBudgetStatus = useCallback(
    (budget: Budget) => {
      const now = new Date();
      const startDate = new Date(budget.startDate);
      const endDate = budget.endDate ? new Date(budget.endDate) : null;

      if (now < startDate || (endDate && now > endDate)) {
        return null;
      }

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

