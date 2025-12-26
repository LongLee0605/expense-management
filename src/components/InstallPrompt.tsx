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

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    setShowPrompt(true);
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
        setIsInstalled(true);
      }
    } catch {
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (isInstalled) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS && !deferredPrompt) {
    return (
      <Card>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <span className="text-3xl">📱</span>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Cài đặt ứng dụng trên iOS</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Nhấn nút <strong>Share</strong> (📤) ở thanh địa chỉ</li>
                <li>Chọn <strong>"Thêm vào Màn hình chính"</strong></li>
                <li>Nhấn <strong>"Thêm"</strong> để hoàn tất</li>
              </ol>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📲</span>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Cài đặt ứng dụng</h3>
              <p className="text-sm text-green-800">
                Cài đặt ứng dụng để truy cập nhanh và sử dụng offline
              </p>
            </div>
          </div>
          <div className="flex space-x-2 ml-4">
            <Button
              onClick={handleInstallClick}
              variant="primary"
              className="whitespace-nowrap"
            >
              📥 Cài đặt ngay
            </Button>
            <Button
              onClick={handleDismiss}
              variant="secondary"
              className="whitespace-nowrap"
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

