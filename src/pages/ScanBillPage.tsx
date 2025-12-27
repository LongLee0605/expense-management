import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks';
import { Button, Card, ImageUpload } from '../components';
import { useToast } from '../contexts/ToastContext';
import { Expense, Currency } from '../types';
import { scanBill } from '../services/billScanner';
import {
  EXPENSE_CATEGORIES,
  getCurrencyList,
  generateId,
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  getCurrencyPlaceholder,
  formatDate,
  CURRENCIES,
} from '../utils';

const ScanBillPage = () => {
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  const { showError, showSuccess } = useToast();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [extractedText, setExtractedText] = useState('');
  const [editableText, setEditableText] = useState('');
  const [isEditingText, setIsEditingText] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'VND' as Currency,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const handleImageSelect = (file: File) => {
    try {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImagePreview(reader.result as string);
        }
      };
      reader.onerror = () => {
        showError('Lỗi khi đọc file ảnh');
        setImageFile(null);
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
      setExtractedText('');
      setEditableText('');
      setAnalysisResult(null);
      setStatus('');
      setIsEditingText(false);
    } catch (error) {
      showError('Lỗi khi chọn file: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleScan = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus('');

    try {
      const result = await scanBill(imageFile, setProgress, setStatus);
      setExtractedText(result.text);
      setEditableText(result.text);
      setAnalysisResult(result.analysis);

      const analysis = result.analysis;
      const detectedCurrency = analysis.currency || 'VND';
      setFormData({
        amount: formatCurrencyInput(analysis.amount.toString(), detectedCurrency),
        currency: detectedCurrency,
        category: analysis.category,
        description: analysis.description,
        date: analysis.date,
      });
      
      if (analysis.confidence >= 80) {
        showSuccess(`Đã phân tích thành công! Độ chính xác: ${analysis.confidence}% (${result.method.toUpperCase()})`);
      } else if (analysis.confidence < 60) {
        showError('Độ chính xác thấp. Vui lòng kiểm tra và chỉnh sửa thông tin.');
      } else {
        showError('Độ chính xác trung bình. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (import.meta.env.DEV) {
      }
      
      showError('Lỗi khi quét bill: ' + errorMessage);
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const handleReAnalyze = async () => {
    try {
      if (!editableText.trim()) {
        showError('Vui lòng nhập text để phân tích');
        return;
      }

      const { analyzeBillText } = await import('../services/billAnalyzer');
      const analysis = analyzeBillText(editableText);
      setAnalysisResult(analysis);
      setExtractedText(editableText);

      const detectedCurrency = analysis.currency || 'VND';
      setFormData({
        amount: formatCurrencyInput(analysis.amount.toString(), detectedCurrency),
        currency: detectedCurrency,
        category: analysis.category,
        description: analysis.description,
        date: analysis.date,
      });

      setIsEditingText(false);
      showSuccess('Đã phân tích lại thành công!');
    } catch (error) {
      showError('Lỗi khi phân tích lại: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.amount || !formData.category) {
        showError('Vui lòng điền đầy đủ thông tin');
        return;
      }

      const parsedAmount = parseCurrencyInput(formData.amount, formData.currency);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        showError('Số tiền không hợp lệ');
        return;
      }

      const transaction: Expense = {
        id: generateId(),
        amount: parsedAmount,
        currency: formData.currency,
        category: formData.category,
        description: formData.description || (analysisResult?.merchantName ? analysisResult.merchantName : 'Hóa đơn'),
        date: formData.date,
        type: 'expense',
        ...(extractedText && { notes: `Text từ bill: ${extractedText.substring(0, 300)}...` }),
      };

      await addTransaction(transaction);
      showSuccess('Thêm giao dịch từ bill thành công!');
      navigate('/transactions');
    } catch (error: any) {
      const errorMessage = error?.message || 'Lỗi khi lưu giao dịch. Vui lòng thử lại.';
      console.error('[Scan Bill Submit Error]', error);
      showError(errorMessage);
    }
  };

  const handleAutoSave = async () => {
    try {
      if (!analysisResult) {
        showError('Không có dữ liệu để lưu.');
        return;
      }

      if (analysisResult.amount === 0) {
        showError('Không thể lưu giao dịch với số tiền bằng 0.');
        return;
      }

      if (analysisResult.category === 'other') {
        showError('Vui lòng chọn danh mục cụ thể trước khi tự động lưu.');
        return;
      }

      if (analysisResult.confidence < 85) {
        showError('Độ chính xác chưa đủ để tự động lưu.');
        return;
      }

      const transaction: Expense = {
        id: generateId(),
        amount: analysisResult.amount,
        currency: analysisResult.currency,
        category: analysisResult.category,
        description: analysisResult.description,
        date: analysisResult.date,
        type: 'expense',
        ...(extractedText && { notes: `Text từ bill: ${extractedText.substring(0, 300)}...` }),
      };

      await addTransaction(transaction);
      showSuccess('Đã tự động thêm giao dịch từ bill!');
      navigate('/transactions');
    } catch (error: any) {
      const errorMessage = error?.message || 'Lỗi khi tự động lưu. Vui lòng thử lại.';
      console.error('[Auto Save Error]', error);
      showError(errorMessage);
    }
  };

  return (
    <div className="max-w-full lg:max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 pb-20 w-full lg:px-3">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Quét hóa đơn</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Upload ảnh hóa đơn để tự động trích xuất thông tin giao dịch
        </p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">1. Upload ảnh hóa đơn</h3>
        <ImageUpload
          onImageSelect={handleImageSelect}
          preview={imagePreview}
          disabled={isProcessing}
        />
        {imagePreview && (
          <div className="mt-3 flex justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowImageModal(true)}
              className="text-sm"
            >
              🔍 Xem ảnh lớn
            </Button>
          </div>
        )}
      </Card>

      {imageFile && !analysisResult && (
        <Card>
          <Button
            onClick={handleScan}
            disabled={isProcessing}
            className="w-full"
            variant="primary"
          >
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="flex items-center space-x-2">
                  <span>{status || `Đang quét... ${progress}%`}</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
                {progress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              '🔍 Quét hóa đơn'
            )}
          </Button>
        </Card>
      )}

      {extractedText && (
        <Card>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Text đã quét được</h3>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(extractedText);
                  showSuccess('Đã copy text vào clipboard!');
                }}
                className="text-sm"
                title="Copy text"
              >
                📋 Copy
              </Button>
              {!isEditingText ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditingText(true)}
                  className="text-sm"
                >
                  ✏️ Chỉnh sửa
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleReAnalyze}
                  className="text-sm"
                >
                  🔄 Phân tích lại
                </Button>
              )}
            </div>
          </div>
          <textarea
            rows={6}
            value={isEditingText ? editableText : extractedText}
            onChange={(e) => setEditableText(e.target.value)}
            readOnly={!isEditingText}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-sm ${
              isEditingText ? 'bg-white' : 'bg-gray-50'
            } ${isEditingText ? '' : 'cursor-default'}`}
            placeholder="Text được trích xuất từ ảnh sẽ hiển thị ở đây..."
          />
          {isEditingText && (
            <p className="text-xs text-gray-500 mt-2">
              💡 Chỉnh sửa text nếu cần, sau đó nhấn "Phân tích lại" để cập nhật thông tin
            </p>
          )}
        </Card>
      )}

      {analysisResult && (
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Kết quả phân tích</h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-600">Độ chính xác:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    analysisResult.confidence >= 80
                      ? 'bg-green-500'
                      : analysisResult.confidence >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${analysisResult.confidence}%` }}
                />
              </div>
              <span
                className={`text-sm font-semibold ${
                  analysisResult.confidence >= 80
                    ? 'text-green-600'
                    : analysisResult.confidence >= 60
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {analysisResult.confidence}%
              </span>
            </div>
            {analysisResult.confidence < 60 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-2">
                <p className="text-sm text-yellow-800">
                  ⚠️ Độ chính xác thấp. Vui lòng kiểm tra và chỉnh sửa thông tin bên dưới.
                </p>
              </div>
            )}
            {analysisResult.confidence >= 85 && analysisResult.amount > 0 && analysisResult.category !== 'other' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-3 mt-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-green-800">
                    ✅ Độ chính xác cao! Bạn có thể tự động lưu giao dịch.
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleAutoSave}
                    className="text-sm px-3 py-1"
                  >
                    💾 Tự động lưu
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Số tiền:</p>
              <p className="font-semibold text-lg">
                {formatCurrency(analysisResult.amount, analysisResult.currency)}
              </p>
              {analysisResult.amount === 0 && (
                <p className="text-xs text-red-600 mt-1">⚠️ Không tìm thấy số tiền</p>
              )}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Danh mục:</p>
              <p className="font-semibold">
                {EXPENSE_CATEGORIES.find((c) => c.id === analysisResult.category)?.name || analysisResult.category}
              </p>
              {analysisResult.category === 'other' && (
                <p className="text-xs text-yellow-600 mt-1">⚠️ Chưa xác định được danh mục</p>
              )}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Ngày:</p>
              <p className="font-semibold">{formatDate(analysisResult.date, analysisResult.currency)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Mô tả:</p>
              <p className="font-semibold text-sm truncate">{analysisResult.description}</p>
            </div>
            {analysisResult.billType && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Loại bill:</p>
                <p className="font-semibold text-sm capitalize">{analysisResult.billType.replace('_', ' ')}</p>
              </div>
            )}
            {analysisResult.merchantName && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Cửa hàng:</p>
                <p className="font-semibold text-sm">{analysisResult.merchantName}</p>
              </div>
            )}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Loại tiền tệ:</p>
              <p className="font-semibold text-sm">
                {CURRENCIES[analysisResult.currency as Currency]?.symbol || ''} {analysisResult.currency}
              </p>
            </div>
          </div>
        </Card>
      )}

      {analysisResult && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">2. Xác nhận và chỉnh sửa thông tin</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền * ({formData.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {CURRENCIES[formData.currency as Currency]?.symbol || formData.currency}
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.amount}
                    onChange={(e) => {
                      const formatted = formatCurrencyInput(e.target.value, formData.currency);
                      setFormData({ ...formData, amount: formatted });
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={getCurrencyPlaceholder(formData.currency)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại tiền *
                </label>
                <select
                  required
                  value={formData.currency}
                  onChange={(e) => {
                    const newCurrency = e.target.value as Currency;
                    if (formData.amount) {
                      const currentAmount = parseCurrencyInput(formData.amount, formData.currency);
                      const formattedAmount = formatCurrencyInput(currentAmount.toString(), newCurrency);
                      setFormData({ ...formData, currency: newCurrency, amount: formattedAmount });
                    } else {
                      setFormData({ ...formData, currency: newCurrency });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {getCurrencyList().map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn danh mục</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>


            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                Lưu giao dịch
              </Button>
            </div>
          </form>
        </Card>
      )}

      {showImageModal && imagePreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              title="Đóng"
            >
              ✕
            </button>
            <img
              src={imagePreview}
              alt="Hóa đơn"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {analysisResult && analysisResult.amount > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-3">Thao tác nhanh</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const amountText = formatCurrency(analysisResult.amount, analysisResult.currency);
                navigator.clipboard.writeText(amountText);
                showSuccess(`Đã copy số tiền: ${amountText}`);
              }}
              className="text-sm"
            >
              💰 Copy số tiền
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(analysisResult.description || '');
                showSuccess('Đã copy mô tả!');
              }}
              className="text-sm"
            >
              📝 Copy mô tả
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ScanBillPage;

