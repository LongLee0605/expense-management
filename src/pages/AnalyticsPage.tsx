import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks';
import { Card } from '../components';
import {
  ExpenseSineChart,
  MonthlyExpenseChart,
  CategoryPieChart,
} from '../components/charts';
import { calculateFinancialMetrics, calculateExpenseTrend, CURRENCIES } from '../utils';
import { formatCurrency } from '../utils';
import { Currency } from '../types';

const AnalyticsPage = () => {
  const { transactions } = useTransactions();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('VND');

  // Lọc transactions theo currency
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => t.currency === selectedCurrency);
  }, [transactions, selectedCurrency]);

  const metrics = useMemo(() => {
    return calculateFinancialMetrics(filteredTransactions);
  }, [filteredTransactions]);

  const trend = useMemo(() => {
    return calculateExpenseTrend(filteredTransactions, 30);
  }, [filteredTransactions]);

  const availableCurrencies = useMemo(() => {
    const currencies = new Set(transactions.map((t) => t.currency));
    return Array.from(currencies);
  }, [transactions]);

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-20 w-full">
      {/* Header với currency selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Phân tích tài chính</h2>
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {availableCurrencies.map((currency) => (
            <option key={currency} value={currency}>
              {CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol} {currency}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Tổng thu nhập</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.totalIncome, selectedCurrency as Currency)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Tổng chi tiêu</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(metrics.totalExpense, selectedCurrency as Currency)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Số dư</p>
            <p
              className={`text-2xl font-bold ${
                metrics.balance >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(metrics.balance, selectedCurrency as Currency)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Tỷ lệ tiết kiệm</p>
            <p
              className={`text-2xl font-bold ${
                metrics.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {metrics.savingsRate.toFixed(1)}%
            </p>
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Chi tiêu TB/ngày</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(metrics.avgDailyExpense, selectedCurrency as Currency)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Chi tiêu TB/tháng</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(metrics.avgMonthlyExpense, selectedCurrency as Currency)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Xu hướng 30 ngày</p>
            <p
              className={`text-xl font-semibold ${
                trend.isIncreasing ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {trend.isIncreasing ? '↑' : '↓'} {Math.abs(trend.change).toFixed(1)}%
            </p>
          </div>
        </Card>
      </div>

      {/* Biểu đồ hình sin - Chi tiêu theo thời gian */}
      <Card>
        <h3 className="text-xl font-semibold mb-4">
          📊 Biểu đồ chi tiêu (Hình sin)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Biểu đồ hiển thị chi tiêu thực tế với đường cong mượt mà (sine wave) và xu hướng
        </p>
        <ExpenseSineChart transactions={filteredTransactions} currency={selectedCurrency} />
      </Card>

      {/* Biểu đồ cột - Chi tiêu theo tháng */}
      <Card>
        <h3 className="text-xl font-semibold mb-4">
          📈 Chi tiêu theo tháng
        </h3>
        <MonthlyExpenseChart transactions={filteredTransactions} currency={selectedCurrency} />
      </Card>

      {/* Biểu đồ tròn - Chi tiêu theo danh mục */}
      <Card>
        <h3 className="text-xl font-semibold mb-4" >
          🥧 Phân bổ chi tiêu theo danh mục
        </h3>
        <CategoryPieChart transactions={filteredTransactions} currency={selectedCurrency} />
      </Card>

      {/* Thông tin chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Thống kê giao dịch</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng số giao dịch:</span>
              <span className="font-semibold">{metrics.transactionCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giao dịch thu:</span>
              <span className="font-semibold text-green-600">{metrics.incomeCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giao dịch chi:</span>
              <span className="font-semibold text-red-600">{metrics.expenseCount}</span>
            </div>
            {metrics.largestExpense && (
              <div className="flex justify-between">
                <span className="text-gray-600">Chi tiêu lớn nhất:</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(metrics.largestExpense.amount, metrics.largestExpense.currency)}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Phân tích xu hướng</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Chi tiêu 30 ngày gần:</span>
              <span className="font-semibold">
                {formatCurrency(trend.recentTotal, selectedCurrency as Currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chi tiêu trung bình/ngày:</span>
              <span className="font-semibold">
                {formatCurrency(trend.recentAvg, selectedCurrency as Currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thay đổi:</span>
              <span
                className={`font-semibold ${
                  trend.isIncreasing ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {trend.isIncreasing ? '↑ Tăng' : '↓ Giảm'} {Math.abs(trend.change).toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;

