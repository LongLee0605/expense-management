import Tesseract from 'tesseract.js';

const suppressedMessages = [
  'language_model_ngram_on',
  'classify_misfit_junk_penalty',
  'classify_integer_matcher_multiplier',
  'parameter not found',
  'warning: parameter',
  'tesseract-core',
  'wasm.js',
  'relaxedsimd',
  'relaxedsimd-lstm',
  'react router future flag',
  'v7_relativeSplatPath',
  'relative route resolution',
  'tesseract-core-relaxedsimd-lstm',
];

const originalWarn = console.warn;
const originalError = console.error;

const formatMessage = (args: unknown[]): string => {
  return args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (arg && typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg || '');
    })
    .join(' ')
    .toLowerCase();
};

const shouldSuppressMessage = (message: string): boolean => {
  return suppressedMessages.some((msg) => message.includes(msg.toLowerCase())) ||
    message.includes('parameter not found:');
};

console.warn = (...args: unknown[]) => {
  try {
    const message = formatMessage(args);
    if (shouldSuppressMessage(message)) return;
    originalWarn.apply(console, args);
  } catch {
    originalWarn.apply(console, args);
  }
};

console.error = (...args: unknown[]) => {
  try {
    const message = formatMessage(args);
    if (shouldSuppressMessage(message)) return;
    originalError.apply(console, args);
  } catch {
    originalError.apply(console, args);
  }
};

const preprocessImage = async (imageFile: File): Promise<HTMLImageElement> => {
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

      const processedImg = new Image();
      processedImg.onload = () => resolve(processedImg);
      processedImg.onerror = reject;
      processedImg.src = canvas.toDataURL('image/png');
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
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
    onProgress?.(20);
    onStatus?.('Đang khởi tạo OCR...');

    const worker = await Tesseract.createWorker('vie+eng+chi_sim+jpn+kor+tha', 1, {
      logger: (m) => {
        if (m.status === 'warning' || m.status === 'info') return;
        
        const statusMap: Record<string, { status: string; progress: number }> = {
          'loading tesseract core': { status: 'Đang tải Tesseract...', progress: 30 },
          'initializing tesseract': { status: 'Đang khởi tạo Tesseract...', progress: 40 },
          'loading language traineddata': { status: 'Đang tải ngôn ngữ...', progress: 50 },
          'initializing api': { status: 'Đang khởi tạo API...', progress: 60 },
          'recognizing text': { status: 'Đang nhận diện text...', progress: 60 + Math.round(m.progress * 40) },
        };

        const statusInfo = statusMap[m.status];
        if (statusInfo) {
          onStatus?.(statusInfo.status);
          onProgress?.(statusInfo.progress);
        }
      },
    });

    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ.,:;!?()[]{}+-*/=<>"\'%$€£¥₫@#&_|\\/ ',
    });

    const { data } = await worker.recognize(processedImage);
    await worker.terminate();

    onProgress?.(100);
    onStatus?.('Hoàn thành!');

    const extractedText = data.text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!extractedText || extractedText.length < 5) {
      throw new Error('Không thể đọc được text từ ảnh. Vui lòng thử ảnh khác có chất lượng tốt hơn.');
    }

    return extractedText;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Không thể đọc text từ ảnh. Vui lòng thử lại.');
  }
};
