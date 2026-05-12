import { useEffect, useMemo, useState } from 'react';
import {
  addQuestionFromBankToQuiz,
  createTeacherQuestionBankItem,
  deleteTeacherQuestionBankItem,
  getTeacherQuestionBank,
  getTeacherQuizzes,
  getTeacherClasses,
  updateTeacherQuestionBankItem,
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
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
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
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingForm, setEditingForm] = useState(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [items, quizData, classesData] = await Promise.all([
        getTeacherQuestionBank(),
        getTeacherQuizzes(),
        getTeacherClasses(),
      ]);
      setBankItems(items || []);
      setQuizzes(quizData || []);
      setClasses(classesData || []);
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
  const bankCount = bankItems.length;

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

  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditingForm({
      prompt: item.prompt || '',
      optionA: item.optionA || '',
      optionB: item.optionB || '',
      optionC: item.optionC || '',
      optionD: item.optionD || '',
      correctOption: item.correctOption || 'A',
      explanation: item.explanation || '',
    });
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingForm(emptyForm);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingItemId) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await updateTeacherQuestionBankItem(editingItemId, editingForm);
      setSuccess('Question updated.');
      setEditingItemId(null);
      setEditingForm(emptyForm);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update question.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 bg-slate-50/70 p-8 pt-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Teacher toolkit
            </p>
            <h1 className="text-3xl font-black tracking-tight lg:text-4xl">
              Question Bank
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-slate-300">Saved questions</p>
              <p className="mt-1 text-2xl font-black text-white">{bankCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-slate-300">Quizzes available</p>
              <p className="mt-1 text-2xl font-black text-white">
                {quizzes.length}
              </p>
            </div>
          </div>
        </div>
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

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Create a new question
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[620px]">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions or options..."
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="prompt-asc">Prompt A-Z</option>
              <option value="prompt-desc">Prompt Z-A</option>
            </select>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
            >
              <option value={4}>4 per page</option>
              <option value={6}>6 per page</option>
              <option value={8}>8 per page</option>
            </select>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-inner shadow-slate-100"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center mb-4">
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            >
              <option value="">Select quiz to import into</option>
              {quizzes
                .filter(
                  (q) =>
                    !selectedClassId ||
                    String(q.studyClassId) === String(selectedClassId),
                )
                .map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
            </select>

            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            >
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            <textarea
              value={form.prompt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, prompt: e.target.value }))
              }
              placeholder="Type the new question here..."
              className="w-full min-h-28 rounded-2xl border border-dashed border-cyan-300 bg-white px-4 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500"
              required
            />

            <textarea
              value={form.explanation}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, explanation: e.target.value }))
              }
              placeholder="Explanation (optional)"
              className="w-full min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={form.optionA}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, optionA: e.target.value }))
                }
                placeholder="Option A"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
              <input
                value={form.optionB}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, optionB: e.target.value }))
                }
                placeholder="Option B"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
              <input
                value={form.optionC}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, optionC: e.target.value }))
                }
                placeholder="Option C"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
              <input
                value={form.optionD}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, optionD: e.target.value }))
                }
                placeholder="Option D"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="text-sm font-semibold text-slate-600">
                  Correct answer
                </label>
                <select
                  value={form.correctOption}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      correctOption: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save question"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Saved questions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Browse and reuse any question card from the library below.
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            {filteredBankItems.length} result
            {filteredBankItems.length === 1 ? "" : "s"}
          </p>
        </div>

        {loading ? (
          <p className="text-slate-500 font-semibold">
            Loading question bank...
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              {pagedBankItems.map((item, index) => (
                <article
                  key={item.id}
                  className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-white hover:shadow-lg"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                        Question {index + 1 + (currentPage - 1) * pageSize}
                      </p>
                      {editingItemId === item.id ? (
                        <textarea
                          value={editingForm.prompt}
                          onChange={(e) =>
                            setEditingForm((prev) => ({
                              ...prev,
                              prompt: e.target.value,
                            }))
                          }
                          className="mt-2 min-h-20 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-semibold text-slate-900 outline-none focus:border-cyan-400"
                          required
                        />
                      ) : (
                        <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900">
                          {item.prompt}
                        </h3>
                      )}
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      Answer {item.correctOption}
                    </span>
                  </div>

                  {editingItemId === item.id ? (
                    <form onSubmit={handleUpdate} className="space-y-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {[
                          ["A", "optionA"],
                          ["B", "optionB"],
                          ["C", "optionC"],
                          ["D", "optionD"],
                        ].map(([label, key]) => (
                          <div
                            key={label}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <label className="mb-1 block font-semibold text-slate-600">
                              {label}.
                            </label>
                            <input
                              value={editingForm[key]}
                              onChange={(e) =>
                                setEditingForm((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-cyan-400"
                              required
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <label className="text-sm font-semibold text-slate-600">
                          Correct answer
                        </label>
                        <select
                          value={editingForm.correctOption}
                          onChange={(e) =>
                            setEditingForm((prev) => ({
                              ...prev,
                              correctOption: e.target.value,
                            }))
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-400"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>

                      <textarea
                        value={editingForm.explanation}
                        onChange={(e) =>
                          setEditingForm((prev) => ({
                            ...prev,
                            explanation: e.target.value,
                          }))
                        }
                        placeholder="Explanation (optional)"
                        className="w-full min-h-20 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-400"
                      />

                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save changes"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={saving}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {[
                          ["A", item.optionA],
                          ["B", item.optionB],
                          ["C", item.optionC],
                          ["D", item.optionD],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className={`rounded-2xl border px-3 py-2 text-sm ${item.correctOption === label ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"}`}
                          >
                            <span className="mr-2 font-bold">{label}.</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>

                      {item.explanation && (
                        <p className="mt-4 rounded-2xl bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
                          {item.explanation}
                        </p>
                      )}
                    </>
                  )}

                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "Recently added"}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(item)}
                        disabled={saving}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUseInQuiz(item.id)}
                        disabled={saving || !selectedQuizId}
                        className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add to quiz
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={saving}
                        className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {!filteredBankItems.length && (
                <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                  <p className="text-base font-semibold text-slate-700">
                    No saved bank questions yet.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Use the blank question card above to create the first one.
                  </p>
                </div>
              )}
            </div>

            {filteredBankItems.length > 0 && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-600">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * pageSize + 1,
                    filteredBankItems.length,
                  )}
                  -{Math.min(currentPage * pageSize, filteredBankItems.length)}{" "}
                  of {filteredBankItems.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="text-sm font-semibold text-slate-600">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherQuestionBank;