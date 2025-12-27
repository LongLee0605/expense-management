import { parseCurrencyInput } from './currencyInput';
import { Currency } from '../types';

export const validateTransactionForm = (
  amount: string,
  category: string,
  currency: Currency
): { isValid: boolean; error?: string } => {
  if (!amount || !category) {
    return { isValid: false, error: 'Vui lòng điền đầy đủ thông tin' };
  }

  const parsedAmount = parseCurrencyInput(amount, currency);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return { isValid: false, error: 'Số tiền không hợp lệ' };
  }

  return { isValid: true };
};

export const validateAmount = (
  amount: string,
  currency: Currency
): { isValid: boolean; error?: string; parsedAmount?: number } => {
  if (!amount) {
    return { isValid: false, error: 'Vui lòng nhập số tiền' };
  }

  const parsedAmount = parseCurrencyInput(amount, currency);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return { isValid: false, error: 'Số tiền không hợp lệ' };
  }

  return { isValid: true, parsedAmount };
};

