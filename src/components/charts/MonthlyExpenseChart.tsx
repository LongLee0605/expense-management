import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense, Currency } from '../../types';
import { formatCurrency } from '../../utils';

interface MonthlyExpenseChartProps {
  transactions: Expense[];
  currency?: string;
}

const MonthlyExpenseChart = ({ transactions, currency = 'VND' }: MonthlyExpenseChartProps) => {
  const chartData = useMemo(() => {
    const expenses = transactions.filter(
      (t) => t.type === 'expense' && t.currency === currency
    );

    const monthlyData = new Map<string, number>();
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthlyData.get(monthKey) || 0;
      monthlyData.set(monthKey, current + expense.amount);
    });

    return Array.from(monthlyData.entries())
      .map(([month, amount]) => ({
        month: month.split('-')[1] + '/' + month.split('-')[0],
        amount,
      }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/');
        const [bMonth, bYear] = b.month.split('/');
        if (aYear !== bYear) return aYear.localeCompare(bYear);
        return aMonth.localeCompare(bMonth);
      });
  }, [transactions, currency]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ minHeight: '300px' }}>
      <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis
          tickFormatter={(value) => formatCurrency(value, currency as Currency)}
        />
        <Tooltip
          formatter={(value: number | undefined) => 
            value !== undefined ? formatCurrency(value, currency as Currency) : ''
          }
        />
        <Legend />
        <Bar dataKey="amount" fill="#ef4444" name="Chi tiêu" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
};

export default MonthlyExpenseChart;

