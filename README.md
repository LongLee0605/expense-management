# Expense Management

Ứng dụng quản lý chi tiêu cá nhân và gia đình được xây dựng với React, TypeScript, TailwindCSS, Vite và PWA.

## 🚀 Tính năng

- **Đăng nhập với Google** - Đồng bộ dữ liệu giữa các thiết bị
- **Quản lý thu chi cá nhân và gia đình** - Theo dõi chi tiêu hiệu quả
- **Quét hóa đơn tự động** - Sử dụng OCR.space API để trích xuất thông tin
- **Progressive Web App (PWA)** - Có thể cài đặt trên mobile và desktop
- **Đồng bộ real-time** - Dữ liệu tự động cập nhật qua Firebase Firestore
- **Giao diện hiện đại** - Với TailwindCSS
- **TypeScript** - Đảm bảo type safety
- **Cấu trúc code rõ ràng** - Dễ mở rộng và bảo trì

## 📋 Yêu cầu

- Node.js >= 18.0.0
- npm >= 9.0.0 hoặc yarn >= 1.22.0

## 🛠️ Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. **Bắt buộc** Tạo file `.env` ở root directory để cấu hình Firebase và API keys:

```bash
# Firebase Configuration (BẮT BUỘC)
# Lấy từ Firebase Console: https://console.firebase.google.com/
# Project Settings > General > Your apps > Web app
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id

# OCR.space API Key
VITE_OCR_SPACE_API_KEY=K89790724088957
```

**Hướng dẫn cấu hình Firebase:**

1. Tạo project mới tại [Firebase Console](https://console.firebase.google.com/)
2. Bật **Authentication** > **Sign-in method** > **Google** (Enable)
3. Tạo **Firestore Database** (chế độ Production hoặc Test mode)
4. Lấy config từ **Project Settings** > **General** > **Your apps** > **Web app**
5. Copy các giá trị vào file `.env`

**Lưu ý:**
- Firebase Authentication và Firestore là **BẮT BUỘC** để ứng dụng hoạt động
- Firebase có free tier rộng rãi cho các dự án nhỏ
- Dữ liệu sẽ được đồng bộ tự động giữa các thiết bị khi đăng nhập

3. Chạy ứng dụng ở chế độ development:
```bash
npm run dev
```

4. Build cho production:
```bash
npm run build
```

5. Preview build production:
```bash
npm run preview
```

## 📁 Cấu trúc dự án

```
expense-management/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services và business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles với Tailwind
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🎨 Công nghệ sử dụng

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool và dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Vite PWA Plugin** - PWA support
- **Firebase Authentication** - Đăng nhập với Google
- **Firebase Firestore** - Database real-time để đồng bộ dữ liệu
- **OCR.space API** - OCR service với độ chính xác cao, hỗ trợ tốt tiếng Việt

## 📱 PWA

Ứng dụng được cấu hình như một Progressive Web App, cho phép:
- Cài đặt trên thiết bị
- Hoạt động offline
- Cập nhật tự động

Để tạo icons cho PWA, thêm các file sau vào thư mục `public/`:
- `pwa-192x192.png` (192x192 pixels)
- `pwa-512x512.png` (512x512 pixels)
- `favicon.ico`
- `apple-touch-icon.png` (180x180 pixels)
- `mask-icon.svg`

## 🔧 Phát triển thêm

### Thêm trang mới

1. Tạo component trong `src/pages/`
2. Thêm route trong `src/App.tsx`

### Thêm component

Tạo component trong `src/components/` và export từ đó.

### Thêm custom hook

Tạo hook trong `src/hooks/` và export từ `src/hooks/index.ts`.

### Thêm service

Tạo service trong `src/services/` để xử lý API calls hoặc business logic.

## 📝 Linting

Chạy ESLint để kiểm tra code:
```bash
npm run lint
```

## 🚀 Deploy

Sau khi build, thư mục `dist/` chứa các file production-ready có thể deploy lên bất kỳ static hosting nào như:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

## 📄 License

MIT
