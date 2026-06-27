import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../../../context/WebSocketProvider';
import useAuthStore from '../../../stores/useAuthStore';
import PetStats from './components/PetStats';
import QuestionPanel from './components/QuestionPanel';
import SkillBar from './components/SkillBar';
import BattleLog from './components/BattleLog';
import BattleResultModal from './components/BattleResultModal';
import { Swords, WifiOff, Loader2, Users, ArrowLeft } from 'lucide-react';
import { useBiMascot } from '../../../components/student/mascot/BiMascot';

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

const STAR_PARTICLES = [
  { id: 0, top: 12, left: 8, delay: 0 },
  { id: 1, top: 24, left: 28, delay: 0.3 },
  { id: 2, top: 16, left: 54, delay: 0.6 },
  { id: 3, top: 30, left: 82, delay: 0.9 },
  { id: 4, top: 48, left: 18, delay: 1.2 },
  { id: 5, top: 58, left: 42, delay: 1.5 },
  { id: 6, top: 46, left: 68, delay: 1.8 },
  { id: 7, top: 72, left: 90, delay: 2.1 },
  { id: 8, top: 78, left: 12, delay: 2.4 },
  { id: 9, top: 88, left: 36, delay: 2.7 },
  { id: 10, top: 82, left: 62, delay: 3 },
  { id: 11, top: 92, left: 76, delay: 3.3 },
];

export default function BattleArenaPage({ selectedPetId, onBack }) {
  const { speak } = useBiMascot();
  const { connected, reconnecting, connect, subscribe, unsubscribe, send } = useWebSocket();
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
  const damageTimeoutRef = useRef(null);
  const lastSpokenActionRef = useRef('');
  const roomIdRef = useRef(null);
  const handleGameStateRef = useRef(null);
  const handleBattleResultRef = useRef(null);

  const isMyTurn = gameState?.currentTurnPlayerId === myId;

  const addLog = useCallback((msg) => {
    setBattleLogs(prev => [...prev.slice(-49), msg]);
  }, []);

  useEffect(() => {
    if (!connected || !myId) return;

    // Subscribe to global match topic FIRST to avoid race conditions
    const unsubMatch = subscribe('/topic/battle/match', (state) => {
      if (!roomIdRef.current && (state.player1Id === myId || state.player2Id === myId)) {
        console.log('[PVP] Match found! Room ID:', state.roomId);
        setRoomId(state.roomId);
        handleGameStateRef.current?.(state);
      }
    });

    // Join queue AFTER subscribing
    send('/app/battle/join', { studentPetId: selectedPetId });

    return () => {
      unsubMatch();
      if (roomIdRef.current) unsubscribe(`/topic/battle/${roomIdRef.current}`);
    };
  }, [connected, myId, selectedPetId, send, subscribe, unsubscribe]);

  useEffect(() => {
    if (!connected || !roomId) return;
    const unsub1 = subscribe(`/topic/battle/${roomId}`, (state) => handleGameStateRef.current?.(state));
    const unsub2 = subscribe(`/topic/battle/${roomId}/result`, (result) => handleBattleResultRef.current?.(result));
    return () => {
      unsub1();
      unsub2();
    };
  }, [connected, roomId, subscribe]);

  function handleGameState(state) {
    if (!roomId && state.roomId) setRoomId(state.roomId);
    setGameState(state);
    updatePhase(state);
    processLogs(state);
    triggerDamageEffect(state);
    startTurnTimer(state);
  }

  function handleBattleResult(result) {
    setBattleResult(result);
    setPhase(PHASE.GAME_OVER);
    addLog(`🏁 Trận đấu kết thúc! Người thắng: ${result.winnerName}`);
    speak(
      String(result.winnerId) === String(myId)
        ? 'Thắng trận PVP rồi! Bạn trả lời và chọn nhịp chiến đấu rất tốt. Pet của mình chắc đang tự hào lắm.'
        : 'Mình thua trận này, nhưng đã có thêm kinh nghiệm. Lần sau đọc kỹ câu hỏi, giữ bình tĩnh và mình sẽ phản công tốt hơn.'
    );
    clearInterval(timerRef.current);
  }

  function updatePhase(state) {
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
  }

  function processLogs(state) {
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
    const actionKey = `${state.roomId || ''}-${state.lastActionResult || ''}-${state.currentTurnIndex || 0}-${state.lastDamageDealt || 0}`;
    if (lastSpokenActionRef.current !== actionKey) {
      lastSpokenActionRef.current = actionKey;
      if (state.lastActionResult === 'CORRECT') {
        speak('PVP trả lời đúng rồi! Đây là lúc tận dụng lợi thế và gây áp lực lên đối thủ.');
      } else if (state.lastActionResult === 'WRONG') {
        speak('Có người vừa trả lời sai. Nếu là lượt của mình thì bình tĩnh lại nhé, câu sau mình đọc chậm hơn một nhịp.');
      } else if (state.lastActionResult === 'TIMEOUT') {
        speak('Hết giờ là mất lượt. Lần tới mình chọn đáp án chắc nhất trước, đừng để đồng hồ ép quá lâu nha.');
      }
    }
  }

  function triggerDamageEffect(state) {
    if (state.lastActionResult === 'CORRECT' && state.lastDamageDealt > 0) {
      const damagedPlayer = state.currentTurnIndex === 0 ? 'player2' : 'player1';
      setDamagedSlot(damagedPlayer);
      window.clearTimeout(damageTimeoutRef.current);
      damageTimeoutRef.current = window.setTimeout(() => setDamagedSlot(null), 600);
    }
  }

  function startTurnTimer(state) {
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

  useEffect(() => {
    handleGameStateRef.current = handleGameState;
    handleBattleResultRef.current = handleBattleResult;
  });

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      window.clearTimeout(damageTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    connect();
  }, [connect]);

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
    clearInterval(timerRef.current);
    window.clearTimeout(damageTimeoutRef.current);
    if (phase === PHASE.MATCHMAKING && connected) send('/app/battle/leave', {});
    if (roomId) {
      unsubscribe(`/topic/battle/${roomId}`);
      unsubscribe(`/topic/battle/${roomId}/result`);
    }
    onBack?.();
  }

  const myPet = gameState?.player1Id === myId ? gameState?.player1Pet : gameState?.player2Pet;
  const enemyPet = gameState?.player1Id === myId ? gameState?.player2Pet : gameState?.player1Pet;
  const myName = gameState?.player1Id === myId ? gameState?.player1Name : gameState?.player2Name;
  const enemyName = gameState?.player1Id === myId ? gameState?.player2Name : gameState?.player1Name;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 overflow-hidden flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STAR_PARTICLES.map((particle) => (
          <div key={particle.id} className="absolute w-1 h-1 rounded-full bg-white/20 animate-pulse"
            style={{ top: `${particle.top}%`, left: `${particle.left}%`, animationDelay: `${particle.delay}s` }}
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
