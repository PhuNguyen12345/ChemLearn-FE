import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createAdminChapter,
  deleteAdminChapter,
  getAdminChapters,
} from '../../../lib/api';
import { AlertTriangle, LoaderCircle, Pencil, Trash2, X, Plus, BookOpen, FileText, GraduationCap, Crown, Layers } from 'lucide-react';

const AdminStudyZoneTab = () => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadChapters = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminChapters();
      setChapters(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách chương học');
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
      setShowCreate(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tạo chương mới');
    }
  };

  const openDeleteConfirm = (chapter) => {
    setDeleteTarget(chapter);
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
      await deleteAdminChapter(deleteTarget.id);
      setChapters((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể xóa chương học');
    } finally {
      setDeleting(false);
    }
  };

  const openChapterEditor = (chapterId) => {
    navigate(`/admin/study/chapter/${chapterId}/edit`);
  };

  const viewChapterDetails = (chapterId) => {
    navigate(`/admin/study/chapter/${chapterId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50/80 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100/50">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Danh sách Chương học</h2>
            <p className="text-xs font-bold text-slate-500">Quản lý cấu trúc và phân mục học liệu</p>
          </div>
        </div>
        <button
          className="group flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-95"
          type="button"
          onClick={() => setShowCreate((s) => !s)}
        >
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? 'Hủy' : 'Thêm Chương mới'}
        </button>
      </div>

      {showCreate && <ChapterCreateForm onCreate={handleCreate} />}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoaderCircle className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-sm font-semibold text-slate-500">Đang tải danh sách chương...</span>
        </div>
      ) : chapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="mb-4 h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-black text-slate-700">Chưa có chương học nào</h3>
          <p className="mt-1 text-sm font-medium text-slate-400 max-w-xs">Bắt đầu bằng cách tạo một chương học mới ở nút phía trên.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chapters.map((c) => (
            <div
              key={c.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-slate-100 bg-white p-6 transition-all duration-300 hover:border-indigo-100 hover:shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-black text-lg text-slate-800 line-clamp-1 group-hover:text-indigo-950 transition-colors">
                      {c.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {c.gradeLevel && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700 border border-blue-200/50">
                          <GraduationCap className="h-3 w-3" /> Lớp {c.gradeLevel}
                        </span>
                      )}
                      {c.needPurchase && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 border border-amber-200/50">
                          <Crown className="h-3 w-3" /> Premium
                        </span>
                      )}
                      {!c.published && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-200">
                          Nháp
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <FileText className="h-3.5 w-3.5 text-indigo-500" /> {c.lessonCount || 0} bài
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-4 line-clamp-3 leading-relaxed">
                  {c.description || 'Chưa có mô tả cho chương này.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
                  onClick={() => viewChapterDetails(c.id)}
                >
                  <BookOpen className="h-3.5 w-3.5" /> Xem Bài học
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => openChapterEditor(c.id)}
                    title="Chỉnh sửa"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-rose-100 text-rose-600 shadow-sm hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    onClick={() => openDeleteConfirm(c)}
                    title="Xóa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
                  Bạn sắp xóa chương "{deleteTarget.title}" cùng toàn bộ bài học bên trong. Hành động này không thể hoàn tác.
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
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 p-6 bg-slate-50/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">Tên chương</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Chương 1: Ôn tập hóa học 8..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-indigo-500 bg-white shadow-sm"
            required
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả ngắn gọn về chương này..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-indigo-500 bg-white shadow-sm"
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Lớp</label>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value={6}>Lớp 6</option>
            <option value={7}>Lớp 7</option>
            <option value={8}>Lớp 8</option>
            <option value={9}>Lớp 9</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
            <input
              type="checkbox"
              checked={needPurchase}
              onChange={(e) => setNeedPurchase(e.target.checked)}
              className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span className="text-sm font-bold text-slate-700">Yêu cầu trả phí (Premium) 💎</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button
          className="rounded-xl bg-indigo-600 text-white px-6 py-2.5 text-sm font-bold hover:bg-indigo-700 shadow-md transition-colors"
          type="submit"
          disabled={saving}
        >
          {saving ? 'Đang tạo...' : 'Tạo chương mới'}
        </button>
      </div>
    </form>
  );
};

export default AdminStudyZoneTab;
