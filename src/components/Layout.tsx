import { ReactNode } from 'react';
import Navigation from './Navigation';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-20 overflow-x-hidden">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 lg:py-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate flex-1 min-w-0">
              💰 Quản Lý Chi Tiêu
            </h1>
            {user && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="hidden sm:flex items-center space-x-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                    />
                  )}
                  <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[120px] sm:max-w-none">
                    {user.displayName || user.email}
                  </span>
                </div>
                <Button
                  onClick={logout}
                  variant="secondary"
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Đăng xuất</span>
                  <span className="sm:hidden">Thoát</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 w-full">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;

