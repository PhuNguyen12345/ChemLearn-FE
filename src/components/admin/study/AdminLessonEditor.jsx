import React, { useState } from 'react';
import { addMiniQuizQuestion, createAdminLesson, updateAdminLesson } from '../../../lib/api';
import LessonWritingBlock from '../../shared/LessonWritingBlock';

const AdminLessonEditor = ({ chapterId, existing = null, onSaved }) => {
  const [title, setTitle] = useState(existing?.title || '');
  const [content, setContent] = useState(existing?.content || '');
  const [durationMinutes, setDurationMinutes] = useState(existing?.durationMinutes || 15);
  const [orderIndex, setOrderIndex] = useState(existing?.orderIndex || 0);
  const [published, setPublished] = useState(existing?.published ?? true);
  const [miniQuizDrafts, setMiniQuizDrafts] = useState(existing?.miniQuizQuestions || []);
  const [quizPrompt, setQuizPrompt] = useState('');
  const [quizOptionA, setQuizOptionA] = useState('');
  const [quizOptionB, setQuizOptionB] = useState('');
  const [quizOptionC, setQuizOptionC] = useState('');
  const [quizOptionD, setQuizOptionD] = useState('');
  const [quizCorrectOption, setQuizCorrectOption] = useState('A');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const resetQuizDraftForm = () => {
    setQuizPrompt('');
    setQuizOptionA('');
    setQuizOptionB('');
    setQuizOptionC('');
    setQuizOptionD('');
    setQuizCorrectOption('A');
  };

  const addDraftQuestion = () => {
    if (!quizPrompt.trim() || !quizOptionA.trim() || !quizOptionB.trim() || !quizOptionC.trim() || !quizOptionD.trim()) {
      setError('Please complete all mini quiz fields before adding a question.');
      return;
    }

    setError('');
    setMiniQuizDrafts((prev) => [
      ...prev,
      {
        questionText: quizPrompt.trim(),
        optionA: quizOptionA.trim(),
        optionB: quizOptionB.trim(),
        optionC: quizOptionC.trim(),
        optionD: quizOptionD.trim(),
        correctOption: quizCorrectOption,
        orderIndex: prev.length
      }
    ]);
    resetQuizDraftForm();
  };

  const removeDraftQuestion = (indexToRemove) => {
    setMiniQuizDrafts((prev) => prev.filter((_, index) => index !== indexToRemove).map((item, index) => ({ ...item, orderIndex: index })));
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
        published
      };

      let persistedLesson;
      if (existing?.id) {
        persistedLesson = await updateAdminLesson(existing.id, payload);
      } else {
        persistedLesson = await createAdminLesson(payload);
      }

      const unsavedMiniQuiz = miniQuizDrafts.filter((question) => !question.id);
      if (persistedLesson?.id && unsavedMiniQuiz.length) {
        const createdQuestions = await Promise.all(
          unsavedMiniQuiz.map((question, index) =>
            addMiniQuizQuestion(persistedLesson.id, {
              questionText: question.questionText,
              optionA: question.optionA,
              optionB: question.optionB,
              optionC: question.optionC,
              optionD: question.optionD,
              correctOption: question.correctOption,
              orderIndex: index
            })
          )
        );
        persistedLesson = {
          ...persistedLesson,
          miniQuizQuestions: createdQuestions
        };
      }

      onSaved && onSaved(persistedLesson);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
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
        <h4 className="text-sm font-black text-slate-700">Lesson-end mini quiz</h4>

        <div className="grid gap-2">
          <input value={quizPrompt} onChange={(e) => setQuizPrompt(e.target.value)} placeholder="Question" className="w-full rounded-md border px-3 py-2" />
          <div className="grid gap-2 md:grid-cols-2">
            <input value={quizOptionA} onChange={(e) => setQuizOptionA(e.target.value)} placeholder="Option A" className="w-full rounded-md border px-3 py-2" />
            <input value={quizOptionB} onChange={(e) => setQuizOptionB(e.target.value)} placeholder="Option B" className="w-full rounded-md border px-3 py-2" />
            <input value={quizOptionC} onChange={(e) => setQuizOptionC(e.target.value)} placeholder="Option C" className="w-full rounded-md border px-3 py-2" />
            <input value={quizOptionD} onChange={(e) => setQuizOptionD(e.target.value)} placeholder="Option D" className="w-full rounded-md border px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={quizCorrectOption}
              onChange={(e) => setQuizCorrectOption(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option value="A">Correct: A</option>
              <option value="B">Correct: B</option>
              <option value="C">Correct: C</option>
              <option value="D">Correct: D</option>
            </select>
            <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold" onClick={addDraftQuestion}>
              Add question
            </button>
          </div>
        </div>

        {!!miniQuizDrafts.length && (
          <div className="space-y-2">
            {miniQuizDrafts.map((question, index) => (
              <div key={`${question.questionText}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-800">{index + 1}. {question.questionText}</div>
                  <button type="button" className="text-xs font-semibold text-rose-600" onClick={() => removeDraftQuestion(index)}>Remove</button>
                </div>
                <div className="mt-1 text-xs text-slate-600">Correct answer: {question.correctOption}</div>
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
