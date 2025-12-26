import { Currency } from '../types';
import { EXPENSE_CATEGORIES, getTodayDate } from '../utils';

interface BillAnalysisResult {
  amount: number;
  currency: Currency;
  category: string;
  description: string;
  date: string;
  confidence: number;
  billType?: string; // Loại bill: restaurant, supermarket, gas_station, etc.
  merchantName?: string; // Tên cửa hàng/merchant
}

/**
 * Phân tích text từ bill để extract thông tin
 */
export const analyzeBillText = (text: string): BillAnalysisResult => {
  const normalizedText = text.toLowerCase();
  const originalText = text;
  
  // Extract số tiền (sử dụng cả normalized và original để tìm pattern tốt hơn)
  const { amount, amountPosition } = extractAmount(normalizedText, originalText);
  
  // Extract currency (sử dụng cả normalized và original để tìm tốt hơn, với vị trí số tiền)
  const currency = extractCurrency(normalizedText, originalText, amount, amountPosition);
  
  // Nhận diện loại bill và merchant name
  const { billType, merchantName } = identifyBillType(originalText, normalizedText);
  
  // Phân loại danh mục dựa trên keywords và bill type
  const category = categorizeBill(normalizedText, billType);
  
  // Extract ngày
  const date = extractDate(normalizedText) || getTodayDate();
  
  // Tạo description từ merchant name hoặc text
  const description = extractDescription(originalText, category, merchantName);
  
  // Tính confidence score
  const confidence = calculateConfidence(amount, category, date, billType);
  
  return {
    amount,
    currency,
    category,
    description,
    date,
    confidence,
    billType,
    merchantName,
  };
};

/**
 * Extract số tiền từ text với nhiều pattern hơn (cải thiện đáng kể)
 * Trả về cả số tiền và vị trí của nó trong text
 */
const extractAmount = (_normalizedText: string, originalText: string): { amount: number; amountPosition: number } => {
  const foundAmounts: Array<{ amount: number; priority: number; position: number; currency?: string }> = [];
  const lines = originalText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Helper function để parse số tiền từ string
  const parseAmount = (amountStr: string): number | null => {
    if (!amountStr) return null;
    
    // Loại bỏ tất cả ký tự không phải số, dấu chấm, phẩy, khoảng trắng
    let cleanStr = amountStr.replace(/[^\d.,\s]/g, '');
    
    // Xử lý các format khác nhau
    // Format VN: 1.000.000 hoặc 1,000,000 hoặc 1 000 000
    if (/[\d]{1,3}[.,\s][\d]{3}[.,\s][\d]{3}/.test(cleanStr)) {
      // Format có dấu phân cách hàng nghìn
      cleanStr = cleanStr.replace(/[.,\s]/g, '');
    } else if (/[\d]{1,3}[.,][\d]{3}/.test(cleanStr)) {
      // Format có thể là số thập phân hoặc hàng nghìn
      // Nếu có 2 chữ số sau dấu chấm/phẩy cuối, coi là số thập phân
      const parts = cleanStr.split(/[.,]/);
      if (parts.length === 2 && parts[1].length <= 2) {
        // Số thập phân (ví dụ: 1.50 hoặc 1,50)
        cleanStr = cleanStr.replace(/[.,]/g, '');
      } else {
        // Hàng nghìn
        cleanStr = cleanStr.replace(/[.,\s]/g, '');
      }
    } else {
      // Chỉ có số, loại bỏ dấu chấm, phẩy, khoảng trắng
      cleanStr = cleanStr.replace(/[.,\s]/g, '');
    }

    const number = parseInt(cleanStr, 10);
    // Validate: số tiền hợp lý từ 1,000 đến 1 tỷ
    if (!isNaN(number) && number >= 1000 && number < 1000000000) {
      return number;
    }
    return null;
  };

  // 1. Tìm số tiền ngay sau các từ khóa quan trọng - Priority CAO NHẤT
  // Pattern: từ khóa + số tiền (trong vòng 30 ký tự)
  const totalKeywords = [
    'tổng', 'total', 'thanh toán', 'payment', 'paid', 'tổng cộng', 'tổng tiền',
    'thành tiền', 'cộng tiền', 'grand total', 'tổng thanh toán', 'tổng giá trị',
    'phải trả', 'phải thanh toán', 'cần trả', 'amount due', 'balance', 'final amount',
    'tổng số tiền', 'tổng giá', 'tổng trị giá', 'tổng cộng tiền', 'tổng thanh toán',
    'số tiền phải trả', 'tiền thanh toán', 'tiền phải trả'
  ];
  
  for (const keyword of totalKeywords) {
    const keywordRegex = new RegExp(keyword.replace(/\s+/g, '\\s+'), 'gi');
    const matches = originalText.matchAll(keywordRegex);
    
    for (const match of matches) {
      const keywordEnd = (match.index || 0) + match[0].length;
      const searchStart = keywordEnd;
      const searchEnd = Math.min(originalText.length, keywordEnd + 50); // Tìm trong vòng 50 ký tự sau từ khóa
      const context = originalText.substring(searchStart, searchEnd);
      
      // Pattern tìm số tiền ngay sau từ khóa
      const amountPatterns = [
        /[\s:]*([\d.,\s]{4,})\s*(?:₫|vnđ|vnd|đồng|đ|dong|usd|\$|eur|€|jpy|¥|gbp|£|cny)/i, // Có currency
        /[\s:]*([\d.,\s]{6,})/i, // Số tiền lớn (ít nhất 6 ký tự)
      ];
      
      for (const pattern of amountPatterns) {
        const amountMatch = context.match(pattern);
        if (amountMatch && amountMatch[1]) {
          const amount = parseAmount(amountMatch[1]);
          if (amount && amount >= 10000) {
            const amountPosition = searchStart + (amountMatch.index || 0);
            // Priority rất cao: 50 + bonus nếu có currency
            const priority = amountMatch[0].match(/₫|vnđ|vnd|đ|usd|\$|eur|€|jpy|¥|gbp|£|cny/i) ? 55 : 50;
            foundAmounts.push({
              amount,
              priority,
              position: amountPosition,
              currency: context.match(/₫|vnđ|vnd|đồng|đ/i) ? 'VND' : undefined
            });
            break; // Chỉ lấy số đầu tiên sau từ khóa
          }
        }
      }
    }
  }

  // 2. Tìm số tiền kèm currency symbol trong cùng dòng - Priority cao
  // Pattern: số tiền + ký hiệu currency (₫, $, €, etc.)
  const amountWithCurrencyPatterns = [
    /([\d.,\s]{4,})\s*₫/gu, // 151.000₫, 105.000₫
    /([\d.,\s]{4,})\s*(?:vnđ|vnd|đồng|dong)\b/gi, // 151.000 VNĐ
    /([\d.,\s]{4,})\s*đ\b/gi, // 151.000 đ
    /\$\s*([\d.,\s]{2,})/gi, // $100
    /€\s*([\d.,\s]+)/gi, // €100
    /¥\s*([\d.,\s]+)/gi, // ¥1000
    /£\s*([\d.,\s]+)/gi, // £100
  ];

  for (const line of lines) {
    for (const pattern of amountWithCurrencyPatterns) {
      const matches = line.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'));
      for (const match of matches) {
        if (match[1]) {
          const amount = parseAmount(match[1]);
          if (amount) {
            const lineIndex = originalText.indexOf(line);
            const matchIndex = line.indexOf(match[0]);
            foundAmounts.push({ 
              amount, 
              priority: 35, // Priority cao vì có currency symbol
              position: lineIndex + matchIndex,
              currency: line.includes('₫') || line.match(/vnđ|vnd|đồng|đ/i) ? 'VND' : undefined
            });
          }
        }
      }
    }
  }

  // 3. Tìm số tiền ở cuối bill (thường là tổng tiền) - Priority trung bình-cao
  const lastLines = lines.slice(-8); // 8 dòng cuối
  for (let i = lastLines.length - 1; i >= 0; i--) {
    const line = lastLines[i];
    
    // Pattern với từ khóa tổng/total ở cuối bill - cải thiện pattern
    const totalPatterns = [
      /(?:tổng|total|thanh\s+toán|payment|tổng\s+cộng|tổng\s+tiền|thành\s+tiền|cộng\s+tiền|grand\s+total|tổng\s+thanh\s+toán|tổng\s+giá\s+trị)[\s:]*([\d.,\s]+)/i,
      /([\d.,\s]{6,})\s*(?:vnđ|vnd|đ|dong|usd|\$|eur|€|jpy|¥|gbp|£|cny)/i, // Ít nhất 6 ký tự số
      /(?:phải\s+trả|phải\s+thanh\s+toán|cần\s+trả)[\s:]*([\d.,\s]+)/i,
    ];

    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const amount = parseAmount(match[1]);
        if (amount && amount >= 10000) { // Chỉ lấy số >= 10,000
          const lineIndex = originalText.indexOf(line);
          const matchIndex = line.indexOf(match[0]);
          // Tăng priority cho dòng cuối cùng (nhưng thấp hơn pattern 1)
          const priority = 25 + (lastLines.length - i) * 2; // Dòng cuối có priority cao hơn
          foundAmounts.push({ 
            amount, 
            priority, 
            position: lineIndex + matchIndex,
            currency: line.includes('₫') || line.match(/vnđ|vnd|đồng|đ/i) ? 'VND' : undefined
          });
          break; // Chỉ lấy match đầu tiên trong mỗi dòng
        }
      }
    }
  }

  // 4. Tìm số tiền với từ khóa rõ ràng trong toàn bộ text - Priority trung bình (fallback)
  // Lưu ý: Các pattern này đã được xử lý ở bước 1, nhưng giữ lại để đảm bảo không bỏ sót
  const keywordPatterns = [
    /(?:giá|price|cost|giá\s+trị|value|tiền\s+hàng)[\s:]*([\d.,\s]+)/gi,
    /(?:số\s+tiền|amount|tiền)[\s:]*([\d.,\s]+)/gi,
  ];

  keywordPatterns.forEach((pattern, index) => {
    const matches = originalText.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const amount = parseAmount(match[1]);
        if (amount && amount >= 10000) {
          foundAmounts.push({ amount, priority: 12 - index, position: match.index || 0 });
        }
      }
    }
  });

  // 4. Tìm số tiền có format VN (1.000.000, 1,000,000, 1 000 000) - Priority thấp hơn
  // Chỉ tìm các số có ít nhất 6 chữ số (100.000 trở lên)
  const vnPatterns = [
    /([\d]{1,3}[.,\s][\d]{3}[.,\s][\d]{3}(?:[.,][\d]{2})?)/g, // 1.000.000 hoặc 1,000,000
    /([\d]{1,3}\s[\d]{3}\s[\d]{3}(?:\s[\d]{2})?)/g, // 1 000 000
    /([\d]{6,9})/g, // Số đơn giản từ 6-9 chữ số
  ];

  vnPatterns.forEach((pattern, index) => {
    const matches = originalText.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        // Loại bỏ các số có thể là date, phone, mã số
        const matchStr = match[1];
        const beforeMatch = originalText.substring(Math.max(0, (match.index || 0) - 10), match.index || 0);
        const afterMatch = originalText.substring((match.index || 0) + matchStr.length, (match.index || 0) + matchStr.length + 10);
        
        // Bỏ qua nếu là date pattern
        if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]/.test(beforeMatch + matchStr + afterMatch)) {
          continue;
        }
        
        // Bỏ qua nếu là phone number pattern (có dấu + hoặc 0 ở đầu)
        if (/\+|^0/.test(beforeMatch + matchStr)) {
          continue;
        }

        const amount = parseAmount(matchStr);
        if (amount && amount >= 10000) {
          foundAmounts.push({ amount, priority: 5 - index, position: match.index || 0 });
        }
      }
    }
  });

  // 5. Tìm số tiền với currency symbol (fallback) - Priority thấp
  const currencyPattern = /([\d.,\s]+)\s*(?:vnđ|vnd|đ|dong|usd|\$|eur|€|jpy|¥|gbp|£|cny)/gi;
  const currencyMatches = originalText.matchAll(currencyPattern);
  for (const match of currencyMatches) {
    if (match[1]) {
      const amount = parseAmount(match[1]);
      if (amount) {
        foundAmounts.push({ amount, priority: 8, position: match.index || 0 });
      }
    }
  }

  // 6. Nếu vẫn chưa tìm thấy, tìm số lớn nhất hợp lý trong text
  if (foundAmounts.length === 0) {
    const allNumbers = originalText.match(/\d{4,9}/g);
    if (allNumbers) {
      const parsed = allNumbers
        .map((n) => parseInt(n, 10))
        .filter((n) => n >= 10000 && n < 1000000000);
      if (parsed.length > 0) {
        const maxNumber = Math.max(...parsed);
        foundAmounts.push({ amount: maxNumber, priority: 1, position: 0 });
      }
    }
  }

  // Sắp xếp: ưu tiên priority cao nhất, nếu bằng nhau thì ưu tiên số ở cuối bill (position lớn), nếu vẫn bằng thì lấy số lớn nhất
  if (foundAmounts.length > 0) {
    foundAmounts.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      // Nếu cùng priority, ưu tiên số ở cuối bill hơn (position lớn hơn)
      if (b.position !== a.position) {
        return b.position - a.position;
      }
      // Nếu cùng vị trí, lấy số lớn hơn (thường là tổng tiền)
      return b.amount - a.amount;
    });
    
    // Cải thiện: Nếu có nhiều số tiền, ưu tiên số lớn nhất hợp lý ở cuối bill
    // Loại bỏ các số tiền quá nhỏ (có thể là giá từng món)
    const validAmounts = foundAmounts.filter(a => a.amount >= 10000); // Ít nhất 10,000
    
    if (validAmounts.length > 0) {
      // Tìm số tiền lớn nhất ở cuối bill (40% cuối của text)
      const textLength = originalText.length;
      const lastPartStart = textLength * 0.6; // 40% cuối của text
      
      const amountsInLastPart = validAmounts.filter(a => a.position >= lastPartStart);
      
      if (amountsInLastPart.length > 0) {
        // Ưu tiên: priority cao nhất, sau đó là số lớn nhất
        amountsInLastPart.sort((a, b) => {
          if (b.priority !== a.priority) {
            return b.priority - a.priority;
          }
          // Nếu cùng priority, ưu tiên số lớn hơn (thường là tổng tiền)
          return b.amount - a.amount;
        });
        
        const bestAmount = amountsInLastPart[0];
        return {
          amount: bestAmount.amount,
          amountPosition: bestAmount.position,
        };
      }
      
      // Nếu không có ở cuối, lấy số lớn nhất có priority cao
      validAmounts.sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        // Nếu cùng priority, ưu tiên số lớn hơn
        return b.amount - a.amount;
      });
      
      const bestAmount = validAmounts[0];
      return {
        amount: bestAmount.amount,
        amountPosition: bestAmount.position,
      };
    }
    
    // Fallback: lấy số đầu tiên (đã được sắp xếp)
    const bestAmount = foundAmounts[0];
    return {
      amount: bestAmount.amount,
      amountPosition: bestAmount.position,
    };
  }

  return { amount: 0, amountPosition: 0 };
};

/**
 * Extract currency từ text (cải thiện đáng kể - tìm currency gần số tiền nhất)
 */
const extractCurrency = (_normalizedText: string, originalText: string, amount: number, amountPosition: number): Currency => {
  const foundCurrencies: Array<{ currency: Currency; priority: number; distance: number }> = [];
  const lines = originalText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Nếu không có số tiền, kiểm tra currency trong toàn bộ text
  if (amount === 0 || amountPosition === 0) {
    // Kiểm tra ký hiệu ₫ trước
    if (/₫/u.test(originalText)) {
      return 'VND';
    }
    // Kiểm tra VND keywords
    if (/\bvnđ\b|\bvnd\b|đồng|dong|[\d.,\s]+\s*đ\b/i.test(originalText)) {
      return 'VND';
    }
    // Mặc định VND cho hóa đơn Việt Nam
    return 'VND';
  }

  // Tìm số tiền trong text để xác định vị trí chính xác
  const amountStr = amount.toString();
  const amountVariations = [
    amountStr,
    amountStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.'), // 150.000
    amountStr.replace(/\B(?=(\d{3})+(?!\d))/g, ','), // 150,000
    amountStr.substring(0, Math.min(6, amountStr.length)), // 6 chữ số đầu
  ];

  // Tìm vị trí chính xác của số tiền trong text
  let exactAmountPosition = amountPosition;
  for (const amtVar of amountVariations) {
    const index = originalText.indexOf(amtVar);
    if (index !== -1) {
      exactAmountPosition = index;
      break;
    }
  }

  // Kiểm tra đặc biệt: Nếu có ký hiệu ₫ hoặc "đ" hoặc "VNĐ" gần số tiền, trả về VND ngay
  const amountContextCheck = originalText.substring(
    Math.max(0, exactAmountPosition - 30),
    Math.min(originalText.length, exactAmountPosition + 200)
  );
  
  // Kiểm tra ký hiệu ₫
  if (/₫/u.test(amountContextCheck)) {
    const dongIndex = amountContextCheck.indexOf('₫');
    const dongDistance = Math.abs((Math.max(0, exactAmountPosition - 30) + dongIndex) - exactAmountPosition);
    if (dongDistance < 20) {
      return 'VND';
    }
  }
  
  // Kiểm tra "đ" hoặc "VNĐ" gần số tiền
  if (/[\d.,\s]{4,}\s*(?:vnđ|vnd|đồng|đ)\b/i.test(amountContextCheck)) {
    return 'VND';
  }
  
  // Kiểm tra format số tiền VN (151.000, 105.000) - thường là VND
  if (/[\d]{1,3}[.,][\d]{3}[.,][\d]{3}/.test(amountContextCheck) && amount >= 10000 && amount < 100000000) {
    // Format VN với số tiền hợp lý, ưu tiên VND
    if (!/\$|usd|dollar/i.test(amountContextCheck)) {
      return 'VND';
    }
  }

  // Định nghĩa các pattern cho từng loại tiền tệ (ưu tiên VND)
  const currencyPatterns: Array<{ currency: Currency; patterns: Array<{ pattern: RegExp; priority: number }> }> = [
    {
      currency: 'VND',
      patterns: [
        // Ký hiệu ₫ (U+20AB) - Priority cao nhất vì đây là ký hiệu chính thức
        { pattern: /[\d.,\s]{4,}\s*₫/gu, priority: 40 }, // 100.000₫ hoặc 151.000₫ (ký hiệu ₫ ngay sau số)
        { pattern: /₫\s*[\d.,\s]{4,}/gu, priority: 39 }, // ₫ 100.000 (ký hiệu ₫ trước số)
        { pattern: /[\d.,\s]{4,}\s*(?:vnđ|vnd|đồng|dong)\b/gi, priority: 30 }, // 100000 VNĐ hoặc 100.000 đồng
        { pattern: /[\d.,\s]{4,}\s*đ\b/gi, priority: 29 }, // 100.000 đ (chữ đ sau số tiền)
        { pattern: /(?:vnđ|vnd|đồng|dong)\s*[\d.,\s]{4,}/gi, priority: 28 }, // VNĐ 100000 hoặc đ 100.000
        { pattern: /\bvnđ\b/gi, priority: 18 },
        { pattern: /\bvnd\b/gi, priority: 17 },
        { pattern: /\bđồng\b/gi, priority: 16 },
        { pattern: /\bdong\b/gi, priority: 15 },
        // Pattern tổng quát cho ký hiệu ₫ (fallback)
        { pattern: /₫/gu, priority: 25 }, // Chỉ cần có ký hiệu ₫
      ],
    },
    {
      currency: 'USD',
      patterns: [
        // Chỉ match $ khi có số tiền rõ ràng gần đó (tránh match nhầm)
        { pattern: /\$\s*[\d.,\s]{2,}/gi, priority: 20 }, // $100 hoặc $ 100
        { pattern: /[\d.,\s]{2,}\s*usd\b/gi, priority: 18 }, // 100 USD
        // Giảm priority cho pattern chung để tránh match nhầm
        { pattern: /\busd\b/gi, priority: 10 }, // Giảm từ 15 xuống 10
        { pattern: /\bdollar\b/gi, priority: 8 }, // Giảm từ 12 xuống 8
      ],
    },
    {
      currency: 'EUR',
      patterns: [
        { pattern: /€\s*[\d.,\s]+/gi, priority: 20 }, // €100
        { pattern: /[\d.,\s]+\s*eur\b/gi, priority: 18 }, // 100 EUR
        { pattern: /\beur\b/gi, priority: 15 },
        { pattern: /\beuro\b/gi, priority: 12 },
      ],
    },
    {
      currency: 'JPY',
      patterns: [
        { pattern: /¥\s*[\d.,\s]+/gi, priority: 20 }, // ¥1000
        { pattern: /[\d.,\s]+\s*jpy\b/gi, priority: 18 }, // 1000 JPY
        { pattern: /\bjpy\b/gi, priority: 15 },
        { pattern: /\byen\b/gi, priority: 12 },
      ],
    },
    {
      currency: 'GBP',
      patterns: [
        { pattern: /£\s*[\d.,\s]+/gi, priority: 20 }, // £100
        { pattern: /[\d.,\s]+\s*gbp\b/gi, priority: 18 }, // 100 GBP
        { pattern: /\bgbp\b/gi, priority: 15 },
        { pattern: /\bpound\b/gi, priority: 12 },
      ],
    },
    {
      currency: 'CNY',
      patterns: [
        { pattern: /[\d.,\s]+\s*cny\b/gi, priority: 18 }, // 100 CNY
        { pattern: /\bcny\b/gi, priority: 15 },
        { pattern: /\byuan\b/gi, priority: 12 },
      ],
    },
  ];

  // 1. Tìm currency gần số tiền nhất (trong vòng 50 ký tự) - Priority cao nhất
  const searchStart = Math.max(0, exactAmountPosition - 50);
  const searchEnd = Math.min(originalText.length, exactAmountPosition + 200); // Tìm cả trước và sau số tiền
  const amountContext = originalText.substring(searchStart, searchEnd);
  
  for (const { currency, patterns } of currencyPatterns) {
    for (const { pattern, priority } of patterns) {
      const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
      const matches = amountContext.matchAll(globalPattern);
      
      for (const match of matches) {
        const matchIndex = (match.index || 0) + searchStart;
        const matchText = match[0];
        
        // Tính khoảng cách từ currency đến số tiền
        const distance = Math.abs(matchIndex - exactAmountPosition);
        
        // Kiểm tra xem currency có trong cùng dòng với số tiền không
        const amountLineIndex = originalText.substring(0, exactAmountPosition).split('\n').length - 1;
        const currencyLineIndex = originalText.substring(0, matchIndex).split('\n').length - 1;
        const sameLine = amountLineIndex === currencyLineIndex;
        
        // Kiểm tra xem có phải là số tiền đã tìm được không
        const hasExactAmount = amountVariations.some(amt => {
          const context = originalText.substring(
            Math.max(0, matchIndex - 20),
            Math.min(originalText.length, matchIndex + matchText.length + 20)
          );
          const cleanContext = context.replace(/[.,\s]/g, '');
          const cleanAmount = amt.replace(/[.,\s]/g, '');
          return cleanContext.includes(cleanAmount);
        });
        
        // Tính priority dựa trên khoảng cách và cùng dòng
        let finalPriority = priority;
        if (hasExactAmount) {
          finalPriority += 40; // Bonus rất cao nếu currency và amount match chính xác
        }
        if (sameLine) {
          finalPriority += 20; // Bonus cao nếu cùng dòng
        }
        if (distance < 10) {
          finalPriority += 15; // Bonus nếu rất gần (< 10 ký tự)
        } else if (distance < 20) {
          finalPriority += 10; // Bonus nếu gần (< 20 ký tự)
        } else if (distance < 30) {
          finalPriority += 5; // Bonus nhỏ nếu khá gần (< 30 ký tự)
        }
        
        foundCurrencies.push({
          currency,
          priority: finalPriority,
          distance,
        });
      }
    }
  }

  // 2. Tìm currency ở cuối bill (thường là tổng tiền) - Priority trung bình
  const lastLines = lines.slice(-5);
  for (let i = lastLines.length - 1; i >= 0; i--) {
    const line = lastLines[i];
    const lineIndex = originalText.indexOf(line);
    
    // Kiểm tra xem dòng này có chứa số tiền không
    const hasAmount = amountVariations.some(amt => {
      const cleanLine = line.replace(/[.,\s]/g, '');
      const cleanAmount = amt.replace(/[.,\s]/g, '');
      return cleanLine.includes(cleanAmount);
    });
    
    if (hasAmount) {
      for (const { currency, patterns } of currencyPatterns) {
        for (const { pattern, priority } of patterns) {
          const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
          const matches = line.matchAll(globalPattern);
          for (const match of matches) {
            const matchIndex = line.indexOf(match[0]);
            const distance = Math.abs((lineIndex + matchIndex) - exactAmountPosition);
            
            foundCurrencies.push({
              currency,
              priority: priority + 15 + (lastLines.length - i) * 2, // Bonus cho dòng cuối
              distance,
            });
          }
        }
      }
    }
  }

  // 3. Tìm currency trong toàn bộ text (fallback) - Priority thấp
  for (const { currency, patterns } of currencyPatterns) {
    for (const { pattern, priority } of patterns) {
      const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
      const matches = originalText.matchAll(globalPattern);
      
      for (const match of matches) {
        const matchIndex = match.index || 0;
        const distance = Math.abs(matchIndex - exactAmountPosition);
        
        // Chỉ thêm nếu chưa có currency này với priority cao hơn
        const existing = foundCurrencies.find(c => c.currency === currency && c.priority > priority);
        if (!existing) {
          foundCurrencies.push({
            currency,
            priority: priority - Math.min(distance / 10, 5), // Giảm priority nếu xa
            distance,
          });
        }
      }
    }
  }

  // Sắp xếp: ưu tiên priority cao nhất, nếu bằng nhau thì ưu tiên gần số tiền nhất
  if (foundCurrencies.length > 0) {
    foundCurrencies.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.distance - b.distance; // Ưu tiên gần số tiền nhất
    });
    
    const detectedCurrency = foundCurrencies[0].currency;
    
    if (detectedCurrency === 'USD') {
      if (/₫|vnđ|vnd|đồng|[\d.,\s]{4,}\s*đ\b/i.test(originalText) && !/\$\s*[\d.,\s]{2,}/.test(originalText)) {
        return 'VND';
      }
    }
    
    return detectedCurrency;
  }

  return 'VND';
};

/**
 * Nhận diện loại bill và merchant name
 */
const identifyBillType = (originalText: string, normalizedText: string): { billType?: string; merchantName?: string } => {
  const billTypes: Record<string, { keywords: string[]; merchants: string[] }> = {
    restaurant: {
      keywords: ['nhà hàng', 'restaurant', 'quán ăn', 'cafe', 'coffee', 'food', 'dining'],
      merchants: ['starbucks', 'highlands', 'trung nguyên', 'kfc', 'mcdonald', 'lotteria', 'pizza', 'burger'],
    },
    supermarket: {
      keywords: ['siêu thị', 'supermarket', 'coopmart', 'vinmart', 'big c', 'lotus', 'aeon'],
      merchants: ['coopmart', 'vinmart', 'big c', 'lotus', 'aeon', 'vincom', 'circle k'],
    },
    gas_station: {
      keywords: ['xăng', 'gas', 'petrol', 'petrolimex', 'mobifone', 'viettel'],
      merchants: ['petrolimex', 'shell', 'total', 'caltex'],
    },
    pharmacy: {
      keywords: ['pharmacy', 'nhà thuốc', 'guardian', 'pharmacity', 'long châu'],
      merchants: ['guardian', 'pharmacity', 'long châu'],
    },
    cinema: {
      keywords: ['cinema', 'rạp', 'cgv', 'lotte', 'galaxy', 'bhd'],
      merchants: ['cgv', 'lotte', 'galaxy', 'bhd'],
    },
  };

  let bestMatch: { type: string; score: number } | null = null;
  let merchantName: string | undefined;

  for (const [type, { keywords, merchants }] of Object.entries(billTypes)) {
    let score = 0;
    
    // Check keywords
    keywords.forEach((keyword) => {
      if (normalizedText.includes(keyword)) {
        score += 2;
      }
    });

    // Check merchant names (case sensitive for better matching)
    merchants.forEach((merchant) => {
      const regex = new RegExp(merchant, 'i');
      if (regex.test(originalText)) {
        score += 5;
        if (!merchantName) {
          merchantName = merchant;
        }
      }
    });

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { type, score };
    }
  }

  return {
    billType: bestMatch?.type,
    merchantName,
  };
};

/**
 * Phân loại bill vào danh mục dựa trên keywords và bill type (cải thiện)
 */
const categorizeBill = (text: string, billType?: string): string => {
  // Nếu đã nhận diện được bill type, map trực tiếp
  if (billType) {
    const typeToCategory: Record<string, string> = {
      restaurant: 'food',
      supermarket: 'shopping',
      gas_station: 'transport',
      pharmacy: 'health',
      cinema: 'entertainment',
    };
    if (typeToCategory[billType]) {
      return typeToCategory[billType];
    }
  }
  
  // Kiểm tra các từ khóa đặc biệt cho delivery/food apps
  const deliveryKeywords = ['grab', 'gojek', 'baemin', 'now', 'shoppeefood', 'foody', 'delivery', 'giao hàng', 'đơn hàng', 'chi tiết đơn hàng'];
  if (deliveryKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    // Kiểm tra xem có phải là đồ ăn không
    const foodKeywords = ['mì', 'cơm', 'phở', 'bún', 'bánh', 'pizza', 'burger', 'gà', 'chicken', 'food', 'đồ ăn', 'thức ăn'];
    if (foodKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return 'food';
    }
  }
  
  // Keywords cho từng danh mục (mở rộng)
  const categoryKeywords: Record<string, string[]> = {
    food: [
      'nhà hàng', 'restaurant', 'quán ăn', 'cafe', 'coffee', 'đồ ăn', 'food',
      'bánh', 'pizza', 'burger', 'gà', 'chicken', 'phở', 'bún', 'cơm',
      'mì', 'mì trộn', 'cơm rang', 'thập cẩm', 'xá xíu', 'trứng',
      'đồ uống', 'drink', 'nước', 'trà', 'tea', 'nước ngọt', 'soda',
      'starbucks', 'highlands', 'trung nguyên', 'kfc', 'mcdonald', 'lotteria',
      'bánh mì', 'sandwich', 'sushi', 'ramen', 'noodles', 'pasta',
      'buffet', 'ăn uống', 'dining', 'meal', 'lunch', 'dinner', 'breakfast',
      'grab food', 'shoppeefood', 'foody', 'baemin', 'now', 'delivery',
    ],
    transport: [
      'xe', 'taxi', 'grab', 'uber', 'xe bus', 'bus', 'tàu', 'train',
      'máy bay', 'airplane', 'flight', 'xăng', 'gas', 'petrol',
      'đỗ xe', 'parking', 'bãi đỗ', 'vietjet', 'vietnam airline', 'jetstar',
      'xe máy', 'motorcycle', 'xe đạp', 'bicycle', 'metro', 'subway',
      'vé', 'ticket', 'cước', 'fare', 'transport', 'giao thông',
    ],
    shopping: [
      'siêu thị', 'supermarket', 'cửa hàng', 'shop', 'store', 'mall',
      'mua sắm', 'shopping', 'quần áo', 'clothes', 'giày', 'shoes',
      'điện thoại', 'phone', 'laptop', 'máy tính', 'computer',
      'vinmart', 'coopmart', 'big c', 'lotus', 'aeon', 'vincom',
      'fashion', 'thời trang', 'cosmetic', 'mỹ phẩm', 'perfume', 'nước hoa',
      'electronics', 'điện tử', 'appliance', 'đồ gia dụng',
    ],
    bills: [
      'điện', 'electricity', 'nước', 'water', 'internet', 'wifi',
      'điện thoại', 'phone bill', 'cước', 'hóa đơn', 'bill', 'invoice',
      'tiền nhà', 'rent', 'thuê', 'cable', 'truyền hình', 'tv',
      'evn', 'sài gòn', 'saigon', 'fpt', 'viettel', 'vnpt',
      'utility', 'tiện ích', 'service', 'dịch vụ',
    ],
    entertainment: [
      'phim', 'movie', 'cinema', 'rạp', 'game', 'karaoke', 'bar',
      'club', 'giải trí', 'entertainment', 'concert', 'nhạc', 'music',
      'cgv', 'lotte', 'galaxy', 'bhd', 'netflix', 'spotify',
      'game', 'playstation', 'xbox', 'nintendo', 'steam',
      'amusement', 'vui chơi', 'park', 'công viên',
    ],
    health: [
      'bệnh viện', 'hospital', 'phòng khám', 'clinic', 'thuốc', 'medicine',
      'dược phẩm', 'pharmacy', 'y tế', 'health', 'bác sĩ', 'doctor',
      'guardian', 'pharmacity', 'long châu', 'pharma', 'nhà thuốc',
      'medical', 'khám', 'examination', 'treatment', 'điều trị',
    ],
    education: [
      'học phí', 'tuition', 'sách', 'book', 'trường học', 'school',
      'giáo dục', 'education', 'khóa học', 'course', 'học', 'study',
      'university', 'đại học', 'college', 'cao đẳng', 'tuition fee',
      'textbook', 'sách giáo khoa', 'stationery', 'văn phòng phẩm',
    ],
    other: [
      'khác', 'other', 'misc', 'khác', 'various',
    ],
  };

  // Đếm số lần xuất hiện của keywords cho mỗi danh mục (cải thiện scoring)
  const categoryScores: Record<string, number> = {};

  Object.entries(categoryKeywords).forEach(([categoryId, keywords]) => {
    let score = 0;
    keywords.forEach((keyword) => {
      // Tìm kiếm không phân biệt hoa thường và tìm từ đầy đủ
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(text)) {
        score += 1;
        // Bonus cho keywords quan trọng
        if (['nhà hàng', 'restaurant', 'siêu thị', 'supermarket', 'taxi', 'grab'].includes(keyword)) {
          score += 0.5;
        }
      }
    });
    categoryScores[categoryId] = score;
  });

  // Tìm danh mục có điểm cao nhất
  const bestCategory = Object.entries(categoryScores).reduce(
    (max, [cat, score]) => (score > max[1] ? [cat, score] : max),
    ['other', 0]
  );

  // Chỉ trả về 'other' nếu không có điểm nào
  return bestCategory[1] > 0 ? bestCategory[0] : 'other';
};

/**
 * Extract ngày từ text (cải thiện với nhiều format hơn)
 */
const extractDate = (text: string): string | null => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Pattern ngày tháng phổ biến (mở rộng)
  const patterns = [
    // DD/MM/YYYY hoặc DD-MM-YYYY hoặc DD.MM.YYYY
    /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/,
    // YYYY/MM/DD
    /(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/,
    // DD/MM/YY (2 số năm)
    /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2})\b/,
    // Với từ "ngày"
    /ngày\s+(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/i,
    /ngày\s+(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2})\b/i,
    // Format: "ngày DD tháng MM năm YYYY"
    /ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/i,
    // Format: "DD tháng MM, YYYY"
    /(\d{1,2})\s+tháng\s+(\d{1,2})[,.]\s*(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let day: string, month: string, year: string;
      
      // Xác định format dựa trên độ dài của năm
      if (match[3] && match[3].length === 4) {
        // DD/MM/YYYY hoặc YYYY/MM/DD
        if (match[1].length === 4) {
          // YYYY/MM/DD
          year = match[1];
          month = match[2].padStart(2, '0');
          day = match[3].padStart(2, '0');
        } else {
          // DD/MM/YYYY
          day = match[1].padStart(2, '0');
          month = match[2].padStart(2, '0');
          year = match[3];
        }
      } else if (match[3] && match[3].length === 2) {
        // DD/MM/YY - convert 2-digit year to 4-digit
        day = match[1].padStart(2, '0');
        month = match[2].padStart(2, '0');
        const twoDigitYear = parseInt(match[3], 10);
        // Nếu năm 2 số < 50, coi là 20xx, ngược lại là 19xx
        const fullYear = (twoDigitYear < 50 ? 2000 : 1900) + twoDigitYear;
        year = fullYear.toString();
      } else {
        continue;
      }

      // Validate day và month
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
        continue;
      }

      // Validate year (từ 2000 đến năm hiện tại + 1)
      if (yearNum < 2000 || yearNum > currentYear + 1) {
        continue;
      }

      const date = `${year}-${month}-${day}`;
      // Kiểm tra xem ngày có hợp lệ không
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        // Kiểm tra xem ngày có trong tương lai quá xa không (max 1 năm)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        if (dateObj <= maxDate) {
          return date;
        }
      }
    }
  }

  return null;
};

/**
 * Extract description từ text (cải thiện với merchant name)
 */
const extractDescription = (text: string, category: string, merchantName?: string): string => {
  // Nếu có merchant name, ưu tiên sử dụng
  if (merchantName) {
    // Tìm dòng chứa merchant name
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    for (const line of lines.slice(0, 10)) {
      if (line.toLowerCase().includes(merchantName.toLowerCase())) {
        const cleanLine = line.trim();
        if (cleanLine.length > 3 && cleanLine.length < 100) {
          return cleanLine;
        }
      }
    }
    return merchantName;
  }

  // Lấy dòng đầu tiên có chứa thông tin quan trọng
  const lines = text.split('\n').filter((line) => line.trim().length > 0);
  
  // Tìm dòng có chứa tên cửa hàng hoặc mô tả (bỏ qua các dòng chỉ có số, date, amount)
  for (const line of lines.slice(0, 10)) {
    const cleanLine = line.trim();
    if (cleanLine.length > 5 && cleanLine.length < 100) {
      // Loại bỏ các dòng chỉ có số, date pattern, hoặc amount pattern
      if (
        !/^\d+$/.test(cleanLine) &&
        !/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(cleanLine) &&
        !/^[\d.,\s]+$/.test(cleanLine) &&
        !cleanLine.toLowerCase().includes('total') &&
        !cleanLine.toLowerCase().includes('tổng')
      ) {
        return cleanLine;
      }
    }
  }

  // Nếu không tìm thấy, trả về tên danh mục
  const categoryName = EXPENSE_CATEGORIES.find((c) => c.id === category)?.name || category;
  return `Hóa đơn ${categoryName}`;
};

/**
 * Tính confidence score (cải thiện)
 */
const calculateConfidence = (
  amount: number,
  category: string,
  date: string,
  billType?: string
): number => {
  let score = 0;

  // Amount found (quan trọng nhất)
  if (amount > 0) {
    score += 40;
    // Bonus nếu số tiền hợp lý
    if (amount >= 10000 && amount < 50000000) {
      score += 10;
    }
  }

  // Category found (not 'other')
  if (category !== 'other') {
    score += 25;
  }

  // Bill type found (bonus)
  if (billType) {
    score += 10;
  }

  // Date found
  if (date !== getTodayDate()) {
    score += 15; // Date được extract từ bill
  } else {
    score += 5; // Default date
  }

  return Math.min(score, 100);
};

