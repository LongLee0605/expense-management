import { NavLink } from 'react-router-dom';

const Navigation = () => {
  const navItems = [
    { path: '/', label: 'Tổng quan', icon: '📊' },
    { path: '/analytics', label: 'Phân tích', icon: '📈' },
    { path: '/scan', label: 'Quét bill', icon: '📷' },
    { path: '/transactions', label: 'Giao dịch', icon: '📝' },
    { path: '/add', label: 'Thêm', icon: '➕' },
  ];

  return (
    <nav className="bg-white shadow-lg border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4">
        <div className="flex justify-around items-center gap-0.5 sm:gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 sm:py-2.5 lg:py-3 px-1 sm:px-2 lg:px-4 text-[10px] sm:text-xs lg:text-sm font-medium transition-colors min-w-0 flex-1 ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg sm:text-xl lg:text-2xl mb-0.5 sm:mb-1">{item.icon}</span>
              <span className="truncate w-full text-center leading-tight">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

