import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdminChapter } from '../../lib/api';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import AdminLessonEditor from '../../components/admin/study/AdminLessonEditor';

const AdminLessonCreatePage = () => {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAdminChapter(chapterId);
        setChapter(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Không thể tải thông tin chương học');
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) {
      loadChapter();
    }
  }, [chapterId]);

  const handleSaved = () => {
    navigate(`/admin/study/chapter/${chapterId}`);
  };

  const handleBack = () => {
    navigate(`/admin/study/chapter/${chapterId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50/50 min-h-screen p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 bg-white rounded-3xl border border-slate-200 p-6 text-sm font-semibold text-slate-500 shadow-sm">
          <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600" /> Đang tải thông tin...
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
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Chương học: {chapter?.title}</h2>
            <h1 className="text-2xl font-black text-slate-800">Thêm Bài học mới</h1>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-xl shadow-slate-200/20">
          <AdminLessonEditor
            chapterId={chapterId}
            onSaved={handleSaved}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLessonCreatePage;
