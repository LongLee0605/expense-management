export type Currency = 'VND' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CNY';

export interface Expense {
  id: string;
  amount: number;
  currency: Currency;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  tags?: string[];
  notes?: string;
  isRecurring?: boolean;
  recurringId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  currency: Currency;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currency: Currency;
  currentAmount: number;
  deadline?: string;
  description?: string;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  currency: Currency;
  category: string;
  description: string;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextDate: string;
  tags?: string[];
}

