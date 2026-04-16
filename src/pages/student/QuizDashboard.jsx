import React, { useEffect, useState } from 'react';
import {
  Clock,
  Award,
  Atom,
  Beaker,
  Sparkles,
  Target,
  Trophy,
  ChevronRight,
  Star,
  LoaderCircle,
} from 'lucide-react';
import { getFreeQuizzes } from '../../lib/api';

const iconByIndex = [Atom, Beaker, Trophy, Star];
const colorByIndex = [
  {
    softBg: 'bg-cyan-50',
    iconBg: 'bg-cyan-100',
    iconText: 'text-cyan-700',
  },
  {
    softBg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
  },
  {
    softBg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
  },
  {
    softBg: 'bg-fuchsia-50',
    iconBg: 'bg-fuchsia-100',
    iconText: 'text-fuchsia-700',
  },
];

const QuizDashboard = ({ onPlayQuiz }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getFreeQuizzes();
        setQuizzes(data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load quizzes.');
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  return (
    <div className="w-full h-full bg-slate-50 overflow-y-auto pb-12">
      <div className="m-4 md:m-6 rounded-[2rem] bg-gradient-to-r from-cyan-700 to-blue-700 p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-cyan-500/20">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-300/20 rounded-full blur-2xl" />

        <div className="absolute top-6 right-20 animate-bounce" style={{ animationDuration: '3s' }}>
          <Trophy className="w-8 h-8 text-white/40 fill-white/10" />
        </div>
        <div className="absolute bottom-6 right-10 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
          <Star className="w-6 h-6 text-yellow-300/60 fill-yellow-300/20" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <span className="text-white/80 text-xs font-black uppercase tracking-widest">Knowledge Arena</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Available Quizzes
          </h1>
          <p className="text-cyan-100 mt-3 font-semibold text-base md:text-lg leading-relaxed">
            All quiz cards now come from backend data. Start any one to create an attempt and submit results.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2.5 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-300" />
              <span className="text-white font-bold text-sm">{quizzes.length} Topics Ready</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 md:mx-10 mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="px-6 md:px-10">
        {loading ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-slate-500 font-semibold flex items-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin" /> Loading quizzes...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz, index) => {
              const IconComponent = iconByIndex[index % iconByIndex.length];
              const style = colorByIndex[index % colorByIndex.length];

              return (
                <div
                  key={quiz.id}
                  onClick={() => onPlayQuiz(quiz.id)}
                  className="group bg-white rounded-[2.5rem] border-2 border-slate-100 border-b-[6.5px] border-b-slate-200 shadow-sm hover:shadow-xl hover:border-b-2 hover:translate-y-1 transition-all duration-300 cursor-pointer p-7 flex flex-col relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-36 h-36 opacity-40 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 ${style.softBg}`} />

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform z-10 ${style.iconBg} ${style.iconText}`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-2xl text-xs font-black border-2 border-amber-100 shadow-sm">
                      <Award className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{quiz.questionCount} Questions</span>
                    </div>
                  </div>

                  <div className="relative z-10 flex-1">
                    <h3 className="text-2xl font-black text-slate-800 mb-2.5 group-hover:text-cyan-700 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-sm font-semibold text-slate-500 leading-relaxed mb-6">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-5 border-t-2 border-slate-50 relative z-10">
                    <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-tighter">
                      <Clock className="w-4 h-4 text-slate-300" />
                      <span>{quiz.durationMinutes || '-'} min</span>
                    </div>

                    <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-2xl font-black text-sm border-b-4 border-cyan-800 active:border-b-0 active:translate-y-1 transition-all shadow-lg shadow-cyan-200 group-hover:scale-105">
                      Start <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDashboard;
