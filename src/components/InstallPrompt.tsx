import { useState, useEffect } from 'react';
import Button from './Button';
import Card from './Card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkInstalled()) {
      return;
    }

    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    setIsMobile(checkMobile());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    if (isMobile || checkMobile()) {
      setTimeout(() => {
        if (!checkInstalled()) {
          setShowPrompt(true);
        }
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
          setIsInstalled(true);
        }
      } catch (error) {
        console.error('Install prompt error:', error);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (isInstalled) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (isIOS && !deferredPrompt) {
    return (
      <Card className="mb-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-3 sm:p-4 md:p-5 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <span className="text-3xl sm:text-4xl">📱</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-blue-900 mb-2">Cài đặt ứng dụng trên iOS</h3>
              <ol className="text-sm sm:text-base text-blue-800 space-y-2 list-decimal list-inside">
                <li>Nhấn nút <strong className="font-semibold">Share</strong> (📤) ở thanh địa chỉ phía dưới</li>
                <li>Cuộn xuống và chọn <strong className="font-semibold">"Thêm vào Màn hình chính"</strong></li>
                <li>Nhấn <strong className="font-semibold">"Thêm"</strong> ở góc trên bên phải để hoàn tất</li>
              </ol>
            </div>
            <Button
              onClick={handleDismiss}
              variant="secondary"
              className="w-full sm:w-auto whitespace-nowrap mt-2 sm:mt-0"
            >
              Đã hiểu
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (isAndroid && !deferredPrompt) {
    return (
      <Card className="mb-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-3 sm:p-4 md:p-5 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <span className="text-3xl sm:text-4xl">🤖</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-green-900 mb-2">Cài đặt ứng dụng trên Android</h3>
              <ol className="text-sm sm:text-base text-green-800 space-y-2 list-decimal list-inside">
                <li>Nhấn nút <strong className="font-semibold">Menu</strong> (⋮) ở góc trên bên phải trình duyệt</li>
                <li>Chọn <strong className="font-semibold">"Cài đặt ứng dụng"</strong> hoặc <strong className="font-semibold">"Thêm vào màn hình chính"</strong></li>
                <li>Nhấn <strong className="font-semibold">"Cài đặt"</strong> hoặc <strong className="font-semibold">"Thêm"</strong> để hoàn tất</li>
              </ol>
            </div>
            <Button
              onClick={handleDismiss}
              variant="secondary"
              className="w-full sm:w-auto whitespace-nowrap mt-2 sm:mt-0"
            >
              Đã hiểu
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 md:p-5 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <span className="text-3xl sm:text-4xl flex-shrink-0">📲</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base sm:text-lg text-green-900 mb-1">Cài đặt ứng dụng</h3>
              <p className="text-sm sm:text-base text-green-800">
                Cài đặt để truy cập nhanh và sử dụng offline
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button
              onClick={handleInstallClick}
              variant="primary"
              className="w-full sm:w-auto whitespace-nowrap text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
              disabled={!deferredPrompt}
            >
              📥 Cài đặt ngay
            </Button>
            <Button
              onClick={handleDismiss}
              variant="secondary"
              className="w-full sm:w-auto whitespace-nowrap text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
            >
              Để sau
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InstallPrompt;

