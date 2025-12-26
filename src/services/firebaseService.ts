import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Expense, Budget, Goal } from '../types';

const convertTimestamp = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return timestamp;
};

const convertFromFirestore = <T extends { date?: string }>(data: any): T => {
  const converted = { ...data };
  if (data.date) {
    converted.date = convertTimestamp(data.date);
  }
  return converted as T;
};

export const transactionsService = {
  getCollectionPath: (userId: string) => `users/${userId}/transactions`,

  async getAll(userId: string): Promise<Expense[]> {
    try {
      const q = query(collection(db, this.getCollectionPath(userId)));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = convertFromFirestore<Expense>(doc.data());
        return {
          ...data,
          id: doc.id,
        };
      });
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
      }
      return [];
    }
  },

  async add(userId: string, transaction: Expense): Promise<void> {
    try {
      const transactionRef = doc(db, this.getCollectionPath(userId), transaction.id);
      await setDoc(transactionRef, {
        ...transaction,
        date: Timestamp.fromDate(new Date(transaction.date)),
      });
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
      }
      throw error;
    }
  },

  async update(userId: string, id: string, transaction: Expense): Promise<void> {
    try {
      const transactionRef = doc(db, this.getCollectionPath(userId), id);
      const { id: _, ...transactionData } = transaction;
      await updateDoc(transactionRef, {
        ...transactionData,
        date: Timestamp.fromDate(new Date(transaction.date)),
      });
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
      }
      throw error;
    }
  },

  async delete(userId: string, id: string): Promise<void> {
    try {
      const transactionRef = doc(db, this.getCollectionPath(userId), id);
      await deleteDoc(transactionRef);
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
      }
      throw error;
    }
  },

  subscribe(userId: string, callback: (transactions: Expense[]) => void): () => void {
    if (!userId) {
      return () => {};
    }
    
    try {
      const q = query(collection(db, this.getCollectionPath(userId)));
      return onSnapshot(
        q,
        (querySnapshot) => {
          const transactions = querySnapshot.docs.map((doc) => {
            const data = convertFromFirestore<Expense>(doc.data());
            return {
              ...data,
              id: doc.id,
            };
          });
          callback(transactions);
        },
        (error: any) => {
          if (error?.code !== 'permission-denied' && error?.code !== 'unavailable') {
          }
          callback([]);
        }
      );
    } catch {
      callback([]);
      return () => {};
    }
  },
};

export const budgetsService = {
  getCollectionPath: (userId: string) => `users/${userId}/budgets`,

  async getAll(userId: string): Promise<Budget[]> {
    try {
      const q = query(collection(db, this.getCollectionPath(userId)));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Budget));
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
      }
      return [];
    }
  },

  async add(userId: string, budget: Budget): Promise<void> {
    try {
      const budgetRef = doc(db, this.getCollectionPath(userId), budget.id);
      await setDoc(budgetRef, budget);
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
      }
      throw error;
    }
  },

  async update(userId: string, id: string, budget: Budget): Promise<void> {
    try {
      const budgetRef = doc(db, this.getCollectionPath(userId), id);
      const { id: _, ...budgetData } = budget;
      await updateDoc(budgetRef, budgetData as any);
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
      }
      throw error;
    }
  },

  async delete(userId: string, id: string): Promise<void> {
    try {
      const budgetRef = doc(db, this.getCollectionPath(userId), id);
      await deleteDoc(budgetRef);
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
      }
      throw error;
    }
  },

  subscribe(userId: string, callback: (budgets: Budget[]) => void): () => void {
    if (!userId) {
      return () => {};
    }
    
    try {
      const q = query(collection(db, this.getCollectionPath(userId)));
      return onSnapshot(
        q,
        (querySnapshot) => {
          const budgets = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
            } as Budget;
          });
          callback(budgets);
        },
        (error: any) => {
          if (error?.code !== 'permission-denied' && error?.code !== 'unavailable') {
          }
          callback([]);
        }
      );
    } catch {
      callback([]);
      return () => {};
    }
  },
};

export const goalsService = {
  getCollectionPath: (userId: string) => `users/${userId}/goals`,

  async getAll(userId: string): Promise<Goal[]> {
    try {
      const q = query(collection(db, this.getCollectionPath(userId)));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Goal));
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
      }
      return [];
    }
  },

  async add(userId: string, goal: Goal): Promise<void> {
    try {
      const goalRef = doc(db, this.getCollectionPath(userId), goal.id);
      await setDoc(goalRef, goal);
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
      }
      throw error;
    }
  },

  async update(userId: string, id: string, goal: Goal): Promise<void> {
    try {
      const goalRef = doc(db, this.getCollectionPath(userId), id);
      const { id: _, ...goalData } = goal;
      await updateDoc(goalRef, goalData as any);
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
      }
      throw error;
    }
  },

  async delete(userId: string, id: string): Promise<void> {
    try {
      const goalRef = doc(db, this.getCollectionPath(userId), id);
      await deleteDoc(goalRef);
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
      }
      throw error;
    }
  },

  subscribe(userId: string, callback: (goals: Goal[]) => void): () => void {
    if (!userId) {
      return () => {};
    }
    
    try {
      const q = query(collection(db, this.getCollectionPath(userId)));
      return onSnapshot(
        q,
        (querySnapshot) => {
          const goals = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
            } as Goal;
          });
          callback(goals);
        },
        (error: any) => {
          if (error?.code !== 'permission-denied' && error?.code !== 'unavailable') {
          }
          callback([]);
        }
      );
    } catch {
      callback([]);
      return () => {};
    }
  },
};

