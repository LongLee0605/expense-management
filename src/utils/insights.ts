import { Expense } from '../types';
import { formatCurrency } from './currency';

/**
 * Tính toán insights thông minh từ giao dịch
 */
export interface SpendingInsight {
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  message: string;
  icon: string;
}

export const generateSmartInsights = (transactions: Expense[]): SpendingInsight[] => {
  const insights: SpendingInsight[] = [];
  const expenses = transactions.filter((t) => t.type === 'expense');
  const incomes = transactions.filter((t) => t.type === 'income');

  if (expenses.length === 0) {
    return [
      {
        type: 'info',
        title: 'Chào mừng!',
        message: 'Bắt đầu theo dõi chi tiêu của bạn bằng cách thêm giao dịch đầu tiên.',
        icon: '👋',
      },
    ];
  }

  // Tính toán metrics
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Insight 1: Chi tiêu so với thu nhập
  if (totalIncome > 0) {
    const expenseRatio = (totalExpense / totalIncome) * 100;
    if (expenseRatio > 90) {
      insights.push({
        type: 'warning',
        title: 'Chi tiêu cao',
        message: `Bạn đang chi tiêu ${expenseRatio.toFixed(0)}% thu nhập. Hãy xem xét tiết kiệm nhiều hơn.`,
        icon: '⚠️',
      });
    } else if (expenseRatio < 50) {
      insights.push({
        type: 'success',
        title: 'Quản lý tốt!',
        message: `Bạn chỉ chi tiêu ${expenseRatio.toFixed(0)}% thu nhập. Tuyệt vời!`,
        icon: '✅',
      });
    }
  }

  // Insight 2: Chi tiêu lớn nhất
  if (expenses.length > 0) {
    const largestExpense = expenses.reduce((max, t) => (t.amount > max.amount ? t : max), expenses[0]);
    const avgExpense = totalExpense / expenses.length;
    if (largestExpense.amount > avgExpense * 3) {
      insights.push({
        type: 'info',
        title: 'Giao dịch lớn',
        message: `Giao dịch lớn nhất: ${formatCurrency(largestExpense.amount, largestExpense.currency)} cho ${largestExpense.description}`,
        icon: '💸',
      });
    }
  }

  // Insight 3: Xu hướng chi tiêu
  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const date = new Date(e.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const lastMonth = expenses.filter((e) => {
    const date = new Date(e.date);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
  });

  if (thisMonth.length > 0 && lastMonth.length > 0) {
    const thisMonthTotal = thisMonth.reduce((sum, t) => sum + t.amount, 0);
    const lastMonthTotal = lastMonth.reduce((sum, t) => sum + t.amount, 0);
    const change = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

    if (Math.abs(change) > 10) {
      insights.push({
        type: change > 0 ? 'warning' : 'success',
        title: 'Xu hướng chi tiêu',
        message: `Tháng này bạn ${change > 0 ? 'chi tiêu nhiều hơn' : 'tiết kiệm được'} ${Math.abs(change).toFixed(0)}% so với tháng trước.`,
        icon: change > 0 ? '📈' : '📉',
      });
    }
  }

  // Insight 4: Category phổ biến nhất
  const categoryMap = new Map<string, number>();
  expenses.forEach((e) => {
    const current = categoryMap.get(e.category) || 0;
    categoryMap.set(e.category, current + e.amount);
  });

  if (categoryMap.size > 0) {
    const topCategory = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])[0];
    const categoryPercentage = (topCategory[1] / totalExpense) * 100;
    if (categoryPercentage > 40) {
      insights.push({
        type: 'info',
        title: 'Danh mục chính',
        message: `${topCategory[0]} chiếm ${categoryPercentage.toFixed(0)}% tổng chi tiêu của bạn.`,
        icon: '🏷️',
      });
    }
  }

  // Insight 5: Số dư
  if (balance < 0) {
    insights.push({
      type: 'warning',
      title: 'Số dư âm',
      message: `Bạn đang chi tiêu nhiều hơn thu nhập. Hãy xem xét điều chỉnh ngân sách.`,
      icon: '🔴',
    });
  } else if (balance > totalIncome * 0.2) {
    insights.push({
      type: 'success',
      title: 'Tiết kiệm tốt',
      message: `Bạn đã tiết kiệm được ${formatCurrency(balance, (expenses[0]?.currency || 'VND') as Currency)}. Tiếp tục phát huy!`,
      icon: '💰',
    });
  }

  // Insight 6: Tần suất giao dịch
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentExpenses = expenses.filter((e) => new Date(e.date) >= weekAgo);
  
  if (recentExpenses.length === 0) {
    insights.push({
      type: 'tip',
      title: 'Mẹo',
      message: 'Bạn chưa có giao dịch nào trong tuần này. Hãy ghi lại mọi chi tiêu để theo dõi chính xác!',
      icon: '💡',
    });
  }

  return insights.slice(0, 4); // Giới hạn 4 insights
};

/**
 * Tính toán top categories
 */
import { Currency } from '../types';

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  currency: Currency;
}

export const getTopCategories = (transactions: Expense[], limit: number = 5): CategorySpending[] => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<string, { amount: number; count: number; currency: string }>();
  
  expenses.forEach((e) => {
    const existing = categoryMap.get(e.category) || { amount: 0, count: 0, currency: e.currency };
    categoryMap.set(e.category, {
      amount: existing.amount + e.amount,
      count: existing.count + 1,
      currency: e.currency,
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
      count: data.count,
      currency: data.currency as Currency,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
};

/**
 * So sánh chi tiêu tháng này vs tháng trước
 */
export interface MonthlyComparison {
  thisMonth: {
    total: number;
    count: number;
    avgPerDay: number;
  };
  lastMonth: {
    total: number;
    count: number;
    avgPerDay: number;
  };
  change: {
    total: number;
    percentage: number;
    isIncrease: boolean;
  };
}

export const compareMonthlySpending = (transactions: Expense[]): MonthlyComparison => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const now = new Date();
  
  const thisMonthExpenses = expenses.filter((e) => {
    const date = new Date(e.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const lastMonthExpenses = expenses.filter((e) => {
    const date = new Date(e.date);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
  });

  const thisMonthTotal = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

  const thisMonthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const lastMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();

  const change = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  return {
    thisMonth: {
      total: thisMonthTotal,
      count: thisMonthExpenses.length,
      avgPerDay: thisMonthDays > 0 ? thisMonthTotal / thisMonthDays : 0,
    },
    lastMonth: {
      total: lastMonthTotal,
      count: lastMonthExpenses.length,
      avgPerDay: lastMonthDays > 0 ? lastMonthTotal / lastMonthDays : 0,
    },
    change: {
      total: thisMonthTotal - lastMonthTotal,
      percentage: change,
      isIncrease: change > 0,
    },
  };
};

