import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useStudentStore } from '../../stores/useStudentStore';
import {
  PlayCircle,
  Award,
  Clock,
  Flame,
  Zap,
  Shield,
  Beaker,
  HelpCircle,
  BookOpen,
  Star,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

import { getProgressMap, loginStudent, getGamificationProfile, logDailyActivity, getDailyQuests, claimQuest } from '../../api/studentApi';
import { toast } from 'sonner';

/* ─────────────────────────────────────────────
   Reusable: Neon XP / HP progress bar
───────────────────────────────────────────── */
const XPBar = ({ fill = '50%', color = 'bg-emerald-400' }) => (
  <div className="h-5 w-full bg-slate-900/10 rounded-full overflow-hidden shadow-inner">
    <div
      className={`h-full ${color} rounded-full relative overflow-hidden transition-all duration-700`}
      style={{ width: fill }}
    >
      {/* Shiny top highlight */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-full" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Reusable: Gold reward pill
───────────────────────────────────────────── */
const XPPill = ({ label }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-900 text-xs font-black shadow-sm shadow-amber-300/50 border border-amber-300 whitespace-nowrap">
    ⭐ {label}
  </span>
);

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const StudentHome = () => {
  const context = useOutletContext();
  const navigate = useNavigate();
  const { coins, experience, level, currentStreak, setGamificationProfile } = useStudentStore();
  const [dailyQuests, setDailyQuests] = React.useState([]);

  const sortQuests = (quests) => {
    const sorted = [...quests].sort((a, b) => {
      const getWeight = (q) => {
        const isDone = q.currentProgress >= q.targetValue;
        if (isDone && !q.isClaimed) return 0; // Hoàn thành nhưng chưa nhận
        if (!isDone) return 1;                // Đang thực hiện
        return 2;                             // Hoàn thành và đã nhận
      };
      return getWeight(a) - getWeight(b);
    });
    return sorted.slice(0, 3);
  };

  const handleClaim = async (questId) => {
    try {
      await claimQuest(questId);
      // Tải lại hồ sơ gamification để cập nhật EXP & Vàng trên Header ngay lập tức
      const profile = await getGamificationProfile();
      setGamificationProfile(profile);
      
      // Tải lại danh sách nhiệm vụ để hiển thị trạng thái mới nhất
      const quests = await getDailyQuests();
      setDailyQuests(sortQuests(quests));
      toast.success("Nhận thưởng thành công! 🎉");
    } catch (err) {
      console.error("Failed to claim quest:", err);
      toast.error("Nhận thưởng thất bại. Vui lòng thử lại!");
    }
  };

  React.useEffect(() => {
    const initData = async () => {
      try {
        // Log activity and fetch gamification data
        await logDailyActivity();
        const profile = await getGamificationProfile();
        setGamificationProfile(profile);
        
        const quests = await getDailyQuests();
        setDailyQuests(sortQuests(quests)); // Sắp xếp và hiển thị tất cả nhiệm vụ
      } catch (error) {
        console.error("Failed to fetch gamification data:", error);
      }
    };
    initData();
  }, []);

  return (
    <div className="space-y-8 pb-12 select-none">

      {/* ══════════════════════════════════════════
          1. PLAYER CARD — Welcome Banner
      ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-[0_10px_30px_rgba(168,85,247,0.4)] border-b-4 border-purple-700">
        {/* Background blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-44 h-44 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top right: Shop & Coins */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-3 mr-35">
          <div className="flex items-center gap-2 bg-yellow-400/20 px-4 py-2 rounded-full border border-yellow-300/40 backdrop-blur-md">
            <span className="text-xl">💰</span>
            <span className="font-black text-yellow-300">{coins} Vàng</span>
          </div>
          <button
            onClick={() => navigate('/student/island')}
            className="flex items-center gap-2 bg-emerald-500/80 hover:bg-emerald-500 px-4 py-2 rounded-full border border-emerald-400/50 backdrop-blur-md transition-all shadow-lg shadow-emerald-500/20"
          >
            <span className="text-xl">🏝️</span>
            <span className="font-bold text-white uppercase text-sm tracking-wider">Đảo Thú Cưng</span>
          </button>
          <button
            onClick={() => navigate('/student/shop')}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full border border-white/40 backdrop-blur-md transition-colors"
          >
            <span className="text-xl">🛍️</span>
            <span className="font-bold text-white uppercase text-sm tracking-wider">Cửa Hàng</span>
          </button>
        </div>

        {/* Floating decorative icons */}
        <div className="absolute top-20 right-28 text-yellow-300 animate-bounce" style={{ animationDuration: '2.4s' }}>
          <Star className="w-6 h-6 fill-yellow-300" />
        </div>
        <div className="absolute top-8 right-14 text-pink-200 animate-bounce" style={{ animationDuration: '3.1s', animationDelay: '0.5s' }}>
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="absolute bottom-5 right-10 text-indigo-200 animate-bounce" style={{ animationDuration: '2.7s', animationDelay: '1s' }}>
          <Star className="w-4 h-4 fill-indigo-200" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            {/* Level badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-black tracking-widest uppercase border border-white/30 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Level {level} · Chemist
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm">
              Welcome back! 🎉
            </h1>
            <p className="text-purple-100 text-base md:text-lg font-semibold opacity-90 max-w-xl">
              You're on fire! 🔥 Keep the streak going and earn bonus XP today.
            </p>
          </div>

          {/* Bouncy Flask */}
          <div className="hidden md:flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-[1.5rem] shadow-inner border border-white/30 shrink-0">
            <Beaker className="w-12 h-12 text-white animate-[bounce_2.5s_ease-in-out_infinite]" strokeWidth={1.5} />
          </div>
        </div>

        {/* XP progress toward next level */}
        <div className="relative z-10 mt-6 space-y-1.5">
          <div className="flex justify-between text-xs font-black text-purple-100 uppercase tracking-wider">
            <span>Progress to Level {level + 1}</span>
            <span>{experience} XP</span>
          </div>
          <div className="h-4 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full relative overflow-hidden" style={{ width: `${(experience % 1000) / 10}%` }}>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          2. GAME STATS ROW — Streak · EXP · Rank
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Streak */}
        <div className="flex items-center gap-4 p-5 bg-white rounded-[1.5rem] border-2 border-orange-200 border-b-[5px] border-b-orange-400 shadow-sm hover:-translate-y-1.5 transition-transform duration-300 cursor-default">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-300/50 shrink-0">
            <Flame className="w-7 h-7 text-white fill-orange-200" />
          </div>
          <div>
            <p className="text-xs font-black text-orange-500 uppercase tracking-widest">Daily Streak</p>
            <h3 className="text-2xl font-black text-slate-800">{currentStreak} Days 🔥</h3>
          </div>
        </div>

        {/* Total EXP */}
        <div className="flex items-center gap-4 p-5 bg-white rounded-[1.5rem] border-2 border-yellow-200 border-b-[5px] border-b-yellow-400 shadow-sm hover:-translate-y-1.5 transition-transform duration-300 cursor-default">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-md shadow-yellow-300/50 shrink-0">
            <Zap className="w-7 h-7 text-white fill-yellow-100" />
          </div>
          <div>
            <p className="text-xs font-black text-yellow-600 uppercase tracking-widest">Total EXP</p>
            <h3 className="text-2xl font-black text-slate-800">{experience} XP ⚡</h3>
          </div>
        </div>

        {/* Rank */}
        <div className="flex items-center gap-4 p-5 bg-white rounded-[1.5rem] border-2 border-indigo-200 border-b-[5px] border-b-indigo-500 shadow-sm hover:-translate-y-1.5 transition-transform duration-300 cursor-default">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-300/50 shrink-0">
            <Shield className="w-7 h-7 text-white fill-indigo-200" />
          </div>
          <div>
            <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">Current Rank</p>
            <h3 className="text-lg font-black text-slate-800">
              {level >= 10 ? '🥇 Gold Alchemist' : level >= 7 ? '🥈 Silver Alchemist' : level >= 4 ? '🥉 Bronze Alchemist' : '🌱 Novice Chemist'}
            </h3>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════
          3. LEVEL SELECTION — Game Portals
      ══════════════════════════════════════════ */}
      <div>
        <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Quick Explore
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Portal 1 — Virtual Lab */}
          <button
            onClick={() => navigate('/student/virtual-lab')}
            className="group flex flex-col items-center justify-center gap-3 p-7 rounded-[1.5rem] bg-white border-2 border-purple-200 border-b-[6px] border-b-purple-400 text-purple-700 hover:bg-purple-50 hover:border-b-purple-500 active:border-b-2 active:translate-y-1 transition-all duration-150 shadow-sm cursor-pointer"
          >
            <div className="w-16 h-16 rounded-[1rem] bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-300/50 group-hover:scale-110 transition-transform duration-200">
              <Beaker className="w-8 h-8 text-white" />
            </div>
            <span className="font-black text-base tracking-tight">🧪 Virtual Lab</span>
            <span className="text-xs font-bold text-purple-400">Mix & React</span>
          </button>

          {/* Portal 2 — Quick Quiz */}
          <button
            onClick={() => navigate('/student/classes')}
            className="group flex flex-col items-center justify-center gap-3 p-7 rounded-[1.5rem] bg-white border-2 border-emerald-200 border-b-[6px] border-b-emerald-400 text-emerald-700 hover:bg-emerald-50 hover:border-b-emerald-500 active:border-b-2 active:translate-y-1 transition-all duration-150 shadow-sm cursor-pointer"
          >
            <div className="w-16 h-16 rounded-[1rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-300/50 group-hover:scale-110 transition-transform duration-200">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <span className="font-black text-base tracking-tight">❓ Class Work</span>
            <span className="text-xs font-bold text-emerald-400">Open class quizzes and tasks</span>
          </button>

          {/* Portal 3 — Boss Raid */}
          <button
            onClick={() => navigate('/student/fire-quiz')}
            className="group flex flex-col items-center justify-center gap-3 p-7 rounded-[1.5rem] bg-white border-2 border-red-200 border-b-[6px] border-b-red-400 text-red-700 hover:bg-red-50 hover:border-b-red-500 active:border-b-2 active:translate-y-1 transition-all duration-150 shadow-sm cursor-pointer"
          >
            <div className="w-16 h-16 rounded-[1rem] bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-300/50 group-hover:scale-110 transition-transform duration-200">
              <Flame className="w-8 h-8 text-white fill-orange-200" />
            </div>
            <span className="font-black text-base tracking-tight">🔥 Đốt Cháy Quái Vật</span>
            <span className="text-xs font-bold text-red-400">Boss Raid Quizzes</span>
          </button>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          4. MAIN QUEST + DAILY QUESTS
      ══════════════════════════════════════════ */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {/* ── MAIN QUEST: Continue Learning ── */}
        <div className="col-span-1 md:col-span-2 xl:col-span-2 rounded-[2rem] overflow-hidden border-2 border-sky-200 border-b-[6px] border-b-sky-400 shadow-sm bg-white">
          {/* Gradient header strip */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 pt-5 pb-4">
            <div className="flex items-center gap-2 text-white">
              <PlayCircle className="w-5 h-5 fill-white text-sky-600" />
              <h2 className="text-base font-black uppercase tracking-widest">⚔️ Main Quest</h2>
            </div>
            <p className="text-sky-100 text-sm font-semibold mt-0.5">Pick up right where you left off</p>
          </div>

          {/* Quest body */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-sky-50 rounded-[1.5rem] border-2 border-sky-100">

              {/* Chapter thumbnail */}
              <div className="w-full sm:w-28 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-300/40 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10" />
                <BookOpen className="w-10 h-10 text-white relative z-10" strokeWidth={1.5} />
              </div>

              {/* Info */}
              <div className="flex-grow text-center sm:text-left space-y-1">
                <h3 className="text-lg font-black text-slate-800">⚗️ Chapter 4: The Periodic Table</h3>
                <p className="text-sm font-semibold text-slate-500">Understanding Groups and Periods</p>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-sky-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>15 mins remaining</span>
                </div>
                {/* Mini progress bar */}
                <div className="pt-2">
                  <XPBar fill="60%" color="bg-sky-400" />
                </div>
                <p className="text-xs font-bold text-sky-500">60% complete</p>
              </div>

              {/* PLAY button */}
              <button className="group flex items-center gap-2 w-full sm:w-auto bg-gradient-to-b from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-black rounded-2xl border-b-[5px] border-green-700 active:border-b active:translate-y-1 transition-all duration-150 px-7 h-14 text-base shadow-md shadow-green-300/40 shrink-0 justify-center">
                <PlayCircle className="w-6 h-6 fill-white text-green-600 shrink-0" />
                <span>PLAY</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </div>
        </div>

        {/* ── DAILY QUESTS / MISSIONS ── */}
        <div className="col-span-1 rounded-[2rem] overflow-hidden border-2 border-amber-200 border-b-[6px] border-b-amber-400 shadow-sm bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 pt-5 pb-4">
            <div className="flex items-center gap-2 text-white">
              <Award className="w-5 h-5 fill-white text-amber-600" />
              <h2 className="text-base font-black uppercase tracking-widest">🏆 Daily Quests</h2>
            </div>
            <p className="text-amber-100 text-sm font-semibold mt-0.5">Complete missions to earn XP</p>
          </div>

          {/* Quest list */}
          <div className="p-6 space-y-6">

            {dailyQuests.map((quest, index) => {
              const Icon = quest.actionType === 'DO_LAB' ? Beaker : 
                           quest.actionType === 'LEARN_LESSON' ? BookOpen : 
                           quest.actionType === 'LOGIN' ? Clock : 
                           quest.actionType === 'FEED_PET' ? Star : 
                           Flame;
              const colorClass = index % 3 === 0 ? 'emerald' : index % 3 === 1 ? 'blue' : 'pink';
              const fillPct = Math.round((quest.currentProgress / quest.targetValue) * 100);
              const isDone = quest.currentProgress >= quest.targetValue;
              const isClaimed = quest.isClaimed;

              return (
                <div key={quest.id} className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl bg-${colorClass}-100 flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4.5 h-4.5 text-${colorClass}-600`} />
                      </div>
                      <span className="font-black text-slate-700 text-sm truncate">{quest.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <XPPill label={`+${quest.rewardXp} XP`} />
                      <span className={`text-${colorClass}-600 font-black text-xs bg-${colorClass}-50 px-2 py-0.5 rounded-lg`}>
                        {quest.currentProgress}/{quest.targetValue}
                      </span>
                    </div>
                  </div>
                  <XPBar fill={`${fillPct}%`} color={`bg-${colorClass}-400`} />

                  {/* Nút bấm Nhận thưởng / Đã nhận thưởng */}
                  {isDone && !isClaimed && (
                    <button
                      onClick={() => handleClaim(quest.id)}
                      className="mt-2 w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs border-b-[3px] border-amber-600 active:border-b-0 active:translate-y-0.5 transition-all duration-100 flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 fill-amber-950/20" />
                      NHẬN THƯỞNG!
                    </button>
                  )}
                  {isClaimed && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-[11px] font-black text-slate-400 bg-slate-50 border border-slate-100 py-1 rounded-xl">
                      ✅ Đã nhận thưởng!
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentHome;
