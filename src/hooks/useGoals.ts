import { useState, useEffect, useCallback } from 'react';
import { Goal } from '../types';
import { goalsService } from '../services';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGoals = () => {
      const data = goalsService.getGoals();
      setGoals(data);
      setLoading(false);
    };
    loadGoals();
  }, []);

  const addGoal = useCallback((goal: Goal) => {
    goalsService.addGoal(goal);
    setGoals((prev) => [...prev, goal]);
  }, []);

  const updateGoal = useCallback((id: string, updatedGoal: Goal) => {
    goalsService.updateGoal(id, updatedGoal);
    setGoals((prev) => prev.map((g) => (g.id === id ? updatedGoal : g)));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    goalsService.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const updateGoalProgress = useCallback(
    (id: string, amount: number) => {
      const goal = goals.find((g) => g.id === id);
      if (goal) {
        const updatedGoal = {
          ...goal,
          currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount),
        };
        updateGoal(id, updatedGoal);
      }
    },
    [goals, updateGoal]
  );

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
  };
};


