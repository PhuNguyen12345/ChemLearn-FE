import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../stores/useStudentStore';
import {
  Award,
  Clock,
  Zap,
  Shield,
  Beaker,
  BookOpen,
  Star,
  Sparkles,
  Flame,
  Bot,
  PawPrint,
} from 'lucide-react';
import { getGamificationProfile, logDailyActivity, getDailyQuests, claimQuest } from '../../api/studentApi';
import { toast } from 'sonner';

const XPBar = ({ fill = '50%', color = 'bg-emerald-400' }) => (
  <div className="h-4 w-full overflow-hidden rounded-full bg-slate-900/10 shadow-inner">
    <div
      className={`relative h-full overflow-hidden rounded-full ${color} transition-all duration-700`}
      style={{ width: fill }}
    >
      <div className="absolute left-0 top-0 h-1/2 w-full rounded-full bg-white/30" />
    </div>
  </div>
);

const XPPill = ({ label }) => (
  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-amber-300 bg-amber-400 px-2.5 py-0.5 text-xs font-black text-amber-900 shadow-sm shadow-amber-300/50">
    ⭐ {label}
  </span>
);

const questColorStyles = {
  emerald: {
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    progress: 'bg-emerald-400',
    pill: 'text-emerald-600 bg-emerald-50',
    border: 'border-emerald-100',
  },
  blue: {
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    progress: 'bg-blue-400',
    pill: 'text-blue-600 bg-blue-50',
    border: 'border-blue-100',
  },
  pink: {
    iconBg: 'bg-pink-100',
    iconText: 'text-pink-600',
    progress: 'bg-pink-400',
    pill: 'text-pink-600 bg-pink-50',
    border: 'border-pink-100',
  },
};

const getRankTitle = (level) => {
  if (level >= 10) return 'Giả kim thuật sư Vàng';
  if (level >= 7) return 'Giả kim thuật sư Bạc';
  if (level >= 4) return 'Giả kim thuật sư Đồng';
  return 'Nhà hóa học tập sự';
};

const getRankLabel = (level) => {
  if (level >= 10) return `🥇 ${getRankTitle(level)}`;
  if (level >= 7) return `🥈 ${getRankTitle(level)}`;
  if (level >= 4) return `🥉 ${getRankTitle(level)}`;
  return `🌱 ${getRankTitle(level)}`;
};

const getQuestIcon = (actionType) => {
  if (actionType === 'DO_LAB') return Beaker;
  if (actionType === 'LEARN_LESSON') return BookOpen;
  if (actionType === 'LOGIN') return Clock;
  if (actionType === 'FEED_PET') return Star;
  return Flame;
};

const sortQuests = (quests) => {
  const sorted = [...quests].sort((a, b) => {
    const getWeight = (quest) => {
      const isDone = quest.currentProgress >= quest.targetValue;
      if (isDone && !quest.isClaimed) return 0;
      if (!isDone) return 1;
      return 2;
    };
    return getWeight(a) - getWeight(b);
  });
  return sorted.slice(0, 3);
};

const StudentHome = () => {
  const navigate = useNavigate();
  const { experience, level, currentStreak, setGamificationProfile } = useStudentStore();
  const [dailyQuests, setDailyQuests] = React.useState([]);

  const refreshQuestsAndProfile = React.useCallback(async () => {
    const profile = await getGamificationProfile();
    setGamificationProfile(profile);

    const quests = await getDailyQuests();
    setDailyQuests(sortQuests(Array.isArray(quests) ? quests : []));
  }, [setGamificationProfile]);

  const handleClaim = async (questId) => {
    try {
      await claimQuest(questId);
      await refreshQuestsAndProfile();
      toast.success('Nhận thưởng thành công! 🎉');
    } catch (err) {
      console.error('Failed to claim quest:', err);
      toast.error('Nhận thưởng thất bại. Vui lòng thử lại!');
    }
  };

  React.useEffect(() => {
    const initData = async () => {
      try {
        await logDailyActivity();
        await refreshQuestsAndProfile();
      } catch (error) {
        console.error('Failed to fetch gamification data:', error);
      }
    };
    initData();
  }, [refreshQuestsAndProfile]);

  const completedQuestCount = dailyQuests.filter((quest) => quest.currentProgress >= quest.targetValue).length;

  return (
    <div className="space-y-6 pb-12 select-none md:space-y-8">
      <div className="relative overflow-hidden rounded-3xl border-b-4 border-purple-700 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 text-white shadow-[0_10px_30px_rgba(168,85,247,0.4)] sm:p-6 md:rounded-[2rem] lg:p-8">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-44 w-44 rounded-full bg-pink-400/20 blur-2xl" />

        <div className="absolute right-28 top-24 hidden animate-bounce text-yellow-300 sm:block" style={{ animationDuration: '2.4s' }}>
          <Star className="h-6 w-6 fill-yellow-300" />
        </div>
        <div className="absolute right-14 top-8 hidden animate-bounce text-pink-200 sm:block" style={{ animationDuration: '3.1s', animationDelay: '0.5s' }}>
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="absolute bottom-5 right-10 animate-bounce text-indigo-200" style={{ animationDuration: '2.7s', animationDelay: '1s' }}>
          <Star className="h-4 w-4 fill-indigo-200" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-between gap-5 md:flex-row md:gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-widest backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              Cấp {level} · {getRankTitle(level)}
            </div>
            <h1 className="text-2xl font-black tracking-tight drop-shadow-sm sm:text-3xl md:text-4xl">
              Chào mừng trở lại! 🎉
            </h1>
            <p className="max-w-xl text-sm font-semibold text-purple-100 opacity-90 sm:text-base md:text-lg">
              Bạn đang cực cháy! 🔥 Hãy giữ vững chuỗi ngày học để nhận thêm XP nhé.
            </p>
          </div>

          <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-[1.5rem] border border-white/30 bg-white/20 shadow-inner backdrop-blur-sm md:flex">
            <Beaker className="h-12 w-12 animate-[bounce_2.5s_ease-in-out_infinite] text-white" strokeWidth={1.5} />
          </div>
        </div>

        <div className="relative z-10 mt-6 space-y-1.5">
          <div className="flex justify-between text-xs font-black uppercase tracking-wider text-purple-100">
            <span>Tiến trình đến Cấp {level + 1}</span>
            <span>{experience} XP</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-white/20">
            <div className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-yellow-300 to-yellow-400" style={{ width: `${(experience % 1000) / 10}%` }}>
              <div className="absolute left-0 top-0 h-1/2 w-full rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="flex cursor-default items-center gap-4 rounded-[1.5rem] border-2 border-b-[5px] border-orange-200 border-b-orange-400 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1.5 sm:p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 shadow-md shadow-orange-300/50">
            <Flame className="h-7 w-7 fill-orange-200 text-white" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-orange-500">Chuỗi ngày học</p>
            <h3 className="text-xl font-black text-slate-800 sm:text-2xl">{currentStreak} Ngày 🔥</h3>
          </div>
        </div>

        <div className="flex cursor-default items-center gap-4 rounded-[1.5rem] border-2 border-b-[5px] border-yellow-200 border-b-yellow-400 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1.5 sm:p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 shadow-md shadow-yellow-300/50">
            <Zap className="h-7 w-7 fill-yellow-100 text-white" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-yellow-600">Tổng EXP</p>
            <h3 className="text-xl font-black text-slate-800 sm:text-2xl">{experience} XP ⚡</h3>
          </div>
        </div>

        <div className="flex cursor-default items-center gap-4 rounded-[1.5rem] border-2 border-b-[5px] border-indigo-200 border-b-indigo-500 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1.5 sm:col-span-2 sm:p-5 xl:col-span-1">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 shadow-md shadow-indigo-300/50">
            <Shield className="h-7 w-7 fill-indigo-200 text-white" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Thứ hạng</p>
            <h3 className="text-base font-black text-slate-800 sm:text-lg">{getRankLabel(level)}</h3>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-800">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Khám phá nhanh
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <button
            onClick={() => navigate('/student/virtual-lab')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-b-[6px] border-purple-200 border-b-purple-400 bg-white p-5 text-purple-700 shadow-sm transition-all duration-150 hover:border-b-purple-500 hover:bg-purple-50 active:translate-y-1 active:border-b-2 sm:p-7"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-300/50 transition-transform duration-200 group-hover:scale-110">
              <Beaker className="h-8 w-8 text-white" />
            </div>
            <span className="text-base font-black tracking-tight">🧪 Phòng thí nghiệm ảo</span>
            <span className="text-xs font-bold text-purple-400">Pha chế & phản ứng</span>
          </button>

          <button
            onClick={() => navigate('/student/ai-tutor')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-b-[6px] border-emerald-200 border-b-emerald-400 bg-white p-5 text-emerald-700 shadow-sm transition-all duration-150 hover:border-b-emerald-500 hover:bg-emerald-50 active:translate-y-1 active:border-b-2 sm:p-7"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-300/50 transition-transform duration-200 group-hover:scale-110">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <span className="text-base font-black tracking-tight">🤖 AI Tutor</span>
            <span className="text-xs font-bold text-emerald-400">Hỏi bài & luyện giải cùng Bi</span>
          </button>

          <button
            onClick={() => navigate('/student/island')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-b-[6px] border-pink-200 border-b-pink-400 bg-white p-5 text-pink-700 shadow-sm transition-all duration-150 hover:border-b-pink-500 hover:bg-pink-50 active:translate-y-1 active:border-b-2 sm:p-7"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] bg-gradient-to-br from-pink-400 to-fuchsia-600 shadow-lg shadow-pink-300/50 transition-transform duration-200 group-hover:scale-110">
              <PawPrint className="h-8 w-8 text-white" />
            </div>
            <span className="text-base font-black tracking-tight">🐾 Đảo thú cưng</span>
            <span className="text-xs font-bold text-pink-400">Chăm pet & mở trứng thưởng</span>
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border-2 border-amber-200 border-b-[6px] border-b-amber-400 bg-white shadow-sm">
        <div className="flex flex-col gap-3 bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Award className="h-5 w-5 fill-white text-amber-600" />
              <h2 className="text-base font-black uppercase tracking-widest">🏆 Nhiệm vụ hàng ngày</h2>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-amber-100">Hoàn thành nhiệm vụ để nhận EXP</p>
          </div>
          <div className="inline-flex w-fit rounded-full bg-white/25 px-3 py-1 text-xs font-black text-white ring-1 ring-white/30">
            {completedQuestCount}/{dailyQuests.length || 0} hoàn thành
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-3">
          {dailyQuests.length === 0 && (
            <div className="rounded-[1.5rem] border-2 border-dashed border-amber-100 bg-amber-50/60 p-6 text-center lg:col-span-3">
              <p className="text-sm font-black text-amber-700">Chưa có nhiệm vụ hàng ngày.</p>
              <p className="mt-1 text-xs font-semibold text-amber-500">Hãy quay lại sau hoặc làm mới trang để cập nhật nhiệm vụ mới.</p>
            </div>
          )}

          {dailyQuests.map((quest, index) => {
            const Icon = getQuestIcon(quest.actionType);
            const colorClass = index % 3 === 0 ? 'emerald' : index % 3 === 1 ? 'blue' : 'pink';
            const colorStyles = questColorStyles[colorClass];
            const currentProgress = Number(quest.currentProgress || 0);
            const targetValue = Math.max(Number(quest.targetValue || 1), 1);
            const fillPct = Math.min(100, Math.round((currentProgress / targetValue) * 100));
            const isDone = currentProgress >= targetValue;
            const isClaimed = quest.isClaimed;

            return (
              <article key={quest.id} className={`flex h-full flex-col rounded-[1.5rem] border-2 ${colorStyles.border} bg-white p-4 shadow-sm`}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${colorStyles.iconBg}`}>
                      <Icon className={`h-5 w-5 ${colorStyles.iconText}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black text-slate-800">{quest.title}</h3>
                      <p className="mt-0.5 text-xs font-semibold text-slate-400">Tiến độ {currentProgress}/{targetValue}</p>
                    </div>
                  </div>
                  <XPPill label={`+${quest.rewardXp} XP`} />
                </div>

                <div className="mt-auto space-y-3">
                  <XPBar fill={`${fillPct}%`} color={colorStyles.progress} />
                  <div className="flex items-center justify-between gap-3">
                    <span className={`${colorStyles.pill} rounded-lg px-2 py-0.5 text-xs font-black`}>
                      {fillPct}%
                    </span>

                    {isDone && !isClaimed && (
                      <button
                        onClick={() => handleClaim(quest.id)}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border-b-[3px] border-amber-600 bg-amber-400 px-3 py-1.5 text-xs font-black text-amber-950 shadow-sm transition-all duration-100 hover:bg-amber-500 active:translate-y-0.5 active:border-b-0"
                      >
                        <Zap className="h-3.5 w-3.5 fill-amber-950/20" />
                        Nhận thưởng
                      </button>
                    )}

                    {isClaimed && (
                      <span className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-400">
                        Đã nhận
                      </span>
                    )}

                    {!isDone && !isClaimed && (
                      <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-400">
                        Đang làm
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default StudentHome;
