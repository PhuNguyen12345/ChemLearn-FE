import React from 'react';
import { PlayCircle, Clock, Award, Flame, Database, Atom, Beaker } from 'lucide-react';

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
    <div className="w-full h-full bg-slate-50 overflow-y-auto">
      {/* Header Area */}
      <div className="bg-white px-8 py-8 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Available Quizzes</h1>
        <p className="text-slate-500 mt-2 font-medium">Select a topic below to test your chemistry knowledge and earn EXP!</p>
      </div>

      {/* Grid Area */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {availableQuizzes.map((quiz) => {
            const IconComponent = quiz.icon;
            return (
              <div 
                key={quiz.id}
                onClick={() => onPlayQuiz(quiz.id)}
                className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer p-6 flex flex-col relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${quiz.color}-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
                
                {/* Icon & Points Badge */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-${quiz.color}-100 flex items-center justify-center text-${quiz.color}-600 shadow-inner group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-sm font-bold border border-amber-100">
                    <Award className="w-4 h-4 fill-amber-500" />
                    <span>{quiz.points} XP</span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{quiz.title}</h3>
                  <p className="text-sm font-medium text-slate-500 line-clamp-2">{quiz.description}</p>
                </div>

                {/* Footer Info & Action */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 relative z-10">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <Clock className="w-4 h-4" />
                    {quiz.questionCount} Questions
                  </div>
                  <button className={`flex items-center gap-2 text-${quiz.color}-600 font-bold group-hover:text-${quiz.color}-700 transition-colors`}>
                    Start <PlayCircle className="w-5 h-5 fill-current" />
                  </button>
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
