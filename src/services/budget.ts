import { Budget } from '../types';

const BUDGET_STORAGE_KEY = 'expense-management-budgets';

export const budgetService = {
  getBudgets: (): Budget[] => {
    try {
      const data = localStorage.getItem(BUDGET_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  },

  saveBudgets: (budgets: Budget[]): void => {
    try {
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
    } catch (error) {
    }
  },

  addBudget: (budget: Budget): void => {
    const budgets = budgetService.getBudgets();
    budgets.push(budget);
    budgetService.saveBudgets(budgets);
  },

  updateBudget: (id: string, updatedBudget: Budget): void => {
    const budgets = budgetService.getBudgets();
    const index = budgets.findIndex((b) => b.id === id);
    if (index !== -1) {
      budgets[index] = updatedBudget;
      budgetService.saveBudgets(budgets);
    }
  },

  deleteBudget: (id: string): void => {
    const budgets = budgetService.getBudgets();
    const filtered = budgets.filter((b) => b.id !== id);
    budgetService.saveBudgets(filtered);
  },
};


