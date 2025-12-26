/**
 * Các hằng số dùng chung trong ứng dụng
 */

export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Ăn uống', icon: '🍽️', color: 'bg-red-500' },
  { id: 'transport', name: 'Giao thông', icon: '🚗', color: 'bg-blue-500' },
  { id: 'shopping', name: 'Mua sắm', icon: '🛒', color: 'bg-purple-500' },
  { id: 'bills', name: 'Hóa đơn', icon: '📄', color: 'bg-yellow-500' },
  { id: 'entertainment', name: 'Giải trí', icon: '🎬', color: 'bg-pink-500' },
  { id: 'health', name: 'Sức khỏe', icon: '🏥', color: 'bg-green-500' },
  { id: 'education', name: 'Giáo dục', icon: '📚', color: 'bg-indigo-500' },
  { id: 'other', name: 'Khác', icon: '📦', color: 'bg-gray-500' },
] as const;

export const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Lương', icon: '💰', color: 'bg-green-500' },
  { id: 'bonus', name: 'Thưởng', icon: '🎁', color: 'bg-yellow-500' },
  { id: 'investment', name: 'Đầu tư', icon: '📈', color: 'bg-blue-500' },
  { id: 'other', name: 'Khác', icon: '💵', color: 'bg-gray-500' },
] as const;


