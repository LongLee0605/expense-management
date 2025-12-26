import { Currency } from '../types';
import { CURRENCIES } from './currency';

/**
 * Format ngày tháng theo locale của loại tiền tệ
 * @param date - Ngày cần format (string hoặc Date object)
 * @param currency - Loại tiền tệ (mặc định: VND)
 * @returns Chuỗi ngày đã format theo locale
 */
export const formatDate = (date: string | Date, currency: Currency = 'VND'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const currencyInfo = CURRENCIES[currency] || CURRENCIES.VND;
  const locale = currencyInfo.locale || 'vi-VN';
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
};

