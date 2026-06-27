import React, { useState } from 'react';
import { FilePlus2, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generateAiExam } from '@/lib/api';

const EXAM_TYPES = [
  { value: 'QUIZ_15_MIN', label: '15 phút' },
  { value: 'FORTY_FIVE_MINUTES', label: '45 phút' },
  { value: 'MIDTERM', label: 'Giữa kỳ' },
  { value: 'FINAL', label: 'Cuối kỳ' },
];

const DIFFICULTIES = [
  { value: 'EASY', label: 'Dễ' },
  { value: 'MEDIUM', label: 'Vừa' },
  { value: 'HARD', label: 'Khó' },
  { value: 'MIXED', label: 'Trộn' },
];

const GenerateExamForm = ({ studentId, context, onExamGenerated }) => {
  const [form, setForm] = useState({
    examType: 'FORTY_FIVE_MINUTES',
    difficulty: 'MIXED',
    topic: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!studentId) {
      toast.error('Không tìm thấy thông tin học sinh.');
      return;
    }
    if (!form.topic.trim()) {
      toast.error('Vui lòng nhập chủ đề đề ôn tập.');
      return;
    }

    setLoading(true);
    try {
      const data = await generateAiExam({
        studentId,
        grade: Number(context.grade),
        bookType: context.bookType,
        examType: form.examType,
        topic: form.topic.trim(),
        difficulty: form.difficulty,
      });
      onExamGenerated?.(data);
      toast.success('Đã tạo đề ôn tập.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không tạo được đề ôn tập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loại đề</span>
          <select
            value={form.examType}
            onChange={(event) => handleChange('examType', event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            {EXAM_TYPES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Độ khó</span>
          <select
            value={form.difficulty}
            onChange={(event) => handleChange('difficulty', event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            {DIFFICULTIES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 xl:col-span-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Chủ đề</span>
          <input
            value={form.topic}
            onChange={(event) => handleChange('topic', event.target.value)}
            placeholder="Ví dụ: Sắt, phản ứng hóa học, axit HCl..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
        Tạo đề
      </button>
    </form>
  );
};

export default GenerateExamForm;
