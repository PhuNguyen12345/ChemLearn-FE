import React from 'react';

// Fallback images if DB doesn't have URLs
import pet1 from '../../../../assets/CapybaraWizard.png';
import pet2 from '../../../../assets/DogeWizard.png';
import pet3 from '../../../../assets/SkibidiToilem.png';
import pet4 from '../../../../assets/TungSahurWarrior.png';

const getPetImage = (url, name) => {
  if (url) return url;
  if (!name) return pet1;
  const n = String(name).toLowerCase();
  if (n.includes('capybara')) return pet1;
  if (n.includes('doge')) return pet2;
  if (n.includes('skibidi') || n.includes('tolem')) return pet3;
  if (n.includes('tung') || n.includes('sahur') || n.includes('warrior')) return pet4;
  return pet1;
};

/**
 * PetStats — Displays a pet's avatar, name, owner name, and HP bar.
 * Pure presentational component.
 *
 * Props:
 *  - petName: string
 *  - ownerName: string
 *  - currentHp: number
 *  - maxHp: number
 *  - imageUrl: string
 *  - element: string  (FIRE, WATER, etc.)
 *  - isEnemy: boolean — mirrors layout horizontally
 *  - isCurrentTurn: boolean — glowing border highlight
 *  - isDamaged: boolean — red flash animation trigger
 */
const ELEMENT_COLORS = {
  FIRE: 'from-red-500 to-orange-400',
  WATER: 'from-blue-500 to-cyan-400',
  EARTH: 'from-green-600 to-lime-400',
  AIR: 'from-sky-400 to-indigo-300',
  LIGHT: 'from-yellow-400 to-amber-300',
  DARK: 'from-purple-600 to-violet-500',
};

const ELEMENT_BG = {
  FIRE: 'bg-red-500/20 border-red-400/40',
  WATER: 'bg-blue-500/20 border-blue-400/40',
  EARTH: 'bg-green-500/20 border-green-400/40',
  AIR: 'bg-sky-500/20 border-sky-400/40',
  LIGHT: 'bg-yellow-400/20 border-yellow-300/40',
  DARK: 'bg-purple-600/20 border-purple-500/40',
};

export default function PetStats({ petName, ownerName, currentHp, maxHp, imageUrl, element = 'FIRE',
  isEnemy = false, isCurrentTurn = false, isDamaged = false }) {

  const hpPercent = maxHp > 0 ? Math.max(0, (currentHp / maxHp) * 100) : 0;
  const gradientClass = ELEMENT_COLORS[element] || ELEMENT_COLORS.FIRE;
  const bgClass = ELEMENT_BG[element] || ELEMENT_BG.FIRE;

  const hpColor = hpPercent > 50 ? 'from-green-400 to-emerald-500'
    : hpPercent > 25 ? 'from-yellow-400 to-amber-500'
    : 'from-red-500 to-rose-600';

  return (
    <div className={`
      relative flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300
      ${bgClass}
      ${isCurrentTurn ? 'ring-2 ring-white/60 shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-[1.02]' : ''}
      ${isDamaged ? 'animate-[shake_0.4s_ease-in-out] bg-red-500/40' : ''}
    `}>

      {/* Turn Indicator */}
      {isCurrentTurn && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r ${gradientClass} text-white shadow-lg`}>
          {isEnemy ? 'Đối thủ' : 'Lượt của bạn'}
        </div>
      )}

      {/* Pet Avatar */}
      <div className={`
        relative w-24 h-24 rounded-2xl overflow-hidden border-2 
        ${isCurrentTurn ? 'border-white/60' : 'border-white/20'}
        shadow-xl
      `}>
        <img src={getPetImage(imageUrl, petName)} alt={petName}
          className="w-full h-full object-contain p-1" />
        {/* Damage flash overlay */}
        {isDamaged && (
          <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center rounded-xl">
            <span className="text-white font-black text-2xl animate-bounce">💥</span>
          </div>
        )}
      </div>

      {/* Names */}
      <div className={`text-center ${isEnemy ? '' : ''}`}>
        <p className="font-black text-white text-base leading-tight">{petName || 'Unknown Pet'}</p>
        <p className="text-white/60 text-xs font-bold">{ownerName || 'Player'}</p>
      </div>

      {/* HP Bar */}
      <div className="w-full space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-white/70 uppercase tracking-wider">HP</span>
          <span className="text-xs font-black text-white">
            {Math.max(0, currentHp)} / {maxHp}
          </span>
        </div>
        <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${hpColor} transition-all duration-700 ease-out relative`}
            style={{ width: `${hpPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
