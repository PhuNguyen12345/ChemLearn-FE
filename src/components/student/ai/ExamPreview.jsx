import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, LoaderCircle, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { submitGeneratedAiExam } from '@/lib/api';

const QUESTION_TYPE_LABELS = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  ESSAY: 'Tự luận',
  LAB_APPLICATION: 'Vận dụng lab',
};

const MASTERY_STYLES = {
  WEAK: 'border-rose-200 bg-rose-50 text-rose-700',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-700',
  GOOD: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const ExamPreview = ({ exam, studentId }) => {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAnswers({});
    setResult(null);
  }, [exam?.examId]);

  const gradedByIndex = useMemo(() => {
    const map = new Map();
    (result?.gradedQuestions || []).forEach((item) => {
      map.set(item.questionIndex, item);
    });
    return map;
  }, [result]);

  if (!exam) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black text-slate-500">Chưa có đề ôn tập.</p>
      </div>
    );
  }

  const updateAnswer = (questionIndex, value) => {
    if (result) return;
    setAnswers((current) => ({ ...current, [questionIndex]: value }));
  };

  const handleSubmit = async () => {
    if (!studentId || !exam?.examId) {
      toast.error('Thiếu thông tin đề hoặc học sinh.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitGeneratedAiExam({
        studentId,
        examId: exam.examId,
        answers: (exam.questions || []).map((question, index) => ({
          questionIndex: index + 1,
          answer: answers[index + 1] || '',
        })),
      });
      setResult(data);
      toast.success('Đã nộp bài và phân tích kết quả.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không nộp được bài làm.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">{exam.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500">
            <Clock className="h-4 w-4 text-amber-500" />
            {exam.durationMinutes} phút
          </div>
        </div>

        {result ? (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
            Điểm tự chấm: {result.correct}/{result.total} · {result.scorePercent}%
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Nộp bài
          </button>
        )}
      </div>

      <div className="space-y-4 p-5">
        {(exam.questions || []).map((question, index) => {
          const questionIndex = index + 1;
          const graded = gradedByIndex.get(questionIndex);
          const isMultipleChoice = question.type === 'MULTIPLE_CHOICE';

          return (
            <article key={`${question.question}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-black text-white">
                  Câu {questionIndex}
                </span>
                <span className="rounded-md bg-cyan-100 px-2.5 py-1 text-xs font-black text-cyan-800">
                  {QUESTION_TYPE_LABELS[question.type] || question.type}
                </span>
                {question.topic && (
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">
                    {question.topic}
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm font-black leading-6 text-slate-800">{question.question}</p>

              {isMultipleChoice && (
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {(question.options || []).map((option, optionIndex) => {
                    const selected = answers[questionIndex] === option;
                    return (
                      <button
                        key={`${option}-${optionIndex}`}
                        type="button"
                        disabled={Boolean(result)}
                        onClick={() => updateAnswer(questionIndex, option)}
                        className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                          selected
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40'
                        } disabled:cursor-default`}
                      >
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {!isMultipleChoice && (
                <textarea
                  value={answers[questionIndex] || ''}
                  disabled={Boolean(result)}
                  onChange={(event) => updateAnswer(questionIndex, event.target.value)}
                  rows={4}
                  placeholder="Nhập câu trả lời của bạn..."
                  className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                />
              )}

              {graded && (
                <div className={`mt-4 rounded-lg border p-3 ${
                  graded.correct
                    ? 'border-emerald-100 bg-emerald-50'
                    : 'border-rose-100 bg-rose-50'
                }`}>
                  <div className={`flex items-center gap-2 text-sm font-black ${
                    graded.correct ? 'text-emerald-800' : 'text-rose-800'
                  }`}>
                    {graded.correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {graded.correct ? 'Đúng' : 'Chưa đúng'}
                  </div>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                    Đáp án mẫu: {graded.expectedAnswer}
                  </p>
                  {graded.explanation && (
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{graded.explanation}</p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {result?.analysis && (
        <div className="border-t border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-black text-slate-900">Phân tích học tập sau khi làm đề</h3>
            <span className={`rounded-lg border px-3 py-2 text-sm font-black ${MASTERY_STYLES[result.analysis.masteryLevel] || MASTERY_STYLES.MEDIUM}`}>
              {result.analysis.masteryLevel}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <h4 className="text-sm font-black text-emerald-800">Điểm mạnh</h4>
              <ul className="mt-2 space-y-2 text-sm font-semibold leading-6 text-emerald-700">
                {(result.analysis.strengths || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
              <h4 className="text-sm font-black text-rose-800">Phần cần ôn</h4>
              <ul className="mt-2 space-y-2 text-sm font-semibold leading-6 text-rose-700">
                {(result.analysis.weaknesses || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>

          {result.analysis.recommendedLessons?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-black text-slate-900">Bài học nên ôn lại</h4>
              <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                {result.analysis.recommendedLessons.map((lesson) => (
                  <div key={lesson.id || lesson.title} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-black text-slate-800">{lesson.title}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{lesson.chapterTitle}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ExamPreview;
