import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Star,
  CheckCircle2,
  Volume2,
  Beaker,
  HelpCircle,
  ArrowRight,
  SkipForward,
  ArrowLeft,
  LoaderCircle,
  Timer,
} from 'lucide-react';
import {
  getQuizDetail,
  startQuizAttempt,
  submitQuizAttempt,
} from '../../lib/api';

const optionLabels = ['A', 'B', 'C', 'D'];

const QuizPlayer = ({ quizId, onBack }) => {
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    const loadQuizAndAttempt = async () => {
      if (!quizId) return;
      try {
        setLoading(true);
        setError('');
        setResult(null);
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
        autoSubmittedRef.current = false;

        const [quizData, attemptData] = await Promise.all([
          getQuizDetail(quizId),
          startQuizAttempt(quizId),
        ]);

        setQuiz(quizData);
        setAttemptId(attemptData.attemptId);

        if (quizData.quizType === 'TIMED' && quizData.durationMinutes) {
          setTimeLeft(quizData.durationMinutes * 60);
        } else {
          setTimeLeft(null);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load quiz player.');
      } finally {
        setLoading(false);
      }
    };

    loadQuizAndAttempt();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || result || loading) return;
    if (timeLeft <= 0 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result, loading]);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const progressPercentage = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  const answeredCount = useMemo(
    () => Object.keys(selectedAnswers).length,
    [selectedAnswers]
  );

  const formatTime = (seconds) => {
    if (seconds === null || seconds < 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelect = (questionId, label) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: label,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async (isAuto = false) => {
    if (!attemptId || !questions.length) return;

    const answers = Object.entries(selectedAnswers).map(([questionId, selectedOption]) => ({
      questionId: Number(questionId),
      selectedOption,
    }));

    if (!answers.length && !isAuto) {
      setError('Please answer at least one question before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const submitResult = await submitQuizAttempt(attemptId, { answers });
      setResult(submitResult);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit quiz attempt.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-screen bg-slate-50 py-8 px-4 flex items-center justify-center text-slate-500 font-semibold gap-2">
        <LoaderCircle className="w-4 h-4 animate-spin" /> Loading quiz...
      </div>
    );
  }

  if (!quiz || !currentQuestion) {
    return (
      <div className="w-full h-full min-h-screen bg-slate-50 py-8 px-4">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 font-semibold">
          {error || 'Quiz data is unavailable.'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-slate-50 py-8 px-4 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-3xl flex flex-col gap-8 pb-12 relative">
        <button
          onClick={onBack}
          className="absolute -top-10 left-0 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Quizzes
        </button>

        <div className="flex items-center justify-between w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 border border-cyan-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 hidden sm:block">{quiz.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-inner">
                <Timer className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            )}
            <div className="text-slate-500 font-bold bg-slate-100 px-4 py-2 rounded-xl">
              {currentQuestionIndex + 1}/{questions.length}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 font-semibold">
            {error}
          </div>
        )}

        {result ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm">
            <h2 className="text-2xl font-black text-slate-800">Attempt Submitted</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl p-4 bg-cyan-50 border border-cyan-200">
                <p className="text-sm font-bold text-cyan-700">Score</p>
                <p className="text-2xl font-black text-cyan-800">{result.score}%</p>
              </div>
              <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200">
                <p className="text-sm font-bold text-emerald-700">Correct</p>
                <p className="text-2xl font-black text-emerald-800">{result.correctAnswers}</p>
              </div>
              <div className="rounded-2xl p-4 bg-amber-50 border border-amber-200">
                <p className="text-sm font-bold text-amber-700">Total</p>
                <p className="text-2xl font-black text-amber-800">{result.totalQuestions}</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold"
            >
              Return to Quiz List
            </button>
          </div>
        ) : (
          <>
            <div className="relative w-full">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100 z-10">
                <Beaker className="w-6 h-6 text-cyan-600" />
              </div>

              <div className="w-full bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-3xl p-1 shadow-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-white/10 opacity-50 mix-blend-overlay" />
                <div className="relative z-10 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[220px]">
                  <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-colors">
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mt-4 drop-shadow-md">
                    {currentQuestion.prompt}
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-2">
              {optionLabels.map((label) => {
                const text = currentQuestion[`option${label}`];
                const selected = selectedAnswers[currentQuestion.id] === label;
                return (
                  <button
                    key={label}
                    onClick={() => handleSelect(currentQuestion.id, label)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${selected
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm transform scale-[1.02]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-slate-50 hover:shadow-sm'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0 transition-colors ${selected
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                      {selected ? <CheckCircle2 className="w-6 h-6" /> : label}
                    </div>
                    <span className="font-bold text-lg">{text}</span>
                  </button>
                );
              })}
            </div>

            <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="w-full sm:w-1/2 space-y-2">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 shadow-inner overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                </div>
                <p className="text-xs font-bold text-slate-400 text-center sm:text-left">
                  {answeredCount}/{questions.length} answered
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex >= questions.length - 1}
                  className="px-6 py-3 font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <SkipForward className="w-5 h-5" /> Next
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" /> Submitting
                    </>
                  ) : (
                    <>
                      Submit <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;
