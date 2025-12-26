import { Currency } from '../types';
import { formatCurrency, CURRENCIES } from '../utils';

interface CurrencyBalanceTableProps {
  incomeByCurrency: Map<Currency, number>;
  expenseByCurrency: Map<Currency, number>;
  balanceByCurrency: Map<Currency, number>;
}

const CurrencyBalanceTable = ({
  incomeByCurrency,
  expenseByCurrency,
  balanceByCurrency,
}: CurrencyBalanceTableProps) => {
  // Lấy tất cả các loại tiền tệ có giao dịch
  const allCurrencies = Array.from(
    new Set([
      ...Array.from(incomeByCurrency.keys()),
      ...Array.from(expenseByCurrency.keys()),
    ])
  );

  if (allCurrencies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có giao dịch nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại tiền
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tổng thu
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tổng chi
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số dư
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {allCurrencies.map((currency) => {
            const income = incomeByCurrency.get(currency) || 0;
            const expense = expenseByCurrency.get(currency) || 0;
            const balance = balanceByCurrency.get(currency) || 0;
            const currencyInfo = CURRENCIES[currency];

            return (
              <tr key={currency} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{currencyInfo.symbol}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {currency}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({currencyInfo.name})
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(income, currency)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(expense, currency)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <span
                    className={`text-sm font-bold ${
                      balance >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(balance, currency)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CurrencyBalanceTable;


