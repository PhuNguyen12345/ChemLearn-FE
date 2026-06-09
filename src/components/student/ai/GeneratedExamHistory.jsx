import React, { useEffect, useState } from 'react';
import { ChevronRight, Clock, FileText, LoaderCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getGeneratedAiExam, getGeneratedAiExams } from '@/lib/api';

const EXAM_TYPE_LABELS = {
  QUIZ_15_MIN: '15 phút',
  FORTY_FIVE_MINUTES: '45 phút',
  MIDTERM: 'Giữa kỳ',
  FINAL: 'Cuối kỳ',
};

const DIFFICULTY_LABELS = {
  EASY: 'Dễ',
  MEDIUM: 'Vừa',
  HARD: 'Khó',
  MIXED: 'Trộn',
};

const formatDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const GeneratedExamHistory = ({ studentId, refreshKey, onExamSelected }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openingId, setOpeningId] = useState(null);

  const loadHistory = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const data = await getGeneratedAiExams(studentId);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không tải được danh sách đề đã tạo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [studentId, refreshKey]);

  const openExam = async (examId) => {
    setOpeningId(examId);
    try {
      const data = await getGeneratedAiExam(examId);
      onExamSelected?.(data);
      toast.success('Đã mở lại đề ôn tập.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không mở được đề đã tạo.');
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-black text-slate-900">Đề đã tạo</h2>
        </div>
        <button
          type="button"
          onClick={loadHistory}
          disabled={loading}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
          title="Tải lại"
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openExam(item.id)}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-800">{item.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                <span>{item.topic}</span>
                <span>{EXAM_TYPE_LABELS[item.examType] || item.examType}</span>
                <span>{DIFFICULTY_LABELS[item.difficulty] || item.difficulty}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </div>
            {openingId === item.id ? (
              <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-indigo-500" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            )}
          </button>
        ))}

        {!loading && items.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm font-semibold text-slate-400">
            Chưa có đề nào được tạo.
          </div>
        )}
      </div>
    </section>
  );
};

export default GeneratedExamHistory;
