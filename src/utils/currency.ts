import { Currency } from '../types';

/**
 * Định nghĩa các loại tiền tệ và thông tin của chúng
 */
export const CURRENCIES: Record<
  Currency,
  { symbol: string; name: string; locale: string }
> = {
  VND: { symbol: '₫', name: 'Việt Nam Đồng', locale: 'vi-VN' },
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
};

/**
 * Format số tiền theo loại tiền tệ
 */
export const formatCurrency = (
  amount: number,
  currency: Currency = 'VND'
): string => {
  const currencyInfo = CURRENCIES[currency];
  
  if (currency === 'VND') {
    // VND không có decimal
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Lấy danh sách các loại tiền tệ
 */
export const getCurrencyList = (): Array<{ value: Currency; label: string }> => {
  return Object.entries(CURRENCIES).map(([key, value]) => ({
    value: key as Currency,
    label: `${value.symbol} ${value.name}`,
  }));
};


