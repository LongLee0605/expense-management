import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks';
import { TransactionItem, SearchBar, Button } from '../components';
import { Expense } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, searchTransactions, exportToCSV, exportToJSON } from '../utils';

const TransactionsListPage = () => {
  const navigate = useNavigate();
  const { transactions, deleteTransaction } = useTransactions();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(
    'all'
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [searchQuery, setSearchQuery] = useState('');

  const allCategories = [
    ...EXPENSE_CATEGORIES,
    ...INCOME_CATEGORIES,
  ].filter(
    (cat, index, self) => index === self.findIndex((c) => c.id === cat.id)
  );

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search
    if (searchQuery) {
      filtered = searchTransactions(filtered, searchQuery);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

    return filtered;
  }, [transactions, filterType, filterCategory, sortBy, searchQuery]);

  const handleEdit = (transaction: Expense) => {
    navigate(`/edit/${transaction.id}`);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="space-y-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại giao dịch
            </label>
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'income', label: 'Thu nhập' },
                { value: 'expense', label: 'Chi tiêu' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setFilterType(option.value as 'all' | 'income' | 'expense')
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả danh mục</option>
              {allCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp theo
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Ngày (mới nhất)</option>
              <option value="amount">Số tiền (cao nhất)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">
            {filteredAndSortedTransactions.length} giao dịch
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => exportToCSV(filteredAndSortedTransactions)}
              className="text-sm"
            >
              📥 CSV
            </Button>
            <Button
              variant="secondary"
              onClick={() => exportToJSON(filteredAndSortedTransactions)}
              className="text-sm"
            >
              📥 JSON
            </Button>
          </div>
        </div>

        {filteredAndSortedTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg mb-2">Không tìm thấy giao dịch</p>
            <p className="text-gray-400 text-sm">
              Thử thay đổi bộ lọc hoặc thêm giao dịch mới
            </p>
          </div>
        ) : (
          <div>
            {filteredAndSortedTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={deleteTransaction}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsListPage;

