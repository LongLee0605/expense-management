import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense, Currency } from '../../types';
import { formatDate, formatCurrency } from '../../utils';

interface ExpenseSineChartProps {
  transactions: Expense[];
  currency?: string;
}

const ExpenseSineChart = ({ transactions, currency = 'VND' }: ExpenseSineChartProps) => {
  const chartData = useMemo(() => {
    const expenses = transactions.filter(
      (t) => t.type === 'expense' && t.currency === currency
    );

    const dailyExpenses = new Map<string, number>();
    expenses.forEach((expense) => {
      const date = expense.date;
      const current = dailyExpenses.get(date) || 0;
      dailyExpenses.set(date, current + expense.amount);
    });

    const sortedDates = Array.from(dailyExpenses.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const maxAmount = Math.max(...sortedDates.map((d) => d.amount), 1);
    const data = sortedDates.map((item, index) => {
      const x = (index / Math.max(sortedDates.length - 1, 1)) * Math.PI * 2;
      const sineValue = Math.sin(x) * (maxAmount * 0.3);
      const smoothedAmount = item.amount + sineValue;

      return {
        date: formatDate(item.date, currency as Currency),
        actual: item.amount,
        smoothed: Math.max(0, smoothedAmount), // Đảm bảo không âm
        trend: item.amount * 0.9, // Đường xu hướng
      };
    });

    return data;
  }, [transactions, currency]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Chưa có dữ liệu chi tiêu</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ minHeight: '300px' }}>
      <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          tickFormatter={(value) => formatCurrency(value, currency as Currency)}
        />
        <Tooltip
          formatter={(value: number | undefined) => 
            value !== undefined ? formatCurrency(value, currency as Currency) : ''
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Chi tiêu thực tế"
        />
        <Line
          type="monotone"
          dataKey="smoothed"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Đường cong mượt (Sin)"
        />
        <Line
          type="monotone"
          dataKey="trend"
          stroke="#10b981"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          name="Xu hướng"
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
};

export default ExpenseSineChart;

