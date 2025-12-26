# Expense Management

Ứng dụng quản lý chi tiêu cá nhân và gia đình được xây dựng với React, TypeScript, TailwindCSS, Vite và PWA.

## 🚀 Tính năng

- Quản lý thu chi cá nhân và gia đình
- Quét hóa đơn tự động bằng AI (Google Gemini) hoặc OCR (OCR.space API)
- Progressive Web App (PWA) - có thể cài đặt trên mobile và desktop
- Giao diện hiện đại với TailwindCSS
- TypeScript để đảm bảo type safety
- Cấu trúc code rõ ràng, dễ mở rộng

## 📋 Yêu cầu

- Node.js >= 18.0.0
- npm >= 9.0.0 hoặc yarn >= 1.22.0

## 🛠️ Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. (Tùy chọn) Tạo file `.env` ở root directory để cấu hình API keys:

```bash
# Groq API Key cho AI Vision (hoàn toàn miễn phí, không cần credit card)
VITE_GROQ_API_KEY=your_groq_api_key_here

# OCR.space API Key (tùy chọn - nếu không có sẽ dùng free tier với giới hạn thấp hơn)
VITE_OCR_SPACE_API_KEY=your_ocr_space_api_key_here
```

**Lưu ý:**
- Ứng dụng có thể hoạt động mà không cần API keys (sử dụng OCR.space free tier ~1,000 requests/tháng)
- **Để có 25,000 requests/tháng miễn phí:** Lấy free API key tại https://ocr.space/ocrapi/freekey
  - Chỉ cần email, không cần credit card
  - Hoàn toàn miễn phí vĩnh viễn
  - Thêm vào file `.env`: `VITE_OCR_SPACE_API_KEY=your_key_here`
- Để lấy Groq API Key miễn phí: https://console.groq.com/
- **Tất cả đều hoàn toàn miễn phí, không cần credit card!**

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
- **Groq API** - AI Vision cho quét hóa đơn (hoàn toàn miễn phí, không cần credit card)
- **OCR.space API** - OCR service với độ chính xác cao, hỗ trợ tốt tiếng Việt (free tier: 25,000 requests/tháng)

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
