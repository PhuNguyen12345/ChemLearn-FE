import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createAdminChapter,
  deleteAdminChapter,
  deleteAdminLesson,
  getAdminChapters,
  getAdminLessonsByChapter,
} from '../../../lib/api';
import AdminLessonEditor from './AdminLessonEditor';
import { AlertTriangle, LoaderCircle, Pencil, Trash2, X } from 'lucide-react';

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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const loadChapters = async ({ preferredChapterId = null } = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminChapters();
      const nextChapters = data || [];
      setChapters(nextChapters);

      const nextSelected = nextChapters.find((chapter) => String(chapter.id) === String(preferredChapterId))
        || nextChapters[0]
        || null;

      setSelectedChapter(nextSelected);

      if (nextSelected) {
        await loadLessons(nextSelected.id);
      } else {
        setLessons([]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load chapters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChapters();
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

  const openDeleteConfirm = (type, item) => {
    setDeleteTarget({ type, item });
  };

  const closeDeleteConfirm = () => {
    if (deleting) {
      return;
    }

    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError('');
    try {
      if (deleteTarget.type === 'chapter') {
        await deleteAdminChapter(deleteTarget.item.id);
        setShowLessonEditor(false);
        await loadChapters({ preferredChapterId: selectedChapter?.id });
      } else {
        await deleteAdminLesson(deleteTarget.item.id);
        await loadChapters({ preferredChapterId: selectedChapter?.id });
      }

      setDeleteTarget(null);
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to delete ${deleteTarget.type}`);
    } finally {
      setDeleting(false);
    }
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
                <button
                  type="button"
                  className="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  onClick={() => openDeleteConfirm('chapter', c)}
                >
                  Delete
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="font-black text-slate-800">{lesson.title}</div>
                  <div className="mt-1 text-xs text-slate-500">Duration: {lesson.durationMinutes || 0} mins | Mini quiz questions: {(lesson.miniQuizQuestions || []).length}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    onClick={() => openLessonEditor(lesson.id)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                    onClick={() => openDeleteConfirm('lesson', lesson)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start gap-4 border-b border-slate-100 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-slate-900">Confirm deletion</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {deleteTarget.type === 'chapter'
                    ? `Delete "${deleteTarget.item.title}" and all lessons inside it? This cannot be undone.`
                    : `Delete lesson "${deleteTarget.item.title}"? This cannot be undone.`}
                </p>
              </div>
              <button
                type="button"
                className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={closeDeleteConfirm}
                disabled={deleting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 p-6">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                onClick={closeDeleteConfirm}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
