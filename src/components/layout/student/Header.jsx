import React, { useState } from 'react';
import { Menu, User, Settings, LogOut, FlaskConical, Flame, Star, Sparkles } from 'lucide-react';
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
import LanguageSwitcher from '../shared/LanguageSwitcher';
import useLanguageStore from '@/stores/useLanguageStore';
import { useLogout } from '@/stores/useLogout';
import { translations } from '@/lib/translations';

const Header = () => {
  const [open, setOpen] = useState(false);
  const { language } = useLanguageStore();
  const t = translations[language] || translations['vi'];
  const logout = useLogout();

  return (
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
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar className="border-r-0" />
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
              <span>5 Day Streak</span>
            </div>

            {/* ⭐ EXP */}
            <div className="flex items-center gap-1.5 text-sm font-black text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.35)] hover:shadow-[0_0_18px_rgba(59,130,246,0.5)] transition-shadow cursor-default">
              <Star className="w-4 h-4 fill-blue-500 text-blue-500 shrink-0" />
              <span>2,450 EXP</span>
            </div>

          </div>

          <LanguageSwitcher />

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
                  <AvatarImage src="/student-avatar.png" alt="@student" />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-black">
                    ST
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-60 rounded-2xl p-2 shadow-xl border border-slate-100" align="end" forceMount>
              <DropdownMenuLabel className="font-normal px-2 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-indigo-300 ring-offset-1">
                    <AvatarImage src="/student-avatar.png" alt="@student" />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-black text-xs">ST</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-black text-slate-800 leading-none">Alex Student</p>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Grade 8 · Science Explorers</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Level 7 Alchemist</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

              <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5 hover:bg-indigo-50 focus:bg-indigo-50 font-semibold">
                <User className="mr-2.5 h-4 w-4 text-indigo-500" />
                <span>{t.profile || 'My Profile'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5 hover:bg-slate-50 focus:bg-slate-50 font-semibold">
                <Settings className="mr-2.5 h-4 w-4 text-slate-500" />
                <span>{t.settings || 'Settings'}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

              <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-xl px-3 py-2.5 text-red-500 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 font-bold">
                <LogOut className="mr-2.5 h-4 w-4" />
                <span>{t.logout || 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
};

export default Header;
