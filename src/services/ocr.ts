
const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image';
const OCR_SPACE_API_KEY = import.meta.env.VITE_OCR_SPACE_API_KEY || 'K89790724088957';

const OCR_MAX_SIZE = 1024 * 1024; // 1MB - giới hạn của OCR.space API

const compressImage = async (
  canvas: HTMLCanvasElement,
  maxSize: number,
  quality: number = 0.9,
  useJpeg: boolean = false
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const mimeType = useJpeg ? 'image/jpeg' : 'image/png';
    const outputQuality = useJpeg ? quality : undefined;

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Không thể tạo blob từ canvas'));
          return;
        }

        // Nếu file vẫn > maxSize và quality > 0.3, giảm quality và thử lại
        if (blob.size > maxSize && quality > 0.3) {
          const newQuality = Math.max(0.3, quality - 0.1);
          compressImage(canvas, maxSize, newQuality, useJpeg || quality < 0.6)
            .then(resolve)
            .catch(reject);
          return;
        }

        // Nếu vẫn > maxSize, giảm kích thước canvas
        if (blob.size > maxSize) {
          const ratio = Math.sqrt(maxSize / blob.size) * 0.9;
          const newWidth = Math.round(canvas.width * ratio);
          const newHeight = Math.round(canvas.height * ratio);
          
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          if (!tempCtx) {
            reject(new Error('Không thể tạo canvas context'));
            return;
          }
          
          tempCanvas.width = newWidth;
          tempCanvas.height = newHeight;
          tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
          
          compressImage(tempCanvas, maxSize, 0.7, true)
            .then(resolve)
            .catch(reject);
          return;
        }

        const processedFile = new File([blob], 'processed.jpg', {
          type: mimeType,
          lastModified: Date.now(),
        });
        resolve(processedFile);
      },
      mimeType,
      outputQuality
    );
  });
};

const preprocessImage = async (imageFile: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Không thể tạo canvas context'));
      return;
    }

    img.onload = async () => {
      // Giảm kích thước ban đầu để tối ưu
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

      try {
        // Compress image để đảm bảo < 1MB
        const compressedFile = await compressImage(canvas, OCR_MAX_SIZE, 0.85, false);
        resolve(compressedFile);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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

    const processedImage = await preprocessImage(imageFile);
    onProgress?.(30);
    onStatus?.('Đang chuẩn bị gửi đến OCR service...');

    const base64Image = await fileToBase64(processedImage);
    onProgress?.(50);
    onStatus?.('Đang nhận diện text...');

    // Kiểm tra kích thước base64 (base64 tăng ~33% so với binary)
    const base64Size = (base64Image.length * 3) / 4;
    if (base64Size > OCR_MAX_SIZE) {
      throw new Error(`Ảnh sau khi xử lý vẫn quá lớn (${(base64Size / 1024 / 1024).toFixed(2)}MB). Vui lòng thử ảnh nhỏ hơn hoặc chất lượng thấp hơn.`);
    }

    const formData = new FormData();
    formData.append('apikey', OCR_SPACE_API_KEY);
    formData.append('base64Image', `data:${processedImage.type};base64,${base64Image}`);
    formData.append('language', 'auto');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

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

    if (result.OCRExitCode !== 1) {
      const errorMessage = result.ErrorMessage?.[0] || 'Lỗi không xác định từ OCR service';
      throw new Error(`OCR failed: ${errorMessage}`);
    }

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
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.');
      }
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new Error('Đã vượt quá giới hạn requests. Vui lòng thử lại sau.');
      }
      throw error;
    }
    throw new Error('Không thể đọc text từ ảnh. Vui lòng thử lại.');
  }
};
