import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import {
  getAdminChapter,
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

        if (isChapter) {
          const entity = await getAdminChapter(entityId);
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
          const entity = await getAdminLesson(entityId);
          setLesson(entity || null);
          if (entity?.chapterId) {
            const chap = await getAdminChapter(entity.chapterId);
            setChapter(chap || null);
          }
        }
      } catch (err) {
        setError(err?.response?.data?.message || `Không thể tải thông tin ${isChapter ? 'chương học' : 'bài học'}.`);
      } finally {
        setLoading(false);
      }
    };

    if (entityId) {
      load();
    }
  }, [entityId, isChapter]);

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
      navigate(`/admin/study/chapter/${entityId}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể lưu thay đổi chương học.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (isChapter) {
      navigate(`/admin/study/chapter/${entityId}`);
    } else if (lesson?.chapterId) {
      navigate(`/admin/study/chapter/${lesson.chapterId}`);
    } else {
      navigate('/admin/study');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50/50 min-h-screen p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 bg-white rounded-3xl border border-slate-200 p-6 text-sm font-semibold text-slate-500 shadow-sm">
          <LoaderCircle className="h-4 w-4 animate-spin text-indigo-600" /> Đang tải thông tin...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="group flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-95 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              {isChapter ? 'Chương học' : `Chương học: ${chapter?.title || 'Bài học'}`}
            </h2>
            <h1 className="text-2xl font-black text-slate-800">
              {isChapter ? 'Chỉnh sửa Chương học' : 'Chỉnh sửa Bài học'}
            </h1>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Editor Container */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-xl shadow-slate-200/20">
          {isChapter ? (
            <form onSubmit={handleChapterSave} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Tiêu đề chương</label>
                <input
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-indigo-500 bg-white shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Mô tả</label>
                <textarea
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-indigo-500 bg-white shadow-sm"
                  placeholder="Mô tả ngắn cho giáo viên và học sinh"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Lớp</label>
                  <select
                    value={chapterForm.gradeLevel}
                    onChange={(e) => setChapterForm({ ...chapterForm, gradeLevel: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white outline-none focus:border-indigo-500 shadow-sm"
                  >
                    <option value={6}>Lớp 6</option>
                    <option value={7}>Lớp 7</option>
                    <option value={8}>Lớp 8</option>
                    <option value={9}>Lớp 9</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min={0}
                    value={chapterForm.orderIndex}
                    onChange={(e) => setChapterForm({ ...chapterForm, orderIndex: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-indigo-500 bg-white shadow-sm"
                  />
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm bg-white">
                  <input
                    type="checkbox"
                    checked={chapterForm.published}
                    onChange={(e) => setChapterForm({ ...chapterForm, published: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Đã xuất bản
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm bg-white">
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
                  onClick={handleBack}
                  className="rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <AdminLessonEditor
                key={lesson?.id || entityId}
                chapterId={lesson?.chapterId}
                existing={lesson}
                onSaved={(savedLesson) => navigate(`/admin/study/chapter/${savedLesson?.chapterId || lesson?.chapterId}`)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStudyEditPage;
