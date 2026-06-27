import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Settings, LogOut, FlaskConical, Flame, Star, Sparkles, Coins, MessageSquare, Bug, Lightbulb, Send, X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import Sidebar from './Sidebar';
import { useLogout } from '@/stores/useLogout';
import { useStudentStore } from '../../../stores/useStudentStore';
import useAuthStore from '@/stores/useAuthStore';
import { getStudentProfileData } from '@/api/studentApi';
import { createFeedbackReport } from '@/lib/api';
import { toast } from 'sonner';

const getRankTitle = (level) => {
  if (level >= 10) return 'Giả kim thuật sư Vàng';
  if (level >= 7) return 'Giả kim thuật sư Bạc';
  if (level >= 4) return 'Giả kim thuật sư Đồng';
  return 'Nhà hóa học tập sự';
};

const Header = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'bug',
    priority: 'medium',
    title: '',
    message: '',
  });
  const { experience, currentStreak, level, coins, profile, setProfileData } = useStudentStore();
  const { user } = useAuthStore();
  const logout = useLogout();

  useEffect(() => {
    if (profile) return undefined;

    let isMounted = true;
    getStudentProfileData()
      .then((data) => {
        if (isMounted) {
          setProfileData(data);
        }
      })
      .catch((error) => {
        console.error('Failed to load student profile', error);
      });

    return () => {
      isMounted = false;
    };
  }, [profile, setProfileData]);

  const displayName = profile?.fullName || user?.fullName || user?.username || 'Học sinh ChemLearn';
  const displayEmail = profile?.email || user?.email || '';
  const gradeLabel = profile?.gradeLevel ? `Lớp ${profile.gradeLevel}` : 'Học sinh ChemLearn';
  const avatarSrc = profile?.avatarUrl || user?.avatarUrl || '';
  const levelTitle = getRankTitle(level);

  const avatarFallback = useMemo(() => {
    const words = displayName.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return 'ST';
    return words.slice(-2).map((word) => word[0]).join('').toUpperCase();
  }, [displayName]);

  const handleFeedbackChange = (event) => {
    const { name, value } = event.target;
    setFeedbackForm((current) => ({ ...current, [name]: value }));
  };

  const closeReportModal = () => {
    setShowReportModal(false);
  };

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();

    if (!feedbackForm.title.trim() || !feedbackForm.message.trim()) {
      toast.warning('Vui lòng nhập tiêu đề và nội dung góp ý.');
      return;
    }

    try {
      setFeedbackSubmitting(true);
      await createFeedbackReport(feedbackForm);
      setFeedbackForm({
        type: 'bug',
        priority: 'medium',
        title: '',
        message: '',
      });
      setShowReportModal(false);
      toast.success('Đã gửi report/feedback cho admin. Cảm ơn bạn!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không gửi được report/feedback lúc này.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-2 border-slate-100 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm shadow-slate-100/60">
        <div className="flex h-16 items-center px-4 md:px-6 gap-3">

          {/* ── Mobile Menu ── */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-1 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Mở menu điều hướng</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 max-w-[85vw]">
              <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
              <Sidebar className="border-r-0 w-full" collapsible={false} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* ── Mobile Brand ── */}
          <div className="md:hidden flex items-center gap-2 font-black text-lg text-slate-800 mr-auto">
            <div className="p-1 bg-indigo-500 rounded-lg shadow-sm">
              <FlaskConical className="h-4 w-4 text-white" />
            </div>
            <span>Chem<span className="text-indigo-500">Learn</span></span>
          </div>

          {/* ── Right side ── */}
          <div className="ml-auto flex items-center gap-3">

            {/* Gamification Stat Pills */}
            <div className="hidden sm:flex items-center gap-2.5">

              {/* 🔥 Streak */}
              <div className="flex items-center gap-1.5 text-sm font-black text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.35)] hover:shadow-[0_0_18px_rgba(245,158,11,0.5)] transition-shadow cursor-default">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                <span>{currentStreak} Ngày liên tiếp</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm font-black text-yellow-700 bg-yellow-100 border border-yellow-200 px-3 py-1.5 rounded-full shadow-[0_0_12px_rgba(250,204,21,0.35)] hover:shadow-[0_0_18px_rgba(250,204,21,0.5)] transition-shadow cursor-default">
                <Coins className="w-4 h-4 fill-yellow-500 text-yellow-500 shrink-0" />
                <span>{coins.toLocaleString()} Vàng</span>
              </div>

              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-black text-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.18)] transition hover:bg-rose-100 hover:text-rose-700"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Report bug</span>
              </button>

              {/* ⭐ EXP */}
              <div className="flex items-center gap-1.5 text-sm font-black text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.35)] hover:shadow-[0_0_18px_rgba(59,130,246,0.5)] transition-shadow cursor-default">
                <Star className="w-4 h-4 fill-blue-500 text-blue-500 shrink-0" />
                <span>{experience.toLocaleString()} EXP</span>
              </div>

            </div>



            {/* ── Avatar with level ring ── */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 hover:scale-105 transition-transform duration-200"
                >
                  {/* Animated gradient ring */}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 animate-[spin_4s_linear_infinite] opacity-80 blur-[1px]" />
                  <Avatar className="h-9 w-9 relative z-10 ring-2 ring-white ring-offset-1">
                    <AvatarImage src={avatarSrc} alt={displayName} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-black">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-60 rounded-2xl p-2 shadow-xl border border-slate-100" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-2 py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-indigo-300 ring-offset-1">
                      <AvatarImage src={avatarSrc} alt={displayName} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-black text-xs">{avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <p className="truncate text-sm font-black text-slate-800 leading-none">{displayName}</p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">
                        {gradeLabel}{displayEmail ? ` · ${displayEmail}` : ''}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Cấp độ {level} {levelTitle}</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

                <DropdownMenuItem
                  onClick={() => navigate('/student/profile')}
                  className="cursor-pointer rounded-xl px-3 py-2.5 hover:bg-indigo-50 focus:bg-indigo-50 font-semibold"
                >
                  <User className="mr-2.5 h-4 w-4 text-indigo-500" />
                  <span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/student/subscriptions')}
                  className="cursor-pointer rounded-xl px-3 py-2.5 hover:bg-emerald-50 focus:bg-emerald-50 font-semibold"
                >
                  <CreditCard className="mr-2.5 h-4 w-4 text-emerald-500" />
                  <span>Gói học của tôi</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5 hover:bg-slate-50 focus:bg-slate-50 font-semibold">
                  <Settings className="mr-2.5 h-4 w-4 text-slate-500" />
                  <span>Cài đặt</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

                <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-xl px-3 py-2.5 text-red-500 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 font-bold">
                  <LogOut className="mr-2.5 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </header>

      {showReportModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
          onClick={closeReportModal}
        >
          <form
            onSubmit={handleFeedbackSubmit}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-2xl rounded-[1.75rem] border-2 border-sky-100 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Report bug & feedback</h2>
                  <p className="text-sm font-semibold text-slate-500">Gửi lỗi hoặc góp ý để admin kiểm tra.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeReportModal}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Đóng popup report"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
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
              disabled={feedbackSubmitting}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-b-[5px] border-sky-700 bg-sky-500 px-5 font-black text-white shadow-md shadow-sky-300/40 transition-all duration-150 hover:bg-sky-600 active:translate-y-1 active:border-b disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-5 w-5" />
              {feedbackSubmitting ? 'Đang gửi...' : 'Gửi cho admin'}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Header;
