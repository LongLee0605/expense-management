import { Goal } from '../types';

const GOALS_STORAGE_KEY = 'expense-management-goals';

export const goalsService = {
  getGoals: (): Goal[] => {
    try {
      const data = localStorage.getItem(GOALS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  },

  saveGoals: (goals: Goal[]): void => {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
    }
  },

  addGoal: (goal: Goal): void => {
    const goals = goalsService.getGoals();
    goals.push(goal);
    goalsService.saveGoals(goals);
  },

  updateGoal: (id: string, updatedGoal: Goal): void => {
    const goals = goalsService.getGoals();
    const index = goals.findIndex((g) => g.id === id);
    if (index !== -1) {
      goals[index] = updatedGoal;
      goalsService.saveGoals(goals);
    }
  },

  deleteGoal: (id: string): void => {
    const goals = goalsService.getGoals();
    const filtered = goals.filter((g) => g.id !== id);
    goalsService.saveGoals(filtered);
  },
};

