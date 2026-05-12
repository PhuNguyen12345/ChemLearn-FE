import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from '../../../context/WebSocketProvider';
import { useStudentStore } from '../../../stores/useStudentStore';
import PetStats from './components/PetStats';
import QuestionPanel from './components/QuestionPanel';
import SkillBar from './components/SkillBar';
import BattleLog from './components/BattleLog';
import BattleResultModal from './components/BattleResultModal';
import { Swords, WifiOff, Loader2, Users, ArrowLeft } from 'lucide-react';

/**
 * BattleArenaPage — Main PVP battle container.
 * Manages all WebSocket subscriptions and battle state.
 * Passes data down to presentational components.
 *
 * Props:
 *  - selectedPetId: UUID string of the pet the student selected
 *  - onBack: () => void — return to lobby
 */

// Battle phases to drive the Interaction Panel
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

  // Get current student's username from localStorage/token
  const myUsername = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.username;
    } catch { return null; }
  })();

  const [phase, setPhase] = useState(PHASE.MATCHMAKING);
  const [gameState, setGameState] = useState(null);   // GameStateResponse from BE
  const [battleResult, setBattleResult] = useState(null); // BattleResultResponse
  const [roomId, setRoomId] = useState(null);
  const [battleLogs, setBattleLogs] = useState([]);
  const [damagedSlot, setDamagedSlot] = useState(null); // 'player1' | 'player2'
  const [timeLeft, setTimeLeft] = useState(30);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const timerRef = useRef(null);

  const myStudentId = gameState?.player1Id === myUsername || gameState?.player1Name === myUsername
    ? gameState?.player1Id : gameState?.player2Id;

  const isMyTurn = gameState?.currentTurnPlayerId === myStudentId ||
                   gameState?.currentTurnIndex === (gameState?.player1Id === myStudentId ? 0 : 1);

  // --- WebSocket setup ---
  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (!connected) return;

    // Join queue
    send('/app/battle/join', { studentPetId: selectedPetId });
    addLog('⚔️ Đang tìm đối thủ...');

    return () => {
      if (roomId) unsubscribe(`/topic/battle/${roomId}`);
    };
  }, [connected]);

  // When we get a roomId, subscribe to that room's channel
  useEffect(() => {
    if (!connected || !roomId) return;

    const unsub1 = subscribe(`/topic/battle/${roomId}`, handleGameState);
    const unsub2 = subscribe(`/topic/battle/${roomId}/result`, handleBattleResult);

    return () => {
      unsub1();
      unsub2();
    };
  }, [connected, roomId]);

  // --- Game State Handler ---
  const handleGameState = useCallback((state) => {
    // First message — extract room ID
    if (!roomId && state.roomId) {
      setRoomId(state.roomId);
    }

    setGameState(state);
    updatePhase(state);
    processLogs(state);
    triggerDamageEffect(state);
    startTurnTimer(state);
  }, [roomId, myStudentId]);

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

    const isMy = state.currentTurnPlayerId === myStudentId ||
                 state.currentTurnIndex === (state.player1Id === myStudentId ? 0 : 1);

    if (state.lastActionResult === 'BATTLE_START' || state.lastActionResult === 'NEW_TURN') {
      setQuestionAnswered(false);
      setPhase(isMy ? PHASE.MY_TURN_QUESTION : PHASE.WAITING_TURN);
    } else if (state.lastActionResult === 'CORRECT' && isMy) {
      setPhase(PHASE.MY_TURN_SKILL);
    }
  };

  const processLogs = (state) => {
    if (!state.lastActionResult) return;
    const p1 = state.player1Name;
    const p2 = state.player2Name;
    const attacker = state.currentTurnIndex === 1 ? p1 : p2; // switched after action

    const messages = {
      BATTLE_START: `⚔️ Trận đấu bắt đầu! ${p1} vs ${p2}`,
      CORRECT: `✅ ${attacker} trả lời đúng! Gây ${state.lastDamageDealt} sát thương!`,
      WRONG: `❌ ${attacker} trả lời sai! Mất lượt!`,
      TIMEOUT: `⏰ ${attacker} hết giờ! Chuyển lượt!`,
      NEW_TURN: `🎯 Đến lượt: ${state.currentTurnIndex === 0 ? p1 : p2}`,
    };
    if (messages[state.lastActionResult]) {
      addLog(messages[state.lastActionResult]);
    }
  };

  const triggerDamageEffect = (state) => {
    if (state.lastActionResult === 'CORRECT' && state.lastDamageDealt > 0) {
      // The damage was dealt to whoever was the defender (not current turn player)
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

  // --- Actions ---
  const handleAnswer = (selectedOption) => {
    if (!gameState || questionAnswered) return;
    setQuestionAnswered(true);
    send('/app/battle/action', {
      roomId: gameState.roomId,
      selectedOption,
      questionId: gameState.currentQuestion?.questionId,
    });
  };

  const handleUseSkill = () => {
    // In current BE design, skill is used automatically on correct answer.
    // This confirms the attack — same action endpoint but after the fact.
    // Sending a follow-up is not needed; BE already applied damage.
    // We just switch to waiting.
    setPhase(PHASE.WAITING_TURN);
  };

  const handleLeave = () => {
    // Send leave queue message to server just in case we are in matchmaking
    if (phase === PHASE.MATCHMAKING && connected) {
      send('/app/battle/leave', {});
    }
    unsubscribe(`/topic/battle/${roomId}`);
    unsubscribe(`/topic/battle/${roomId}/result`);
    onBack?.();
  };

  // --- Render helpers ---
  const myPet = gameState?.player1Id === myStudentId ? gameState?.player1Pet : gameState?.player2Pet;
  const enemyPet = gameState?.player1Id === myStudentId ? gameState?.player2Pet : gameState?.player1Pet;
  const myName = gameState?.player1Id === myStudentId ? gameState?.player1Name : gameState?.player2Name;
  const enemyName = gameState?.player1Id === myStudentId ? gameState?.player2Name : gameState?.player1Name;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 overflow-hidden flex flex-col">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full bg-white/20 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`, animationDuration: `${2 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Reconnecting banner */}
      {reconnecting && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-500/90 backdrop-blur-sm py-2 text-center text-sm font-black text-white flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 animate-pulse" />
          Đang mất kết nối — đang kết nối lại...
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/10 shrink-0">
        <button onClick={handleLeave} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold">Thoát</span>
        </button>
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-amber-400" />
          <span className="font-black text-white text-sm">PVP Pet Battle</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
      </div>

      {/* ============ MATCHMAKING PHASE ============ */}
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
          <div className="flex items-center gap-2 px-5 py-2 bg-white/10 rounded-full">
            <Users className="w-4 h-4 text-white/60" />
            <span className="text-sm font-bold text-white/60">Đang trong hàng chờ...</span>
          </div>

          <button
            onClick={handleLeave}
            className="mt-6 px-6 py-3 rounded-full bg-red-500/20 text-red-300 font-bold hover:bg-red-500/40 border border-red-500/30 transition-all hover:scale-105"
          >
            Hủy tìm trận
          </button>
        </div>
      )}

      {/* ============ BATTLE ARENA ============ */}
      {phase !== PHASE.MATCHMAKING && phase !== PHASE.GAME_OVER && gameState && (
        <div className="flex-1 flex flex-col gap-3 p-3 md:p-4 overflow-auto">

          {/* Battle field — 2 pet zones */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {/* My Pet (left) */}
            <PetStats
              petName={myPet?.petName}
              ownerName={myName}
              currentHp={myPet?.currentHp ?? 0}
              maxHp={myPet?.maxHp ?? 100}
              imageUrl={myPet?.imageUrl}
              element={myPet?.element}
              isCurrentTurn={isMyTurn}
              isDamaged={damagedSlot === (gameState.player1Id === myStudentId ? 'player1' : 'player2')}
            />

            {/* Enemy Pet (right) */}
            <PetStats
              petName={enemyPet?.petName}
              ownerName={enemyName}
              currentHp={enemyPet?.currentHp ?? 0}
              maxHp={enemyPet?.maxHp ?? 100}
              imageUrl={enemyPet?.imageUrl}
              element={enemyPet?.element}
              isEnemy
              isCurrentTurn={!isMyTurn}
              isDamaged={damagedSlot === (gameState.player1Id === myStudentId ? 'player2' : 'player1')}
            />
          </div>

          {/* Interaction Panel */}
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex-1 min-h-[180px]">
            {phase === PHASE.WAITING_TURN && (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-6 h-6 text-indigo-300 animate-spin" />
                </div>
                <p className="text-white/60 font-black text-sm">Đang chờ đối thủ trả lời...</p>
                <p className="text-white/30 text-xs">Đứng vững! Đến lượt bạn ngay thôi 💪</p>
              </div>
            )}

            {phase === PHASE.MY_TURN_QUESTION && gameState.currentQuestion && (
              <QuestionPanel
                question={gameState.currentQuestion}
                onAnswer={handleAnswer}
                disabled={questionAnswered}
                timeLeft={timeLeft}
              />
            )}

            {phase === PHASE.MY_TURN_SKILL && (
              <SkillBar
                petName={myPet?.petName}
                skillName={myPet?.skillName}
                onUseSkill={handleUseSkill}
              />
            )}
          </div>

          {/* Battle Log */}
          <BattleLog logs={battleLogs} />
        </div>
      )}

      {/* ============ GAME OVER ============ */}
      {phase === PHASE.GAME_OVER && battleResult && (
        <BattleResultModal
          result={battleResult}
          myStudentId={myStudentId}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
}
