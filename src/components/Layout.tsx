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
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
              💰 Quản Lý Chi Tiêu
            </h1>
            {user && (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {user.displayName || user.email}
                  </span>
                </div>
                <Button
                  onClick={logout}
                  variant="secondary"
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                >
                  <span className="hidden sm:inline">Đăng xuất</span>
                  <span className="sm:hidden">Thoát</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;

