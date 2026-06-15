import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../stores/useStudentStore';
import {
  PlayCircle,
  Award,
  Clock,
  Zap,
  Shield,
  Beaker,
  HelpCircle,
  BookOpen,
  Star,
  Sparkles,
  ChevronRight,
  Flame,
  MessageSquare,
  Bug,
  Send,
  Lightbulb
} from 'lucide-react';

import { getGamificationProfile, logDailyActivity, getDailyQuests, claimQuest } from '../../api/studentApi';
import { toast } from 'sonner';
import { createFeedbackReport } from '../../lib/api';

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

const questColorStyles = {
  emerald: {
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    progress: 'bg-emerald-400',
    pill: 'text-emerald-600 bg-emerald-50',
  },
  blue: {
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    progress: 'bg-blue-400',
    pill: 'text-blue-600 bg-blue-50',
  },
  pink: {
    iconBg: 'bg-pink-100',
    iconText: 'text-pink-600',
    progress: 'bg-pink-400',
    pill: 'text-pink-600 bg-pink-50',
  },
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const StudentHome = () => {
  const navigate = useNavigate();
  const { coins, experience, level, currentStreak, setGamificationProfile } = useStudentStore();
  const [dailyQuests, setDailyQuests] = React.useState([]);
  const [feedbackForm, setFeedbackForm] = React.useState({
    type: 'bug',
    priority: 'medium',
    title: '',
    message: '',
  });

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

  const handleFeedbackChange = (event) => {
    const { name, value } = event.target;
    setFeedbackForm((current) => ({ ...current, [name]: value }));
  };

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();

    if (!feedbackForm.title.trim() || !feedbackForm.message.trim()) {
      toast.warning('Vui lòng nhập tiêu đề và nội dung góp ý.');
      return;
    }

    try {
      await createFeedbackReport(feedbackForm);
      setFeedbackForm({
        type: 'bug',
        priority: 'medium',
        title: '',
        message: '',
      });
      toast.success('Đã gửi report/feedback cho admin. Cảm ơn bạn!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không gửi được report/feedback lúc này.');
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
    <div className="space-y-6 md:space-y-8 pb-12 select-none">

      {/* ══════════════════════════════════════════
          1. PLAYER CARD — Welcome Banner
      ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl md:rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 sm:p-6 lg:p-8 text-white shadow-[0_10px_30px_rgba(168,85,247,0.4)] border-b-4 border-purple-700">
        {/* Background blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-44 h-44 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top right: Shop & Coins */}
        <div className="relative z-20 mb-6 flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3">
          <div className="flex min-h-10 items-center gap-2 bg-yellow-400/20 px-3 sm:px-4 py-2 rounded-full border border-yellow-300/40 backdrop-blur-md">
            <span className="text-xl">💰</span>
            <span className="font-black text-yellow-300 text-sm sm:text-base">{coins} Vàng</span>
          </div>
          <button
            onClick={() => navigate('/student/shop')}
            className="flex min-h-10 items-center gap-2 bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded-full border border-white/40 backdrop-blur-md transition-colors"
          >
            <span className="text-xl">🛍️</span>
            <span className="font-bold text-white uppercase text-xs sm:text-sm tracking-wider">Cửa Hàng</span>
          </button>
        </div>

        {/* Floating decorative icons */}
        <div className="absolute top-24 right-28 hidden sm:block text-yellow-300 animate-bounce" style={{ animationDuration: '2.4s' }}>
          <Star className="w-6 h-6 fill-yellow-300" />
        </div>
        <div className="absolute top-8 right-14 hidden sm:block text-pink-200 animate-bounce" style={{ animationDuration: '3.1s', animationDelay: '0.5s' }}>
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="absolute bottom-5 right-10 text-indigo-200 animate-bounce" style={{ animationDuration: '2.7s', animationDelay: '1s' }}>
          <Star className="w-4 h-4 fill-indigo-200" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6">
          <div className="space-y-2 text-center md:text-left">
            {/* Level badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-black tracking-widest uppercase border border-white/30 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Cấp {level} · Hóa học gia
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm">
              Chào mừng trở lại! 🎉
            </h1>
            <p className="text-purple-100 text-sm sm:text-base md:text-lg font-semibold opacity-90 max-w-xl">
              Bạn đang cực cháy! 🔥 Hãy giữ vững chuỗi ngày học để nhận thêm XP nhé.
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
            <span>Tiến trình đến Cấp {level + 1}</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* Streak */}
        <div className="flex items-center gap-4 p-4 sm:p-5 bg-white rounded-[1.5rem] border-2 border-orange-200 border-b-[5px] border-b-orange-400 shadow-sm hover:-translate-y-1.5 transition-transform duration-300 cursor-default">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-300/50 shrink-0">
            <Flame className="w-7 h-7 text-white fill-orange-200" />
          </div>
          <div>
            <p className="text-xs font-black text-orange-500 uppercase tracking-widest">Chuỗi ngày học</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">{currentStreak} Ngày 🔥</h3>
          </div>
        </div>

        {/* Total EXP */}
        <div className="flex items-center gap-4 p-4 sm:p-5 bg-white rounded-[1.5rem] border-2 border-yellow-200 border-b-[5px] border-b-yellow-400 shadow-sm hover:-translate-y-1.5 transition-transform duration-300 cursor-default">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-md shadow-yellow-300/50 shrink-0">
            <Zap className="w-7 h-7 text-white fill-yellow-100" />
          </div>
          <div>
            <p className="text-xs font-black text-yellow-600 uppercase tracking-widest">Tổng EXP</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">{experience} XP ⚡</h3>
          </div>
        </div>

        {/* Rank */}
        <div className="flex items-center gap-4 p-4 sm:p-5 bg-white rounded-[1.5rem] border-2 border-indigo-200 border-b-[5px] border-b-indigo-500 shadow-sm hover:-translate-y-1.5 transition-transform duration-300 cursor-default sm:col-span-2 xl:col-span-1">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-300/50 shrink-0">
            <Shield className="w-7 h-7 text-white fill-indigo-200" />
          </div>
          <div>
            <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">Thứ hạng</p>
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              {level >= 10 ? '🥇 Giả kim thuật sư Vàng' : level >= 7 ? '🥈 Giả kim thuật sư Bạc' : level >= 4 ? '🥉 Giả kim thuật sư Đồng' : '🌱 Nhà hóa học tập sự'}
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
          Khám phá nhanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* Portal 1 — Virtual Lab */}
          <button
            onClick={() => navigate('/student/virtual-lab')}
            className="group flex flex-col items-center justify-center gap-3 p-5 sm:p-7 rounded-[1.5rem] bg-white border-2 border-purple-200 border-b-[6px] border-b-purple-400 text-purple-700 hover:bg-purple-50 hover:border-b-purple-500 active:border-b-2 active:translate-y-1 transition-all duration-150 shadow-sm cursor-pointer"
          >
            <div className="w-16 h-16 rounded-[1rem] bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-300/50 group-hover:scale-110 transition-transform duration-200">
              <Beaker className="w-8 h-8 text-white" />
            </div>
            <span className="font-black text-base tracking-tight">🧪 Phòng thí nghiệm ảo</span>
            <span className="text-xs font-bold text-purple-400">Pha chế & Phản ứng</span>
          </button>

          {/* Portal 2 — Quick Quiz */}
          <button
            onClick={() => navigate('/student/classes')}
            className="group flex flex-col items-center justify-center gap-3 p-5 sm:p-7 rounded-[1.5rem] bg-white border-2 border-emerald-200 border-b-[6px] border-b-emerald-400 text-emerald-700 hover:bg-emerald-50 hover:border-b-emerald-500 active:border-b-2 active:translate-y-1 transition-all duration-150 shadow-sm cursor-pointer"
          >
            <div className="w-16 h-16 rounded-[1rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-300/50 group-hover:scale-110 transition-transform duration-200">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <span className="font-black text-base tracking-tight">❓ Lớp học của tôi</span>
            <span className="text-xs font-bold text-emerald-400">Bài tập & bài kiểm tra được giao</span>
          </button>


        </div>
      </div>

      {/* ══════════════════════════════════════════
          4. MAIN QUEST + DAILY QUESTS
      ══════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
        <div className="rounded-[2rem] border-2 border-slate-200 border-b-[6px] border-b-slate-300 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Report bug & feedback</h2>
              <p className="text-sm font-semibold text-slate-500">Gửi lỗi hoặc góp ý để admin kiểm tra.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
              <Bug className="mb-2 h-5 w-5" />
              <p className="font-black">Bug</p>
              <p className="text-xs font-semibold text-rose-500">Lỗi giao diện, lab, bài học, tài khoản.</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
              <Lightbulb className="mb-2 h-5 w-5" />
              <p className="font-black">Feedback</p>
              <p className="text-xs font-semibold text-amber-600">Ý tưởng cải thiện trải nghiệm học.</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleFeedbackSubmit}
          className="rounded-[2rem] border-2 border-sky-200 border-b-[6px] border-b-sky-400 bg-white p-4 sm:p-5 shadow-sm"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Loại gửi</span>
              <select
                name="type"
                value={feedbackForm.type}
                onChange={handleFeedbackChange}
                className="h-11 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-400"
              >
                <option value="bug">Bug</option>
                <option value="feedback">Feedback</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Mức ưu tiên</span>
              <select
                name="priority"
                value={feedbackForm.priority}
                onChange={handleFeedbackChange}
                className="h-11 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-400"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </label>
          </div>

          <label className="mt-3 block space-y-1.5">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tiêu đề</span>
            <input
              name="title"
              value={feedbackForm.title}
              onChange={handleFeedbackChange}
              placeholder="Ví dụ: Không mở được bài lab axit-bazơ"
              className="h-11 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400 focus:border-sky-400"
            />
          </label>

          <label className="mt-3 block space-y-1.5">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Nội dung</span>
            <textarea
              name="message"
              value={feedbackForm.message}
              onChange={handleFeedbackChange}
              placeholder="Mô tả ngắn gọn lỗi/góp ý, trang đang dùng và thao tác đã thực hiện."
              rows={4}
              className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-sky-400"
            />
          </label>

          <button
            type="submit"
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-b-[5px] border-sky-700 bg-sky-500 px-5 font-black text-white shadow-md shadow-sky-300/40 transition-all duration-150 hover:bg-sky-600 active:translate-y-1 active:border-b"
          >
            <Send className="h-5 w-5" />
            GỬI CHO ADMIN
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {/* ── MAIN QUEST: Continue Learning ── */}
        <div className="col-span-1 md:col-span-2 xl:col-span-2 rounded-[2rem] overflow-hidden border-2 border-sky-200 border-b-[6px] border-b-sky-400 shadow-sm bg-white">
          {/* Gradient header strip */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 pt-5 pb-4">
            <div className="flex items-center gap-2 text-white">
              <PlayCircle className="w-5 h-5 fill-white text-sky-600" />
              <h2 className="text-base font-black uppercase tracking-widest">⚔️ Nhiệm vụ chính</h2>
            </div>
            <p className="text-sky-100 text-sm font-semibold mt-0.5">Tiếp tục bài học đang dang dở</p>
          </div>

          {/* Quest body */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row items-center gap-5 p-4 sm:p-5 bg-sky-50 rounded-[1.5rem] border-2 border-sky-100">

              {/* Chapter thumbnail */}
              <div className="w-full lg:w-28 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-300/40 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10" />
                <BookOpen className="w-10 h-10 text-white relative z-10" strokeWidth={1.5} />
              </div>

              {/* Info */}
              <div className="flex-grow text-center lg:text-left space-y-1 min-w-0">
                <h3 className="text-lg font-black text-slate-800">⚗️ Chương 4: Bảng tuần hoàn</h3>
                <p className="text-sm font-semibold text-slate-500">Tìm hiểu về các Nhóm và Chu kỳ</p>
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-bold text-sky-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Còn 15 phút</span>
                </div>
                {/* Mini progress bar */}
                <div className="pt-2">
                  <XPBar fill="60%" color="bg-sky-400" />
                </div>
                <p className="text-xs font-bold text-sky-500">Hoàn thành 60%</p>
              </div>

              {/* PLAY button */}
              <button className="group flex items-center gap-2 w-full lg:w-auto bg-gradient-to-b from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-black rounded-2xl border-b-[5px] border-green-700 active:border-b active:translate-y-1 transition-all duration-150 px-7 h-14 text-base shadow-md shadow-green-300/40 shrink-0 justify-center">
                <PlayCircle className="w-6 h-6 fill-white text-green-600 shrink-0" />
                <span>TIẾP TỤC</span>
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
              <h2 className="text-base font-black uppercase tracking-widest">🏆 Nhiệm vụ hàng ngày</h2>
            </div>
            <p className="text-amber-100 text-sm font-semibold mt-0.5">Hoàn thành nhiệm vụ để nhận EXP</p>
          </div>

          {/* Quest list */}
          <div className="p-4 sm:p-6 space-y-6">

            {dailyQuests.map((quest, index) => {
              const Icon = quest.actionType === 'DO_LAB' ? Beaker :
                quest.actionType === 'LEARN_LESSON' ? BookOpen :
                  quest.actionType === 'LOGIN' ? Clock :
                    quest.actionType === 'FEED_PET' ? Star :
                      Flame;
              const colorClass = index % 3 === 0 ? 'emerald' : index % 3 === 1 ? 'blue' : 'pink';
              const colorStyles = questColorStyles[colorClass];
              const fillPct = Math.round((quest.currentProgress / quest.targetValue) * 100);
              const isDone = quest.currentProgress >= quest.targetValue;
              const isClaimed = quest.isClaimed;

              return (
                <div key={quest.id} className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${colorStyles.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4.5 h-4.5 ${colorStyles.iconText}`} />
                      </div>
                      <span className="font-black text-slate-700 text-sm truncate">{quest.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <XPPill label={`+${quest.rewardXp} XP`} />
                      <span className={`${colorStyles.pill} font-black text-xs px-2 py-0.5 rounded-lg`}>
                        {quest.currentProgress}/{quest.targetValue}
                      </span>
                    </div>
                  </div>
                  <XPBar fill={`${fillPct}%`} color={colorStyles.progress} />

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
