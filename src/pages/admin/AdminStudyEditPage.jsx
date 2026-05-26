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
            orderIndex: entity?.orderIndex ?? 0,
            published: entity?.published ?? true,
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
        displayOrder: Number.isFinite(Number(chapterForm.orderIndex)) ? Number(chapterForm.orderIndex) : 0,
        published: chapterForm.published,
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
    <div className="space-y-6 p-6">
      <button
        onClick={() => navigate('/admin/study')}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </button>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-indigo-500">Admin editor</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              {isChapter ? 'Chỉnh sửa chương' : 'Chỉnh sửa bài học'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {selectedChapter?.title ? `Chỉnh sửa ${selectedChapter.title}` : 'Chọn nội dung bạn muốn cập nhật.'}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Các chương có sẵn</p>
            <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {chapters.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <div className="font-bold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.description || 'No description yet.'}</div>
                </div>
              ))}
              {!chapters.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Không có sẵn chương.
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
              <div className="grid gap-4 md:grid-cols-3">
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
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={chapterForm.published}
                    onChange={(e) => setChapterForm({ ...chapterForm, published: e.target.checked })}
                  />
                  Đã xuất bản
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin/study')}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu chương'}
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