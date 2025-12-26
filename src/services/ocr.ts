/**
 * OCR Service sử dụng OCR.space API
 * OCR.space cung cấp độ chính xác cao hơn Tesseract.js và hỗ trợ tốt cho tiếng Việt
 * 
 * FREE TIER: 25,000 requests/tháng (hoàn toàn miễn phí, không cần credit card)
 * - Không có API key: ~1,000 requests/tháng
 * - Có free API key: 25,000 requests/tháng
 * 
 * Lấy free API key tại: https://ocr.space/ocrapi/freekey
 * (Chỉ cần email, không cần credit card, hoàn toàn miễn phí)
 */

const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image';
// API key mặc định hoặc từ environment variable
// Lấy free API key tại: https://ocr.space/ocrapi/freekey (hoàn toàn miễn phí)
const OCR_SPACE_API_KEY = import.meta.env.VITE_OCR_SPACE_API_KEY || 'K89790724088957';

/**
 * Tiền xử lý ảnh để cải thiện độ chính xác OCR
 */
const preprocessImage = async (imageFile: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Không thể tạo canvas context'));
      return;
    }

    img.onload = () => {
      const maxWidth = 2000;
      const maxHeight = 2000;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Cải thiện độ tương phản và độ sáng
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        const contrast = 1.2;
        const brightness = 10;
        
        let newGray = (gray - 128) * contrast + 128 + brightness;
        newGray = Math.max(0, Math.min(255, newGray));
        
        data[i] = newGray;
        data[i + 1] = newGray;
        data[i + 2] = newGray;
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const processedFile = new File([blob], imageFile.name, {
              type: 'image/png',
              lastModified: Date.now(),
            });
            resolve(processedFile);
          } else {
            reject(new Error('Không thể xử lý ảnh'));
          }
        },
        'image/png',
        0.95
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
};

/**
 * Chuyển đổi File thành base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Loại bỏ data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Trích xuất text từ ảnh sử dụng OCR.space API
 * @param imageFile - File ảnh cần OCR
 * @param onProgress - Callback để cập nhật tiến trình (0-100)
 * @param onStatus - Callback để cập nhật trạng thái
 * @returns Promise<string> - Text đã được trích xuất
 */
export const extractTextFromImage = async (
  imageFile: File,
  onProgress?: (progress: number) => void,
  onStatus?: (status: string) => void
): Promise<string> => {
  try {
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('File không phải là ảnh hợp lệ');
    }

    if (imageFile.size > 20 * 1024 * 1024) {
      throw new Error('File ảnh quá lớn (tối đa 20MB)');
    }

    onStatus?.('Đang xử lý ảnh...');
    onProgress?.(10);

    // Tiền xử lý ảnh để cải thiện độ chính xác
    const processedImage = await preprocessImage(imageFile);
    onProgress?.(30);
    onStatus?.('Đang chuẩn bị gửi đến OCR service...');

    // Chuyển đổi ảnh sang base64
    const base64Image = await fileToBase64(processedImage);
    onProgress?.(50);
    onStatus?.('Đang nhận diện text...');

    // Gọi OCR.space API
    const formData = new FormData();
    formData.append('apikey', OCR_SPACE_API_KEY); // API key được gửi qua FormData
    formData.append('base64Image', `data:image/png;base64,${base64Image}`);
    // Sử dụng 'auto' để tự động nhận diện ngôn ngữ (Engine 2 hỗ trợ tốt)
    // Hoặc có thể dùng 'vnm' cho tiếng Việt, 'eng' cho tiếng Anh
    formData.append('language', 'auto'); // Tự động nhận diện ngôn ngữ (hỗ trợ tiếng Việt và tiếng Anh)
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Engine 2 hỗ trợ tiếng Việt và tự động nhận diện ngôn ngữ

    onProgress?.(60);
    onStatus?.('Đang gửi request đến OCR service...');

    const response = await fetch(OCR_SPACE_API_URL, {
      method: 'POST',
      body: formData,
    });

    onProgress?.(80);
    onStatus?.('Đang xử lý kết quả...');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OCR API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Kiểm tra lỗi từ API
    if (result.OCRExitCode !== 1) {
      const errorMessage = result.ErrorMessage?.[0] || 'Lỗi không xác định từ OCR service';
      throw new Error(`OCR failed: ${errorMessage}`);
    }

    // Trích xuất text từ kết quả
    const parsedResults = result.ParsedResults;
    if (!parsedResults || parsedResults.length === 0) {
      throw new Error('Không tìm thấy text trong ảnh');
    }

    let extractedText = '';
    for (const parsedResult of parsedResults) {
      if (parsedResult.ParsedText) {
        extractedText += parsedResult.ParsedText + '\n';
      }
    }

    // Làm sạch text
    extractedText = extractedText
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!extractedText || extractedText.length < 5) {
      throw new Error('Không thể đọc được text từ ảnh. Vui lòng thử ảnh khác có chất lượng tốt hơn.');
    }

    onProgress?.(100);
    onStatus?.('Hoàn thành!');

    return extractedText;
  } catch (error) {
    // Xử lý lỗi cụ thể
    if (error instanceof Error) {
      // Kiểm tra nếu là lỗi network
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.');
      }
      // Kiểm tra nếu là lỗi API rate limit
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new Error('Đã vượt quá giới hạn requests. Vui lòng thử lại sau.');
      }
      throw error;
    }
    throw new Error('Không thể đọc text từ ảnh. Vui lòng thử lại.');
  }
};
