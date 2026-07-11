import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdminChapter, getAdminLessonsByChapter, deleteAdminLesson } from '../../lib/api';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  LoaderCircle,
  BookOpen,
  FileText,
  GraduationCap,
  Crown,
  AlertTriangle
} from 'lucide-react';

const AdminChapterDetailPage = () => {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [chapterData, lessonsData] = await Promise.all([
        getAdminChapter(chapterId),
        getAdminLessonsByChapter(chapterId)
      ]);
      setChapter(chapterData);
      setLessons(lessonsData || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải chi tiết chương hoặc bài học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chapterId) {
      loadData();
    }
  }, [chapterId]);

  const openDeleteConfirm = (lesson) => {
    setDeleteTarget(lesson);
  };

  const closeDeleteConfirm = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setError('');
    try {
      await deleteAdminLesson(deleteTarget.id);
      setLessons((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể xóa bài học');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50/50 min-h-screen p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 bg-white rounded-3xl border border-slate-200 p-6 text-sm font-semibold text-slate-500 shadow-sm">
          <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600" /> Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (error && !chapter) {
    return (
      <div className="flex-1 bg-slate-50/50 min-h-screen p-6 max-w-7xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/admin/study')}
          className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation & Actions Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/study')}
              className="group flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 shadow-sm"
              title="Quay lại"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5 text-slate-600" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Chi tiết học phần</h2>
              <h1 className="text-2xl font-black text-slate-800 line-clamp-1">{chapter?.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              onClick={() => navigate(`/admin/study/chapter/${chapterId}/edit`)}
            >
              <Pencil className="h-4 w-4" /> Chỉnh sửa Chương
            </button>
            <button
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-900/10"
              onClick={() => navigate(`/admin/study/chapter/${chapterId}/lesson/new`)}
            >
              <Plus className="h-4 w-4" /> Thêm Bài học
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Chapter Overview Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {chapter?.gradeLevel && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-blue-700 border border-blue-200/50">
                <GraduationCap className="h-4 w-4" /> Lớp {chapter.gradeLevel}
              </span>
            )}
            {chapter?.needPurchase && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-700 border border-amber-200/50">
                <Crown className="h-4 w-4" /> Premium
              </span>
            )}
            {chapter?.published ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 border border-emerald-200/50">
                Đã xuất bản
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-slate-500 border border-slate-200">
                Bản nháp
              </span>
            )}
          </div>
          <p className="text-base font-medium text-slate-600 leading-relaxed max-w-3xl">
            {chapter?.description || 'Chưa có mô tả chi tiết cho chương học này.'}
          </p>
        </div>

        {/* Lessons List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-400">
              <FileText className="h-4.5 w-4.5 text-indigo-500" /> Danh sách bài học ({lessons.length})
            </h3>
          </div>

          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                <FileText className="h-10 w-10" />
              </div>
              <h4 className="text-base font-black text-slate-700">Chưa có bài học nào</h4>
              <p className="mt-2 text-sm font-medium text-slate-400 max-w-xs">
                Chương học này chưa có nội dung bài học. Hãy bấm vào "Thêm Bài học" để tạo bài học đầu tiên.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="group flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md"
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-sm font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                      {lesson.orderIndex ?? idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-black text-slate-800">{lesson.title}</div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
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
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => navigate(`/admin/study/lesson/${lesson.id}/edit`)}
                      title="Chỉnh sửa bài học"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-rose-100 text-rose-600 shadow-sm hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      onClick={() => openDeleteConfirm(lesson)}
                      title="Xóa bài học"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Lesson Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-100 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-5 border-b border-slate-100 p-6 bg-slate-50/50">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-rose-100 text-rose-600">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div className="min-w-0 pt-1.5">
                <h3 className="text-xl font-black text-slate-900">Xác nhận xóa bài học</h3>
                <p className="mt-2 text-sm font-medium text-slate-600 leading-relaxed">
                  Bạn sắp xóa bài học "{deleteTarget.title}". Hành động này không thể hoàn tác.
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

export default AdminChapterDetailPage;
