import { useEffect, useMemo, useState } from 'react';
import {
  addQuestionFromBankToQuiz,
  createTeacherQuestionBankItem,
  deleteTeacherQuestionBankItem,
  getTeacherQuestionBank,
  getTeacherQuizzes,
} from '@/lib/api';

const emptyForm = {
  prompt: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
  explanation: '',
};

const TeacherQuestionBank = () => {
  const [bankItems, setBankItems] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [items, quizData] = await Promise.all([
        getTeacherQuestionBank(),
        getTeacherQuizzes(),
      ]);
      setBankItems(items || []);
      setQuizzes(quizData || []);
      if (!selectedQuizId && quizData?.[0]?.id) {
        setSelectedQuizId(String(quizData[0].id));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load question bank data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, pageSize]);

  const filteredBankItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const items = [...bankItems].filter((item) => {
      if (!term) return true;

      const haystack = [
        item.prompt,
        item.optionA,
        item.optionB,
        item.optionC,
        item.optionD,
        item.explanation,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });

    items.sort((left, right) => {
      if (sortBy === 'oldest') return new Date(left.createdAt) - new Date(right.createdAt);
      if (sortBy === 'prompt-desc') return right.prompt.localeCompare(left.prompt);
      if (sortBy === 'prompt-asc') return left.prompt.localeCompare(right.prompt);
      return new Date(right.createdAt) - new Date(left.createdAt);
    });

    return items;
  }, [bankItems, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredBankItems.length / pageSize));
  const pagedBankItems = filteredBankItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await createTeacherQuestionBankItem(form);
      setForm(emptyForm);
      setSuccess('Question added to bank.');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save question in bank.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this bank question?')) return;
    try {
      setSaving(true);
      await deleteTeacherQuestionBankItem(itemId);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete bank question.');
    } finally {
      setSaving(false);
    }
  };

  const handleUseInQuiz = async (bankQuestionId) => {
    if (!selectedQuizId) {
      setError('Please select a target quiz first.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await addQuestionFromBankToQuiz(selectedQuizId, bankQuestionId);
      setSuccess('Question copied into selected quiz.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add question to quiz.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Question Bank</h1>
        <p className="text-slate-500 mt-1">Save reusable multiple-choice questions and insert them into quizzes anytime.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid grid-cols-1 gap-3 lg:grid-cols-3">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search questions or options..."
          className="rounded-lg border border-slate-200 px-3 py-2"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="prompt-asc">Prompt A-Z</option>
          <option value="prompt-desc">Prompt Z-A</option>
        </select>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="rounded-lg border border-slate-200 px-3 py-2"
        >
          <option value={4}>4 per page</option>
          <option value={6}>6 per page</option>
          <option value={8}>8 per page</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Create Bank Question</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <textarea
              value={form.prompt}
              onChange={(e) => setForm((prev) => ({ ...prev, prompt: e.target.value }))}
              placeholder="Question prompt"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 min-h-24"
              required
            />
            <input value={form.optionA} onChange={(e) => setForm((prev) => ({ ...prev, optionA: e.target.value }))} placeholder="Option A" className="w-full rounded-lg border border-slate-200 px-3 py-2" required />
            <input value={form.optionB} onChange={(e) => setForm((prev) => ({ ...prev, optionB: e.target.value }))} placeholder="Option B" className="w-full rounded-lg border border-slate-200 px-3 py-2" required />
            <input value={form.optionC} onChange={(e) => setForm((prev) => ({ ...prev, optionC: e.target.value }))} placeholder="Option C" className="w-full rounded-lg border border-slate-200 px-3 py-2" required />
            <input value={form.optionD} onChange={(e) => setForm((prev) => ({ ...prev, optionD: e.target.value }))} placeholder="Option D" className="w-full rounded-lg border border-slate-200 px-3 py-2" required />
            <div className="flex items-center gap-3">
              <select
                value={form.correctOption}
                onChange={(e) => setForm((prev) => ({ ...prev, correctOption: e.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="A">Correct: A</option>
                <option value="B">Correct: B</option>
                <option value="C">Correct: C</option>
                <option value="D">Correct: D</option>
              </select>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save to Bank'}
              </button>
            </div>
            <textarea
              value={form.explanation}
              onChange={(e) => setForm((prev) => ({ ...prev, explanation: e.target.value }))}
              placeholder="Explanation (optional)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 min-h-20"
            />
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-slate-800">Bank Library</h2>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select quiz to import into</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-slate-500 font-semibold">Loading question bank...</p>
          ) : (
            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {pagedBankItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-800">{item.prompt}</p>
                  <p className="text-xs text-slate-500 mt-1">Correct: {item.correctOption}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleUseInQuiz(item.id)}
                      disabled={saving || !selectedQuizId}
                      className="rounded-md bg-cyan-600 px-3 py-1 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      Use in Selected Quiz
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={saving}
                      className="rounded-md border border-rose-300 px-3 py-1 text-rose-600 text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {!filteredBankItems.length && (
                <p className="text-slate-500 font-semibold">No saved bank questions yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {filteredBankItems.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredBankItems.length)}-
            {Math.min(currentPage * pageSize, filteredBankItems.length)} of {filteredBankItems.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm font-semibold text-slate-600">Page {currentPage} / {totalPages}</span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuestionBank;