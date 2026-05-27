import React, { useEffect, useState } from 'react';
import {
  getTeacherChapters,
  getTeacherLessons,
  getTeacherClasses,
  createTeacherChapter,
  updateTeacherChapter,
  deleteTeacherChapter,
  createTeacherLesson,
  updateTeacherLesson,
  deleteTeacherLesson,
  addChapterToClass,
  removeChapterFromClass
} from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  LoaderCircle,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import LessonWritingBlock from '../../components/shared/LessonWritingBlock';

const TeacherContentManagement = () => {
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  // Forms
  const [chapterForm, setChapterForm] = useState({ title: '', description: '', orderIndex: 0, published: true });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', durationMinutes: 10, orderIndex: 0, published: true });

  const loadData = async () => {
    try {
      setLoading(true);
      const [chaptersData, lessonsData, classesData] = await Promise.all([
        getTeacherChapters(),
        getTeacherLessons(),
        getTeacherClasses()
      ]);
      setChapters(chaptersData || []);
      setLessons(lessonsData || []);
      setTeacherClasses(classesData || []);

      if (chaptersData?.length > 0 && !selectedChapter) {
        setSelectedChapter(chaptersData[0]);
      } else if (selectedChapter) {
        const updatedSelected = chaptersData.find(c => c.id === selectedChapter.id);
        if (updatedSelected) setSelectedChapter(updatedSelected);
      }
    } catch (err) {
      setError('Tải nội dung không thành công.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLessons = lessons.filter(l => {
    const chapterId = l.chapterId || l.chapter?.id;
    return String(chapterId) === String(selectedChapter?.id);
  });

  // Chapter Handlers
  const handleOpenChapterModal = (chapter = null) => {
    if (chapter) {
      setEditingChapter(chapter);
      setChapterForm({
        title: chapter.title,
        description: chapter.description || '',
        orderIndex: chapter.orderIndex ?? chapter.displayOrder ?? 0,
        published: chapter.published ?? true
      });
    } else {
      setEditingChapter(null);
      setChapterForm({ title: '', description: '', orderIndex: 0, published: true });
    }
    setShowChapterModal(true);
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: chapterForm.title,
        description: chapterForm.description,
        displayOrder: Number.isFinite(Number(chapterForm.orderIndex)) ? Number(chapterForm.orderIndex) : 0,
        published: chapterForm.published
      };
      if (editingChapter) {
        await updateTeacherChapter(editingChapter.id, payload);
      } else {
        await createTeacherChapter(payload);
      }
      await loadData();
      setShowChapterModal(false);
    } catch (err) {
      setError('Lưu chương không thành công.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChapter = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này và tất cả các bài học trong chương không?')) return;
    try {
      await deleteTeacherChapter(id);
      await loadData();
      if (selectedChapter?.id === id) setSelectedChapter(null);
    } catch (err) {
      setError('Xóa chương không thành công.');
    }
  };

  const handleToggleChapterAssignment = async (classId, chapterId, assigned) => {
    try {
      if (assigned) {
        await removeChapterFromClass(classId, chapterId);
      } else {
        await addChapterToClass(classId, chapterId);
      }
      await loadData();
    } catch (err) {
      setError('Cập nhật chương không thành công.');
    }
  };

  // Lesson Handlers
  const handleOpenLessonModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        content: lesson.content || '',
        durationMinutes: lesson.durationMinutes ?? lesson.estimatedMinutes ?? 10,
        orderIndex: lesson.orderIndex ?? lesson.displayOrder ?? 0,
        published: lesson.published ?? true
      });
    } else {
      setEditingLesson(null);
      setLessonForm({ title: '', content: '', durationMinutes: 10, orderIndex: 0, published: true });
    }
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!selectedChapter) return;
    setSubmitting(true);
    try {
      const payload = {
        chapterId: String(selectedChapter.id),
        title: lessonForm.title,
        content: lessonForm.content,
        estimatedMinutes: Number.isFinite(Number(lessonForm.durationMinutes)) ? Number(lessonForm.durationMinutes) : 0,
        displayOrder: Number.isFinite(Number(lessonForm.orderIndex)) ? Number(lessonForm.orderIndex) : 0,
        published: lessonForm.published
      };
      if (editingLesson) {
        await updateTeacherLesson(editingLesson.id, payload);
      } else {
        await createTeacherLesson(payload);
      }
      await loadData();
      setShowLessonModal(false);
    } catch (err) {
      setError('Lưu bài học không thành công.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      await deleteTeacherLesson(id);
      await loadData();
    } catch (err) {
      setError('Xóa bài học không thành công.');
    }
  };

  if (loading && !chapters.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderCircle className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Quản lý nội dung</h1>
          <p className="text-slate-500 mt-1 font-medium">Tạo và tổ chức các chương và bài học.</p>
        </div>
        <button
          onClick={() => handleOpenChapterModal()}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-200"
        >
          <Plus className="h-5 w-5" /> Tạo chương mới
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chapters Column */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Chương học
          </h2>
          <div className="space-y-3">
            {chapters.length === 0 ? (
              <Card className="border-dashed border-slate-200 bg-slate-50/50">
                <CardContent className="p-8 text-center text-slate-400 font-bold">
                  Chưa có chương nào được tạo.
                </CardContent>
              </Card>
            ) : (
              chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className={`group relative rounded-2xl border-2 transition-all duration-300 ${
                    selectedChapter?.id === chapter.id
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-md'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setSelectedChapter(chapter)}
                    className="w-full text-left p-4 pr-12"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-500 group-hover:text-indigo-600 transition-colors">
                        {chapter.orderIndex ?? chapter.displayOrder ?? 0}
                      </span>
                      <div>
                        <div className={`font-black text-sm ${selectedChapter?.id === chapter.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {chapter.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{chapter.description || 'No description.'}</div>
                      </div>
                    </div>
                  </button>
                  
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenChapterModal(chapter); }}
                      className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id); }}
                      className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lessons Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Bài học trong {selectedChapter?.title || 'Selected Chapter'}
            </h2>
            <button
              disabled={!selectedChapter}
              onClick={() => handleOpenLessonModal()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" /> Tạo bài học
            </button>
          </div>

          {!selectedChapter ? (
            <Card className="border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="font-black text-slate-700">Chọn chương học</h3>
                <p className="text-sm text-slate-500 mt-1">Chọn một chương để quản lý các bài học của nó.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredLessons.length === 0 ? (
                <Card className="border-dashed border-slate-200 bg-slate-50/50">
                  <CardContent className="p-12 text-center">
                    <h3 className="font-black text-slate-700">Chưa có bài học</h3>
                    <p className="text-sm text-slate-500 mt-1">Bài học này chưa có bài nào được thêm vào.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredLessons.map((lesson) => (
                    <Card key={lesson.id} className="border-slate-100 hover:border-indigo-200 transition-all group">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-500">
                            {lesson.orderIndex ?? lesson.displayOrder ?? 0}
                          </div>
                          <div>
                            <div className="font-black text-slate-800">{lesson.title}</div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                {lesson.durationMinutes ?? lesson.estimatedMinutes ?? 0} phút
                              </span>
                              {lesson.published ? (
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                  Đã xuất bản
                                </span>
                              ) : (
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                  Nháp
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenLessonModal(lesson)}
                            className="p-2 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg shadow-2xl rounded-3xl overflow-hidden border-none animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black">{editingChapter ? 'Edit Chapter' : 'Create New Chapter'}</CardTitle>
                <button onClick={() => setShowChapterModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>
            </CardHeader>
            <form onSubmit={handleSaveChapter}>
              <CardContent className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tiêu đề chương</label>
                  <input
                    required
                    value={chapterForm.title}
                    onChange={e => setChapterForm({ ...chapterForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="e.g. Introduction to Organic Chemistry"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả</label>
                  <textarea
                    rows={3}
                    value={chapterForm.description}
                    onChange={e => setChapterForm({ ...chapterForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-medium resize-none"
                    placeholder="Briefly describe what this chapter covers..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Thứ tự</label>
                    <input
                      type="number"
                      value={chapterForm.orderIndex}
                      onChange={e => setChapterForm({ ...chapterForm, orderIndex: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 transition-all w-full">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={chapterForm.published}
                        onChange={e => setChapterForm({ ...chapterForm, published: e.target.checked })}
                      />
                      <span className="text-sm font-bold text-slate-700">Đã xuất bản</span>
                    </label>
                  </div>
                </div>
              </CardContent>
              <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Chapter'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl shadow-2xl rounded-3xl overflow-hidden border-none animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <CardHeader className="border-b border-slate-100 p-6 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black">{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</CardTitle>
                  <p className="text-sm text-slate-500 font-bold mt-0.5">Chương: {selectedChapter.title}</p>
                </div>
                <button onClick={() => setShowLessonModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>
            </CardHeader>
            <div className="overflow-y-auto p-6 flex-1">
              <form id="lessonForm" onSubmit={handleSaveLesson} className="space-y-6">
                <LessonWritingBlock
                  title={lessonForm.title}
                  content={lessonForm.content}
                  durationMinutes={lessonForm.durationMinutes}
                  orderIndex={lessonForm.orderIndex}
                  published={lessonForm.published}
                  onTitleChange={val => setLessonForm({ ...lessonForm, title: val })}
                  onContentChange={val => setLessonForm({ ...lessonForm, content: val })}
                  onDurationChange={val => setLessonForm({ ...lessonForm, durationMinutes: val })}
                  onOrderChange={val => setLessonForm({ ...lessonForm, orderIndex: val })}
                  onPublishedChange={val => setLessonForm({ ...lessonForm, published: val })}
                  titlePlaceholder="e.g. Lewis Structures and Formal Charge"
                  contentPlaceholder="Write your lesson content here. You can use markdown-like formatting."
                />
              </form>
            </div>
            <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button
                form="lessonForm"
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Lesson'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeacherContentManagement;
