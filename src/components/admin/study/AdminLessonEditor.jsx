import React, { useState, useMemo } from 'react';
import { addMiniQuizQuestion, createAdminLesson, updateAdminLesson, deleteMiniQuizQuestion } from '../../../lib/api';
import LessonWritingBlock from '../../shared/LessonWritingBlock';

const getInitialMiniQuizQuestions = (existing) => {
  const questions = existing?.miniQuizQuestions || existing?.miniQuestions || [];
  return Array.isArray(questions) ? questions : [];
};

/**
 * Extracts YouTube video ID from various URL formats.
 */
const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes('youtube.com') && parsed.searchParams.has('v')) return parsed.searchParams.get('v');
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split('/')[0] || null;
    const embedMatch = parsed.pathname.match(/\/(embed|v)\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[2];
  } catch { /* not a valid URL */ }
  return null;
};

const AdminLessonEditor = ({ chapterId, existing = null, onSaved }) => {
  const [title, setTitle] = useState(existing?.title || '');
  const [content, setContent] = useState(existing?.content || '');
  const [durationMinutes, setDurationMinutes] = useState(existing?.durationMinutes || 15);
  const [orderIndex, setOrderIndex] = useState(existing?.orderIndex || 0);
  const [published, setPublished] = useState(existing?.published ?? true);
  const [videoUrl, setVideoUrl] = useState(existing?.videoUrl || '');
  const parsedVideoId = useMemo(() => extractYouTubeId(videoUrl), [videoUrl]);
  const [miniQuizDrafts, setMiniQuizDrafts] = useState(() => getInitialMiniQuizQuestions(existing));
  const [quizPrompt, setQuizPrompt] = useState('');
  const [quizOptionA, setQuizOptionA] = useState('');
  const [quizOptionB, setQuizOptionB] = useState('');
  const [quizOptionC, setQuizOptionC] = useState('');
  const [quizOptionD, setQuizOptionD] = useState('');
  const [quizQuestionType, setQuizQuestionType] = useState('SINGLE_CHOICE');
  const [quizCorrectOption, setQuizCorrectOption] = useState('A');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const resetQuizDraftForm = () => {
    setQuizPrompt('');
    setQuizOptionA('');
    setQuizOptionB('');
    setQuizOptionC('');
    setQuizOptionD('');
    setQuizQuestionType('SINGLE_CHOICE');
    setQuizCorrectOption('A');
  };

  const addDraftQuestion = () => {
    if (!quizPrompt.trim() || !quizOptionA.trim() || !quizOptionB.trim() || !quizOptionC.trim() || !quizOptionD.trim()) {
      setError('Please complete all mini quiz fields before adding a question.');
      return;
    }
    if (!normalizeCorrectOption(quizCorrectOption)) {
      setError('Please choose at least one correct option.');
      return;
    }

    setError('');
    setMiniQuizDrafts((prev) => [
      ...prev,
      {
        questionText: quizPrompt.trim(),
        questionType: quizQuestionType,
        optionA: quizOptionA.trim(),
        optionB: quizOptionB.trim(),
        optionC: quizOptionC.trim(),
        optionD: quizOptionD.trim(),
        correctOption: normalizeCorrectOption(quizCorrectOption),
        orderIndex: prev.length
      }
    ]);
    resetQuizDraftForm();
  };

  const removeDraftQuestion = (indexToRemove) => {
    setMiniQuizDrafts((prev) => prev.filter((_, index) => index !== indexToRemove).map((item, index) => ({ ...item, orderIndex: index })));
  };

  const removeMiniQuizQuestion = async (question, indexToRemove) => {
    if (!question?.id) {
      removeDraftQuestion(indexToRemove);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await deleteMiniQuizQuestion(question.id);
      removeDraftQuestion(indexToRemove);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove mini quiz question');
    } finally {
      setSaving(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Lesson title and content are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        content,
        chapterId,
        durationMinutes,
        orderIndex,
        published,
        videoUrl: videoUrl.trim() || null
      };

      let persistedLesson;
      if (existing?.id) {
        persistedLesson = await updateAdminLesson(existing.id, payload);
      } else {
        persistedLesson = await createAdminLesson(payload);
      }

      const unsavedMiniQuiz = miniQuizDrafts.filter((question) => !question.id);
      const savedMiniQuiz = miniQuizDrafts.filter((question) => question.id);
      if (persistedLesson?.id && unsavedMiniQuiz.length) {
        const createdQuestions = await Promise.all(
          unsavedMiniQuiz.map((question) =>
            addMiniQuizQuestion(persistedLesson.id, {
              questionText: question.questionText,
              questionType: question.questionType || 'SINGLE_CHOICE',
              optionA: question.optionA,
              optionB: question.optionB,
              optionC: question.optionC,
              optionD: question.optionD,
              correctOption: question.correctOption,
              orderIndex: question.orderIndex ?? 0
            })
          )
        );
        persistedLesson = {
          ...persistedLesson,
          miniQuizQuestions: [...savedMiniQuiz, ...createdQuestions]
        };
      } else {
        persistedLesson = {
          ...persistedLesson,
          miniQuizQuestions: savedMiniQuiz
        };
      }

      onSaved && onSaved(persistedLesson);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const normalizeCorrectOption = (value) => value
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .sort()
    .join(',');

  const toggleCorrectOption = (option) => {
    if (quizQuestionType !== 'MULTIPLE_CHOICE') {
      setQuizCorrectOption(option);
      return;
    }

    const selected = quizCorrectOption ? quizCorrectOption.split(',') : [];
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    setQuizCorrectOption(next.sort().join(','));
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

      <LessonWritingBlock
        title={title}
        content={content}
        durationMinutes={durationMinutes}
        orderIndex={orderIndex}
        published={published}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onDurationChange={setDurationMinutes}
        onOrderChange={setOrderIndex}
        onPublishedChange={setPublished}
        titlePlaceholder="Lesson title"
        durationLabel="Duration (minutes)"
        orderLabel="Order index"
        publishedLabel="Published in Study Zone"
        contentPlaceholder="Write a styled lesson like a document page..."
      />

      <div className="rounded-md border border-slate-200 p-3 space-y-3">
        <h4 className="text-sm font-black text-slate-700">YouTube Video</h4>
        <div className="space-y-2">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {videoUrl.trim() && (
            parsedVideoId ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Valid YouTube video detected: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">{parsedVideoId}</code>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-black" style={{ aspectRatio: '16/9', maxWidth: 420 }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${parsedVideoId}?rel=0&modestbranding=1`}
                    title="Video preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                Could not detect a YouTube video ID from this URL
              </div>
            )
          )}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 p-3 space-y-3">
        <h4 className="text-sm font-black text-slate-700">Lesson-end mini quiz</h4>

        <div className="grid gap-2">
          <input value={quizPrompt} onChange={(e) => setQuizPrompt(e.target.value)} placeholder="Question" className="w-full rounded-md border px-3 py-2" />
          <div className="grid gap-2 md:grid-cols-2">
            <input value={quizOptionA} onChange={(e) => setQuizOptionA(e.target.value)} placeholder="Option A" className="w-full rounded-md border px-3 py-2" />
            <input value={quizOptionB} onChange={(e) => setQuizOptionB(e.target.value)} placeholder="Option B" className="w-full rounded-md border px-3 py-2" />
            <input value={quizOptionC} onChange={(e) => setQuizOptionC(e.target.value)} placeholder="Option C" className="w-full rounded-md border px-3 py-2" />
            <input value={quizOptionD} onChange={(e) => setQuizOptionD(e.target.value)} placeholder="Option D" className="w-full rounded-md border px-3 py-2" />
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <select
              value={quizQuestionType}
              onChange={(e) => {
                setQuizQuestionType(e.target.value);
                setQuizCorrectOption('A');
              }}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option value="SINGLE_CHOICE">Single choice</option>
              <option value="MULTIPLE_CHOICE">Multiple choice</option>
            </select>
            <div className="flex flex-wrap items-center gap-2">
              {['A', 'B', 'C', 'D'].map((option) => {
                const active = quizCorrectOption.split(',').includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    className={`rounded-lg border px-3 py-2 text-sm font-black ${active ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                    onClick={() => toggleCorrectOption(option)}
                  >
                    {option}
                  </button>
                );
              })}
              <button type="button" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold" onClick={addDraftQuestion}>
                Add question
              </button>
            </div>
          </div>
        </div>

        {!!miniQuizDrafts.length && (
          <div className="space-y-2">
            {miniQuizDrafts.map((question, index) => (
              <div key={`${question.questionText}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-800">{index + 1}. {question.questionText || question.prompt}</div>
                  <button
                    type="button"
                    className="text-xs font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => removeMiniQuizQuestion(question, index)}
                    disabled={saving}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {(question.questionType || 'SINGLE_CHOICE').replace('_', ' ').toLowerCase()} • Correct answer: {question.correctOption}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <button className="rounded-md bg-indigo-600 text-white px-3 py-2 font-bold" type="submit" disabled={saving}>{saving ? 'Saving...' : existing?.id ? 'Update Lesson' : 'Create Lesson'}</button>
      </div>
    </form>
  );
};

export default AdminLessonEditor;
