import React from 'react';

// Helper function: Trả về React Elements để tự do tùy biến CSS thay vì Unicode
export const formatChemicalText = (text) => {
  if (!text) return text;
  
  // 1. Chuyển đổi toàn bộ Subscript Unicode (nếu lỡ nhập từ trước) về số bình thường
  const UNICODE_SUBSCRIPTS = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
  };
  const normalizedText = text.replace(/[₀-₉]/g, char => UNICODE_SUBSCRIPTS[char]);
  
  const elements = [];
  let buffer = "";
  
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];
    
    // Nếu gặp chữ số
    if (/[0-9]/.test(char)) {
      const prevChar = i > 0 ? normalizedText[i-1] : "";
      
      let numStr = char;
      while (i + 1 < normalizedText.length && /[0-9]/.test(normalizedText[i+1])) {
        numStr += normalizedText[i+1];
        i++;
      }
      
      // Nếu số đứng ngay sau một kí tự chữ cái (A-Z, a-z) hoặc dấu ngoặc đóng ')' ']' -> Nó là Subscript
      if (prevChar && /[a-zA-Z)\]]/.test(prevChar)) {
        if (buffer) {
          elements.push(<span key={elements.length}>{buffer}</span>);
          buffer = "";
        }
        elements.push(
          <sub key={elements.length} className="text-[0.7em] font-extrabold tracking-tight opacity-90" style={{ bottom: '-0.1em', marginLeft: '0.5px' }}>
            {numStr}
          </sub>
        );
      } else {
        // Nếu số đứng đầu câu, hoặc đứng sau khoảng trắng/dấu + -> Nó là Hệ số Cân Bằng (VD: 2 NaOH)
        buffer += numStr;
      }
    } else {
      buffer += char;
    }
  }
  
  if (buffer) {
    elements.push(<span key={elements.length}>{buffer}</span>);
  }
  
  return <>{elements}</>;
};
