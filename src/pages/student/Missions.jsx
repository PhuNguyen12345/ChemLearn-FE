import React, { useState } from 'react';
import {
  Target,
  Star,
  Flame,
  Beaker,
  BookOpen,
  HelpCircle,
  Clock,
  Lock,
  CheckCircle2,
  Zap,
  Sparkles,
  Trophy,
  Shield,
  Atom,
  FlaskConical,
  Award,
} from 'lucide-react';
import { useStudentStore } from '../../stores/useStudentStore';
import { getDailyQuests, claimQuest, getGamificationProfile } from '../../api/studentApi';
import { toast } from 'sonner';

/* ================================================================
   SUB-COMPONENTS
================================================================ */

/** Neon game-style XP / progress bar */
const XPBar = ({ fill, color }) => (
  <div className="h-4 w-full bg-slate-100 rounded-full border border-slate-200 overflow-hidden shadow-inner">
    <div
      className={`h-full ${color} rounded-full relative overflow-hidden transition-all duration-700`}
      style={{ width: `${Math.min(fill, 100)}%` }}
    >
      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-full" />
    </div>
  </div>
);

/* ================================================================
   MAIN COMPONENT
================================================================ */
const Missions = () => {
  const [quests, setQuests] = useState([]);
  const { experience, setGamificationProfile } = useStudentStore();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const qData = await getDailyQuests();
        setQuests(qData);
        const pData = await getGamificationProfile();
        setGamificationProfile(pData);
      } catch (err) {
        console.error("Failed to fetch gamification data", err);
      }
    };
    fetchData();
  }, [setGamificationProfile]);

  const handleClaim = async (questId) => {
    try {
      await claimQuest(questId);
      // Refetch quests and profile
      const qData = await getDailyQuests();
      setQuests(qData);
      const pData = await getGamificationProfile();
      setGamificationProfile(pData);
      toast.success("Nhận thưởng thành công!");
    } catch (err) {
      console.error("Failed to claim quest", err);
      toast.error("Nhận thưởng thất bại");
    }
  };

  const completedQuests = quests.filter((q) => q.currentProgress >= q.targetValue);
  const unlockedBadges = mockBadges.filter((b) => b.unlocked).length;

  return (
    <div className="min-h-full w-full bg-slate-50 overflow-y-auto pb-12">

      {/* ════════════════════════════════════════════════
          QUEST BANNER
      ════════════════════════════════════════════════ */}
      <div className="m-4 md:m-6 rounded-[2rem] bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-7 md:p-10 relative overflow-hidden shadow-2xl shadow-orange-400/30">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Floating icons */}
        <div className="absolute top-5 right-28 animate-bounce" style={{ animationDuration: '2.8s' }}>
          <Target className="w-7 h-7 text-white/60" />
        </div>
        <div className="absolute top-8 right-12 animate-bounce" style={{ animationDuration: '3.4s', animationDelay: '0.4s' }}>
          <Star className="w-6 h-6 text-yellow-200/80 fill-yellow-200/60" />
        </div>
        <div className="absolute bottom-6 right-20 animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '0.8s' }}>
          <Flame className="w-6 h-6 text-orange-200/70 fill-orange-200/40" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/80 text-xs font-black uppercase tracking-widest">
              Bảng nhiệm vụ
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-sm">
            Nhiệm vụ hàng ngày & Huy hiệu 🏆
          </h1>
          <p className="text-orange-100 mt-1.5 font-semibold text-base max-w-lg">
            Hoàn thành nhiệm vụ để kiếm XP và mở khóa huy hiệu. Let's go!
          </p>

          {/* XP Overview pills */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-2">
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-white font-black text-sm">
                {experience.toLocaleString()} XP
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span className="text-white font-black text-sm">
                {completedQuests.length} / {quests.length} Nhiệm vụ hoàn thành
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-2">
              <Trophy className="w-4 h-4 text-amber-300 fill-amber-300/40" />
              <span className="text-white font-black text-sm">
                {unlockedBadges} Huy hiệu đã mở
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 space-y-10">

        {/* ════════════════════════════════════════════════
            DAILY QUESTS
        ════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-orange-500 rounded-xl shadow-md shadow-orange-300/40">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Nhiệm vụ hàng ngày</h2>
            <span className="ml-auto text-xs font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              Reset sau 08:42:17
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quests.map((quest, index) => {
              const Icon = quest.actionType === 'DO_LAB' ? Beaker :
                quest.actionType === 'LEARN_LESSON' ? BookOpen :
                  quest.actionType === 'LOGIN' ? Clock :
                    quest.actionType === 'FEED_PET' ? Star :
                      Flame;
              const colorClass = index % 3 === 0 ? 'emerald' : index % 3 === 1 ? 'blue' : 'pink';
              const iconBg = `bg-${colorClass}-100`;
              const iconColor = `text-${colorClass}-600`;
              const barColor = `bg-${colorClass}-400`;

              const isDone = quest.currentProgress >= quest.targetValue;
              const fillPct = Math.round((quest.currentProgress / quest.targetValue) * 100);
              const isClaimed = quest.isClaimed;

              return (
                <div
                  key={quest.id}
                  className={`bg-white rounded-3xl border-2 border-slate-100 border-b-[6px] shadow-sm p-5 flex flex-col gap-4 transition-all duration-200
                    ${isDone && !isClaimed ? 'border-amber-200 border-b-amber-400 shadow-amber-100/60' : ''}
                    ${isClaimed ? 'opacity-70' : ''}
                  `}
                >
                  {/* Top row */}
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black text-slate-800 text-sm leading-snug">{quest.title}</h3>
                        {/* XP reward tag */}
                        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                          ⭐ +{quest.rewardXp} XP
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs font-semibold mt-0.5">Mục tiêu: {quest.targetValue}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <XPBar fill={fillPct} color={barColor} />
                    <div className="flex justify-between text-[11px] font-black">
                      <span className={isDone ? 'text-emerald-600' : 'text-slate-400'}>
                        {isDone ? '✅ Hoàn thành!' : `${quest.currentProgress} / ${quest.targetValue}`}
                      </span>
                      <span className="text-slate-400">{fillPct}%</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="mt-auto">
                    {isClaimed ? (
                      <div className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl bg-slate-100 text-slate-400 text-sm font-black">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Đã nhận!
                      </div>
                    ) : isDone ? (
                      <button
                        onClick={() => handleClaim(quest.id)}
                        className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-900 font-black text-sm border-b-4 border-amber-600 hover:border-amber-700 hover:-translate-y-1 hover:border-b-[6px] active:border-b-0 active:translate-y-1 transition-all duration-150 shadow-md shadow-amber-200/60 flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4 fill-amber-900/30" />
                        NHẬN XP!
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl bg-slate-100 text-slate-400 text-sm font-black border border-slate-200 cursor-not-allowed">
                        <Clock className="w-4 h-4" />
                        Đang làm…
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════
            ACHIEVEMENT GALLERY — TROPHY ROOM
        ════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-amber-500 rounded-xl shadow-md shadow-amber-300/40">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Phòng lưu niệm</h2>
            <span className="ml-2 text-xs font-black text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
              {unlockedBadges} / {mockBadges.length} Huy hiệu đã mở
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`relative flex flex-col items-center text-center p-5 rounded-3xl border-2 transition-all duration-300 select-none
                    ${badge.unlocked
                      ? `${badge.bg} ${badge.border} border-b-4 ${badge.glow} hover:-translate-y-1.5 hover:scale-[1.02] cursor-default`
                      : 'bg-slate-50 border-slate-200 border-b-4 border-b-slate-300 opacity-60 grayscale cursor-not-allowed'
                    }
                  `}
                >
                  {/* Badge icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-md
                    ${badge.unlocked
                      ? `bg-gradient-to-br ${badge.gradient}`
                      : 'bg-slate-200'
                    }
                  `}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>

                  <h3 className={`font-black text-sm leading-snug mb-0.5 ${badge.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                    {badge.title}
                  </h3>
                  <p className={`text-[11px] font-semibold leading-tight ${badge.unlocked ? 'text-slate-500' : 'text-slate-400'}`}>
                    {badge.desc}
                  </p>

                  {/* Unlocked shimmer accent */}
                  {badge.unlocked && (
                    <div className="mt-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-2.5 h-2.5" /> Đã mở khóa
                      </span>
                    </div>
                  )}

                  {/* Locked overlay */}
                  {!badge.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-3xl">
                      <div className="w-9 h-9 rounded-2xl bg-slate-300/80 flex items-center justify-center shadow-sm">
                        <Lock className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Missions;
