import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Star, Sparkles, Zap, FlaskConical, BookOpen, Flame, Droplets, Building2, Atom, Heart, Skull, Crown, ShoppingBag, Shield } from 'lucide-react';
import { getProgressMap, getNodeQuestions, completeNode, getGamificationProfile } from '../../api/studentApi';
import { useStudentStore } from '../../stores/useStudentStore';

/* ═══════════════════════════════════════════════════════════
   THEMING SYSTEM FOR DIFFERENT ISLAND ARENAS
   ═══════════════════════════════════════════════════════════ */
const THEMES = [
  {
    name: 'Cyan',
    bgStyle: { background: 'linear-gradient(to bottom, #081a36, #0c2f5d, #040e21)' },
    panelBg: 'bg-blue-950/80 border-blue-600/50',
    panelLine: 'from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,1)]',
    btnBg: 'from-blue-800/80 to-blue-950/90 hover:from-blue-600/90 hover:to-blue-800/90 border-blue-600/60 hover:border-cyan-300',
    glow: 'rgba(34,211,238,0.5)',
    btnGlow: 'hover:shadow-[0_0_25px_rgba(34,211,238,0.8)]',
    accentText: 'text-cyan-200',
    victoryBg: 'bg-blue-950/95 border-cyan-400 shadow-[0_0_80px_rgba(34,211,238,0.5)]',
    victoryBtn: 'bg-cyan-500 hover:bg-cyan-400 text-slate-900',
  },
  {
    name: 'Green',
    bgStyle: { background: 'linear-gradient(to bottom, #062419, #093d27, #02100a)' },
    panelBg: 'bg-emerald-950/80 border-emerald-600/50',
    panelLine: 'from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,1)]',
    btnBg: 'from-emerald-800/80 to-emerald-950/90 hover:from-emerald-600/90 hover:to-emerald-800/90 border-emerald-600/60 hover:border-emerald-300',
    glow: 'rgba(52,211,153,0.5)',
    btnGlow: 'hover:shadow-[0_0_25px_rgba(52,211,153,0.8)]',
    accentText: 'text-emerald-200',
    victoryBg: 'bg-emerald-950/95 border-emerald-400 shadow-[0_0_80px_rgba(52,211,153,0.5)]',
    victoryBtn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-900',
  },
  {
    name: 'Red',
    bgStyle: { background: 'linear-gradient(to bottom, #2d0b0b, #481212, #140202)' },
    panelBg: 'bg-red-950/80 border-red-600/50',
    panelLine: 'from-transparent via-orange-400 to-transparent shadow-[0_0_15px_rgba(251,146,60,1)]',
    btnBg: 'from-red-800/80 to-red-950/90 hover:from-red-600/90 hover:to-red-800/90 border-red-600/60 hover:border-orange-300',
    glow: 'rgba(239,68,68,0.5)',
    btnGlow: 'hover:shadow-[0_0_25px_rgba(239,68,68,0.8)]',
    accentText: 'text-orange-200',
    victoryBg: 'bg-red-950/95 border-orange-400 shadow-[0_0_80px_rgba(239,68,68,0.5)]',
    victoryBtn: 'bg-orange-500 hover:bg-orange-400 text-slate-950',
  }
];

/* ═══════════════════════════════════════════════════════════
   ISLAND STYLES & POSITIONS (zigzag layout)
   ═══════════════════════════════════════════════════════════ */
const ISLAND_STYLES = [
  {
    icon: FlaskConical,
    emoji: '🧪',
    color: 'from-blue-500 to-cyan-400',
    glowColor: 'rgba(59,130,246,0.6)',
    neonBorder: 'border-blue-400',
    neonShadow: 'shadow-blue-500/50',
    bgGradient: 'from-blue-600/20 to-cyan-500/10',
  },
  {
    icon: BookOpen,
    emoji: '🌿',
    color: 'from-emerald-500 to-green-400',
    glowColor: 'rgba(16,185,129,0.6)',
    neonBorder: 'border-emerald-400',
    neonShadow: 'shadow-emerald-500/50',
    bgGradient: 'from-emerald-600/20 to-green-500/10',
  },
  {
    icon: Atom,
    emoji: '⚗️',
    color: 'from-orange-500 to-red-400',
    glowColor: 'rgba(249,115,22,0.6)',
    neonBorder: 'border-orange-400',
    neonShadow: 'shadow-orange-500/50',
    bgGradient: 'from-orange-600/20 to-red-500/10',
  }
];

const islandPositions = [
  { x: 18, y: 62 },
  { x: 50, y: 38 },
  { x: 82, y: 60 }
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
   Glowing Footprint path between islands
   ═══════════════════════════════════════════════════════════ */
const GlowingPath = ({ fromX, fromY, toX, toY, active }) => {
  const steps = 6;
  const footprints = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = fromX + (toX - fromX) * t;
      const wave = Math.sin(t * Math.PI) * 20;
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
          <div className={`w-3 h-3 rounded-full ${active ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]' : 'bg-slate-500/40'}`} />
        </motion.div>
      ))}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   Star Display Component
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
  return (
    <div
      className="absolute z-20"
      style={{ left: `${posX}%`, top: `${posY}%`, transform: 'translate(-50%, -50%)' }}
    >
      <motion.div
        className={`${island.unlocked ? 'cursor-pointer' : 'cursor-default'}`}
        whileHover={island.unlocked ? { scale: 1.08 } : {}}
        whileTap={island.unlocked ? { scale: 0.95 } : {}}
        onClick={() => island.unlocked && onClick(island)}
      >
        {island.unlocked && (
          <motion.div
            className="absolute inset-[-15px] rounded-full opacity-40 z-0"
            style={{ background: `radial-gradient(circle, ${island.glowColor}, transparent 70%)` }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}

        <div className={`relative flex flex-col items-center gap-1 ${!island.unlocked ? 'opacity-40 grayscale' : ''}`}>
          <motion.div
            animate={island.unlocked ? { y: [0, -8, 0] } : {}}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center"
          >
            {/* 25% Larger Island circle wrapper */}
            <div className={`
              relative w-28 h-28 sm:w-32 sm:h-32 rounded-full
              bg-gradient-to-br ${island.color}
              border-[4px] ${island.neonBorder}
              shadow-2xl ${island.neonShadow}
              flex items-center justify-center overflow-hidden
              ${isSelected ? 'ring-4 ring-white/60 ring-offset-2 ring-offset-transparent' : ''}
            `}>
              {island.unlocked ? (
                island.imageUrl ? (
                  <img
                    src={island.imageUrl}
                    alt={island.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-3xl sm:text-4xl">{island.emoji}</span>
                  </div>
                )
              ) : (
                <Lock className="w-10 h-10 text-white/60" />
              )}

              {island.completed && (
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-black">✓</span>
                </div>
              )}
            </div>

            <div className={`
              mt-2 px-3 py-1.5 rounded-xl text-center min-w-[120px] max-w-[160px]
              bg-slate-900/80 backdrop-blur-md border border-white/10
            `}>
              <p className={`text-xs font-black leading-tight ${island.unlocked ? 'text-white' : 'text-slate-500'}`}>
                {island.name}
              </p>
              <p className="text-[9px] text-slate-400 font-semibold">{island.subtitle}</p>
              {island.completed && <StarRating count={island.stars} />}
            </div>
          </motion.div>

          <div className="w-20 h-4 rounded-[100%] mt-1 bg-white/10 blur-sm" />
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
        <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${island.bgGradient} to-transparent pointer-events-none`} />
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/60 hover:text-white transition-colors text-xl">✕</button>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br ${island.color} flex items-center justify-center shadow-lg ${island.neonShadow}`}>
              {island.imageUrl ? (
                <img src={island.imageUrl} alt={island.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">{island.emoji}</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{island.name}</h3>
              <p className="text-xs text-slate-400 font-semibold">{island.subtitle}</p>
            </div>
          </div>

          {island.completed && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating count={island.stars} />
              <span className="text-xs text-yellow-400/80 font-bold">{island.stars}⭐</span>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">🎯 Nhiệm vụ</p>
              <p className="text-sm text-white font-bold">{island.mission}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">🧩 Tiến độ ải</p>
              <p className="text-sm text-white font-bold">{island.fragment}</p>
            </div>
          </div>

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

          <div className="mt-auto">
            <button
              onClick={() => onNavigate(island)}
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
              Khám phá
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN CONTAINER COMPONENT: ProgressMap
   ═══════════════════════════════════════════════════════════ */
export default function ProgressMap({ onBack, setActiveTab }) {
  const { coins, addCoins, inventory, consumeItem, setGamificationProfile } = useStudentStore();

  const [activeView, setActiveView] = useState('world'); // 'world' | 'submap' | 'game'
  const [selectedIsland, setSelectedIsland] = useState(null);
  const [currentGameNode, setCurrentGameNode] = useState(null);
  const [gameQuestions, setGameQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const [bgParticles, setBgParticles] = useState([]);
  const [islands, setIslands] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Core gameplay states
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'gameover' | 'victory'
  const [hp, setHp] = useState(100);
  const [lives, setLives] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswersDisabled, setIsAnswersDisabled] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [monsterShake, setMonsterShake] = useState(0);
  const [screenFlashHit, setScreenFlashHit] = useState(false);

  useEffect(() => {
    fetchMapData();
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

  const fetchMapData = async () => {
    try {
      setIsLoading(true);
      const data = await getProgressMap();
      setMapData(data);

      const mappedIslands = data.islands.map((apiIsland, index) => {
        const style = ISLAND_STYLES[index % ISLAND_STYLES.length];
        const totalNodes = apiIsland.nodes.length;
        const completedNodes = apiIsland.nodes.filter(n => n.isCompleted).length;
        const isCompleted = totalNodes > 0 && totalNodes === completedNodes;
        const stars = apiIsland.nodes.reduce((sum, n) => sum + (n.stars || 0), 0);

        return {
          id: apiIsland.islandId,
          name: apiIsland.name,
          subtitle: `Level yêu cầu: ${apiIsland.requiredLevel}`,
          mission: apiIsland.nodes.length > 0 ? apiIsland.nodes[0].name : 'Đang cập nhật',
          fragment: `${completedNodes}/${totalNodes} Ải`,
          imageUrl: apiIsland.imageUrl,
          ...style,
          unlocked: !apiIsland.isLocked,
          completed: isCompleted,
          stars: stars,
          nodes: apiIsland.nodes,
          styleIndex: index % ISLAND_STYLES.length
        };
      });

      setIslands(mappedIslands);

      // If in submap view, sync the selected island node status
      if (selectedIsland) {
        const updated = mappedIslands.find(i => i.id === selectedIsland.id);
        if (updated) setSelectedIsland(updated);
      }
    } catch (error) {
      console.error('Lỗi tải bản đồ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (island) => {
    setSelectedIsland(island);
    setActiveView('submap');
  };

  const handleNodeClick = async (node) => {
    if (node.isLocked) return;
    try {
      setIsLoadingQuestions(true);
      const questions = await getNodeQuestions(node.nodeId);
      setGameQuestions(questions);
      setCurrentGameNode(node);

      // Init Game Arena Variables
      setHp(100);
      setLives(3);
      setCurrentQuestionIndex(0);
      setGameState('playing');
      setIsAnswersDisabled(false);
      setShowExplosion(false);
      setScreenFlashHit(false);

      setActiveView('game');
    } catch (err) {
      console.error("Lỗi tải câu hỏi:", err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const playSound = (isCorrect) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (isCorrect) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio can fail in some security contexts, bypass.
    }
  };

  const handleAnswer = async (selectedOption) => {
    if (isAnswersDisabled) return;
    setIsAnswersDisabled(true);

    const currentQ = gameQuestions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    playSound(isCorrect);

    const isBoss = currentGameNode.nodeType === 'BOSS';
    const bottleCount = inventory ? inventory.filter(i => i.id === 'bottle1').length : 0;
    const hasSword = inventory ? inventory.some(i => i.id === 'sword1') : false;
    const hasStaff = inventory ? inventory.some(i => i.id === 'staff1') : false;

    // Weapon stats: staff = 40 damage, sword = 30 damage, otherwise boss 10 damage / normal 20 damage
    const ACTUAL_DAMAGE = hasStaff ? 40 : hasSword ? 30 : (isBoss ? 10 : 20);

    if (isCorrect) {
      // Visual feedback
      setShowExplosion(true);
      setMonsterShake(prev => prev + 1);

      setTimeout(() => {
        setMonsterShake(0);
      }, 600);

      setTimeout(async () => {
        setShowExplosion(false);
        const newHp = Math.max(0, hp - ACTUAL_DAMAGE);
        setHp(newHp);

        if (newHp <= 0) {
          // Calculate stars based on remaining lives
          const earnedStars = lives >= 3 ? 3 : lives === 2 ? 2 : 1;

          try {
            // Save completion on backend
            await completeNode(currentGameNode.nodeId, earnedStars);

            // Re-fetch map data to immediately sync UI unlock states
            await fetchMapData();

            // Re-sync full gamification profile (XP, level, coins) from backend
            try {
              const profile = await getGamificationProfile();
              setGamificationProfile(profile);
            } catch (profileErr) {
              console.error("Lỗi đồng bộ profile:", profileErr);
              // Fallback: local coin adjustment
              if (!currentGameNode.isCompleted) {
                addCoins(isBoss ? 500 : 300);
              } else {
                addCoins(isBoss ? 50 : 30);
              }
            }
          } catch (err) {
            console.error("Lỗi lưu tiến trình:", err);
          }

          setTimeout(() => {
            setGameState('victory');
          }, 1000);
        } else {
          nextQuestion();
        }
      }, 1000);
    } else {
      // Wrong Answer Visual Feedback
      setScreenFlashHit(true);
      const newLives = lives - 1;
      setLives(newLives);

      setTimeout(() => {
        setScreenFlashHit(false);
        if (newLives <= 0) {
          setGameState('gameover');
        } else {
          nextQuestion();
        }
      }, 500);
    }
  };

  const useBottle = () => {
    if (inventory && lives < 3) {
      const bottle = inventory.find(i => i.id === 'bottle1');
      if (bottle) {
        consumeItem('bottle1');
        setLives(prev => Math.min(3, prev + 1));
      }
    }
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => (prev + 1) % gameQuestions.length);
    setIsAnswersDisabled(false);
  };

  /* ═══════════════════════════════════════════════════════════
     SUB-MAP VIEW RENDERER
     ═══════════════════════════════════════════════════════════ */
  const renderSubMap = () => {
    if (!selectedIsland) return null;
    const theme = THEMES[selectedIsland.styleIndex % THEMES.length];
    const nodes = selectedIsland.nodes || [];

    const nodeCoords = [
      { x: 15, y: 55 },
      { x: 38, y: 35 },
      { x: 61, y: 55 },
      { x: 84, y: 35 }
    ];

    const threeNodeCoords = [
      { x: 20, y: 50 },
      { x: 50, y: 35 },
      { x: 80, y: 50 }
    ];

    const coords = nodes.length === 3 ? threeNodeCoords : nodeCoords;
    const totalStars = nodes.reduce((sum, n) => sum + (n.stars || 0), 0);
    const maxStars = nodes.length * 3;

    return (
      <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-[2rem] select-none flex flex-col justify-between p-6">
        {/* Deep space/ocean background identical to the islands page */}
        <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to bottom, #0a0e27, #0d1540, #081028)' }} />

        {/* Semi-transparent island color overlay */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" style={theme.bgStyle} />

        <motion.div
          className={`absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br ${selectedIsland.color} opacity-10 blur-[100px] pointer-events-none z-0`}
          style={{ top: '20%', left: '30%' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {bgParticles.slice(0, 20).map((p) => (
          <FloatingParticle key={`sub-${p.id}`} x={p.x} y={p.y} size={p.size} delay={p.delay} color={p.color} />
        ))}

        {/* HEADER BAR */}
        <div className="relative z-20 flex justify-between items-center w-full pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('world')}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-white backdrop-blur-md transition-all shadow-lg active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight drop-shadow-md">
                {selectedIsland.name}
              </h2>
              <p className="text-[10px] text-cyan-300/80 font-bold uppercase tracking-widest">
                Ải Khám Phá Hóa Học
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full backdrop-blur-md">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-black text-yellow-400">{totalStars} / {maxStars}</span>
          </div>
        </div>

        {/* SUBMAP ROAD */}
        <div className="relative flex-1 w-full min-h-0 py-8">
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {nodes.map((node, i) => {
              if (i === 0) return null;
              const from = coords[i - 1];
              const to = coords[i];
              const isPathActive = !node.isLocked;

              return (
                <line
                  key={`line-${i}`}
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke={isPathActive ? '#22d3ee' : '#475569'}
                  strokeWidth="4"
                  strokeDasharray="8 6"
                />
              );
            })}
          </svg>

          {nodes.map((node, i) => {
            const pos = coords[i];
            if (!pos) return null;
            const isCompleted = node.isCompleted;
            const isLocked = node.isLocked;
            const isBoss = node.nodeType === 'BOSS';

            let NodeIcon = FlaskConical;
            if (isBoss) NodeIcon = Skull;
            else if (i % 2 === 1) NodeIcon = BookOpen;

            return (
              <div
                key={node.nodeId}
                className="absolute z-20"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <motion.div
                  className={`${!isLocked ? 'cursor-pointer' : 'cursor-default'}`}
                  whileHover={!isLocked ? { scale: 1.1 } : {}}
                  whileTap={!isLocked ? { scale: 0.95 } : {}}
                  onClick={() => !isLocked && handleNodeClick(node)}
                >
                  <div className="flex flex-col items-center gap-1">
                    {!isLocked && (
                      <motion.div
                        className="absolute inset-[-6px] rounded-full opacity-35 z-0"
                        style={{ background: `radial-gradient(circle, ${theme.glow}, transparent 70%)` }}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                    )}

                    <div className={`
                      relative w-16 h-16 rounded-full flex items-center justify-center border-[3px] shadow-lg
                      ${isLocked
                        ? 'bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-60'
                        : isBoss
                          ? 'bg-gradient-to-b from-red-600 to-orange-500 border-red-400 shadow-red-500/50 text-white'
                          : `bg-gradient-to-b ${selectedIsland.color} ${selectedIsland.neonBorder} ${selectedIsland.neonShadow} text-white`
                      }
                    `}>
                      {isLocked ? (
                        <Lock className="w-5 h-5 text-slate-500" />
                      ) : (
                        <NodeIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      )}

                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border border-white flex items-center justify-center shadow-md">
                          <span className="text-white text-[9px] font-black">✓</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-1 flex flex-col items-center">
                      <p className={`text-[10px] sm:text-xs font-black tracking-tight text-center max-w-[100px] leading-tight ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                        {node.name}
                      </p>
                      {!isLocked && (
                        <div className="flex gap-0.5 mt-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= (node.stars || 0) ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.8)]' : 'text-slate-600'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        <div className="relative z-20 text-center text-[10px] text-slate-400 font-semibold pt-2 shrink-0 border-t border-white/5">
          Ải đã hoàn thành có thể được chơi lại bất cứ lúc nào để kiếm thêm Vàng và đạt tối đa 3 Sao.
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     GAMEPLAY ARENA SCREEN
     ═══════════════════════════════════════════════════════════ */
  const renderGameArena = () => {
    if (!selectedIsland || !currentGameNode || gameQuestions.length === 0) return null;

    const theme = THEMES[selectedIsland.styleIndex % THEMES.length];
    const isBoss = currentGameNode.nodeType === 'BOSS';

    // Inventory weapons & items
    const bottleCount = inventory ? inventory.filter(i => i.id === 'bottle1').length : 0;
    const hasSword = inventory ? inventory.some(i => i.id === 'sword1') : false;
    const hasStaff = inventory ? inventory.some(i => i.id === 'staff1') : false;

    const currentQ = gameQuestions[currentQuestionIndex];

    const coinRewardAmount = currentGameNode.isCompleted
      ? (isBoss ? 50 : 30)
      : (isBoss ? 500 : 300);

    return (
      <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-[2rem] select-none flex flex-col justify-between p-4">
        {/* Deep space/ocean background identical to the islands page */}
        <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to bottom, #0a0e27, #0d1540, #081028)' }} />

        {/* Semi-transparent island color overlay */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={theme.bgStyle} />

        {/* Screen Damage Flash */}
        <AnimatePresence>
          {screenFlashHit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-600 z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* TOP STATUS BAR */}
        <div className="relative z-10 flex justify-between items-start w-full shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('submap')}
              className="p-2.5 bg-black/50 hover:bg-black/70 rounded-xl border border-white/10 text-white backdrop-blur-md transition-all shadow-lg active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Lives Display */}
            <div className="flex gap-2 items-center bg-black/50 p-2 sm:p-3 rounded-xl border border-white/10 backdrop-blur-md">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 1 }}
                  animate={{ scale: i < lives ? 1 : 0, opacity: i < lives ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Heart
                    className={`w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg ${i < lives ? 'fill-red-500 text-red-500' : 'fill-transparent text-gray-500'}`}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 items-end">
            <div className="bg-black/50 px-5 py-1.5 rounded-xl border border-white/10 backdrop-blur-md font-bold text-xs tracking-wider text-orange-200 uppercase">
              {isBoss ? 'Ải Trùm Cuối' : 'Ải Câu Hỏi'}
            </div>

            {/* Inventory Potion and Weapons */}
            <div className="flex gap-2">
              {bottleCount > 0 && (
                <button
                  onClick={useBottle}
                  className="relative p-2 bg-blue-900/50 hover:bg-blue-600/80 rounded-xl border border-blue-400/50 transition-all shadow-lg flex items-center justify-center group active:scale-95"
                >
                  <span className="text-xl">🧪</span>
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white/20 shadow-md transform transition-transform group-hover:scale-110">
                    {bottleCount}
                  </span>
                </button>
              )}
              {hasSword && (
                <div className="relative p-2 bg-slate-800/80 rounded-xl border border-slate-500/50 flex items-center justify-center cursor-help">
                  <span className="text-xl">⚔️</span>
                </div>
              )}
              {hasStaff && (
                <div className="relative p-2 bg-purple-900/80 rounded-xl border border-purple-500/50 flex items-center justify-center cursor-help">
                  <span className="text-xl">🪄</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE COMBAT FIELD */}
        <div className="relative z-10 flex-1 w-full min-h-0 flex flex-col items-center py-2 mb-[10vh]">
          {/* Monster HP Bar */}
          <div className="w-full max-w-sm bg-black/80 p-2 rounded-full border-2 border-red-950 shadow-[0_0_20px_rgba(239,68,68,0.2)] mt-2 relative shrink-0">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-black text-red-500 tracking-widest text-xs uppercase whitespace-nowrap">
              {currentGameNode.monsterName || 'Green Slime'}
            </div>
            <div className="h-4 bg-red-950 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 to-orange-500"
                initial={{ width: '100%' }}
                animate={{ width: `${hp}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Dynamic Monster Visual floating */}
          <div className={`absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-300
            ${isBoss
              ? 'w-[550px] h-[520px] pb-36'
              : 'w-[280px] h-[340px] top-[35%] sm:top-[28%]'
            }
          `}>
            <motion.div
              key={monsterShake}
              animate={monsterShake > 0 ? {
                x: [-15, 15, -10, 10, -5, 5, 0],
                rotate: [-3, 3, -2, 2, 0],
                scale: [1, 1.05, 1],
                filter: ["brightness(1)", "brightness(2.5) hue-rotate(-30deg)", "brightness(1)"],
              } : {
                y: [0, -10, 0],
                scale: [1, 1.03, 1],
                filter: [`drop-shadow(0 0 20px ${theme.glow})`, `drop-shadow(0 0 45px ${theme.glow})`, `drop-shadow(0 0 20px ${theme.glow})`],
              }}
              transition={
                monsterShake > 0
                  ? { duration: 0.6, ease: "easeInOut" }
                  : { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }
              className={`relative flex items-end justify-center pointer-events-none transition-all duration-300
                ${isBoss
                  ? 'w-[620px] sm:w-[680px] h-[100%]'
                  : 'w-[180px] sm:w-[240px] h-[100%]'
                }
              `}
            >
              {currentGameNode.monsterImageUrl ? (
                <img
                  src={currentGameNode.monsterImageUrl}
                  alt={currentGameNode.monsterName}
                  className="w-full h-full object-contain transform-gpu"
                />
              ) : (
                <div className="text-6xl animate-bounce">👾</div>
              )}
            </motion.div>

            {/* Explosion effects */}
            <AnimatePresence>
              {showExplosion && (
                <motion.div
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "backOut" }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-center mix-blend-screen z-30 pb-20"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,211,238,1)_0%,rgba(251,191,36,0.8)_50%,rgba(255,255,255,0)_80%)] opacity-80 z-[-1] animate-ping duration-500 rounded-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM DIALOG / QUESTION PANEL */}
        {gameState === 'playing' && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`w-full max-w-full mx-auto shrink-0 ${theme.panelBg} border-t p-4 sm:p-5 rounded-2xl shadow-[0_-10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl relative flex flex-col items-center mt-auto z-20`}
          >
            <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${theme.panelLine}`} />

            <h3 className="text-base sm:text-lg font-black mb-4 sm:mb-6 text-slate-100 text-center leading-relaxed tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] w-full block">
              {currentQ.prompt}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={isAnswersDisabled}
                  className={`relative group bg-gradient-to-b ${theme.btnBg} text-slate-50 text-sm sm:text-base py-3.5 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-center font-bold hover:text-white hover:scale-[1.02] shadow-[0_5px_15px_rgba(0,0,0,0.6)] ${theme.btnGlow} backdrop-blur-md`}
                >
                  <span className="relative z-10 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">{opt}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* GAME OVER MODAL */}
        <AnimatePresence>
          {gameState === 'gameover' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <div className="bg-red-950/80 border border-red-500 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(255,0,0,0.3)]">
                <h2 className="text-4xl font-black text-red-500 mb-2 drop-shadow-md">GAME OVER</h2>
                <p className="text-red-200 mb-8 text-sm">Bạn đã bị quái vật hóa học đánh bại!</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleNodeClick(currentGameNode)}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 w-full uppercase tracking-wider text-xs"
                  >
                    Thử lại
                  </button>
                  <button
                    onClick={() => setActiveView('submap')}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 w-full uppercase tracking-wider text-xs"
                  >
                    Rút lui
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VICTORY MODAL */}
        <AnimatePresence>
          {gameState === 'victory' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <div className={`${theme.victoryBg} border p-8 rounded-3xl max-w-md w-full text-center relative overflow-hidden`}>
                <h2 className="text-4xl font-black text-yellow-400 mb-2 drop-shadow-md">CHIẾN THẮNG!</h2>
                <p className="text-slate-200 mb-6 text-sm">
                  Chúc mừng! Bạn đã giải mã thành công các câu hỏi và chế ngự được <strong>{currentGameNode.monsterName}</strong>.
                </p>

                {/* Stars feedback */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3].map((s) => {
                    const starsEarned = lives >= 3 ? 3 : lives === 2 ? 2 : 1;
                    return (
                      <Star
                        key={s}
                        className={`w-10 h-10 ${s <= starsEarned ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]' : 'text-slate-700'}`}
                      />
                    );
                  })}
                </div>

                <div className="flex flex-col gap-2 items-center justify-center mb-8 bg-black/40 py-4 px-6 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-2xl font-black text-yellow-400">+{coinRewardAmount} Vàng</span>
                  </div>
                  {!currentGameNode.isCompleted && (
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      <span className="text-sm font-bold text-cyan-300">+{currentGameNode.xpReward} Kinh nghiệm (XP)</span>
                    </div>
                  )}
                  {currentGameNode.isCompleted && (
                    <span className="text-[10px] text-slate-400 font-semibold mt-1">
                      (Đã nhận thưởng lần đầu, cộng 1/10 số vàng ở chế độ chơi lại)
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setActiveView('submap')}
                    className={`${theme.victoryBtn} font-black py-4 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 w-full uppercase tracking-wider text-xs`}
                  >
                    Trở về Bản đồ
                  </button>
                  <button
                    onClick={() => handleNodeClick(currentGameNode)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 w-full uppercase tracking-wider text-xs"
                  >
                    Chơi lại ải này
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     WORLD MAP VIEW RENDERER (Default)
     ═══════════════════════════════════════════════════════════ */
  const renderWorldMap = () => {
    return (
      <div className="relative w-full h-full min-h-[600px] overflow-hidden select-none">
        {/* === DEEP OCEAN BACKGROUND === */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#0d1540] to-[#081028] z-0" />

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

        {bgParticles.map((p) => (
          <FloatingParticle key={p.id} x={p.x} y={p.y} size={p.size} delay={p.delay} color={p.color} />
        ))}

        {/* === TOP HEADER BAR === */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 flex items-center justify-between">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-white backdrop-blur-md transition-all shadow-lg active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>
              <Atom className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                Elemental Archipelago
              </h1>
              <p className="text-[10px] sm:text-xs text-cyan-300/70 font-bold uppercase tracking-widest">
                HÀNH TRÌNH HÓA HỌC
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-black text-white">{islands.filter(i => i.completed).length} / {islands.length}</span>
            <span className="text-xs text-slate-400 font-semibold">Quần đảo</span>
          </div>
        </div>

        {/* === GLOWING PATHS BETWEEN ISLANDS === */}
        {islandPositions.slice(0, Math.min(islandPositions.length, islands.length) - 1).map((pos, i) => {
          const next = islandPositions[i + 1];
          const isActive = islands[i]?.completed;
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
        {islands.map((island, i) => {
          if (i >= islandPositions.length) return null;
          return (
            <IslandNode
              key={island.id}
              island={island}
              posX={islandPositions[i].x}
              posY={islandPositions[i].y}
              onClick={setSelectedIsland}
              isSelected={selectedIsland?.id === island.id}
            />
          );
        })}

        {/* === DETAIL PANEL === */}
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
  };

  if (isLoading || isLoadingQuestions) {
    return (
      <div className="flex h-[600px] items-center justify-center bg-slate-900 rounded-[2rem]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider animate-pulse">
            Đang tải câu hỏi và hoạt ảnh...
          </p>
        </div>
      </div>
    );
  }

  // Switch Render View Tiers
  if (activeView === 'submap') {
    return renderSubMap();
  } else if (activeView === 'game') {
    return renderGameArena();
  } else {
    return renderWorldMap();
  }
}
