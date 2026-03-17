import React, { useState } from 'react';
import { BookOpen, PlayCircle, CheckCircle2, Info, ChevronRight } from 'lucide-react';

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
  ]
};

const StudyZone = () => {
  const [activeLessonId, setActiveLessonId] = useState(103);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleLessonSelect = (id) => {
    setActiveLessonId(id);
    setQuizAnswered(false);
    setSelectedOption(null);
  };

  const handleQuizSubmit = () => {
    if (selectedOption !== null) {
      setQuizAnswered(true);
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50 flex-col md:flex-row overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      
      {/* Left Sidebar: Course Navigation */}
      <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col h-full overflow-y-auto">
        <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Course Map
          </h2>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '35%' }}></div>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-2">35% Completed</p>
        </div>

        <div className="p-4 space-y-6">
          {mockCourseData.chapters.map((chapter) => (
            <div key={chapter.id} className="space-y-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">
                {chapter.title}
              </h3>
              <ul className="space-y-1">
                {chapter.lessons.map((lesson) => {
                  const isActive = activeLessonId === lesson.id;
                  return (
                    <li key={lesson.id}>
                      <button
                        onClick={() => handleLessonSelect(lesson.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors text-sm font-medium ${
                          isActive 
                            ? 'bg-indigo-50 text-indigo-700 font-bold' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {lesson.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : isActive ? (
                            <PlayCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0"></div>
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content Area: Lesson Material */}
      <div className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col">
        {/* Lesson Header */}
        <div className="bg-white p-8 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
            <span>Chapter 1</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-indigo-600 font-bold">Atomic Number & Mass</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Understanding Atomic Number & Mass
          </h1>
        </div>

        {/* Lesson Content Area */}
        <div className="p-8 max-w-4xl mx-auto w-full space-y-8 flex-1">
          
          <div className="prose prose-slate prose-indigo max-w-none space-y-4">
            <p className="text-slate-700 text-lg leading-relaxed">
              Every element on the periodic table is unique. The key to this uniqueness lies in the nucleus of its atoms. Two numbers are essential for understanding an atom's identity: the <strong>Atomic Number</strong> and the <strong>Mass Number</strong>.
            </p>

            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-r-xl my-8 flex gap-4 items-start shadow-sm">
              <Info className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-indigo-900 text-lg mb-1">Key Definitions</h4>
                <ul className="list-disc list-inside text-indigo-800 space-y-2">
                  <li><strong>Atomic Number (Z):</strong> The number of protons tightly bound in the nucleus. This determines the chemical element.</li>
                  <li><strong>Mass Number (A):</strong> The total number of protons and neutrons in the nucleus.</li>
                </ul>
              </div>
            </div>

            <p className="text-slate-700 text-lg leading-relaxed">
              Since atoms are electrically neutral overall, the number of electrons orbiting the nucleus is exactly equal to the number of protons (the atomic number). For example, Carbon has an atomic number of 6. This means every carbon atom has exactly 6 protons and, in its neutral state, 6 electrons.
            </p>
          </div>

          {/* Mini-Quiz Section */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-800 p-4 border-b border-slate-700">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <TargetIcon className="w-5 h-5 text-indigo-400" />
                  Knowledge Check
                </h3>
              </div>
              <div className="p-6">
                <p className="text-lg font-medium text-slate-800 mb-6 font-serif">
                  If an atom of Oxygen has 8 protons and a mass number of 16, how many neutrons does it have?
                </p>
                <div className="space-y-3">
                  {[
                    { id: 'a', text: '16' },
                    { id: 'b', text: '8' },
                    { id: 'c', text: '24' },
                    { id: 'd', text: '0' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => !quizAnswered && setSelectedOption(option.id)}
                      disabled={quizAnswered}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium flex items-center gap-3 ${
                        quizAnswered
                          ? option.id === 'b'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : selectedOption === option.id
                            ? 'bg-rose-50 border-rose-500 text-rose-800'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                          : selectedOption === option.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-sm'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        quizAnswered
                          ? option.id === 'b' ? 'border-emerald-500 bg-emerald-500 text-white' : selectedOption === option.id ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-300'
                          : selectedOption === option.id ? 'border-indigo-600 bg-indigo-600 hover:border-indigo-600 pointer-events-none' : 'border-slate-300'
                      }`}>
                         {quizAnswered && option.id === 'b' && <CheckCircle2 className="w-4 h-4 text-white" />}
                         {selectedOption === option.id && !quizAnswered && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                      </div>
                      {option.text}
                    </button>
                  ))}
                </div>

                {quizAnswered && (
                  <div className={`mt-6 p-4 rounded-xl font-medium ${selectedOption === 'b' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {selectedOption === 'b' 
                      ? "Correct! The mass number is the sum of protons and neutrons. So, 16 (mass) - 8 (protons) = 8 neutrons." 
                      : "Not quite. Remember that Mass Number = Protons + Neutrons. Try subtracting the protons (8) from the mass number (16)."}
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  {!quizAnswered ? (
                    <button 
                      onClick={handleQuizSubmit}
                      disabled={!selectedOption}
                      className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleLessonSelect(104)}
                      className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-2"
                    >
                      Next Lesson
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

// Helper icon
const TargetIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
)

export default StudyZone;
