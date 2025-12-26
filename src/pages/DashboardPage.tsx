import { useTransactions, useBudgets, useGoals } from '../hooks';
import {
  StatCard,
  TransactionItem,
  CurrencyBalanceTable,
  Card,
  Button,
} from '../components';
import { Expense } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { EXPENSE_CATEGORIES } from '../utils';
import { ExpenseSineChart } from '../components/charts';

const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    transactions,
    totalIncome,
    totalExpense,
    balance,
    deleteTransaction,
    incomeByCurrency,
    expenseByCurrency,
    balanceByCurrency,
  } = useTransactions();
  const { budgets, getBudgetStatus } = useBudgets(transactions);
  const { goals } = useGoals();

  // Lấy 5 giao dịch gần nhất
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleEdit = (transaction: Expense) => {
    navigate(`/edit/${transaction.id}`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Stat Cards - Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Tổng thu"
          amount={totalIncome}
          icon="💰"
          color="text-green-600"
        />
        <StatCard
          title="Tổng chi"
          amount={totalExpense}
          icon="💸"
          color="text-red-600"
        />
        <StatCard
          title="Số dư"
          amount={balance}
          icon="💵"
          color={balance >= 0 ? 'text-blue-600' : 'text-red-600'}
        />
      </div>

      {/* Biểu đồ hình sin - Chi tiêu */}
      {transactions.filter((t) => t.type === 'expense').length > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Biểu đồ chi tiêu (Hình sin)</h2>
              <p className="text-sm text-gray-600 mt-1">
                Phân tích chi tiêu với đường cong mượt mà
              </p>
            </div>
            <Link to="/analytics">
              <Button variant="secondary" className="text-sm">
                Xem chi tiết
              </Button>
            </Link>
          </div>
          <ExpenseSineChart transactions={transactions} />
        </Card>
      )}

      {/* Bảng thu chi theo từng loại tiền */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">
          Bảng thu chi theo loại tiền tệ
        </h2>
        <CurrencyBalanceTable
          incomeByCurrency={incomeByCurrency}
          expenseByCurrency={expenseByCurrency}
          balanceByCurrency={balanceByCurrency}
        />
      </Card>

      {/* Budgets Overview */}
      {budgets.length > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Ngân sách</h2>
            <Link to="/budget">
              <Button variant="secondary" className="text-sm">
                Xem tất cả
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {budgets.slice(0, 3).map((budget) => {
              const status = getBudgetStatus(budget);
              if (!status) return null;
              const category = EXPENSE_CATEGORIES.find(
                (c) => c.id === budget.category
              );
              return (
                <div key={budget.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {category?.icon} {category?.name || budget.category}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        status.isOverBudget ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {status.isOverBudget ? '⚠️ Vượt' : '✓ OK'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        status.isOverBudget ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(status.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Goals Overview */}
      {goals.length > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mục tiêu</h2>
            <Link to="/goals">
              <Button variant="secondary" className="text-sm">
                Xem tất cả
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {goals.slice(0, 3).map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="border-l-4 border-yellow-500 pl-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full bg-yellow-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Giao dịch gần đây</h2>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">Chưa có giao dịch nào</p>
            <p className="text-sm">Hãy thêm giao dịch đầu tiên của bạn!</p>
          </div>
        ) : (
          <div>
            {recentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={deleteTransaction}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;

