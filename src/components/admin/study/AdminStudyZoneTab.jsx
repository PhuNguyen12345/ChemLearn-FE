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
import { AlertTriangle, LoaderCircle, Pencil, Trash2, X, Plus, BookOpen, FileText, ChevronRight, GraduationCap, Crown, Layers } from 'lucide-react';

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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50/80 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100/50">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Cấu trúc Chương trình</h2>
            <p className="text-xs font-bold text-slate-500">Quản lý và tổ chức các bài giảng</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="group flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-95"
            type="button"
            onClick={() => setShowCreate((s) => !s)}
          >
            {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showCreate ? 'Hủy' : 'Thêm Chương mới'}
          </button>
          <button
            className="group flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            type="button"
            disabled={!selectedChapter}
            onClick={() => setShowLessonEditor((s) => !s)}
          >
            {showLessonEditor ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showLessonEditor ? 'Hủy' : 'Thêm Bài học'}
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
            <BookOpen className="h-4 w-4" /> Danh sách Chương
          </h3>
          <div className="space-y-3">
          {chapters.map((c) => (
            <div 
              key={c.id} 
              className={`group relative w-full overflow-hidden rounded-3xl border-2 p-5 text-left transition-all duration-300 ${
                selectedChapter?.id === c.id 
                  ? 'border-indigo-500 bg-indigo-50/40 shadow-xl shadow-indigo-100/50' 
                  : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md'
              }`}
            >
              {selectedChapter?.id === c.id && (
                <div className="absolute left-0 top-0 h-full w-2 bg-indigo-500 rounded-l-3xl" />
              )}
              <button type="button" className="w-full text-left outline-none" onClick={() => handleSelectChapter(c)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className={`font-black text-lg transition-colors ${selectedChapter?.id === c.id ? 'text-indigo-950' : 'text-slate-800'}`}>
                      {c.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {c.gradeLevel && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 border border-blue-200/50">
                          <GraduationCap className="h-3.5 w-3.5" /> Lớp {c.gradeLevel}
                        </span>
                      )}
                      {c.needPurchase && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700 border border-amber-200/50 shadow-sm shadow-amber-100/50">
                          <Crown className="h-3.5 w-3.5" /> Premium
                        </span>
                      )}
                      {!c.published && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                          Nháp
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                      {c.description || 'Chưa có mô tả cho chương này.'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <FileText className="h-3.5 w-3.5 text-indigo-500" /> {c.lessonCount || 0} bài
                    </div>
                    <ChevronRight className={`h-6 w-6 transition-all duration-300 ${selectedChapter?.id === c.id ? 'text-indigo-500 translate-x-1' : 'text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4'}`} />
                  </div>
                </div>
              </button>
              
              <div className={`mt-5 flex items-center gap-3 overflow-hidden transition-all duration-300 ${selectedChapter?.id === c.id ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <button 
                  type="button" 
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900" 
                  onClick={() => openChapterEditor(c.id)}
                >
                  <Pencil className="h-4 w-4" /> Chỉnh sửa
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-600 shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => openDeleteConfirm('chapter', c)}
                >
                  <Trash2 className="h-4 w-4" /> Xóa
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
            <FileText className="h-4 w-4" /> Danh sách Bài học
          </h3>
          
          <div className="sticky top-5 bg-white/50 backdrop-blur-sm rounded-[2rem] p-3 border-2 border-slate-100/80 shadow-sm min-h-[500px]">
            {!selectedChapter && (
              <div className="flex h-full flex-col items-center justify-center py-32 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm border border-slate-100 text-slate-300">
                  <BookOpen className="h-10 w-10" />
                </div>
                <h4 className="text-base font-black text-slate-700">Chọn một chương học</h4>
                <p className="mt-2 text-sm font-medium text-slate-400 max-w-xs">Chọn chương học ở cột bên trái để quản lý danh sách bài học.</p>
              </div>
            )}
            
            {selectedChapter && loadingLessons && (
              <div className="flex h-full flex-col items-center justify-center py-32">
                <LoaderCircle className="h-10 w-10 animate-spin text-indigo-500" />
              </div>
            )}
            
            {selectedChapter && !loadingLessons && !lessons.length && (
              <div className="flex h-full flex-col items-center justify-center py-32 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm border border-slate-100 text-slate-300">
                  <FileText className="h-10 w-10" />
                </div>
                <h4 className="text-base font-black text-slate-700">Chưa có bài học nào</h4>
                <p className="mt-2 text-sm font-medium text-slate-400 max-w-xs">Chương này hiện trống. Hãy tạo bài học đầu tiên.</p>
              </div>
            )}
            
            <div className="space-y-3">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="group flex items-center justify-between gap-4 rounded-2xl border-2 border-transparent bg-white p-4 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-sm font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                      {lesson.orderIndex ?? idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-black text-slate-800">{lesson.title}</div>
                      <div className="mt-1.5 flex items-center gap-4 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span> {lesson.durationMinutes || 0} phút
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> {(lesson.miniQuizQuestions || []).length} câu hỏi
                        </span>
                        {!lesson.published && (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-600 border border-rose-100">Bản nháp</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                      onClick={() => openLessonEditor(lesson.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 shadow-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                      onClick={() => openDeleteConfirm('lesson', lesson)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-100 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-5 border-b border-slate-100 p-6 bg-slate-50/50">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-rose-100 text-rose-600">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div className="min-w-0 pt-1.5">
                <h3 className="text-xl font-black text-slate-900">Xác nhận xóa</h3>
                <p className="mt-2 text-sm font-medium text-slate-600 leading-relaxed">
                  {deleteTarget.type === 'chapter'
                    ? `Bạn sắp xóa chương "${deleteTarget.item.title}" cùng toàn bộ bài học bên trong. Hành động này không thể hoàn tác.`
                    : `Bạn sắp xóa bài học "${deleteTarget.item.title}". Hành động này không thể hoàn tác.`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 bg-white">
              <button
                type="button"
                className="rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
                onClick={closeDeleteConfirm}
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all disabled:opacity-50"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Xóa ngay
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
  const [gradeLevel, setGradeLevel] = useState(6);
  const [needPurchase, setNeedPurchase] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onCreate({ title: title.trim(), description: description.trim(), gradeLevel, needPurchase });
      setTitle('');
      setDescription('');
      setGradeLevel(6);
      setNeedPurchase(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 mb-4 rounded-xl border border-slate-200 p-5 bg-slate-50/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">Tên chương</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Chương 1: Ôn tập hóa học 8..." className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 bg-white" required />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">Mô tả</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nhập mô tả ngắn gọn về chương này..." className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500 bg-white" rows={2} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Lớp</label>
          <select value={gradeLevel} onChange={(e) => setGradeLevel(Number(e.target.value))} className="w-full rounded-md border border-slate-200 px-3 py-2 bg-white outline-none focus:border-indigo-500">
            <option value={6}>Lớp 6</option>
            <option value={7}>Lớp 7</option>
            <option value={8}>Lớp 8</option>
            <option value={9}>Lớp 9</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex w-full items-center gap-3 px-4 py-2.5 rounded-md border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked={needPurchase} onChange={(e) => setNeedPurchase(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
            <span className="text-sm font-bold text-slate-700">Yêu cầu trả phí (Premium) 💎</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button className="rounded-md bg-indigo-600 text-white px-5 py-2 text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors" type="submit" disabled={saving}>
          {saving ? 'Đang tạo...' : 'Tạo chương mới'}
        </button>
      </div>
    </form>
  );
};

export default AdminStudyZoneTab;
