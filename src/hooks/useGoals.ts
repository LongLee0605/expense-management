import { useState, useEffect, useCallback } from 'react';
import { Goal } from '../types';
import { goalsService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { goalsService as localStorageGoalsService } from '../services';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !user.uid) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const unsubscribe = goalsService.subscribe(user.uid, (data) => {
      setGoals(data);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const addGoal = useCallback(
    async (goal: Goal) => {
      if (!user) return;
      
      try {
        await goalsService.add(user.uid, goal);
      } catch (error: any) {
        if (error?.code !== 'permission-denied') {
        }
        localStorageGoalsService.addGoal(goal);
        setGoals((prev) => [...prev, goal]);
      }
    },
    [user]
  );

  const updateGoal = useCallback(
    async (id: string, updatedGoal: Goal) => {
      if (!user) return;
      
      try {
        await goalsService.update(user.uid, id, updatedGoal);
      } catch (error: any) {
        if (error?.code !== 'permission-denied') {
        }
        localStorageGoalsService.updateGoal(id, updatedGoal);
        setGoals((prev) => prev.map((g) => (g.id === id ? updatedGoal : g)));
      }
    },
    [user]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      if (!user) return;
      
      try {
        await goalsService.delete(user.uid, id);
      } catch (error: any) {
        if (error?.code !== 'permission-denied') {
        }
        localStorageGoalsService.deleteGoal(id);
        setGoals((prev) => prev.filter((g) => g.id !== id));
      }
    },
    [user]
  );

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


