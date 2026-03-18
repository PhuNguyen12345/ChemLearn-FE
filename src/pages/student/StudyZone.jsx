import React, { useState } from 'react';
import {
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Info,
  ChevronRight,
  Sparkles,
  Zap,
  Lock,
} from 'lucide-react';

/* ─────────────────────────────────────────────────
   Static mock data — unchanged from original
───────────────────────────────────────────────── */
const mockCourseData = {
  chapters: [
    {
      id: 1,
      title: 'Chapter 1: Atomic Structure',
      lessons: [
        { id: 101, title: 'Introduction to Atoms', completed: true },
        { id: 102, title: 'Protons, Neutrons, Electrons', completed: true },
        { id: 103, title: 'Atomic Number & Mass', completed: false },
        { id: 104, title: 'Isotopes', completed: false },
      ],
    },
    {
      id: 2,
      title: 'Chapter 2: The Periodic Table',
      lessons: [
        { id: 201, title: 'Groups and Periods', completed: false },
        { id: 202, title: 'Metals vs. Non-Metals', completed: false },
      ],
    },
    {
      id: 3,
      title: 'Chapter 3: Chemical Bonding',
      lessons: [
        { id: 301, title: 'Ionic Bonds', completed: false },
        { id: 302, title: 'Covalent Bonds', completed: false },
      ],
    },
  ],
};

const QUIZ_OPTIONS = [
  { id: 'a', text: '16' },
  { id: 'b', text: '8'  },
  { id: 'c', text: '24' },
  { id: 'd', text: '0'  },
];
const CORRECT_OPTION = 'b';

/* ─────────────────────────────────────────────────
   Inline animated EXP bar stripes (pure Tailwind
   can't do repeating-gradient, so we use a tiny
   inline style only for the stripe pattern itself)
───────────────────────────────────────────────── */
const stripeStyle = {
  backgroundImage:
    'repeating-linear-gradient(-45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 6px, transparent 6px, transparent 12px)',
};

/* ─────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────── */
const StudyZone = () => {
  const [activeLessonId, setActiveLessonId] = useState(103);
  const [quizAnswered,   setQuizAnswered]   = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleLessonSelect = (id) => {
    setActiveLessonId(id);
    setQuizAnswered(false);
    setSelectedOption(null);
  };

  const handleQuizSubmit = () => {
    if (selectedOption !== null) setQuizAnswered(true);
  };

  const isCorrect = selectedOption === CORRECT_OPTION;

  return (
    <div className="flex h-full w-full bg-slate-50 flex-col md:flex-row overflow-hidden rounded-2xl border border-slate-200 shadow-sm">

      {/* ══════════════════════════════════════════
          LEFT SIDEBAR — Course Navigation
      ══════════════════════════════════════════ */}
      <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-col h-full overflow-y-auto shrink-0">

        {/* ── Header + EXP bar ── */}
        <div className="p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-500 rounded-xl shadow-md shadow-indigo-200">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            Course Map
          </h2>

          {/* Gamified EXP progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-black text-indigo-500 uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" /> Progress
              </span>
              <span>35%</span>
            </div>

            {/* Thick pill track */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 relative overflow-hidden transition-all duration-700"
                style={{ width: '35%' }}
              >
                {/* Animated stripes overlay */}
                <div
                  className="absolute inset-0 rounded-full animate-[shimmer_1.5s_linear_infinite]"
                  style={stripeStyle}
                />
                {/* Shiny top gloss */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/25 rounded-full" />
              </div>
            </div>

            <p className="text-xs text-slate-400 font-bold">7 / 20 lessons done 🎯</p>
          </div>
        </div>

        {/* ── Chapter list ── */}
        <div className="p-4 space-y-5 flex-1">
          {mockCourseData.chapters.map((chapter) => (
            <div key={chapter.id} className="space-y-1">
              {/* Chapter heading */}
              <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest px-2 mb-2 flex items-center gap-1.5">
                <span className="flex-1">{chapter.title}</span>
              </h3>

              <ul className="space-y-1">
                {chapter.lessons.map((lesson) => {
                  const isActive = activeLessonId === lesson.id;

                  return (
                    <li key={lesson.id}>
                      <button
                        onClick={() => handleLessonSelect(lesson.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 text-sm group
                          ${isActive
                            ? 'bg-indigo-500 text-white font-black shadow-md shadow-indigo-300/40 border-b-[3px] border-indigo-700'
                            : 'text-slate-600 font-semibold hover:bg-indigo-50 hover:text-indigo-700 hover:-translate-y-0.5 hover:shadow-sm border-b-[3px] border-transparent'
                          }
                        `}
                      >
                        {/* Status icon */}
                        <span className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all
                          ${isActive
                            ? 'bg-white/20'
                            : lesson.completed
                              ? 'bg-emerald-100'
                              : 'bg-slate-100'
                          }
                        `}>
                          {lesson.completed ? (
                            <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                          ) : isActive ? (
                            <PlayCircle className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Lock className="w-3 h-3 text-slate-300" />
                          )}
                        </span>

                        <span className="truncate flex-1">{lesson.title}</span>

                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT CONTENT AREA — Lesson Material
      ══════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto bg-white relative flex flex-col">

        {/* ── Lesson Header ── */}
        <div className="bg-white px-8 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-3">
            <span>Chapter 1</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-indigo-500 font-black">Atomic Number & Mass</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
            Understanding Atomic Number & Mass ⚗️
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1 text-xs font-black text-purple-600 bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> +30 XP on completion
            </span>
            <span className="text-xs font-bold text-slate-400">~8 min read</span>
          </div>
        </div>

        {/* ── Reading Zone (clean, low cognitive load) ── */}
        <div className="p-8 max-w-3xl mx-auto w-full space-y-8 flex-1">

          <p className="text-slate-700 text-lg leading-relaxed">
            Every element on the periodic table is unique. The key to this uniqueness lies in the nucleus of its atoms. Two numbers are essential for understanding an atom's identity: the{' '}
            <strong className="text-indigo-700 font-black">Atomic Number</strong> and the{' '}
            <strong className="text-purple-700 font-black">Mass Number</strong>.
          </p>

          {/* ── Key Definitions — Claymorphism card ── */}
          <div className="bg-indigo-50 rounded-2xl p-6 border-2 border-indigo-100 shadow-sm shadow-indigo-100/50 flex gap-4 items-start">
            <div className="p-2.5 bg-indigo-500 rounded-xl shadow-md shadow-indigo-300/50 shrink-0 mt-0.5">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-black text-indigo-900 text-lg mb-3 flex items-center gap-2">
                📖 Key Definitions
              </h4>
              <ul className="space-y-3 text-indigo-800">
                <li className="flex gap-2">
                  <span className="font-black text-indigo-600 shrink-0">Z →</span>
                  <span><strong className="font-black">Atomic Number (Z):</strong> The number of protons tightly bound in the nucleus. This single number uniquely determines the chemical element.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-purple-600 shrink-0">A →</span>
                  <span><strong className="font-black">Mass Number (A):</strong> The total number of protons <em>and</em> neutrons (nucleons) in the nucleus.</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-slate-700 text-lg leading-relaxed">
            Since atoms are electrically neutral, the number of electrons orbiting the nucleus exactly equals the number of protons (the atomic number). For example, Carbon has an atomic number of 6, meaning every carbon atom has exactly <strong className="font-black text-slate-800">6 protons</strong> and, in its neutral state, <strong className="font-black text-slate-800">6 electrons</strong>.
          </p>

          {/* ══════════════════════════════════════════
              KNOWLEDGE CHECK — Game Zone Card
          ══════════════════════════════════════════ */}
          <div className="mt-4 rounded-3xl overflow-hidden border-2 border-slate-800 border-b-[6px] shadow-xl shadow-slate-900/10">

            {/* Header bar */}
            <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-xl shadow-md">
                <TargetIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-white text-base leading-none">Knowledge Check ⚡</h3>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">Answer correctly to earn XP!</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center gap-1 text-xs font-black text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-1 rounded-full">
                  ⭐ +20 XP
                </span>
              </div>
            </div>

            {/* Quiz body */}
            <div className="bg-white p-6 space-y-4">
              <p className="text-lg font-black text-slate-800 leading-snug">
                If an atom of Oxygen has 8 protons and a mass number of 16, how many neutrons does it have?
              </p>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {QUIZ_OPTIONS.map((option) => {
                  const isCorrectOption = option.id === CORRECT_OPTION;
                  const isSelected      = selectedOption === option.id;
                  const isWrong         = quizAnswered && isSelected && !isCorrectOption;
                  const isRevealCorrect = quizAnswered && isCorrectOption;

                  let classes = 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:-translate-y-0.5 hover:shadow-sm text-slate-700';
                  if (!quizAnswered && isSelected) {
                    classes = 'border-indigo-500 border-b-[4px] border-b-indigo-700 bg-indigo-50 text-indigo-800 shadow-sm -translate-y-0.5';
                  } else if (isRevealCorrect) {
                    classes = 'border-emerald-400 border-b-[4px] border-b-emerald-700 bg-emerald-50 text-emerald-800 shadow-sm shadow-emerald-100';
                  } else if (isWrong) {
                    classes = 'border-rose-400 border-b-[3px] border-b-rose-600 bg-rose-50 text-rose-800';
                  } else if (quizAnswered) {
                    classes = 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed';
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => !quizAnswered && setSelectedOption(option.id)}
                      disabled={quizAnswered}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all duration-150 font-bold flex items-center gap-3 ${classes}`}
                    >
                      {/* Radio circle */}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                        ${isRevealCorrect ? 'border-emerald-500 bg-emerald-500'
                          : isWrong        ? 'border-rose-500 bg-rose-500'
                          : isSelected && !quizAnswered ? 'border-indigo-600 bg-indigo-600'
                          : 'border-slate-300'}
                      `}>
                        {isRevealCorrect && <CheckCircle2 className="w-4 h-4 text-white" />}
                        {isSelected && !quizAnswered && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        {isWrong && <span className="text-white text-xs font-black">✕</span>}
                      </div>

                      {/* Label badge */}
                      <span className="w-6 h-6 rounded-lg bg-current/10 flex items-center justify-center text-xs font-black shrink-0 opacity-60">
                        {option.id.toUpperCase()}
                      </span>

                      {option.text}
                    </button>
                  );
                })}
              </div>

              {/* Result feedback */}
              {quizAnswered && (
                <div className={`mt-2 p-5 rounded-2xl font-bold text-base border-2 transition-all
                  ${isCorrect
                    ? 'bg-emerald-500 text-white border-emerald-600 border-b-[5px] shadow-lg shadow-emerald-300/40'
                    : 'bg-rose-50 text-rose-800 border-rose-200 border-b-[4px]'
                  }
                `}>
                  {isCorrect ? (
                    <div className="space-y-1">
                      <p className="text-xl font-black flex items-center gap-2">
                        🎉 Correct! <span className="bg-white/20 text-white px-3 py-0.5 rounded-full text-sm border border-white/30">+20 XP Earned!</span>
                      </p>
                      <p className="text-emerald-100 font-semibold text-sm">
                        Mass Number = Protons + Neutrons → 16 − 8 = <strong className="text-white">8 neutrons</strong>. Excellent work!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-black flex items-center gap-2">😬 Not quite!</p>
                      <p className="text-sm font-semibold">
                        Remember: Mass Number = Protons + Neutrons. Try subtracting the protons (8) from the mass number (16). You'll get it next time!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex justify-end">
                {!quizAnswered ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={!selectedOption}
                    className="px-7 py-3 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-black rounded-2xl border-b-[4px] border-indigo-800 hover:from-indigo-600 hover:to-indigo-700 active:border-b active:translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-[4px] transition-all duration-150 shadow-md shadow-indigo-200"
                  >
                    Check Answer ✓
                  </button>
                ) : (
                  <button
                    onClick={() => handleLessonSelect(104)}
                    className="group px-7 py-3 bg-gradient-to-b from-slate-700 to-slate-800 text-white font-black rounded-2xl border-b-[4px] border-slate-950 hover:from-slate-800 hover:to-slate-900 active:border-b active:translate-y-1 transition-all duration-150 shadow-md flex items-center gap-2"
                  >
                    Next Lesson
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Target/Crosshair SVG icon (inline, unchanged from original) ── */
const TargetIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export default StudyZone;
