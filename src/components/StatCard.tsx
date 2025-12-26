interface StatCardProps {
  title: string;
  amount: number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({ title, amount, icon, color, trend }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className={`text-xl sm:text-2xl font-bold mt-1 sm:mt-2 ${color} break-words`}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(amount)}
          </p>
          {trend && (
            <p
              className={`text-xs mt-1 sm:mt-2 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`text-3xl sm:text-4xl ${color} flex-shrink-0 ml-2`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;


