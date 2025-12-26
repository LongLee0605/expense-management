import Card from './Card';
import { SpendingInsight } from '../utils/insights';

interface SmartInsightsWidgetProps {
  insights: SpendingInsight[];
}

const SmartInsightsWidget = ({ insights }: SmartInsightsWidgetProps) => {
  if (insights.length === 0) return null;

  const getBgColor = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'tip':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      case 'info':
        return 'text-blue-600';
      case 'tip':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">💡 Insights thông minh</h2>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-3 sm:p-4 rounded-lg border-l-4 ${getBgColor(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <span className={`text-xl sm:text-2xl flex-shrink-0 ${getIconColor(insight.type)}`}>
                {insight.icon}
              </span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {insight.title}
                </h3>
                <p className="text-sm text-gray-700">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SmartInsightsWidget;

