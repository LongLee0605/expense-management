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

## 🚀 Deploy lên Vercel

### Cách 1: Deploy qua Vercel Dashboard

1. **Đẩy code lên GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Kết nối với Vercel:**
   - Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New Project"**
   - Import repository từ GitHub
   - Vercel sẽ tự động phát hiện Vite project

3. **Cấu hình Environment Variables:**
   Trong Vercel Dashboard, vào **Settings** > **Environment Variables** và thêm các biến sau:

   ```
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_OCR_SPACE_API_KEY=your-ocr-api-key-here
   ```

4. **Cấu hình Firebase Authorized Domains:**
   - Vào [Firebase Console](https://console.firebase.google.com/)
   - Chọn project của bạn
   - Vào **Authentication** > **Settings** > **Authorized domains**
   - Thêm domain của Vercel (ví dụ: `your-project.vercel.app`)

5. **Deploy:**
   - Click **"Deploy"** trong Vercel Dashboard
   - Vercel sẽ tự động build và deploy ứng dụng

### Cách 2: Deploy qua Vercel CLI

1. **Cài đặt Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login vào Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Thêm Environment Variables:**
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add VITE_FIREBASE_AUTH_DOMAIN
   vercel env add VITE_FIREBASE_PROJECT_ID
   vercel env add VITE_FIREBASE_STORAGE_BUCKET
   vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
   vercel env add VITE_FIREBASE_APP_ID
   vercel env add VITE_FIREBASE_MEASUREMENT_ID
   vercel env add VITE_OCR_SPACE_API_KEY
   ```

5. **Redeploy với environment variables:**
   ```bash
   vercel --prod
   ```

### Cấu hình Vercel

File `vercel.json` đã được tạo sẵn với các cấu hình:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework:** Vite (tự động phát hiện)
- **SPA Routing:** Tất cả routes được rewrite về `/index.html`
- **PWA Support:** Service Worker được cấu hình đúng cache headers

### Lưu ý quan trọng:

1. **Firebase Authorized Domains:**
   - Sau khi deploy, thêm domain Vercel vào Firebase Authorized Domains
   - Format: `your-project.vercel.app` hoặc custom domain nếu có

2. **Environment Variables:**
   - Tất cả biến môi trường phải có prefix `VITE_` để Vite có thể truy cập
   - Các biến này sẽ được embed vào code khi build

3. **Firestore Rules:**
   - Đảm bảo Firestore Rules cho phép đọc/ghi dữ liệu từ domain Vercel
   - Ví dụ rule cơ bản:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

## 🚀 Deploy lên các platform khác

Sau khi build, thư mục `dist/` chứa các file production-ready có thể deploy lên:
- **Netlify** - Tương tự Vercel, thêm environment variables trong Netlify Dashboard
- **GitHub Pages** - Sử dụng GitHub Actions để build và deploy
- **Firebase Hosting** - `firebase deploy --only hosting`

## 📄 License

MIT
