import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import {
  getAdminChapter,
  getAdminChapters,
  getAdminLesson,
  updateAdminChapter,
} from '../../lib/api';
import AdminLessonEditor from '../../components/admin/study/AdminLessonEditor';

const AdminStudyEditPage = () => {
  const navigate = useNavigate();
  const { entityType, entityId } = useParams();
  const isChapter = entityType === 'chapter';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [chapters, setChapters] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: '',
    orderIndex: 0,
    published: true,
    gradeLevel: 6,
    needPurchase: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const [chapterList, entity] = await Promise.all([
          getAdminChapters(),
          isChapter ? getAdminChapter(entityId) : getAdminLesson(entityId),
        ]);

        setChapters(chapterList || []);

        if (isChapter) {
          setChapter(entity || null);
          setChapterForm({
            title: entity?.title || '',
            description: entity?.description || '',
            orderIndex: entity?.orderIndex ?? entity?.displayOrder ?? 0,
            published: entity?.published ?? true,
            gradeLevel: entity?.gradeLevel ?? 6,
            needPurchase: entity?.needPurchase ?? false,
          });
        } else {
          setLesson(entity || null);
        }
      } catch (err) {
        setError(err?.response?.data?.message || `Failed to load ${isChapter ? 'chapter' : 'lesson'} details.`);
      } finally {
        setLoading(false);
      }
    };

    if (entityId) {
      load();
    }
  }, [entityId, isChapter]);

  const selectedChapter = useMemo(() => {
    if (isChapter) return chapter;
    if (!lesson) return null;
    return chapters.find((item) => String(item.id) === String(lesson.chapterId)) || null;
  }, [chapters, chapter, isChapter, lesson]);

  const handleChapterSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        title: chapterForm.title.trim(),
        description: chapterForm.description.trim(),
        orderIndex: Number.isFinite(Number(chapterForm.orderIndex)) ? Number(chapterForm.orderIndex) : 0,
        published: chapterForm.published,
        gradeLevel: chapterForm.gradeLevel,
        needPurchase: chapterForm.needPurchase,
      };

      await updateAdminChapter(entityId, payload);
      navigate('/admin/study');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save chapter.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">
        <LoaderCircle className="h-4 w-4 animate-spin" /> Đang tải...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate('/admin/study')}
          className="group flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        </button>
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">Quay lại Study Zone</h2>
          <p className="text-xs font-semibold text-slate-500">Trình biên tập nội dung Admin</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <aside className="space-y-6 rounded-[2.5rem] border border-slate-200/60 bg-white/60 backdrop-blur-xl p-8 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 mb-4 border border-indigo-100/50">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Admin Editor</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {isChapter ? 'Cập nhật Chương' : 'Cập nhật Bài học'}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {selectedChapter?.title ? `Đang chỉnh sửa: ${selectedChapter.title}` : 'Chọn nội dung ở danh sách bên dưới để bắt đầu.'}
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              Các chương hiện tại
            </h3>
            <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {chapters.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/admin/study/chapter/${item.id}/edit`)}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-300 ${
                    item.id === selectedChapter?.id
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-100/50'
                      : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm'
                  }`}
                >
                  <div className={`font-black text-base transition-colors ${item.id === selectedChapter?.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {item.title}
                  </div>
                  <div className="mt-1.5 text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description || 'Chưa có mô tả cho chương này.'}
                  </div>
                </button>
              ))}
              {!chapters.length && (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm font-medium text-slate-500">
                  Chưa có dữ liệu chương học.
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/20">
          {isChapter ? (
            <form onSubmit={handleChapterSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tiêu đề</label>
                <input
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
                <textarea
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Mô tả ngắn cho giáo viên và học sinh"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Lớp</label>
                  <select
                    value={chapterForm.gradeLevel}
                    onChange={(e) => setChapterForm({ ...chapterForm, gradeLevel: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value={6}>Lớp 6</option>
                    <option value={7}>Lớp 7</option>
                    <option value={8}>Lớp 8</option>
                    <option value={9}>Lớp 9</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min={0}
                    value={chapterForm.orderIndex}
                    onChange={(e) => setChapterForm({ ...chapterForm, orderIndex: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chapterForm.published}
                    onChange={(e) => setChapterForm({ ...chapterForm, published: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Đã xuất bản
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chapterForm.needPurchase}
                    onChange={(e) => setChapterForm({ ...chapterForm, needPurchase: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Yêu cầu trả phí (Premium) 💎
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/admin/study')}
                  className="rounded-2xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Editing lesson</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{lesson?.title || 'Bài học'}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {lesson?.chapterTitle ? `Chương: ${lesson.chapterTitle}` : 'Không có thông tin chương.'}
                </p>
              </div>
              <AdminLessonEditor
                key={lesson?.id || entityId}
                chapterId={lesson?.chapterId || selectedChapter?.id}
                existing={lesson}
                onSaved={() => navigate('/admin/study')}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminStudyEditPage;
