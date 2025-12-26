import { analyzeBillText } from './billAnalyzer';
import { extractTextFromImage } from './ocr';

export type ScanMethod = 'ocr';

interface ScanResult {
  text: string;
  analysis: ReturnType<typeof analyzeBillText>;
  method: ScanMethod;
}

export const scanBill = async (
  imageFile: File,
  onProgress?: (progress: number) => void,
  onStatus?: (status: string) => void
): Promise<ScanResult> => {
  onStatus?.('Đang sử dụng OCR...');
  const text = await extractTextFromImage(imageFile, onProgress, onStatus);
  const analysis = analyzeBillText(text);

  return {
    text,
    analysis,
    method: 'ocr',
  };
};

