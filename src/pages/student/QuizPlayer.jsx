import React, { useState } from 'react';
import { Star, CheckCircle2, XCircle, Volume2, Beaker, HelpCircle, ArrowRight, SkipForward, ArrowLeft } from 'lucide-react';

const mockQuestions = [
  {
    id: 1,
    questionText: "What is the primary indicator that a chemical reaction has occurred when two clear liquids are mixed and a white solid forms?",
    options: [
      { id: 'A', text: "Change in temperature", isCorrect: false },
      { id: 'B', text: "Formation of a precipitate", isCorrect: true },
      { id: 'C', text: "Release of a gas", isCorrect: false },
      { id: 'D', text: "Color change", isCorrect: false },
    ],
    explanation: "Excellent! A precipitate is a solid formed from a chemical reaction in a liquid solution."
  },
  {
    id: 2,
    questionText: "Which of the following describes an exothermic reaction?",
    options: [
      { id: 'A', text: "It absorbs heat from its surroundings.", isCorrect: false },
      { id: 'B', text: "It requires a constant input of energy.", isCorrect: false },
      { id: 'C', text: "It releases energy in the form of heat or light.", isCorrect: true },
      { id: 'D', text: "It only occurs in the presence of a catalyst.", isCorrect: false },
    ],
    explanation: "Spot on! 'Exo' means outward and 'thermic' relates to heat. Exothermic reactions release energy!"
  },
  {
    id: 3,
    questionText: "In the chemical equation 2H₂ + O₂ → 2H₂O, what are the reactants?",
    options: [
      { id: 'A', text: "H₂O only", isCorrect: false },
      { id: 'B', text: "H₂ and O₂", isCorrect: true },
      { id: 'C', text: "O₂ and H₂O", isCorrect: false },
      { id: 'D', text: "H₂ only", isCorrect: false },
    ],
    explanation: "Correct! Reactants are the starting substances on the left side of the arrow."
  }
];

const QuizPlayer = ({ quizId, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(850); // Initial score offset mimic

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  const handleOptionSelect = (id) => {
    if (!isAnswerChecked) {
      setSelectedOptionId(id);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedOptionId) {
      setIsAnswerChecked(true);
      const isCorrect = currentQuestion.options.find(opt => opt.id === selectedOptionId)?.isCorrect;
      if (isCorrect) {
        setScore(prev => prev + 50);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerChecked(false);
    } else {
      alert(`Quiz Completed! Final Score: ${score}`);
      onBack();
    }
  };

  const getOptionStyles = (option) => {
    if (!isAnswerChecked) {
      return selectedOptionId === option.id 
        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm transform scale-[1.02]" 
        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-slate-50 hover:shadow-sm";
    }

    if (isAnswerChecked) {
      if (option.isCorrect) {
        return "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm";
      }
      if (selectedOptionId === option.id && !option.isCorrect) {
        return "border-rose-400 bg-rose-50 text-rose-700 shadow-sm";
      }
      return "border-slate-200 bg-slate-50 text-slate-400 opacity-70";
    }
  };

  const isCurrentSelectionCorrect = isAnswerChecked && currentQuestion.options.find(opt => opt.id === selectedOptionId)?.isCorrect;

  return (
    <div className="w-full h-full min-h-screen bg-slate-50 py-8 px-4 flex flex-col items-center overflow-y-auto">
      
      {/* Container Array */}
      <div className="w-full max-w-3xl flex flex-col gap-8 pb-12 relative">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute -top-10 left-0 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Quizzes
        </button>

        {/* Header Section */}
        <div className="flex items-center justify-between w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 hidden sm:block">Chemical Reactions Quiz</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-inner">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              {score}
            </div>
            <div className="text-slate-500 font-bold bg-slate-100 px-4 py-2 rounded-xl">
              {currentQuestionIndex + 1}/{mockQuestions.length}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="relative w-full">
          {/* Floating Icon */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100 z-10">
            <Beaker className="w-6 h-6 text-fuchsia-500" />
          </div>

          <div className="w-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 rounded-3xl p-1 shadow-lg overflow-hidden relative">
             <div className="absolute inset-0 bg-white/10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')] opacity-50 mix-blend-overlay"></div>
             <div className="relative z-10 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[220px]">
                <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-colors">
                  <Volume2 className="w-5 h-5" />
                </button>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mt-4 drop-shadow-md">
                   {currentQuestion.questionText}
                </h2>
             </div>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-2">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={isAnswerChecked}
              className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${getOptionStyles(option)}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0 transition-colors ${
                isAnswerChecked && option.isCorrect ? 'bg-emerald-500 text-white border-emerald-500' :
                isAnswerChecked && selectedOptionId === option.id && !option.isCorrect ? 'bg-rose-500 text-white border-rose-500' :
                selectedOptionId === option.id ? 'bg-blue-600 text-white border-blue-600' :
                'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {isAnswerChecked && option.isCorrect ? <CheckCircle2 className="w-6 h-6" /> :
                 isAnswerChecked && selectedOptionId === option.id && !option.isCorrect ? <XCircle className="w-6 h-6" /> :
                 option.id}
              </div>
              <span className="font-bold text-lg">{option.text}</span>
            </button>
          ))}
        </div>

        {/* Result Explanation Badge */}
        {isAnswerChecked && (
           <div className={`p-6 rounded-2xl border-2 animate-in slide-in-from-bottom-2 fade-in duration-300 w-full ${isCurrentSelectionCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
             <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isCurrentSelectionCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                   {isCurrentSelectionCorrect ? <Star className="w-6 h-6 fill-emerald-500" /> : <HelpCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className={`text-xl font-extrabold mb-1 ${isCurrentSelectionCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {isCurrentSelectionCorrect ? 'Awesome job! +50 XP' : 'Not quite right!'}
                  </h3>
                  <p className={`font-medium ${isCurrentSelectionCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {currentQuestion.explanation}
                  </p>
                </div>
             </div>
           </div>
        )}

        {/* Footer Controls */}
        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="w-full sm:w-1/2 space-y-2">
            <div className="flex justify-between text-sm font-bold text-slate-500">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 shadow-inner overflow-hidden">
               <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="text-xs font-bold text-slate-400 text-center sm:text-left">You're on fire 🔥! Keep going!</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             {!isAnswerChecked ? (
               <>
                 <button onClick={handleNextQuestion} className="px-6 py-3 font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2">
                    <SkipForward className="w-5 h-5" /> Skip
                 </button>
                 <button 
                    onClick={handleCheckAnswer}
                    disabled={!selectedOptionId}
                    className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                    Check <CheckCircle2 className="w-5 h-5" />
                 </button>
               </>
             ) : (
               <button 
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
               >
                  Next Question <ArrowRight className="w-5 h-5" />
               </button>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuizPlayer;
