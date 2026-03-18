import React from 'react';
import { 
  PlayCircle, 
  Clock, 
  Award, 
  Flame, 
  Database, 
  Atom, 
  Beaker, 
  Zap, 
  Sparkles, 
  Target, 
  Trophy,
  ChevronRight,
  Star
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Color Map to fix Tailwind Purge issue
   Mapping logical color names to explicit class strings
───────────────────────────────────────────────────────── */
const colorMap = {
  emerald: {
    softBg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    accent: 'emerald',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  blue: {
    softBg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    accent: 'blue',
    badge: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  fuchsia: {
    softBg: 'bg-fuchsia-50',
    iconBg: 'bg-fuchsia-100',
    iconText: 'text-fuchsia-600',
    accent: 'fuchsia',
    badge: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200'
  },
  amber: {
    softBg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    accent: 'amber',
    badge: 'bg-amber-100 text-amber-700 border-amber-200'
  }
};

const availableQuizzes = [
  {
    id: 'quiz-1',
    title: 'Chemical Reactions',
    description: 'Test your knowledge on types of reactions, balance, and indicators.',
    questionCount: 10,
    points: 500,
    icon: Flame,
    color: 'emerald'
  },
  {
    id: 'quiz-2',
    title: 'Atomic Structure',
    description: 'Protons, neutrons, electrons, and the history of the atom.',
    questionCount: 15,
    points: 750,
    icon: Atom,
    color: 'blue'
  },
  {
    id: 'quiz-3',
    title: 'Acids & Bases',
    description: 'Understanding pH, neutralization, and strong vs. weak acids.',
    questionCount: 8,
    points: 400,
    icon: Beaker,
    color: 'fuchsia'
  },
  {
    id: 'quiz-4',
    title: 'Periodic Table Trends',
    description: 'Electronegativity, ionization energy, and identifying groups.',
    questionCount: 12,
    points: 600,
    icon: Database,
    color: 'amber'
  }
];

const QuizDashboard = ({ onPlayQuiz }) => {
  return (
    <div className="w-full h-full bg-slate-50 overflow-y-auto pb-12">
      
      {/* ══════════════════════════════════════════════
          VIBRANT HEADER BANNER
      ══════════════════════════════════════════════ */}
      <div className="m-4 md:m-6 rounded-[2rem] bg-gradient-to-r from-violet-600 to-fuchsia-600 p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-purple-500/20">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-fuchsia-400/20 rounded-full blur-2xl" />
        
        {/* Floating Icons */}
        <div className="absolute top-6 right-20 animate-bounce" style={{ animationDuration: '3s' }}>
          <Trophy className="w-8 h-8 text-white/40 fill-white/10" />
        </div>
        <div className="absolute bottom-6 right-10 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
          <Star className="w-6 h-6 text-yellow-300/60 fill-yellow-300/20" />
        </div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 opacity-20 hidden lg:block">
          <Zap className="w-24 h-24 text-white fill-current" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <span className="text-white/80 text-xs font-black uppercase tracking-widest">Knowledge Arena</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Available Quizzes ⚡
          </h1>
          <p className="text-purple-100 mt-3 font-semibold text-base md:text-lg leading-relaxed">
            Select a topic to test your chemistry skills and earn EXP! 
            Correct answers unlock special badges for your trophy room.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2.5 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-300" />
              <span className="text-white font-bold text-sm">4 Topics Ready</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2.5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300" />
              <span className="text-white font-bold text-sm">Up to 750 XP per Quiz</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          QUIZ GRID
      ══════════════════════════════════════════════ */}
      <div className="px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {availableQuizzes.map((quiz) => {
            const IconComponent = quiz.icon;
            const style = colorMap[quiz.color] || colorMap.blue; // Fallback to blue if not found

            return (
              <div 
                key={quiz.id}
                onClick={() => onPlayQuiz(quiz.id)}
                className="group bg-white rounded-[2.5rem] border-2 border-slate-100 border-b-[6.5px] border-b-slate-200 shadow-sm hover:shadow-xl hover:border-b-2 hover:translate-y-1 transition-all duration-300 cursor-pointer p-7 flex flex-col relative overflow-hidden"
              >
                {/* Background Decoration - Static classes used here */}
                <div className={`absolute top-0 right-0 w-36 h-36 opacity-40 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 ${style.softBg}`}></div>
                
                {/* Top Row: Icon & Points */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform z-10 ${style.iconBg} ${style.iconText}`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-2xl text-xs font-black border-2 border-amber-100 shadow-sm">
                    <Award className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{quiz.points} XP</span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1">
                  <h3 className="text-2xl font-black text-slate-800 mb-2.5 group-hover:text-violet-600 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 leading-relaxed mb-6">
                    {quiz.description}
                  </p>
                </div>

                {/* Footer UI */}
                <div className="mt-auto flex items-center justify-between pt-5 border-t-2 border-slate-50 relative z-10">
                  <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-tighter">
                    <Clock className="w-4 h-4 text-slate-300" />
                    <span>{quiz.questionCount} Questions</span>
                  </div>
                  
                  {/* The Start Button */}
                  <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-black text-sm border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 transition-all shadow-lg shadow-indigo-200 group-hover:scale-105">
                    Start <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Corner Sparkle indicator on hover */}
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                </div>
              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
};

export default QuizDashboard;
