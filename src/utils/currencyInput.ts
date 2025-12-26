import { Currency } from '../types';

/**
 * Format số tiền để hiển thị trong input theo loại tiền tệ
 */
export const formatCurrencyInput = (
  value: string,
  currency: Currency
): string => {
  if (!value || value.trim() === '') return '';

  if (currency === 'VND') {
    // VND: 10.000.000 (dấu chấm phân cách hàng nghìn, không có thập phân)
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';
    const number = parseInt(numericValue, 10);
    if (isNaN(number)) return '';
    return number.toLocaleString('vi-VN');
  } else {
    // Các loại tiền khác: 1,234.56 (dấu phẩy hàng nghìn, dấu chấm thập phân)
    // Giữ lại dấu chấm cho phần thập phân
    const cleanValue = value.replace(/[^\d.,]/g, '');
    
    // Tách phần nguyên và phần thập phân
    const parts = cleanValue.split(/[.,]/);
    const integerPart = parts[0] || '';
    const decimalPart = parts[1] || '';
    
    // Format phần nguyên với dấu phẩy
    const formattedInteger = integerPart
      ? parseInt(integerPart, 10).toLocaleString('en-US')
      : '';
    
    // Kết hợp với phần thập phân (tối đa 2 chữ số)
    if (decimalPart) {
      return `${formattedInteger}.${decimalPart.slice(0, 2)}`;
    }
    
    // Nếu đang nhập dấu chấm hoặc phẩy, giữ lại
    if (cleanValue.endsWith('.') || cleanValue.endsWith(',')) {
      return formattedInteger + '.';
    }
    
    return formattedInteger;
  }
};

/**
 * Parse số tiền từ input đã format về số thực
 */
export const parseCurrencyInput = (
  formattedValue: string,
  currency: Currency
): number => {
  if (!formattedValue) return 0;

  if (currency === 'VND') {
    // VND: loại bỏ dấu chấm
    const cleanValue = formattedValue.replace(/\./g, '');
    return parseInt(cleanValue, 10) || 0;
  } else {
    // Các loại tiền khác: loại bỏ dấu phẩy, giữ dấu chấm cho thập phân
    // Chuyển dấu phẩy thành dấu chấm nếu có
    const cleanValue = formattedValue.replace(/,/g, '');
    
    // Nếu có dấu chấm, giữ lại (là phần thập phân)
    if (cleanValue.includes('.')) {
      return parseFloat(cleanValue) || 0;
    }
    
    return parseInt(cleanValue, 10) || 0;
  }
};

/**
 * Format số tiền để hiển thị placeholder trong input
 */
export const getCurrencyPlaceholder = (currency: Currency): string => {
  switch (currency) {
    case 'VND':
      return '10.000.000';
    case 'USD':
      return '1,234.56';
    case 'EUR':
      return '1.234,56';
    case 'JPY':
      return '1,234';
    case 'GBP':
      return '1,234.56';
    case 'CNY':
      return '1,234.56';
    default:
      return '0';
  }
};

/**
 * Component helper để xử lý onChange của input tiền tệ
 */
export const handleCurrencyInputChange = (
  value: string,
  currency: Currency,
  setValue: (value: string) => void
) => {
  // Cho phép xóa hết
  if (value === '') {
    setValue('');
    return;
  }

  // Format theo loại tiền tệ
  const formatted = formatCurrencyInput(value, currency);
  setValue(formatted);
};

