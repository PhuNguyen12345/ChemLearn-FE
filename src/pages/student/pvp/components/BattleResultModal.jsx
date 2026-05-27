import React, { useEffect, useRef, useState } from 'react';
import { Home, Play, SkipForward, Star } from 'lucide-react';

/**
 * BattleResultModal — Full-screen overlay shown when battle ends.
 *
 * Props:
 *  - result: BattleResultResponse from backend
 *  - myStudentId: string
 *  - onLeave: () => void
 */
export default function BattleResultModal({ result, myStudentId, onLeave }) {
  const [showCutscene, setShowCutscene] = useState(true);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!result || !showCutscene || !videoRef.current) return;

    const playPromise = videoRef.current.play();
    if (playPromise?.catch) {
      playPromise.catch(() => setNeedsManualPlay(true));
    }
  }, [result, showCutscene]);

  if (!result) return null;

  const isWinner = String(result.winnerId) === String(myStudentId);
  const cutsceneSrc = isWinner ? '/VictoryCutscene.mp4' : '/DefeatCutscene.mp4';

  if (showCutscene) {
    return (
      <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-500">
        <video
          ref={videoRef}
          src={cutsceneSrc}
          className="h-full w-full object-cover"
          autoPlay
          playsInline
          controls={needsManualPlay}
          onEnded={() => setShowCutscene(false)}
          onError={() => setShowCutscene(false)}
        />

        {needsManualPlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <button
              onClick={() => {
                setNeedsManualPlay(false);
                videoRef.current?.play()?.catch(() => setNeedsManualPlay(true));
              }}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 shadow-xl transition hover:scale-105"
            >
              <Play className="h-5 w-5 fill-current" />
              Phát cutscene
            </button>
          </div>
        )}

        <button
          onClick={() => setShowCutscene(false)}
          className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-black/80"
        >
          <SkipForward className="h-4 w-4" />
          Bỏ qua
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className={`
        relative flex flex-col items-center gap-6 p-10 rounded-[2.5rem] border-2 shadow-2xl max-w-md w-full mx-4
        ${isWinner
          ? 'bg-gradient-to-b from-amber-900/60 to-yellow-900/40 border-amber-400/60 shadow-amber-500/30'
          : 'bg-gradient-to-b from-slate-800/80 to-slate-900/60 border-slate-600/40'}
      `}>
        {/* Top badge */}
        <div className={`
          absolute -top-8 w-16 h-16 rounded-full flex items-center justify-center text-4xl
          border-4 shadow-xl
          ${isWinner ? 'bg-amber-400 border-amber-200 shadow-amber-400/50' : 'bg-slate-700 border-slate-500'}
        `}>
          {isWinner ? '🏆' : '😔'}
        </div>

        {/* Result title */}
        <div className="text-center pt-4">
          <h2 className={`text-4xl font-black ${isWinner ? 'text-amber-300' : 'text-slate-300'}`}>
            {isWinner ? 'CHIẾN THẮNG!' : 'THẤT BẠI'}
          </h2>
          <p className="text-white/60 text-sm font-bold mt-1">
            {result.endReason === 'DISCONNECT' ? '(Đối thủ ngắt kết nối)' :
             result.endReason === 'TIMEOUT' ? '(Hết thời gian)' :
             isWinner ? `Đánh bại ${result.loserName}!` : `Thua trước ${result.winnerName}`}
          </p>
        </div>

        {/* Rewards */}
        <div className="w-full space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-white/50 text-center">Phần thưởng</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10">
              <p className="text-2xl font-black text-amber-300">
                +{isWinner ? result.winnerXpGained : result.loserXpGained}
              </p>
              <p className="text-xs font-bold text-white/50">XP Kinh nghiệm</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10">
              <p className="text-2xl font-black text-yellow-400">
                +{isWinner ? result.winnerCoinsGained : result.loserCoinsGained}
              </p>
              <p className="text-xs font-bold text-white/50">🪙 Vàng</p>
            </div>
          </div>
        </div>

        {/* Star rating for winner */}
        {isWinner && (
          <div className="flex gap-1">
            {[1,2,3].map(i => (
              <Star
                key={i}
                className={`w-8 h-8 fill-amber-400 text-amber-400 ${i <= 3 ? 'animate-bounce' : ''}`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}

        {/* Leave button */}
        <button
          onClick={onLeave}
          className={`
            w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2
            transition-all duration-200 hover:scale-[1.02] shadow-lg
            ${isWinner
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-900 shadow-amber-500/40 hover:shadow-amber-500/60'
              : 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-700/50'}
          `}
        >
          <Home className="w-5 h-5" />
          Về Sảnh
        </button>
      </div>
    </div>
  );
}
