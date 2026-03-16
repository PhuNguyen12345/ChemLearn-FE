import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Award, Clock, Flame, Zap, Shield, Beaker, HelpCircle, BookOpen } from 'lucide-react';

const StudentHome = () => {
  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Gamified Welcome Banner */}
      <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 p-8 text-white shadow-lg shadow-blue-500/20">
        {/* Decorative background overlay */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 translate-y-1/2 w-48 h-48 bg-sky-300/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Welcome back, Alex! 👋</h1>
            <p className="text-blue-50 text-base md:text-lg font-medium opacity-90 max-w-xl text-center md:text-left">
              You're in your element today! Let's mix things up and learn some chemistry.
            </p>
          </div>
          <div className="hidden md:flex items-center justify-center p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner border border-white/20">
            <Beaker className="w-16 h-16 text-white animate-[bounce_3s_ease-in-out_infinite]" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* 2. Student Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="rounded-2xl border-none shadow-md hover:shadow-lg hover:-translate-y-1 transition-all bg-orange-50">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner">
              <Flame className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-orange-600/80 uppercase tracking-wider">Daily Streak</p>
              <h3 className="text-2xl font-extrabold text-slate-800">5 Days</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md hover:shadow-lg hover:-translate-y-1 transition-all bg-yellow-50">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center shadow-inner">
              <Zap className="w-7 h-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-yellow-600/80 uppercase tracking-wider">Total EXP</p>
              <h3 className="text-2xl font-extrabold text-slate-800">2,450 XP</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md hover:shadow-lg hover:-translate-y-1 transition-all bg-indigo-50">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-inner">
              <Shield className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-600/80 uppercase tracking-wider">Current Rank</p>
              <h3 className="text-lg font-extrabold text-slate-800">Bronze Alchemist</h3>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* 3. Quick Actions / Explore */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 px-1">Quick Explore</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-700 transition-colors shadow-sm cursor-pointer group">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Beaker className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-bold">Virtual Lab</span>
          </button>

          <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 transition-colors shadow-sm cursor-pointer group">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="font-bold">Quick Quiz</span>
          </button>

          <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-pink-50 hover:bg-pink-100 border border-pink-100 text-pink-700 transition-colors shadow-sm cursor-pointer group">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-pink-600" />
            </div>
            <span className="font-bold">Flashcards</span>
          </button>

        </div>
      </div>

      {/* 4. Continue Learning & Missions */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        
        {/* Continue Learning Card */}
        <Card className="col-span-1 md:col-span-2 xl:col-span-2 rounded-[2rem] border-sky-100 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
              Continue Learning
            </CardTitle>
            <CardDescription className="text-base">Pick up right where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-sky-50/50 rounded-2xl border border-sky-100 hover:shadow-md transition-shadow">
              
              {/* Thumbnail Placeholder */}
              <div className="w-full sm:w-32 h-24 rounded-xl bg-gradient-to-br from-blue-400 to-sky-300 flex items-center justify-center shadow-inner shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
                <BookOpen className="w-10 h-10 text-white relative z-10" strokeWidth={1.5} />
              </div>

              <div className="space-y-2 flex-grow text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-800">Chapter 4: The Periodic Table</h3>
                <p className="text-sm font-medium text-slate-500">Understanding Groups and Periods</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-xs font-semibold text-slate-400">
                  <Clock className="w-4 h-4 text-sky-500" />
                  <span>15 mins left</span>
                </div>
              </div>

              <Button className="w-full sm:w-auto rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 shrink-0 h-12 px-6 font-bold">
                <PlayCircle className="w-5 h-5 fill-white text-blue-600 -ml-1 border-white" />
                Resume
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Missions */}
        <Card className="rounded-[2rem] border-amber-100 shadow-md">
          <CardHeader className="pb-4 bg-gradient-to-br from-amber-50 to-white rounded-t-[2rem]">
            <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
              <Award className="w-6 h-6 text-amber-500 fill-amber-100" />
              Daily Missions
            </CardTitle>
            <CardDescription>Complete missions to earn sweet EXP</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">Complete 1 Quiz</span>
                </div>
                <span className="text-slate-400 font-bold text-sm bg-slate-100 px-2 py-0.5 rounded-md">0/1</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-emerald-400 w-[5%] rounded-full relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/20 w-full h-1/2"></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Beaker className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">30 mins in Lab</span>
                </div>
                <span className="text-blue-600 font-bold text-sm bg-blue-50 px-2 py-0.5 rounded-md">15/30</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-blue-500 w-1/2 rounded-full relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/20 w-full h-1/2"></div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default StudentHome;
