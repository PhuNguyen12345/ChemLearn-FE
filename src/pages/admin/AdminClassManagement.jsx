import { useEffect, useMemo, useState } from 'react';
import {
  createAdminClass,
  deleteAdminClass,
  getAccounts,
  getAdminClasses,
  updateAdminClass,
} from '@/lib/api';
import { BookOpen, ChevronDown, ChevronUp, School, Users } from 'lucide-react';

const emptyForm = {
  name: '',
  schedule: '',
  description: '',
  teacherId: '',
  studentIds: [],
};

const AdminClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingClassId, setEditingClassId] = useState(null);
  const [createOpen, setCreateOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  const teachers = useMemo(() => accounts.filter((acc) => acc.role === 'ROLE_TEACHER'), [accounts]);
  const students = useMemo(() => accounts.filter((acc) => acc.role === 'ROLE_STUDENT'), [accounts]);

  const classCount = classes.length;
  const teacherCount = useMemo(
    () => new Set(classes.map((classRoom) => classRoom.teacher?.id).filter(Boolean)).size,
    [classes]
  );
  const linkedStudentCount = useMemo(
    () => classes.reduce((total, classRoom) => total + (classRoom.students?.length || 0), 0),
    [classes]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const [classData, accountData] = await Promise.all([getAdminClasses(), getAccounts()]);
      setClasses(classData || []);
      setAccounts(accountData || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load class management data.');
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

  const handleStudentToggle = (studentId) => {
    setForm((prev) => {
      const exists = prev.studentIds.includes(studentId);
      return {
        ...prev,
        studentIds: exists ? prev.studentIds.filter((id) => id !== studentId) : [...prev.studentIds, studentId],
      };
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingClassId(null);
  };

  const handleEdit = (classRoom) => {
    setEditingClassId(classRoom.id);
    setCreateOpen(true);
    setSuccess('');
    setForm({
      name: classRoom.name || '',
      schedule: classRoom.schedule || '',
      description: classRoom.description || '',
      teacherId: classRoom.teacher?.id ? String(classRoom.teacher.id) : '',
      studentIds: (classRoom.students || []).map((student) => student.id),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        ...form,
        teacherId: form.teacherId || null,
      };

      if (editingClassId) {
        await updateAdminClass(editingClassId, payload);
        setSuccess('Class updated successfully.');
      } else {
        await createAdminClass(payload);
        setSuccess('Class created successfully.');
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save class.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Delete this class?')) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await deleteAdminClass(classId);
      await loadData();
      if (editingClassId === classId) resetForm();
      setSuccess('Class deleted.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete class.');
    } finally {
      setSaving(false);
    }
  };

  const filteredClasses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const items = [...classes].filter((classRoom) => {
      if (!term) return true;

      const studentNames = (classRoom.students || []).map((student) => student.username).join(' ');
      const teacherName = classRoom.teacher?.username || '';
      const haystack = [classRoom.name, classRoom.schedule, classRoom.description, teacherName, studentNames]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });

    items.sort((left, right) => {
      if (sortBy === 'name-desc') return right.name.localeCompare(left.name);
      if (sortBy === 'students-desc') return (right.students?.length || 0) - (left.students?.length || 0);
      if (sortBy === 'students-asc') return (left.students?.length || 0) - (right.students?.length || 0);
      return left.name.localeCompare(right.name);
    });

    return items;
  }, [classes, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / pageSize));
  const pagedClasses = filteredClasses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Class Management</h1>
              <p className="mt-1 text-sm text-slate-500">Create classes, assign teachers, and enroll students.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{classCount} classes</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{teacherCount} teachers</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{linkedStudentCount} enrollments</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              {createOpen ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
              {createOpen && !editingClassId ? 'Close create form' : 'Create class'}
            </button>

            {editingClassId && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Editing existing class</span>}
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
            {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{success}</div>}

            {createOpen && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{editingClassId ? 'Edit class' : 'New class'}</h2>
                    <p className="text-xs text-slate-500">Admin can assign a teacher and enroll existing students.</p>
                  </div>
                  {editingClassId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      Cancel edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Class name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                      required
                    />
                    <input
                      value={form.schedule}
                      onChange={(e) => setForm((prev) => ({ ...prev, schedule: e.target.value }))}
                      placeholder="Schedule"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Description"
                      className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white md:col-span-2"
                    />
                    <select
                      value={form.teacherId}
                      onChange={(e) => setForm((prev) => ({ ...prev, teacherId: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white md:col-span-2"
                    >
                      <option value="">Unassigned teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.username} ({teacher.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Enroll students</p>
                    </div>

                    <div className="grid max-h-52 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                      {students.map((student) => (
                        <label key={student.id} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={form.studentIds.includes(student.id)}
                            onChange={() => handleStudentToggle(student.id)}
                          />
                          <span className="truncate">{student.username} ({student.email})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : editingClassId ? 'Update class' : 'Create class'}
                    </button>
                    {!editingClassId && createOpen && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-secondary px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Classes</h2>
                  <p className="text-xs text-slate-500">Manage ownership, teachers, and student enrollment.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Page {currentPage} / {totalPages}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-white p-4 md:grid-cols-3">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search classes, teachers, students..."
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                >
                  <option value="name-asc">Sort by name A-Z</option>
                  <option value="name-desc">Sort by name Z-A</option>
                  <option value="students-desc">Most students first</option>
                  <option value="students-asc">Fewest students first</option>
                </select>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                >
                  <option value={4}>4 per page</option>
                  <option value={6}>6 per page</option>
                  <option value={8}>8 per page</option>
                </select>
              </div>

              {loading ? (
                <div className="p-6 text-sm font-semibold text-slate-500">Loading classes...</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pagedClasses.map((classRoom) => (
                    <div key={classRoom.id} className="p-5 transition hover:bg-slate-50/80">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">{classRoom.name}</h3>
                            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-indigo-700">
                              {classRoom.classCode || '------'}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-slate-600">
                              {classRoom.students?.length || 0} students
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">{classRoom.schedule || 'No schedule set'}</p>
                          <p className="mt-1 text-sm text-slate-600">{classRoom.description || 'No description provided.'}</p>
                          <p className="mt-2 text-xs text-slate-400">
                            Teacher: {classRoom.teacher ? `${classRoom.teacher.username} (${classRoom.teacher.email})` : 'Unassigned'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={() => handleEdit(classRoom)}
                            className="rounded-full border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(classRoom.id)}
                            className="rounded-full border border-rose-300 px-3.5 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="rounded-full bg-slate-100 px-3 py-1">Students: {(classRoom.students || []).length}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">Schedule: {classRoom.schedule || 'None'}</span>
                      </div>
                    </div>
                  ))}

                  {!filteredClasses.length && <div className="p-6 text-sm font-semibold text-slate-500">No classes yet.</div>}
                </div>
              )}
            </div>

            {filteredClasses.length > 0 && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-600">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, filteredClasses.length)}-
                  {Math.min(currentPage * pageSize, filteredClasses.length)} of {filteredClasses.length}
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

          <aside className="space-y-4 self-start lg:sticky lg:top-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Quick Stats</p>
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl bg-indigo-50 p-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-600"><BookOpen className="h-4 w-4" /> Classes</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{classCount}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700"><School className="h-4 w-4" /> Teachers</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{teacherCount}</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-700"><Users className="h-4 w-4" /> Enrollments</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{linkedStudentCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Search & Filter</p>
              <div className="mt-3 space-y-3">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search classes..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                >
                  <option value="name-asc">Sort by name A-Z</option>
                  <option value="name-desc">Sort by name Z-A</option>
                  <option value="students-desc">Most students first</option>
                  <option value="students-asc">Fewest students first</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSortBy('name-asc');
                    setPageSize(6);
                  }}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminClassManagement;
