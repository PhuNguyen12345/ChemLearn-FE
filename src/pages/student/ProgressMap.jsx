import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Star, Sparkles, Zap, FlaskConical, BookOpen, Flame, Droplets, Building2, Atom } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ISLAND DATA — 6 floating islands from the Elemental Archipelago
═══════════════════════════════════════════════════════════ */
const ISLANDS = [
  {
    id: 1,
    name: 'Đảo Chất',
    subtitle: 'Substance Island',
    mission: 'Giải mã Mật mã Nguyên tử',
    fragment: 'Nguyên tố Nền tảng',
    icon: FlaskConical,
    emoji: '🧪',
    color: 'from-blue-500 to-cyan-400',
    glowColor: 'rgba(59,130,246,0.6)',
    neonBorder: 'border-blue-400',
    neonShadow: 'shadow-blue-500/50',
    bgGradient: 'from-blue-600/20 to-cyan-500/10',
    unlocked: true,
    completed: true,
    stars: 3,
    tabTarget: 'studyZone',
  },
  {
    id: 2,
    name: 'Đảo Rừng Ký Hiệu',
    subtitle: 'Symbol Forest',
    mission: 'Ghép đúng hóa trị',
    fragment: 'Hóa trị Ổn định',
    icon: BookOpen,
    emoji: '🌿',
    color: 'from-emerald-500 to-green-400',
    glowColor: 'rgba(16,185,129,0.6)',
    neonBorder: 'border-emerald-400',
    neonShadow: 'shadow-emerald-500/50',
    bgGradient: 'from-emerald-600/20 to-green-500/10',
    unlocked: true,
    completed: true,
    stars: 2,
    tabTarget: 'quizzes',
  },
  {
    id: 3,
    name: 'Đảo Biến Đổi',
    subtitle: 'Transformation Island',
    mission: 'Cân bằng Phương trình',
    fragment: 'Phản ứng Hoàn chỉnh',
    icon: Atom,
    emoji: '⚗️',
    color: 'from-orange-500 to-red-400',
    glowColor: 'rgba(249,115,22,0.6)',
    neonBorder: 'border-orange-400',
    neonShadow: 'shadow-orange-500/50',
    bgGradient: 'from-orange-600/20 to-red-500/10',
    unlocked: true,
    completed: false,
    stars: 0,
    tabTarget: 'labDashboard',
  },
  {
    id: 4,
    name: 'Đảo Núi Lửa Oxy',
    subtitle: 'Oxygen Volcano',
    mission: 'Kiểm soát sự cháy',
    fragment: 'Sức mạnh Oxy',
    icon: Flame,
    emoji: '🌋',
    color: 'from-red-600 to-orange-500',
    glowColor: 'rgba(239,68,68,0.6)',
    neonBorder: 'border-red-400',
    neonShadow: 'shadow-red-500/50',
    bgGradient: 'from-red-600/20 to-orange-500/10',
    unlocked: true,
    completed: false,
    stars: 0,
    tabTarget: 'fireQuiz',
  },
  {
    id: 5,
    name: 'Đảo Đầm Lầy Hydro',
    subtitle: 'Hydrogen Swamp',
    mission: 'Lấy kim loại từ quặng',
    fragment: 'Khí Hydro Tinh khiết',
    icon: Droplets,
    emoji: '💧',
    color: 'from-sky-500 to-blue-400',
    glowColor: 'rgba(14,165,233,0.6)',
    neonBorder: 'border-sky-400',
    neonShadow: 'shadow-sky-500/50',
    bgGradient: 'from-sky-600/20 to-blue-500/10',
    unlocked: false,
    completed: false,
    stars: 0,
    tabTarget: 'studyZone',
  },
  {
    id: 6,
    name: 'Thành Phố Ionic',
    subtitle: 'Ionic City',
    mission: 'Trung hòa Axit/Bazơ',
    fragment: 'Cân bằng Ionic',
    icon: Building2,
    emoji: '🏙️',
    color: 'from-purple-500 to-pink-500',
    glowColor: 'rgba(168,85,247,0.6)',
    neonBorder: 'border-purple-400',
    neonShadow: 'shadow-purple-500/50',
    bgGradient: 'from-purple-600/20 to-pink-500/10',
    unlocked: false,
    completed: false,
    stars: 0,
    tabTarget: 'labDashboard',
  },
];

/* ═══════════════════════════════════════════════════════════
   Floating Particle Component
═══════════════════════════════════════════════════════════ */
const FloatingParticle = ({ delay, x, y, size = 4, color = 'bg-cyan-400' }) => (
  <motion.div
    className={`absolute rounded-full ${color} opacity-60`}
    style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -20, 0],
      opacity: [0.3, 0.8, 0.3],
      scale: [0.8, 1.2, 0.8],
    }}
    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay }}
  />
);

/* ═══════════════════════════════════════════════════════════
   Glowing Footprint between islands
═══════════════════════════════════════════════════════════ */
const GlowingPath = ({ fromX, fromY, toX, toY, active }) => {
  const steps = 6;
  const footprints = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Bezier-like curve with slight vertical wave
      const x = fromX + (toX - fromX) * t;
      const wave = Math.sin(t * Math.PI) * 25;
      const y = fromY + (toY - fromY) * t - wave;
      arr.push({ x, y, t });
    }
    return arr;
  }, [fromX, fromY, toX, toY]);

  return (
    <>
      {footprints.map((fp, i) => (
        <motion.div
          key={i}
          className="absolute z-10 pointer-events-none"
          style={{ left: `${fp.x}%`, top: `${fp.y}%`, transform: 'translate(-50%, -50%)' }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: active ? [0.2, 0.7, 0.2] : 0.15,
            scale: active ? [0.8, 1.1, 0.8] : 0.6,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.25,
          }}
        >
          {/* Atom particle */}
          <div className={`w-3 h-3 rounded-full ${active ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]' : 'bg-slate-500/40'}`} />
        </motion.div>
      ))}
      {/* Extra atomic orbits between footprints */}
      {active && footprints.filter((_, i) => i % 2 === 1).map((fp, i) => (
        <motion.div
          key={`orbit-${i}`}
          className="absolute z-10 pointer-events-none"
          style={{ left: `${fp.x}%`, top: `${fp.y}%`, transform: 'translate(-50%, -50%)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
        >
          <div className="w-8 h-8 border border-cyan-400/30 rounded-full relative">
            <div className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
          </div>
        </motion.div>
      ))}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   Star display for completed islands
═══════════════════════════════════════════════════════════ */
const StarRating = ({ count }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3].map((s) => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${s <= count ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]' : 'text-slate-600'}`}
      />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   Single Island Component
═══════════════════════════════════════════════════════════ */
const IslandNode = ({ island, posX, posY, onClick, isSelected }) => {
  const Icon = island.icon;

  return (
    /* Static positioning wrapper — never animated, keeps translate centering stable */
    <div
      className="absolute z-20"
      style={{ left: `${posX}%`, top: `${posY}%`, transform: 'translate(-50%, -50%)' }}
    >
      {/* Animated wrapper for hover / tap — scale only, no position shift */}
      <motion.div
        className={`${island.unlocked ? 'cursor-pointer' : 'cursor-default'}`}
        whileHover={island.unlocked ? { scale: 1.08 } : {}}
        whileTap={island.unlocked ? { scale: 0.95 } : {}}
        onClick={() => island.unlocked && onClick(island)}
      >
        {/* Outer glow ring */}
        {island.unlocked && (
          <motion.div
            className="absolute inset-[-12px] rounded-full opacity-40 z-0"
            style={{ background: `radial-gradient(circle, ${island.glowColor}, transparent 70%)` }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}

        {/* Island platform */}
        <div className={`relative flex flex-col items-center gap-1 ${!island.unlocked ? 'opacity-40 grayscale' : ''}`}>
          {/* Floating animation wrapper */}
          <motion.div
            animate={island.unlocked ? { y: [0, -8, 0] } : {}}
            transition={{ duration: 3 + island.id * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center"
          >
            {/* Icon Circle */}
            <div className={`
              relative w-20 h-20 sm:w-24 sm:h-24 rounded-full
              bg-gradient-to-br ${island.color}
              border-[3px] ${island.neonBorder}
              shadow-lg ${island.neonShadow}
              flex items-center justify-center
              ${isSelected ? 'ring-4 ring-white/60 ring-offset-2 ring-offset-transparent' : ''}
            `}>
              {island.unlocked ? (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-2xl sm:text-3xl">{island.emoji}</span>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white/90" strokeWidth={2.5} />
                </div>
              ) : (
                <Lock className="w-8 h-8 text-white/60" />
              )}

              {/* Completion checkmark */}
              {island.completed && (
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-black">✓</span>
                </div>
              )}
            </div>

            {/* Island name plate */}
            <div className={`
              mt-2 px-3 py-1.5 rounded-xl text-center min-w-[100px] max-w-[140px]
              ${island.unlocked
                ? 'bg-slate-900/80 backdrop-blur-md border border-white/10'
                : 'bg-slate-900/40 border border-slate-700/30'
              }
            `}>
              <p className={`text-[11px] sm:text-xs font-black leading-tight ${island.unlocked ? 'text-white' : 'text-slate-500'}`}>
                {island.name}
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">{island.subtitle}</p>
              {island.completed && <StarRating count={island.stars} />}
            </div>
          </motion.div>

          {/* Ground shadow */}
          <div className={`w-16 h-4 rounded-[100%] mt-1 ${island.unlocked ? 'bg-white/10 blur-sm' : 'bg-white/5 blur-sm'}`} />
        </div>
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   Island Detail Panel (slide-in from right)
═══════════════════════════════════════════════════════════ */
const IslandDetailPanel = ({ island, onClose, onNavigate }) => {
  if (!island) return null;
  const Icon = island.icon;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute right-4 top-20 bottom-20 w-80 z-40 flex flex-col"
    >
      <div className="flex-1 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
        {/* Background accent */}
        <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${island.bgGradient} to-transparent pointer-events-none`} />

        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/60 hover:text-white transition-colors text-xl">✕</button>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${island.color} flex items-center justify-center shadow-lg ${island.neonShadow}`}>
              <span className="text-2xl">{island.emoji}</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{island.name}</h3>
              <p className="text-xs text-slate-400 font-semibold">{island.subtitle}</p>
            </div>
          </div>

          {/* Stars */}
          {island.completed && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating count={island.stars} />
              <span className="text-xs text-yellow-400/80 font-bold">{island.stars}/3 ⭐</span>
            </div>
          )}

          {/* Mission Info */}
          <div className="space-y-3 mb-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">🎯 Nhiệm vụ</p>
              <p className="text-sm text-white font-bold">{island.mission}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">🧩 Mảnh ghép</p>
              <p className="text-sm text-white font-bold">{island.fragment}</p>
            </div>
          </div>

          {/* Status */}
          <div className={`rounded-2xl p-4 mb-4 ${island.completed ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
            <div className="flex items-center gap-2">
              {island.completed ? (
                <>
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-green-400 font-bold text-sm">Đã hoàn thành!</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 font-bold text-sm">Đang mở khóa</span>
                </>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="mt-auto">
            <button
              onClick={() => onNavigate(island.tabTarget)}
              className={`
                w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider
                transition-all active:scale-95 hover:scale-[1.02]
                bg-gradient-to-r ${island.color}
                text-white shadow-lg ${island.neonShadow}
                border-b-4 border-black/20
                flex items-center justify-center gap-2
              `}
            >
              <Icon className="w-5 h-5" />
              {island.completed ? 'Chơi lại' : 'Khám phá'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT: ProgressMap
═══════════════════════════════════════════════════════════ */
export default function ProgressMap({ onBack, setActiveTab }) {
  const [selectedIsland, setSelectedIsland] = useState(null);
  const [bgParticles, setBgParticles] = useState([]);

  // Generate random background particles once
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 3,
        color: ['bg-cyan-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-emerald-400'][Math.floor(Math.random() * 5)],
      });
    }
    setBgParticles(particles);
  }, []);

  /* Island positions — a gentle zigzag path left → right */
  const islandPositions = [
    { x: 10, y: 60 },
    { x: 26, y: 35 },
    { x: 42, y: 58 },
    { x: 58, y: 32 },
    { x: 74, y: 55 },
    { x: 90, y: 30 },
  ];

  const handleNavigate = (tabTarget) => {
    setSelectedIsland(null);
    if (setActiveTab) {
      setActiveTab(tabTarget);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-[2rem] select-none">
      {/* === DEEP OCEAN BACKGROUND === */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#0d1540] to-[#081028] z-0" />

      {/* Animated nebula blobs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none z-0"
        style={{ top: '-10%', left: '-10%' }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none z-0"
        style={{ bottom: '-10%', right: '-5%' }}
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-cyan-500/8 blur-[80px] pointer-events-none z-0"
        style={{ top: '40%', left: '40%' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* Floating particles */}
      {bgParticles.map((p) => (
        <FloatingParticle key={p.id} x={p.x} y={p.y} size={p.size} delay={p.delay} color={p.color} />
      ))}

      {/* === TOP HEADER BAR === */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 flex items-center justify-between">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-white backdrop-blur-md transition-all shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Title */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Atom className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          </motion.div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
              Elemental Archipelago
            </h1>
            <p className="text-[10px] sm:text-xs text-cyan-300/70 font-bold uppercase tracking-widest">
              Hành trình Hóa Học
            </p>
          </div>
        </div>

        {/* Progress pill */}
        <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-black text-white">2 / 6</span>
          <span className="text-xs text-slate-400 font-semibold">Islands</span>
        </div>
      </div>

      {/* === GLOWING PATHS BETWEEN ISLANDS === */}
      {islandPositions.slice(0, -1).map((pos, i) => {
        const next = islandPositions[i + 1];
        const isActive = ISLANDS[i].completed;
        return (
          <GlowingPath
            key={`path-${i}`}
            fromX={pos.x}
            fromY={pos.y}
            toX={next.x}
            toY={next.y}
            active={isActive}
          />
        );
      })}

      {/* === ISLAND NODES === */}
      {ISLANDS.map((island, i) => (
        <IslandNode
          key={island.id}
          island={island}
          posX={islandPositions[i].x}
          posY={islandPositions[i].y}
          onClick={setSelectedIsland}
          isSelected={selectedIsland?.id === island.id}
        />
      ))}

      {/* === DETAIL PANEL (slide-in) === */}
      <AnimatePresence>
        {selectedIsland && (
          <IslandDetailPanel
            island={selectedIsland}
            onClose={() => setSelectedIsland(null)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>

      {/* === BOTTOM LEGEND === */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          <span className="text-[10px] text-slate-300 font-bold">Hoàn thành</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
          <span className="text-[10px] text-slate-300 font-bold">Đang mở</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] text-slate-500 font-bold">Chưa mở</span>
        </div>
      </div>
    </div>
  );
}
