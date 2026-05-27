import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from '../../../context/WebSocketProvider';
import { useStudentStore } from '../../../stores/useStudentStore';
import useAuthStore from '../../../stores/useAuthStore';
import PetStats from './components/PetStats';
import QuestionPanel from './components/QuestionPanel';
import SkillBar from './components/SkillBar';
import BattleLog from './components/BattleLog';
import BattleResultModal from './components/BattleResultModal';
import { Swords, WifiOff, Loader2, Users, ArrowLeft } from 'lucide-react';

/**
 * BattleArenaPage — Main PVP battle container.
 */

const PHASE = {
  MATCHMAKING: 'MATCHMAKING',
  WAITING_TURN: 'WAITING_TURN',
  MY_TURN_QUESTION: 'MY_TURN_QUESTION',
  MY_TURN_SKILL: 'MY_TURN_SKILL',
  GAME_OVER: 'GAME_OVER',
};

export default function BattleArenaPage({ selectedPetId, onBack }) {
  const { connected, reconnecting, connect, subscribe, unsubscribe, send } = useWebSocket();
  const { level } = useStudentStore();
  const { user } = useAuthStore();
  const myId = user?.id;

  const [phase, setPhase] = useState(PHASE.MATCHMAKING);
  const [gameState, setGameState] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [battleLogs, setBattleLogs] = useState([]);
  const [damagedSlot, setDamagedSlot] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const timerRef = useRef(null);

  const myStudentId = gameState?.player1Id === myId ? gameState?.player1Id : gameState?.player2Id;
  const isMyTurn = gameState?.currentTurnPlayerId === myId;

  // --- WebSocket setup ---
  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (!connected || !myId) return;

    // Subscribe to global match topic FIRST to avoid race conditions
    const unsubMatch = subscribe('/topic/battle/match', (state) => {
      if (!roomId && (state.player1Id === myId || state.player2Id === myId)) {
        console.log('[PVP] Match found! Room ID:', state.roomId);
        setRoomId(state.roomId);
        handleGameState(state);
      }
    });

    // Join queue AFTER subscribing
    send('/app/battle/join', { studentPetId: selectedPetId });
    addLog('⚔️ Đang tìm đối thủ...');

    return () => {
      unsubMatch();
      if (roomId) unsubscribe(`/topic/battle/${roomId}`);
    };
  }, [connected, myId, selectedPetId]);

  useEffect(() => {
    if (!connected || !roomId) return;
    const unsub1 = subscribe(`/topic/battle/${roomId}`, handleGameState);
    const unsub2 = subscribe(`/topic/battle/${roomId}/result`, handleBattleResult);
    return () => { unsub1(); unsub2(); };
  }, [connected, roomId]);

  const handleGameState = useCallback((state) => {
    if (!roomId && state.roomId) setRoomId(state.roomId);
    setGameState(state);
    updatePhase(state);
    processLogs(state);
    triggerDamageEffect(state);
    startTurnTimer(state);
  }, [roomId, myId]);

  const handleBattleResult = useCallback((result) => {
    setBattleResult(result);
    setPhase(PHASE.GAME_OVER);
    addLog(`🏁 Trận đấu kết thúc! Người thắng: ${result.winnerName}`);
    clearInterval(timerRef.current);
  }, []);

  const updatePhase = (state) => {
    if (state.status === 'FINISHED' || state.status?.includes('WON')) {
      setPhase(PHASE.GAME_OVER);
      return;
    }
    const isMy = state.currentTurnPlayerId === myId;
    if (state.lastActionResult === 'BATTLE_START' || state.lastActionResult === 'NEW_TURN') {
      setQuestionAnswered(false);
      setPhase(isMy ? PHASE.MY_TURN_QUESTION : PHASE.WAITING_TURN);
    } else {
      setPhase(PHASE.WAITING_TURN);
    }
  };

  const processLogs = (state) => {
    if (!state.lastActionResult) return;
    const p1 = state.player1Name;
    const p2 = state.player2Name;
    
    // Since turn switches before broadcasting, the attacker is the OTHER player
    const attacker = state.currentTurnIndex === 1 ? p1 : p2;
    const attackerPet = state.currentTurnIndex === 1 ? state.player1Pet : state.player2Pet;
    const skillName = attackerPet?.skillName || 'Tấn công cơ bản';

    const messages = {
      BATTLE_START: `⚔️ Trận đấu bắt đầu! ${p1} vs ${p2}`,
      CORRECT: `✅ Pet ${attackerPet?.petName} của ${attacker} đã dùng [${skillName}] gây ${state.lastDamageDealt} sát thương (1 lần)!`,
      WRONG: `❌ ${attacker} trả lời sai! Mất lượt!`,
      TIMEOUT: `⏰ ${attacker} hết giờ! Chuyển lượt!`,
      NEW_TURN: `🎯 Đến lượt: ${state.currentTurnIndex === 0 ? p1 : p2}`,
    };
    if (messages[state.lastActionResult]) addLog(messages[state.lastActionResult]);
  };

  const triggerDamageEffect = (state) => {
    if (state.lastActionResult === 'CORRECT' && state.lastDamageDealt > 0) {
      const damagedPlayer = state.currentTurnIndex === 0 ? 'player2' : 'player1';
      setDamagedSlot(damagedPlayer);
      setTimeout(() => setDamagedSlot(null), 600);
    }
  };

  const startTurnTimer = (state) => {
    clearInterval(timerRef.current);
    if (!state.turnDeadline) return;
    const remaining = Math.max(0, Math.floor((state.turnDeadline - Date.now()) / 1000));
    setTimeLeft(remaining);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const addLog = (msg) => setBattleLogs(prev => [...prev.slice(-49), msg]);

  const handleAnswer = (selectedOption) => {
    if (!gameState || questionAnswered) return;
    setQuestionAnswered(true);
    send('/app/battle/action', {
      roomId: gameState.roomId,
      selectedOption,
      questionId: gameState.currentQuestion?.questionId,
    });
  };

  const handleUseSkill = () => setPhase(PHASE.WAITING_TURN);

  const handleLeave = () => {
    if (phase === PHASE.MATCHMAKING && connected) send('/app/battle/leave', {});
    if (roomId) {
      unsubscribe(`/topic/battle/${roomId}`);
      unsubscribe(`/topic/battle/${roomId}/result`);
    }
    onBack?.();
  };

  const myPet = gameState?.player1Id === myId ? gameState?.player1Pet : gameState?.player2Pet;
  const enemyPet = gameState?.player1Id === myId ? gameState?.player2Pet : gameState?.player1Pet;
  const myName = gameState?.player1Id === myId ? gameState?.player1Name : gameState?.player2Name;
  const enemyName = gameState?.player1Id === myId ? gameState?.player2Name : gameState?.player1Name;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 overflow-hidden flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full bg-white/20 animate-pulse"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>

      {reconnecting && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-500/90 py-2 text-center text-sm font-black text-white flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 animate-pulse" /> Đang kết nối lại...
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/10">
        <button onClick={handleLeave} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-bold">Thoát</span>
        </button>
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-amber-400" /> <span className="font-black text-white text-sm">PVP Pet Battle</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
      </div>

      {phase === PHASE.MATCHMAKING && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-indigo-500/30 border-2 border-indigo-400/50 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-indigo-300 animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-indigo-400/20 animate-ping" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">Đang tìm đối thủ...</h2>
            <p className="text-white/50 text-sm font-bold">Hãy chờ hệ thống ghép đôi</p>
          </div>
          <button onClick={handleLeave} className="mt-6 px-6 py-3 rounded-full bg-red-500/20 text-red-300 font-bold hover:bg-red-500/40 border border-red-500/30">
            Hủy tìm trận
          </button>
        </div>
      )}

      {phase !== PHASE.MATCHMAKING && phase !== PHASE.GAME_OVER && gameState && (
        <div className="flex-1 flex flex-col gap-3 p-3 md:p-4 overflow-auto">
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <PetStats petName={myPet?.petName} ownerName={myName} currentHp={myPet?.currentHp ?? 0} maxHp={myPet?.maxHp ?? 100} imageUrl={myPet?.imageUrl} element={myPet?.element} isCurrentTurn={isMyTurn} isDamaged={damagedSlot === (gameState.player1Id === myId ? 'player1' : 'player2')} />
            <PetStats petName={enemyPet?.petName} ownerName={enemyName} currentHp={enemyPet?.currentHp ?? 0} maxHp={enemyPet?.maxHp ?? 100} imageUrl={enemyPet?.imageUrl} element={enemyPet?.element} isEnemy isCurrentTurn={!isMyTurn} isDamaged={damagedSlot === (gameState.player1Id === myId ? 'player2' : 'player1')} />
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shrink-0 my-2">
            {phase === PHASE.WAITING_TURN && (
              <div className="flex flex-col gap-3">
                {gameState.currentQuestion ? (
                  <>
                    <div className="flex items-center justify-center gap-2 bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
                      <Loader2 className="w-5 h-5 text-indigo-300 animate-spin shrink-0" />
                      <p className="text-indigo-200 font-bold text-sm">Đang chờ đối thủ...</p>
                    </div>
                    <div className="opacity-70 pointer-events-none filter grayscale-[30%]">
                      <QuestionPanel question={gameState.currentQuestion} onAnswer={() => { }} disabled={true} timeLeft={timeLeft} />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
                    <Loader2 className="w-6 h-6 text-indigo-300 animate-spin" />
                    <p className="text-white/60 font-black text-sm">Đang chờ hệ thống...</p>
                  </div>
                )}
              </div>
            )}
            {phase === PHASE.MY_TURN_QUESTION && gameState.currentQuestion && (
              <QuestionPanel question={gameState.currentQuestion} onAnswer={handleAnswer} disabled={questionAnswered} timeLeft={timeLeft} />
            )}
            {phase === PHASE.MY_TURN_SKILL && (
              <SkillBar petName={myPet?.petName} skillName={myPet?.skillName} onUseSkill={handleUseSkill} />
            )}
          </div>
          <div className="mt-auto shrink-0 pt-2">
            <BattleLog logs={battleLogs} />
          </div>
        </div>
      )}

      {phase === PHASE.GAME_OVER && battleResult && (
        <BattleResultModal result={battleResult} myStudentId={myId} onLeave={handleLeave} />
      )}
    </div>
  );
}
