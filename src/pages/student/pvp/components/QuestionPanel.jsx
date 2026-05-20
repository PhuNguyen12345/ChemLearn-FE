import React, { useState } from 'react';
import { CheckCircle, XCircle, Timer } from 'lucide-react';

/**
 * QuestionPanel — Displays the chemistry MCQ during active turn.
 * Pure presentational component — no WebSocket logic.
 *
 * Props:
 *  - question: { questionId, prompt, optionA, optionB, optionC, optionD }
 *  - onAnswer: (selectedOption: "A"|"B"|"C"|"D") => void
 *  - disabled: boolean — prevent re-submission
 *  - timeLeft: number — seconds remaining
 */

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

const OPTION_STYLES = {
  default: 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:scale-[1.02]',
  selected: 'bg-indigo-500/40 border-indigo-400 text-white scale-[1.02] shadow-lg shadow-indigo-500/30',
  correct: 'bg-green-500/30 border-green-400 text-green-100',
  wrong: 'bg-red-500/30 border-red-400 text-red-100',
};

export default function QuestionPanel({ question, onAnswer, disabled = false, timeLeft = 30 }) {
  const [selected, setSelected] = useState(null);

  if (!question) return null;

  const options = {
    A: question.optionA,
    B: question.optionB,
    C: question.optionC,
    D: question.optionD,
  };

  const timePercent = (timeLeft / 30) * 100;
  const timeColor = timeLeft > 15 ? 'from-green-400 to-emerald-500'
    : timeLeft > 7 ? 'from-yellow-400 to-amber-500'
      : 'from-red-500 to-rose-600';

  const handleSelect = (key) => {
    if (disabled || selected) return;
    setSelected(key);
    onAnswer(key);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Timer bar */}
      <div className="flex items-center gap-3">
        <Timer className="w-4 h-6 text-white/70 shrink-0" />
        <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${timeColor} transition-all duration-1000`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
        <span className={`text-sm font-black w-6 text-right ${timeLeft <= 7 ? 'text-red-400 animate-pulse' : 'text-white/80'}`}>
          {timeLeft}s
        </span>
      </div>

      {/* Question prompt */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
        <p className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2">⚗️ Câu hỏi Hóa học</p>
        <p className="text-white font-bold leading-relaxed text-sm md:text-base">{question.prompt}</p>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPTION_KEYS.map((key) => {
          const isSelected = selected === key;
          const style = isSelected ? OPTION_STYLES.selected : OPTION_STYLES.default;

          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              disabled={disabled || !!selected}
              className={`
                flex items-start gap-3 p-3 rounded-xl border-2 text-left
                transition-all duration-200 cursor-pointer
                ${style}
                ${disabled || selected ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Key badge */}
              <span className={`
                shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black
                ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/20 text-white/80'}
              `}>
                {key}
              </span>
              <span className="text-sm font-semibold leading-snug">{options[key]}</span>
              {isSelected && <CheckCircle className="w-4 h-4 text-indigo-300 ml-auto shrink-0 mt-0.5" />}
            </button>
          );
        })}
      </div>

      {selected && (
        <p className="text-center text-sm text-white/60 font-bold animate-pulse">
          ✅ Đã chọn {selected} — đang xử lý...
        </p>
      )}
    </div>
  );
}
