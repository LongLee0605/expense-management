import { useMemo } from 'react';
import { useTransactions } from '../hooks';
import { Card } from '../components';
import { Currency } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatCurrency } from '../utils';

const StatisticsPage = () => {
  const { transactions } = useTransactions();

  // Thống kê theo danh mục chi tiêu (theo từng loại tiền)
  const expenseByCategory = useMemo(() => {
    const categoryMap = new Map<string, { amount: number; currency: string }>();

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const key = `${t.category}_${t.currency}`;
        const current = categoryMap.get(key);
        categoryMap.set(key, {
          amount: (current?.amount || 0) + t.amount,
          currency: t.currency,
        });
      });

    return Array.from(categoryMap.entries())
      .map(([key, data]) => {
        const [categoryId] = key.split('_');
        const category = EXPENSE_CATEGORIES.find((c) => c.id === categoryId);
        return {
          category: category?.name || 'Khác',
          icon: category?.icon || '📦',
          color: category?.color || 'bg-gray-500',
          amount: data.amount,
          currency: data.currency as Currency,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Thống kê theo danh mục thu nhập (theo từng loại tiền)
  const incomeByCategory = useMemo(() => {
    const categoryMap = new Map<string, { amount: number; currency: string }>();

    transactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        const key = `${t.category}_${t.currency}`;
        const current = categoryMap.get(key);
        categoryMap.set(key, {
          amount: (current?.amount || 0) + t.amount,
          currency: t.currency,
        });
      });

    return Array.from(categoryMap.entries())
      .map(([key, data]) => {
        const [categoryId] = key.split('_');
        const category = INCOME_CATEGORIES.find((c) => c.id === categoryId);
        return {
          category: category?.name || 'Khác',
          icon: category?.icon || '💵',
          color: category?.color || 'bg-gray-500',
          amount: data.amount,
          currency: data.currency as Currency,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalExpense = expenseByCategory.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = incomeByCategory.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Chi tiêu theo danh mục */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Chi tiêu theo danh mục</h2>
        {expenseByCategory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có dữ liệu chi tiêu</p>
        ) : (
          <div className="space-y-3">
            {expenseByCategory.map((item, index) => {
              const percentage = totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-red-600">
                        {formatCurrency(item.amount, item.currency)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {item.currency}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Thu nhập theo danh mục */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Thu nhập theo danh mục</h2>
        {incomeByCategory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có dữ liệu thu nhập</p>
        ) : (
          <div className="space-y-3">
            {incomeByCategory.map((item, index) => {
              const percentage = totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(item.amount, item.currency)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {item.currency}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StatisticsPage;

