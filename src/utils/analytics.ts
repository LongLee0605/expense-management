import { Expense } from '../types';

/**
 * Tính toán các metrics tài chính
 */
export const calculateFinancialMetrics = (transactions: Expense[]) => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const incomes = transactions.filter((t) => t.type === 'income');

  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Tính trung bình chi tiêu hàng ngày
  const expenseDates = new Set(expenses.map((t) => t.date));
  const avgDailyExpense = expenseDates.size > 0 ? totalExpense / expenseDates.size : 0;

  // Tính trung bình chi tiêu hàng tháng
  const monthlyExpenses = new Map<string, number>();
  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = monthlyExpenses.get(monthKey) || 0;
    monthlyExpenses.set(monthKey, current + expense.amount);
  });
  const avgMonthlyExpense = monthlyExpenses.size > 0 
    ? Array.from(monthlyExpenses.values()).reduce((sum, val) => sum + val, 0) / monthlyExpenses.size 
    : 0;

  // Tỷ lệ tiết kiệm
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // Giao dịch lớn nhất
  const largestExpense = expenses.length > 0 
    ? expenses.reduce((max, t) => (t.amount > max.amount ? t : max), expenses[0])
    : null;

  // Giao dịch nhỏ nhất
  const smallestExpense = expenses.length > 0
    ? expenses.reduce((min, t) => (t.amount < min.amount ? t : min), expenses[0])
    : null;

  return {
    totalExpense,
    totalIncome,
    balance,
    avgDailyExpense,
    avgMonthlyExpense,
    savingsRate,
    largestExpense,
    smallestExpense,
    transactionCount: transactions.length,
    expenseCount: expenses.length,
    incomeCount: incomes.length,
  };
};

/**
 * Tính toán xu hướng chi tiêu
 */
export const calculateExpenseTrend = (transactions: Expense[], days: number = 30) => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const recentExpenses = transactions.filter(
    (t) => t.type === 'expense' && new Date(t.date) >= pastDate
  );
  const olderExpenses = transactions.filter(
    (t) => t.type === 'expense' && new Date(t.date) < pastDate
  );

  const recentTotal = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
  const olderTotal = olderExpenses.reduce((sum, t) => sum + t.amount, 0);

  const recentAvg = recentExpenses.length > 0 ? recentTotal / recentExpenses.length : 0;
  const olderAvg = olderExpenses.length > 0 ? olderTotal / olderExpenses.length : 0;

  const change = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  return {
    recentTotal,
    olderTotal,
    recentAvg,
    olderAvg,
    change,
    isIncreasing: change > 0,
  };
};


