import React from 'react';
import { Zap, Sword, Shield } from 'lucide-react';

/**
 * SkillBar — Appears after a correct answer. Lets player choose skill to attack.
 * Currently shows 1 skill from the pet (can be extended to multiple).
 *
 * Props:
 *  - petName: string
 *  - skillName: string
 *  - onUseSkill: () => void
 *  - disabled: boolean
 */
export default function SkillBar({ petName, skillName, onUseSkill, disabled = false }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="text-center">
        <p className="text-green-400 font-black text-sm uppercase tracking-wider animate-pulse">
          ✅ Trả lời đúng! Chọn Skill để tấn công!
        </p>
      </div>

      {/* Skill cards */}
      <div className="flex flex-col gap-3">
        {/* Primary skill from Pet */}
        <button
          onClick={onUseSkill}
          disabled={disabled}
          className={`
            group relative flex items-center gap-4 p-4 rounded-2xl border-2
            bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border-amber-400/50
            hover:from-amber-500/40 hover:border-amber-300 hover:scale-[1.02]
            transition-all duration-200 text-left
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-200 shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <p className="text-white font-black text-base leading-tight">{skillName || 'Kỹ năng Đặc biệt'}</p>
            <p className="text-amber-300/80 text-xs font-semibold">{petName} — Tấn công x1.5 sát thương</p>
          </div>

          {/* Arrow indicator */}
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center group-hover:bg-amber-400/40 transition-colors duration-200">
            <Sword className="w-4 h-4 text-amber-300" />
          </div>
        </button>

        {/* Auto-pass option */}
        <button
          onClick={onUseSkill}
          disabled={disabled}
          className={`
            flex items-center gap-4 p-3 rounded-xl border border-white/10
            bg-white/5 text-white/50
            hover:bg-white/10 hover:text-white/70 hover:border-white/20
            transition-all duration-200 text-left text-sm
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <Shield className="w-4 h-4 shrink-0" />
          <span className="font-semibold">Bỏ qua — Không tấn công</span>
        </button>
      </div>
    </div>
  );
}
