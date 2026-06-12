import React, { useState } from 'react';
import { useLabStore } from '../stores/useLabStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MathChallengeModal() {
  const activeChallenge = useLabStore(state => state.activeChallenge);
  const clearActiveChallenge = useLabStore(state => state.clearActiveChallenge);
  
  // Trạng thái cho các ô nhập liệu
  const [answers, setAnswers] = useState({});
  const [showHints, setShowHints] = useState(false);

  if (!activeChallenge) return null;

  const { schema, groundTruth, onComplete } = activeChallenge;

  const handleInputChange = (fieldId, value) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = () => {
    let allCorrect = true;
    
    // Kiểm tra từng trường requiredFields
    schema.requiredFields.forEach(field => {
      // 1. Phân tích evalPath để lấy giá trị GroundTruth tương ứng
      let gtValue = 0;
      const path = field.evalPath;
      
      if (path.type === 'product') {
        const product = groundTruth.generatedProducts.find(p => p.name === path.targetName);
        if (product) gtValue = product[path.property] || 0;
      } else if (path.type === 'excess') {
        if (groundTruth.excessRemaining) {
          gtValue = groundTruth.excessRemaining[path.property] || 0;
        }
      }

      // Làm tròn 2 số thập phân để so sánh
      const expected = Number(gtValue.toFixed(2));
      const studentAnswer = Number(parseFloat(answers[field.id] || 0).toFixed(2));

      // Sai số cho phép: 0.05
      if (Math.abs(expected - studentAnswer) > 0.05) {
        allCorrect = false;
        console.log(`Sai ở ${field.id}: Mong đợi ${expected}, Học sinh nhập ${studentAnswer}`);
      }
    });

    if (allCorrect) {
      toast.success("Chính xác tuyệt đối! Phản ứng bắt đầu diễn ra.", { position: "top-center" });
      clearActiveChallenge();
      if (onComplete) onComplete(); // Tiếp tục hoạt cảnh kéo thả
    } else {
      toast.error("Kết quả chưa chính xác. Vui lòng tính toán lại nhé!", { position: "top-center" });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-blue-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 3.8l7.2 14.2H4.8L12 5.8z"/></svg>
          </div>
          <h2 className="text-3xl font-black mb-2 relative z-10 uppercase tracking-wide">Thử Thách Phản Ứng</h2>
          <div className="inline-block bg-white/20 px-4 py-1.5 rounded-full font-mono text-xl font-bold backdrop-blur-md relative z-10 border border-white/30">
            {schema.equation}
          </div>
        </div>

        {/* BODY */}
        <div className="p-8">
          <p className="text-slate-700 text-lg leading-relaxed mb-6 font-medium">
            {schema.question}
          </p>

          <div className="grid gap-6 mb-8">
            {schema.requiredFields.map(field => (
              <div key={field.id} className="flex flex-col gap-2">
                <label className="font-semibold text-slate-800 text-base">{field.label}</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="Nhập kết quả..." 
                    value={answers[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="pr-16 text-lg h-12 border-2 focus-visible:ring-blue-500 focus-visible:border-transparent"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    {field.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* HINTS */}
          {showHints && (
            <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 animate-in slide-in-from-top-4">
              <h4 className="font-bold flex items-center gap-2 mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                Gợi ý giải bài:
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-sm ml-1">
                {schema.hints.map((hint, idx) => (
                  <li key={idx}>{hint}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-4 pt-4 border-t">
            <Button 
              variant="outline" 
              className="flex-1 h-12 text-base font-semibold border-2 hover:bg-slate-50"
              onClick={() => setShowHints(!showHints)}
            >
              {showHints ? "Đóng Gợi ý" : "Xem Gợi ý"}
            </Button>
            <Button 
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
              onClick={handleSubmit}
            >
              Kiểm tra & Thực hiện
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
