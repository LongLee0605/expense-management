import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense, Currency } from '../../types';
import { EXPENSE_CATEGORIES } from '../../utils';
import { formatCurrency } from '../../utils';

interface CategoryPieChartProps {
  transactions: Expense[];
  currency?: string;
}

const CategoryPieChart = ({ transactions, currency = 'VND' }: CategoryPieChartProps) => {
  const chartData = useMemo(() => {
    const expenses = transactions.filter(
      (t) => t.type === 'expense' && t.currency === currency
    );

    const categoryMap = new Map<string, number>();
    expenses.forEach((expense) => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([categoryId, amount]) => {
        const category = EXPENSE_CATEGORIES.find((c) => c.id === categoryId);
        return {
          name: category?.name || categoryId,
          value: amount,
          icon: category?.icon || '📦',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, currency]);

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | undefined) => 
            value !== undefined ? formatCurrency(value, currency as Currency) : ''
          }
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;

