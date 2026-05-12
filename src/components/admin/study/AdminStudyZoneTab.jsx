import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdminChapter, getAdminChapters, getAdminLessonsByChapter } from '../../../lib/api';
import AdminLessonEditor from './AdminLessonEditor';

const AdminStudyZoneTab = () => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showLessonEditor, setShowLessonEditor] = useState(false);

  const loadLessons = async (chapterId) => {
    if (!chapterId) {
      setLessons([]);
      return;
    }

    setLoadingLessons(true);
    setError('');
    try {
      const data = await getAdminLessonsByChapter(chapterId);
      setLessons(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load lessons');
    } finally {
      setLoadingLessons(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAdminChapters();
        setChapters(data || []);
        if (data?.length) {
          setSelectedChapter(data[0]);
          await loadLessons(data[0].id);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load chapters');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCreate = async (payload) => {
    try {
      const created = await createAdminChapter(payload);
      setChapters((prev) => [created, ...prev]);
      setSelectedChapter(created);
      setLessons([]);
      setShowCreate(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create chapter');
    }
  };

  const handleSelectChapter = async (chapter) => {
    setSelectedChapter(chapter);
    await loadLessons(chapter.id);
  };

  const handleLessonSaved = (lesson) => {
    if (!lesson) {
      return;
    }

    setLessons((prev) => {
      const index = prev.findIndex((item) => item.id === lesson.id);
      if (index === -1) {
        return [lesson, ...prev];
      }

      const next = [...prev];
      next[index] = lesson;
      return next;
    });
    setShowLessonEditor(false);
  };

  const openChapterEditor = (chapterId) => {
    navigate(`/admin/study/chapter/${chapterId}/edit`);
  };

  const openLessonEditor = (lessonId) => {
    navigate(`/admin/study/lesson/${lessonId}/edit`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black">Admin Study Zone</h2>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md bg-indigo-600 text-white px-3 py-2 font-bold"
            type="button"
            onClick={() => setShowCreate((s) => !s)}
          >
            {showCreate ? 'Close' : 'Create Chapter'}
          </button>
          <button
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-bold text-slate-700 disabled:opacity-50"
            type="button"
            disabled={!selectedChapter}
            onClick={() => setShowLessonEditor((s) => !s)}
          >
            {showLessonEditor ? 'Close Lesson Editor' : 'Create Lesson'}
          </button>
        </div>
      </div>

      {showCreate && <ChapterCreateForm onCreate={handleCreate} />}

      {showLessonEditor && selectedChapter && (
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-600">Creating lesson in: <span className="font-black text-slate-800">{selectedChapter.title}</span></div>
          <AdminLessonEditor chapterId={selectedChapter.id} onSaved={handleLessonSaved} />
        </div>
      )}

      {loading && <div className="text-sm text-slate-500">Loading chapters...</div>}
      {error && <div className="text-sm text-rose-600">{error}</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Chapters</h3>
          {chapters.map((c) => (
            <div key={c.id} className={`w-full rounded-lg border p-3 text-left ${selectedChapter?.id === c.id ? 'border-indigo-500 bg-indigo-50' : 'bg-white'}`}>
              <button type="button" className="w-full text-left" onClick={() => handleSelectChapter(c)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-black">{c.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{c.description || 'No chapter description yet.'}</div>
                  </div>
                  <div className="text-xs text-slate-400">{c.lessonCount || 0} lessons</div>
                </div>
              </button>
              <div className="mt-3 flex items-center gap-2">
                <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700" onClick={() => openChapterEditor(c.id)}>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Lessons in selected chapter</h3>
          {!selectedChapter && <div className="rounded-lg border bg-white p-3 text-sm text-slate-500">Select a chapter to view lessons.</div>}
          {selectedChapter && loadingLessons && <div className="rounded-lg border bg-white p-3 text-sm text-slate-500">Loading lessons...</div>}
          {selectedChapter && !loadingLessons && !lessons.length && (
            <div className="rounded-lg border bg-white p-3 text-sm text-slate-500">No lessons yet. Use Create Lesson to add the first one.</div>
          )}
          {lessons.map((lesson) => (
            <div key={lesson.id} className="rounded-lg border bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-black text-slate-800">{lesson.title}</div>
                  <div className="mt-1 text-xs text-slate-500">Duration: {lesson.durationMinutes || 0} mins | Mini quiz questions: {(lesson.miniQuizQuestions || []).length}</div>
                </div>
                <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700" onClick={() => openLessonEditor(lesson.id)}>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChapterCreateForm = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onCreate({ title: title.trim(), description: description.trim() });
      setTitle('');
      setDescription('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 mb-4">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter title" className="w-full rounded-md border px-3 py-2" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="w-full rounded-md border px-3 py-2" rows={3} />
      <div>
        <button className="rounded-md bg-indigo-600 text-white px-3 py-2 font-bold" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
      </div>
    </form>
  );
};

export default AdminStudyZoneTab;
