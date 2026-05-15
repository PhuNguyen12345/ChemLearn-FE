import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addQuestionFromBankToQuiz,
  createTeacherQuestionBankItem,
  deleteTeacherQuestionBankItem,
  getTeacherAssignments,
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
  correctOptions: [],
  questionType: 'SINGLE_CHOICE',
  explanation: '',
  pointValue: 1,
};

const questionTypeLabelMap = {
  SINGLE_CHOICE: 'Single choice',
  MULTIPLE_CHOICE: 'Multiple choice',
  TRUE_FALSE: 'True / False',
  ESSAY: 'Essay',
};

const questionTypeOptions = Object.keys(questionTypeLabelMap);

const TeacherQuestionBank = () => {
  const [bankItems, setBankItems] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCorrectOption, setSelectedCorrectOption] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [targetType, setTargetType] = useState('quiz');
  const [selectedTargetId, setSelectedTargetId] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [items, quizData, classesData, assignmentData] = await Promise.all([
        getTeacherQuestionBank(),
        getTeacherQuizzes(),
        getTeacherClasses(),
        getTeacherAssignments(),
      ]);
      setBankItems(items || []);
      setQuizzes(quizData || []);
      setClasses(classesData || []);
      setAssignments(assignmentData || []);

      if (!selectedTargetId) {
        if (quizData?.[0]?.id) {
          setTargetType('quiz');
          setSelectedTargetId(String(quizData[0].id));
        } else if (assignmentData?.[0]?.id) {
          setTargetType('assignment');
          setSelectedTargetId(String(assignmentData[0].id));
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load question bank data.');
    } finally {
      setLoading(false);
    }
  }, [selectedTargetId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, pageSize, selectedClassId, selectedCorrectOption]);

  useEffect(() => {
    setSelectedQuestionIds([]);
  }, [searchTerm, sortBy, pageSize, selectedClassId, selectedCorrectOption, currentPage]);

  useEffect(() => {
    if (targetType === 'quiz') {
      if (!quizzes.some((quiz) => String(quiz.id) === String(selectedTargetId))) {
        setSelectedTargetId(quizzes[0]?.id ? String(quizzes[0].id) : '');
      }
      return;
    }

    if (!assignments.some((assignment) => String(assignment.id) === String(selectedTargetId))) {
      setSelectedTargetId(assignments[0]?.id ? String(assignments[0].id) : '');
    }
  }, [targetType, quizzes, assignments, selectedTargetId]);

  const extractItemClassId = (item) => {
    const classValue = item.studyClassId ?? item.classId ?? item.studyClass?.id ?? item.classroomId;
    return classValue ? String(classValue) : '';
  };

  const filteredBankItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const items = [...bankItems].filter((item) => {
      const classMatched = !selectedClassId || extractItemClassId(item) === String(selectedClassId);
      if (!classMatched) return false;

      const answerMatched = !selectedCorrectOption || item.correctOption === selectedCorrectOption;
      if (!answerMatched) return false;

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
      if (sortBy === 'oldest') return new Date(left.createdAt || 0) - new Date(right.createdAt || 0);
      if (sortBy === 'prompt-desc') return right.prompt.localeCompare(left.prompt);
      if (sortBy === 'prompt-asc') return left.prompt.localeCompare(right.prompt);
      return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
    });

    return items;
  }, [bankItems, searchTerm, sortBy, selectedClassId, selectedCorrectOption]);

  const totalPages = Math.max(1, Math.ceil(filteredBankItems.length / pageSize));
  const pagedBankItems = filteredBankItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const allVisibleSelected =
    pagedBankItems.length > 0 && pagedBankItems.every((item) => selectedQuestionIds.includes(item.id));

  const selectedCount = selectedQuestionIds.length;

  const activeTargetOptions = targetType === 'quiz' ? quizzes : assignments;

  const targetQuizId = useMemo(() => {
    if (targetType === 'quiz') return selectedTargetId;

    const assignment = assignments.find((item) => String(item.id) === String(selectedTargetId));
    return assignment?.quizId ? String(assignment.quizId) : '';
  }, [targetType, selectedTargetId, assignments]);

  const openCreateModal = () => {
    setEditingItemId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItemId(item.id);
    setForm({
      prompt: item.prompt || '',
      optionA: item.optionA || '',
      optionB: item.optionB || '',
      optionC: item.optionC || '',
      optionD: item.optionD || '',
      correctOption: item.correctOption || 'A',
      correctOptions: item.correctOption && item.questionType === 'MULTIPLE_CHOICE' ? item.correctOption.split(',') : (item.correctOptions || (item.correctOption ? [item.correctOption] : [])),
      questionType: item.questionType || 'SINGLE_CHOICE',
      explanation: item.explanation || '',
      pointValue: item.pointValue ?? 1,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItemId(null);
    setForm(emptyForm);
  };

  const openImportModal = () => {
    if (!selectedQuestionIds.length) {
      setError('Select at least one question using the checkboxes.');
      return;
    }

    setError('');
    setSuccess('');
    setShowImportModal(true);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
  };

  const handleSaveQuestion = async (event) => {
    event.preventDefault();

    if (!form.prompt.trim()) {
      setError('Question text is required.');
      return;
    }

    // Validate according to question type rules
    if (form.questionType === 'SINGLE_CHOICE') {
      if (!['A', 'B', 'C', 'D'].includes(form.correctOption)) {
        setError('Single choice requires exactly one correct option (A-D).');
        return;
      }
    }

    if (form.questionType === 'MULTIPLE_CHOICE') {
      if (!Array.isArray(form.correctOptions) || form.correctOptions.length < 2) {
        setError('Multiple choice requires two or more correct answers.');
        return;
      }
    }

    if (form.questionType === 'TRUE_FALSE') {
      // ensure option A/B represent True/False and exactly one correct among them
      const correct = form.correctOptions && form.correctOptions.length ? form.correctOptions : form.correctOption ? [form.correctOption] : [];
      if (correct.length !== 1 || !['A', 'B'].includes(correct[0])) {
        setError('True/False requires exactly one correct answer: A (True) or B (False).');
        return;
      }
    }

    if (form.questionType === 'ESSAY') {
      // require a paragraph prompt for essay
      if (form.prompt.trim().length < 20) {
        setError('Essay prompt should be a paragraph (longer than 20 characters).');
        return;
      }
    }

    const pointValue = Number(form.pointValue);
    if (!Number.isFinite(pointValue) || pointValue <= 0) {
      setError('Point value must be greater than 0.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (editingItemId) {
        // Map to backend-friendly payload
        const payload = { ...form };
        if (form.questionType === 'MULTIPLE_CHOICE') {
          payload.correctOption = form.correctOptions ? form.correctOptions.join(',') : 'A';
          delete payload.correctOptions;
        }
        if (form.questionType === 'ESSAY') {
          // backend DTO doesn't support essay fields; keep options non-blank placeholders
          payload.optionA = payload.optionA || 'N/A';
          payload.optionB = payload.optionB || 'N/A';
          payload.optionC = payload.optionC || 'N/A';
          payload.optionD = payload.optionD || 'N/A';
          delete payload.correctOptions;
          delete payload.correctOption;
        }
        payload.pointValue = pointValue;

        await updateTeacherQuestionBankItem(editingItemId, payload);
        setSuccess('Question updated.');
      } else {
        const payload = { ...form };
        if (form.questionType === 'MULTIPLE_CHOICE') {
          payload.correctOption = form.correctOptions ? form.correctOptions.join(',') : 'A';
          delete payload.correctOptions;
        }
        if (form.questionType === 'ESSAY') {
          payload.optionA = payload.optionA || 'N/A';
          payload.optionB = payload.optionB || 'N/A';
          payload.optionC = payload.optionC || 'N/A';
          payload.optionD = payload.optionD || 'N/A';
          delete payload.correctOptions;
          delete payload.correctOption;
        }
        payload.pointValue = pointValue;

        await createTeacherQuestionBankItem(payload);
        setSuccess('Question added to bank.');
      }

      closeModal();
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save question.');
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

  const toggleSelectRow = (itemId) => {
    setSelectedQuestionIds((previous) => {
      if (previous.includes(itemId)) {
        return previous.filter((id) => id !== itemId);
      }

      return [...previous, itemId];
    });
  };

  const toggleSelectVisible = () => {
    const visibleIds = pagedBankItems.map((item) => item.id);

    setSelectedQuestionIds((previous) => {
      if (allVisibleSelected) {
        return previous.filter((id) => !visibleIds.includes(id));
      }

      const next = new Set(previous);
      visibleIds.forEach((id) => next.add(id));
      return Array.from(next);
    });
  };

  const handleBulkAdd = async () => {
    if (!selectedQuestionIds.length) {
      setError('Select at least one question using the checkboxes.');
      return;
    }

    if (!selectedTargetId) {
      setError('Please select a target quiz or assignment first.');
      return;
    }

    if (!targetQuizId) {
      setError('Selected assignment is not linked to a quiz yet.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const results = await Promise.allSettled(
        selectedQuestionIds.map((bankQuestionId) => addQuestionFromBankToQuiz(targetQuizId, bankQuestionId)),
      );

      const successCount = results.filter((result) => result.status === 'fulfilled').length;
      const failedCount = results.length - successCount;

      if (!successCount) {
        setError('Failed to add selected questions to target.');
      } else if (failedCount) {
        setSuccess(`${successCount} question(s) added. ${failedCount} failed.`);
      } else {
        setSuccess(`${successCount} question(s) added successfully.`);
      }

      setSelectedQuestionIds([]);
      setShowImportModal(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add selected questions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 bg-slate-50/70 p-6 pt-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Question Bank</h1>
            <p className="text-sm text-slate-500">Compact list view for quick selection and import</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openImportModal}
              disabled={!selectedCount || saving}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Importing...' : `Import selected (${selectedCount})`}
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add question
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="xl:col-span-2">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search question or options"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
            />
          </div>

          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
          >
            <option value="">All classes</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCorrectOption}
            onChange={(e) => setSelectedCorrectOption(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
          >
            <option value="">Any answer</option>
            <option value="A">Correct A</option>
            <option value="B">Correct B</option>
            <option value="C">Correct C</option>
            <option value="D">Correct D</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="prompt-asc">Question A-Z</option>
            <option value="prompt-desc">Question Z-A</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
          >
            <option value={10}>10 per page</option>
            <option value={15}>15 per page</option>
            <option value={20}>20 per page</option>
          </select>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            Selected: {selectedCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="font-semibold text-slate-700">
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredBankItems.length || 1)}-
              {Math.min(currentPage * pageSize, filteredBankItems.length)} of {filteredBankItems.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <span className="font-semibold text-slate-600">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="w-12 px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectVisible}
                      aria-label="Select all visible questions"
                    />
                  </th>
                  <th className="w-16 px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Question</th>
                  <th className="w-36 px-3 py-2 text-left">Type</th>
                  <th className="w-24 px-3 py-2 text-left">Points</th>
                  <th className="w-28 px-3 py-2 text-left">Correct</th>
                  <th className="w-24 px-3 py-2 text-center">Edit</th>
                  <th className="w-24 px-3 py-2 text-center">Trash</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center font-semibold text-slate-500">
                      Loading question bank...
                    </td>
                  </tr>
                )}

                {!loading && !pagedBankItems.length && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No questions found for this filter.
                    </td>
                  </tr>
                )}

                {!loading &&
                  pagedBankItems.map((item, index) => {
                    const isSelected = selectedQuestionIds.includes(item.id);
                    const rowNumber = index + 1 + (currentPage - 1) * pageSize;

                    return (
                      <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(item.id)}
                            aria-label={`Select question ${rowNumber}`}
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-700">{rowNumber}</td>
                        <td className="max-w-[560px] px-3 py-2 text-slate-800">
                          <p className="truncate" title={item.prompt || ''}>
                            {item.prompt || '-'}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                          {questionTypeLabelMap[String(item.questionType || '').toUpperCase()] || item.questionType || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-semibold text-indigo-700">
                          {Number(item.pointValue ?? 1)} pts
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-semibold text-emerald-700">
                          {item.correctOption || '-'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={saving}
                            className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Trash
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingItemId ? 'Edit question' : 'Add question'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3 px-4 py-4">
              <textarea
                value={form.prompt}
                onChange={(e) => setForm((prev) => ({ ...prev, prompt: e.target.value }))}
                placeholder="Question"
                className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
                required
              />

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  value={form.optionA}
                  onChange={(e) => setForm((prev) => ({ ...prev, optionA: e.target.value }))}
                  placeholder="Option A"
                  className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
                  required={form.questionType !== 'ESSAY'}
                  disabled={form.questionType === 'TRUE_FALSE' || form.questionType === 'ESSAY'}
                />
                <input
                  value={form.optionB}
                  onChange={(e) => setForm((prev) => ({ ...prev, optionB: e.target.value }))}
                  placeholder="Option B"
                  className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
                  required={form.questionType !== 'ESSAY'}
                  disabled={form.questionType === 'TRUE_FALSE' || form.questionType === 'ESSAY'}
                />
                <input
                  value={form.optionC}
                  onChange={(e) => setForm((prev) => ({ ...prev, optionC: e.target.value }))}
                  placeholder="Option C"
                  className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
                  required={form.questionType !== 'ESSAY'}
                  disabled={form.questionType === 'TRUE_FALSE' || form.questionType === 'ESSAY'}
                />
                <input
                  value={form.optionD}
                  onChange={(e) => setForm((prev) => ({ ...prev, optionD: e.target.value }))}
                  placeholder="Option D"
                  className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
                  required={form.questionType !== 'ESSAY'}
                  disabled={form.questionType === 'TRUE_FALSE' || form.questionType === 'ESSAY'}
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[180px,150px,120px,1fr]">
                <select
                  value={form.questionType}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((prev) => {
                      const next = { ...prev, questionType: v };
                      if (v === 'TRUE_FALSE') {
                        next.optionA = 'True';
                        next.optionB = 'False';
                        next.optionC = 'N/A';
                        next.optionD = 'N/A';
                        next.correctOption = 'A';
                        next.correctOptions = ['A'];
                      } else if (v === 'ESSAY') {
                        next.optionA = 'N/A';
                        next.optionB = 'N/A';
                        next.optionC = 'N/A';
                        next.optionD = 'N/A';
                        next.correctOption = '';
                        next.correctOptions = [];
                      } else if (v === 'SINGLE_CHOICE') {
                        // keep existing options but clear multiple selection
                        next.correctOptions = [];
                        if (prev.optionA === 'N/A' && prev.optionB === 'N/A') {
                          next.optionA = '';
                          next.optionB = '';
                          next.optionC = '';
                          next.optionD = '';
                        }
                        next.correctOption = prev.correctOption || 'A';
                      } else if (v === 'MULTIPLE_CHOICE') {
                        next.correctOption = '';
                        next.correctOptions = prev.correctOptions || [];
                      }

                      return next;
                    });
                  }}
                  className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
                >
                  {questionTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {questionTypeLabelMap[type]}
                    </option>
                  ))}
                </select>

                {/* correct selector: single select or multiple checkboxes depending on type */}
                {form.questionType === 'MULTIPLE_CHOICE' ? (
                  <div className="flex items-center gap-2">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <label key={opt} className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Array.isArray(form.correctOptions) && form.correctOptions.includes(opt)}
                          onChange={() =>
                            setForm((prev) => {
                              const next = new Set(prev.correctOptions || []);
                              if (next.has(opt)) next.delete(opt);
                              else next.add(opt);
                              return { ...prev, correctOptions: Array.from(next) };
                            })
                          }
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : form.questionType === 'TRUE_FALSE' ? (
                  <select
                    value={(form.correctOptions && form.correctOptions[0]) || form.correctOption || 'A'}
                    onChange={(e) => setForm((prev) => ({ ...prev, correctOption: e.target.value, correctOptions: [e.target.value] }))}
                    className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
                  >
                    <option value="A">Correct: True (A)</option>
                    <option value="B">Correct: False (B)</option>
                  </select>
                ) : form.questionType === 'ESSAY' ? (
                  <div className="text-sm text-slate-500">Essay - no correct option</div>
                ) : (
                  <select
                    value={form.correctOption}
                    onChange={(e) => setForm((prev) => ({ ...prev, correctOption: e.target.value }))}
                    className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
                  >
                    <option value="A">Correct: A</option>
                    <option value="B">Correct: B</option>
                    <option value="C">Correct: C</option>
                    <option value="D">Correct: D</option>
                  </select>
                )}

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.pointValue}
                  onChange={(e) => setForm((prev) => ({ ...prev, pointValue: e.target.value }))}
                  placeholder="Points"
                  className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
                />

                <input
                  value={form.explanation}
                  onChange={(e) => setForm((prev) => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explanation (optional)"
                  className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItemId ? 'Save changes' : 'Add question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-base font-bold text-slate-900">Import selected questions</h3>
              <button
                type="button"
                onClick={closeImportModal}
                disabled={saving}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 px-4 py-4">
              <p className="text-sm text-slate-600">{selectedCount} question(s) selected.</p>

              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
              >
                <option value="quiz">Import to quiz</option>
                <option value="assignment">Import to assignment</option>
              </select>

              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
              >
                <option value="">{targetType === 'quiz' ? 'Select quiz' : 'Select assignment'}</option>
                {activeTargetOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>

              {targetType === 'assignment' && !targetQuizId && selectedTargetId && (
                <p className="text-xs font-semibold text-rose-600">
                  This assignment has no linked quiz.
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeImportModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkAdd}
                  disabled={saving || !selectedTargetId || !targetQuizId}
                  className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Importing...' : 'Import now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuestionBank;
