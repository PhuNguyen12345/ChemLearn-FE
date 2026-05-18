import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getQuizDetail, 
  startQuizAttempt, 
  submitQuizAttempt,
  getQuizAttemptHistory
} from '../../lib/api';
import { 
  LoaderCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertCircle,
  CheckCircle2,
  Trophy,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

/* ─────────────────────────────────────────────
   Constants & Utilities
 ───────────────────────────────────────────── */
const formatTime = (seconds) => {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const QuizTakingPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // Data state
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [started, setStarted] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
  const [timeLeft, setTimeLeft] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState(null);

  /* ═════════════════════════════════════════════
     Data Loading
  ═════════════════════════════════════════════ */
  useEffect(() => {
    const initQuiz = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch quiz details
        const quizData = await getQuizDetail(quizId);
        setQuiz(quizData);
        setQuestions(quizData.questions || []);

        // 2. Load attempt history and decide whether to resume or let user start
        const history = await getQuizAttemptHistory(quizId);
        setAttemptHistory(history || []);

        const active = (history || []).find(h => h.status === 'IN_PROGRESS');
        if (active) {
          // Resume existing attempt
          const attemptData = await startQuizAttempt(quizId);
          setAttemptId(attemptData.attemptId);
          setStarted(true);
        }

        // 3. Initialize timer if quiz has duration (only when started)
        if (quizData.durationMinutes > 0 && active) {
          setTimeLeft(quizData.durationMinutes * 60);
        }

      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to start quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      initQuiz();
    }
  }, [quizId]);

  /* ═════════════════════════════════════════════
     Timer Logic
  ═════════════════════════════════════════════ */
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isCompleted]);

  /* ═════════════════════════════════════════════
     Handlers
  ═════════════════════════════════════════════ */
  const handleAnswerSelect = (questionId, option) => {
    if (isCompleted) return;
    
    const question = questions.find(q => q.id === questionId);
    if (question?.questionType === 'MULTIPLE_CHOICE') {
      const currentSelected = answers[questionId] ? answers[questionId].split(',') : [];
      let nextSelected;
      if (currentSelected.includes(option)) {
        nextSelected = currentSelected.filter(o => o !== option);
      } else {
        nextSelected = [...currentSelected, option];
      }
      setAnswers({
        ...answers,
        [questionId]: nextSelected.join(',')
      });
    } else {
      setAnswers({
        ...answers,
        [questionId]: option
      });
    }
  };

  const handleSubmit = async () => {
    if (submitting || isCompleted) return;

    // Confirm submission if some questions are unanswered
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0 && !confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`)) {
      return;
    }

    await performSubmit();
  };

  const handleAutoSubmit = useCallback(async () => {
    if (isCompleted) return;
    console.log('Time is up! Auto-submitting...');
    await performSubmit();
  }, [answers, questions, attemptId, isCompleted]);

  const performSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption
        }))
      };

      const resultData = await submitQuizAttempt(attemptId, payload);
      setResults(resultData);
      setIsCompleted(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit quiz. Please contact your teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ═════════════════════════════════════════════
     Render Helpers
  ═════════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <LoaderCircle className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-lg font-bold text-slate-500">Preparing your quiz environment...</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <QuizResultView 
        results={results} 
        quiz={quiz} 
        onBack={() => navigate(-1)} 
      />
    );
  }

  if (!started) {
    const canStart = attemptHistory.length === 0 || attemptHistory.some(h => h.canRetake === true);

    return (
      <div className="max-w-3xl mx-auto py-12">
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-black">{quiz?.title}</CardTitle>
            <CardDescription className="text-sm">Attempts history</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {attemptHistory.length === 0 ? (
              <p className="text-sm text-slate-500 font-bold">No previous attempts. You may start the quiz.</p>
            ) : (
              <div className="space-y-3">
                {attemptHistory.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-black">{a.status}</div>
                      <div className="text-xs text-slate-500">Score: {a.score ?? '-'} • {a.correctAnswers}/{a.totalQuestions}</div>
                    </div>
                    <div className="text-xs text-slate-400">{a.startedAt ? new Date(a.startedAt).toLocaleString() : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button onClick={async () => {
              try {
                setLoading(true);
                const attemptData = await startQuizAttempt(quizId);
                setAttemptId(attemptData.attemptId);
                setStarted(true);
                if (quiz?.durationMinutes > 0) setTimeLeft(quiz.durationMinutes * 60);
              } catch (err) {
                setError(err?.response?.data?.message || 'Failed to start attempt');
              } finally {
                setLoading(false);
              }
            }} disabled={!canStart} className="rounded-xl font-black">
              {canStart ? 'Start Quiz' : 'Cannot Retake'}
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-800">{quiz?.title}</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-black transition-colors ${
            timeLeft < 60 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Clock className="h-5 w-5" />
            <span className="text-lg tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Quiz Area */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-slate-200 shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              {currentQuestion ? (
                <>
                  <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <span className="text-xs font-black uppercase tracking-widest bg-indigo-100 px-2 py-0.5 rounded">
                      {currentQuestion.questionType?.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-800 leading-relaxed">
                    {currentQuestion.prompt}
                  </h2>
                </>
              ) : (
                <div className="py-4 text-center text-slate-400 font-bold italic">No question found.</div>
              )}
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-3">
                {currentQuestion && currentQuestion.questionType !== 'ESSAY' && (
                  currentQuestion.questionType === 'TRUE_FALSE'
                    ? ['optionA', 'optionB']
                    : ['optionA', 'optionB', 'optionC', 'optionD']
                ).map((key) => {
                  const optionValue = currentQuestion[key];
                  if (!optionValue || optionValue === 'N/A') return null;
                  
                  const optionLetter = key.slice(-1);
                  const isSelected = (answers[currentQuestion.id] || '').split(',').includes(optionLetter);

                  return (
                    <button
                      key={key}
                      onClick={() => handleAnswerSelect(currentQuestion?.id, optionLetter)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all group ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/10' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 font-black text-sm transition-colors ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-500 text-white' 
                          : 'border-slate-200 bg-white text-slate-500 group-hover:border-slate-300'
                      }`}>
                        {optionLetter}
                      </div>
                      <span className={`flex-1 text-sm font-bold ${
                        isSelected ? 'text-indigo-900' : 'text-slate-700'
                      }`}>
                        {optionValue}
                      </span>
                    </button>
                  );
                })}

                {currentQuestion?.questionType === 'ESSAY' && (
                  <textarea
                    value={answers[currentQuestion?.id] || ''}
                    onChange={(e) => handleAnswerSelect(currentQuestion?.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full min-h-[200px] p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition outline-none text-sm font-semibold"
                  />
                )}
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 flex justify-between">
              <Button
                variant="outline"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="rounded-xl font-bold gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl font-black gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
                >
                  {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Finish Quiz
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="rounded-xl font-bold gap-2"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar / Navigation Grid */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest">
                Question Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = idx === currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 w-full rounded-lg border-2 text-xs font-black transition-all ${
                        isCurrent 
                          ? 'border-indigo-500 bg-indigo-500 text-white shadow-sm' 
                          : isAnswered
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Notice</span>
            </div>
            <p className="text-xs font-bold text-amber-600 leading-relaxed">
              Ensure you have a stable connection. Do not refresh or close the page while the quiz is in progress.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 font-bold text-sm">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Result View Component
 ───────────────────────────────────────────── */
const QuizResultView = ({ results, quiz, onBack }) => {
  const score = results?.score || 0;
  const isExcellent = score >= 80;
  const isGood = score >= 50;

  const isPending = results?.status === 'NEEDS_GRADING';

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="border-slate-200 shadow-xl overflow-hidden border-t-8 border-t-indigo-500">
        <CardContent className="p-10 text-center space-y-6">
          <div className="mx-auto w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            {isPending ? (
              <Clock className="h-12 w-12 text-blue-500" />
            ) : isExcellent ? (
              <Trophy className="h-12 w-12 text-amber-500" />
            ) : isGood ? (
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            ) : (
              <HelpCircle className="h-12 w-12 text-slate-400" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-800">
              {isPending ? 'Submission Success!' : isExcellent ? 'Outstanding!' : isGood ? 'Good Job!' : 'Keep Practicing!'}
            </h2>
            <p className="text-slate-500 font-bold">
              You've completed <span className="text-indigo-600">{quiz?.title}</span>
            </p>
          </div>

          {isPending ? (
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold flex flex-col items-center gap-3">
              <span className="text-xl font-black">{results?.message || 'Please wait for your teacher to grade.'}</span>
              <p className="text-blue-600/80 font-semibold leading-relaxed">
                Your multiple-choice questions have been auto-calculated, but the essay portion requires manual review before your final score is released.
              </p>
              <div className="mt-2 pt-4 border-t border-blue-100 w-full flex justify-around">
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-700">{results?.correctAnswers} / {results?.totalQuestions}</div>
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">MCQ Progress</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-indigo-600">{score}%</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Final Score</div>
              </div>
              <div className="text-center border-l border-slate-200">
                <div className="text-3xl font-black text-slate-700">{results?.correctAnswers} / {results?.totalQuestions}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Correct Answers</div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={onBack}
              className="flex-1 rounded-2xl font-black h-12 bg-slate-800 hover:bg-slate-900"
            >
              Back to Course
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizTakingPage;
