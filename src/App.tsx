import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddTransactionPage from './pages/AddTransactionPage';
import EditTransactionPage from './pages/EditTransactionPage';
import TransactionsListPage from './pages/TransactionsListPage';
import StatisticsPage from './pages/StatisticsPage';
import BudgetPage from './pages/BudgetPage';
import GoalsPage from './pages/GoalsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ScanBillPage from './pages/ScanBillPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/add" element={<AddTransactionPage />} />
                <Route path="/edit/:id" element={<EditTransactionPage />} />
                <Route path="/scan" element={<ScanBillPage />} />
                <Route path="/transactions" element={<TransactionsListPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/budget" element={<BudgetPage />} />
                <Route path="/goals" element={<GoalsPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

