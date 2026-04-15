import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useStudentStore } from '../stores/useStudentStore';
import bgImage from '../assets/quiz-background.png';
import bossImage from '../assets/fireboss1.png';
import attackImage from '../assets/attack2.png';

const QUESTIONS = [
  { id: 1, question: "Ký hiệu hóa học của Sắt là gì?", options: ["Fe", "Cu", "Ag", "Au"], answer: "Fe" },
  { id: 2, question: "Khí nào duy trì sự cháy?", options: ["O2", "N2", "CO2", "H2"], answer: "O2" },
  { id: 3, question: "Nước có công thức hóa học là gì?", options: ["HO", "H2O", "HO2", "H2O2",], answer: "H2O" },
  { id: 4, question: "Muối ăn (Muối biển) chủ yếu chứa chất nào?", options: ["NaCl", "KCl", "CaCl2", "MgCl2"], answer: "NaCl" },
  { id: 5, question: "Axit có trong dạ dày con người là gì?", options: ["HCl", "H2SO4", "HNO3", "CH3COOH"], answer: "HCl" },
  { id: 6, question: "Kim loại nào ở thể lỏng ở nhiệt độ thường?", options: ["Hg (Thủy ngân)", "Fe (Sắt)", "Cu (Đồng)", "Ag (Bạc)"], answer: "Hg (Thủy ngân)" },
  { id: 7, question: "Khí nhà kính chủ yếu gây ra sự nóng lên toàn cầu là?", options: ["CO2", "O2", "N2", "H2"], answer: "CO2" },
  { id: 8, question: "Chất nào được dùng làm bột nở trong làm bánh?", options: ["NaHCO3", "Na2CO3", "NaCl", "NaOH"], answer: "NaHCO3" },
  { id: 9, question: "Thành phần chính của đá vôi là gì?", options: ["CaCO3", "CaO", "Ca(OH)2", "CaCl2"], answer: "CaCO3" },
  { id: 10, question: "Phân đạm cung cấp nguyên tố dinh dưỡng nào cho cây trồng?", options: ["N (Nitơ)", "P (Photpho)", "K (Kali)", "Ca (Canxi)"], answer: "N (Nitơ)" },
];

const INITIAL_HP = 100;
const INITIAL_LIVES = 3;
const HP_REDUCTION = 20;

export default function FireQuizGame({ onBack, onGoShop }) {
  const { addCoins, inventory, consumeItem } = useStudentStore();
  const [gameState, setGameState] = useState('playing'); // 'playing', 'gameover', 'victory'
  const [hp, setHp] = useState(INITIAL_HP);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Animation states
  const [isAnswersDisabled, setIsAnswersDisabled] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [monsterShake, setMonsterShake] = useState(0); // changing value triggers shake
  const [screenFlashHit, setScreenFlashHit] = useState(false);

  // Shuffle questions randomly once on mount
  const [questions, setQuestions] = useState([]);

  const setupGame = () => {
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
    setHp(INITIAL_HP);
    setLives(INITIAL_LIVES);
    setCurrentQuestionIndex(0);
    setGameState('playing');
    setIsAnswersDisabled(false);
    setShowExplosion(false);
    setScreenFlashHit(false);
  };

  const bottleCount = inventory.filter(i => i.id === 'bottle1').length;
  const hasSword = inventory.some(i => i.id === 'sword1');
  const hasStaff = inventory.some(i => i.id === 'staff1');
  
  const ACTUAL_DAMAGE = hasStaff ? 40 : hasSword ? 30 : HP_REDUCTION;

  const useBottle = () => {
    if (bottleCount > 0 && lives < INITIAL_LIVES + 2) {
      consumeItem('bottle1');
      setLives(lives + 1);
      // Optional: Add healing animation/sound here if desired
    }
  };

  useEffect(() => {
    setupGame();
  }, []);

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
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleAnswer = (selectedOption) => {
    if (isAnswersDisabled) return;

    setIsAnswersDisabled(true);
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQ.answer;
    playSound(isCorrect);

    if (isCorrect) {
      // Trigger correct animations
      setShowExplosion(true);
      setMonsterShake(prev => prev + 1);
      setTimeout(() => {
        setMonsterShake(0);
      }, 600);
      setTimeout(() => {
        setShowExplosion(false);
        const newHp = Math.max(0, hp - ACTUAL_DAMAGE);
        setHp(newHp);

        if (newHp <= 0) {
          setTimeout(() => {
          setGameState('victory');
          addCoins(50);
        }, 1500);
        } else {
          nextQuestion();
        }
      }, 1000); // Wait for explosion animation

    } else {
      // Trigger incorrect animations
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
      }, 500); // Screen red flash duration
    }
  };

  const nextQuestion = () => {
    // If we run out of questions but haven't won/lost, just loop them
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
    setIsAnswersDisabled(false);
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentQuestionIndex];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black text-white selection:bg-red-500/30 font-sans"
    >
      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

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

      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 mx-auto">

        {/* TOP BAR: Lives & Level */}
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center gap-4">
            {onBack && (
              <button 
                onClick={onBack} 
                className="p-2 sm:p-3 bg-black/50 hover:bg-black/70 rounded-xl border border-white/10 text-white backdrop-blur-md transition-colors shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
            <div className="flex gap-2 items-center bg-black/50 p-2 sm:p-3 rounded-xl border border-white/10 backdrop-blur-md">
              {[...Array(INITIAL_LIVES)].map((_, i) => (
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

          <div className="flex flex-col gap-2">
            <div className="bg-black/50 px-6 py-2 rounded-xl border border-white/10 backdrop-blur-md font-bold text-xl tracking-wider text-orange-200 uppercase justify-end flex">
              Boss Fight
            </div>

            {/* INVENTORY QUICK USE */}
            <div className="flex gap-2 self-end">
               {bottleCount > 0 && (
                  <button onClick={useBottle} className="relative group p-2 bg-blue-900/50 hover:bg-blue-600/80 rounded-xl border border-blue-400/50 transition-colors shadow-lg flex items-center justify-center tooltip-trigger">
                     <span className="text-xl">🧪</span>
                     <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white/20 shadow-md transform transition-transform group-hover:scale-110">{bottleCount}</span>
                  </button>
               )}
               {hasSword && (
                  <div className="relative p-2 bg-slate-800/80 rounded-xl border border-slate-500/50 flex items-center justify-center cursor-help">
                     <span className="text-xl">⚔️</span>
                     <span className="absolute flex w-max top-full mt-2 -right-2 opacity-0 hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded">Kiếm Tân Binh: Dmg 30</span>
                  </div>
               )}
               {hasStaff && (
                  <div className="relative p-2 bg-purple-900/80 rounded-xl border border-purple-500/50 flex items-center justify-center cursor-help">
                     <span className="text-xl">🪄</span>
                     <span className="absolute flex w-max top-full mt-2 -right-2 opacity-0 hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded">Trượng Pháp Thuật: Dmg 40</span>
                  </div>
               )}
            </div>
          </div>
        </div>

        {/* MIDDLE: Boss and Effects */}
        <div className="flex-1 min-h-0 w-full flex flex-col items-center relative py-2 mb-[10vh]">

          {/* HP Bar */}
          <div className="w-full max-w-sm sm:max-w-md bg-black/80 p-2 rounded-full border-2 border-red-900 shadow-[0_0_20px_rgba(255,0,0,0.3)] mt-2 sm:mt-6 relative shrink-0 z-20">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-bold text-red-500 tracking-widest text-xs sm:text-sm uppercase whitespace-nowrap">Quái Vật Lửa</div>
            <div className="h-4 sm:h-6 bg-red-950 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 to-orange-500 relative"
                initial={{ width: '100%' }}
                animate={{ width: `${hp}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Visual fire effect stripe inside hp bar */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAnIGhlaWdodD0nMTAwJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPSd1cmwoI3BnKScvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0ncGcnIHgxPScwJycgeTE9JzAlJyB4Mj0nMTAwJScgeTI9JzEwMCUnPjxzdG9wIG9mZnNldD0nMjUlJyBzdG9wLWNvbG9yPSdyZ2JhKDI1NSwyNTUsMjU1LDAuMiknIHN0b3Atb3BhY2l0eT0nMScvPjxzdG9wIG9mZnNldD0nNTAlJyBzdG9wLWNvbG9yPSd0cmFuc3BhcmVudCcgc3RvcC1vcGFjaXR5PScwJy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+')] opacity-50 mix-blend-overlay"></div>
              </motion.div>
            </div>
          </div>

          {/* Absolute Boss Image Container */}
          <div className="absolute top-[35%] sm:top-[28%] lg:top-[20%] left-1/2 -translate-x-1/2 w-[350px] sm:w-[300px] h-[450px] sm:h-[600px] z-10 pointer-events-none flex items-center justify-center">
            <motion.div
              key={monsterShake}
              animate={monsterShake > 0 ? {
                x: [-15, 15, -10, 10, -5, 5, -2, 2, 0],
                rotate: [-3, 3, -2, 2, 0],
                scale: [1, 1.05, 1],
                filter: ["brightness(1)", "brightness(2.5) hue-rotate(-30deg)", "brightness(1)"],
              } : {
                y: [0, -15, 0], // floating animation when idle
                scale: [1, 1.03, 1], // breathing effect
                filter: ["drop-shadow(0 0 20px rgba(255,100,0,0.5))", "drop-shadow(0 0 50px rgba(255,100,0,0.9))", "drop-shadow(0 0 20px rgba(255,100,0,0.5))"],
              }}
              transition={
                monsterShake > 0
                  ? { duration: 0.6, ease: "easeInOut" }
                  : { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }
              className="relative w-[350px] sm:w-[500px] lg:w-[650px] h-[120%] sm:h-[130%] scale-110 sm:scale-125 transform-gpu origin-bottom flex items-end justify-center"
            >
              <img
                src={bossImage}
                alt="Fire Monster Boss"
                className="w-full h-full object-contain"
                style={{
                  mixBlendMode: 'screen',
                  WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 75%)',
                  maskImage: 'radial-gradient(circle at center, black 50%, transparent 75%)'
                }}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x500/100/f00?text=Fire+Boss';
                }}
              />
            </motion.div>

            {/* Explosion Effect when correct */}
            <AnimatePresence>
              {showExplosion && (
                <motion.div
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "backOut" }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-center mix-blend-screen z-30 pb-[50%]"
                >
                  <img
                    src={attackImage}
                    alt="Explosion VFX"
                    className="w-[400vw] h-[500vw] sm:w-[1000px] sm:h-[1000px] max-wide-none object-contain object-center opacity-90"
                    style={{ filter: 'brightness(1.5) contrast(1.2)' }}
                    onError={(e) => {
                      // Fallback CSS explosion if image not found
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* Fallback CSS particle explosion if image is missing */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(100,200,255,1)_0%,rgba(255,255,0,0.8)_50%,rgba(255,255,255,0)_80%)] opacity-80 z-[-1] animate-ping duration-500"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM: Question / Dialog Box */}
        {gameState === 'playing' && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-full mx-auto shrink-0 bg-amber-950/80 border-t border-amber-600/50 p-4 sm:p-5 rounded-xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl relative flex flex-col items-center mt-auto z-20"
          >
            {/* Decals inside dialog */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80 shadow-[0_0_15px_rgba(251,191,36,1)]"></div>

            <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-amber-50 text-center leading-relaxed tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] w-full block">
              {currentQ.question}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={isAnswersDisabled}
                  className="relative group bg-gradient-to-b from-amber-800/80 to-amber-950/90 hover:from-amber-600/90 hover:to-amber-800/90 border border-amber-600/60 hover:border-amber-300 text-lg py-3 px-4 sm:text-xl sm:py-4 sm:px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-center text-amber-50 font-bold hover:text-white hover:scale-[1.03] shadow-[0_5px_15px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(251,191,36,0.8)] backdrop-blur-md"
                >
                  <span className="relative z-10 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">{opt}</span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-amber-500/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* GAME OVER SCREEN */}
        <AnimatePresence>
          {gameState === 'gameover' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <div className="bg-red-950/80 border border-red-500 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(255,0,0,0.3)]">
                <h2 className="text-5xl font-black text-red-500 mb-2 drop-shadow-md">GAME OVER</h2>
                <p className="text-red-200 mb-8">Bạn đã bị quái vật lửa thiêu rụi!</p>
                <button
                  onClick={setupGame}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 w-full uppercase tracking-widest popup-button"
                >
                  Thử lại
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VICTORY SCREEN */}
        <AnimatePresence>
          {gameState === 'victory' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <div className="bg-amber-950/90 border border-amber-400 p-8 rounded-3xl max-w-md w-full text-center shadow-[0_0_80px_rgba(251,191,36,0.5)] relative overflow-hidden">
                {/* Sparkles background */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] opacity-30 animate-pulse"></div>

                <h2 className="text-5xl font-black text-amber-400 mb-2 drop-shadow-md relative z-10">CHIẾN THẮNG!</h2>
                <p className="text-amber-200 mb-6 relative z-10">Bạn đã dập tắt được Lửa Hỗn Mang và cứu lấy phòng thí nghiệm giả kim!</p>
                
                <div className="flex items-center justify-center gap-2 mb-8 relative z-10 bg-black/40 py-3 rounded-2xl border border-amber-500/30">
                  <span className="text-3xl">💰</span>
                  <span className="text-3xl font-black text-yellow-400 drop-shadow-md">+50 Vàng</span>
                </div>

                <div className="flex flex-col gap-3 relative z-10">
                  {onGoShop && (
                    <button
                      onClick={onGoShop}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95 w-full uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" /> Tới Cửa Hàng
                    </button>
                  )}
                  <button
                    onClick={setupGame}
                    className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-95 w-full uppercase tracking-widest"
                  >
                    Chơi lại
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
