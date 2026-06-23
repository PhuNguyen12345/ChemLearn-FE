import React, { useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, HelpCircle, LoaderCircle, RefreshCcw, Send } from 'lucide-react';
import { submitLessonMiniQuiz } from '../../../lib/api';
import { useBiMascot } from '../mascot/BiMascot';
import { formatChemistryText } from '../../../utils/chemistryFormatting';

const OPTION_KEYS = [
  ['A', 'optionA'],
  ['B', 'optionB'],
  ['C', 'optionC'],
  ['D', 'optionD']
];

const normalizeQuestionType = (question) => {
  if (question?.questionType === 'MULTIPLE_CHOICE') return 'MULTIPLE_CHOICE';
  const correctOption = question?.correctOption || '';
  return correctOption.includes(',') ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE';
};

const MiniQuizSection = ({ lessonId, questions = [] }) => {
  const { speak } = useBiMascot();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value?.length).length,
    [answers]
  );

  if (!questions.length) return null;

  const updateAnswer = (question, optionLetter) => {
    if (result || submitting) return;

    const type = normalizeQuestionType(question);
    setAnswers((prev) => {
      const current = prev[question.id] || [];
      if (type === 'MULTIPLE_CHOICE') {
        const next = current.includes(optionLetter)
          ? current.filter((item) => item !== optionLetter)
          : [...current, optionLetter].sort();
        return { ...prev, [question.id]: next };
      }
      return { ...prev, [question.id]: [optionLetter] };
    });
  };

  const submitQuiz = async () => {
    if (submitting || result) return;
    if (answeredCount !== questions.length) {
      setError('Trả lời tất cả các câu hỏi trước khi nộp bài.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await submitLessonMiniQuiz(lessonId, {
        answers: questions.map((question) => ({
          questionId: question.id,
          selectedOption: (answers[question.id] || []).join(',')
        }))
      });
      setResult(response);
      speak(
        response.passed
          ? `Tuyệt lắm! Bạn làm đúng ${response.correctAnswers}/${response.totalQuestions} câu mini quiz. Giữ nhịp này là kiến thức sẽ chắc dần đó.`
          : `Mình chưa qua lần này, nhưng không sao. Bạn đúng ${response.correctAnswers}/${response.totalQuestions} câu rồi. Hãy đọc lại phần liên quan và thử lại, Bi ở đây cùng bạn.`
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi khi nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setResult(null);
    setError('');
  };

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Kiểm tra kiến thức</h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              {questions.length} câu • chọn 1 hoặc nhiều đáp án
            </p>
          </div>
        </div>

        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600">
          Đã trả lời {answeredCount}/{questions.length}
        </div>
      </div>

      <div className="space-y-5 p-5">
        {questions.map((question, index) => {
          const type = normalizeQuestionType(question);
          const selected = answers[question.id] || [];

          return (
            <div key={question.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-wide text-indigo-600">
                    Câu hỏi {index + 1}
                  </div>
                  <p
                    className="mt-1 text-sm font-bold leading-6 text-slate-800"
                    dangerouslySetInnerHTML={{ __html: formatChemistryText(question.prompt || '') }}
                  />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase text-slate-500">
                  {type === 'MULTIPLE_CHOICE' ? 'Chọn tất cả' : 'Chọn một'}
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {OPTION_KEYS.map(([letter, key]) => {
                  const optionText = question[key];
                  if (!optionText) return null;
                  const isSelected = selected.includes(letter);

                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={!!result || submitting}
                      onClick={() => updateAnswer(question, letter)}
                      className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        } disabled:cursor-default`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${isSelected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-500'
                        }`}>
                        {letter}
                      </span>
                      <span
                        className="text-sm font-semibold leading-5"
                        dangerouslySetInnerHTML={{ __html: formatChemistryText(optionText) }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            <CircleAlert className="h-4 w-4" />
            {error}
          </div>
        )}

        {result && (
          <div className={`rounded-xl border px-4 py-3 ${result.passed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}>
            <div className="flex items-center gap-2 text-sm font-black">
              <CheckCircle2 className="h-4 w-4" />
              Điểm số: {result.score}% ({result.correctAnswers}/{result.totalQuestions})
            </div>
            <p className="mt-1 text-xs font-semibold opacity-80">
              {result.passed ? 'Chính xác. Làm tốt lắm!' : 'Chưa đạt. Xem lại bài học và thử lại.'}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={submitQuiz}
            disabled={submitting || !!result}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Nộp câu trả lời
          </button>
          <button
            type="button"
            onClick={resetQuiz}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Thử lại
          </button>
        </div>
      </div>
    </section>
  );
};

export default MiniQuizSection;
