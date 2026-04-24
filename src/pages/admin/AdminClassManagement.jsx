import { useEffect, useMemo, useState } from 'react';
import {
  createAdminClass,
  deleteAdminClass,
  getAccounts,
  getAdminClasses,
  updateAdminClass,
} from '@/lib/api';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  const teachers = useMemo(
    () => accounts.filter((acc) => acc.role === 'ROLE_TEACHER'),
    [accounts]
  );

  const students = useMemo(
    () => accounts.filter((acc) => acc.role === 'ROLE_STUDENT'),
    [accounts]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [classData, accountData] = await Promise.all([
        getAdminClasses(),
        getAccounts(),
      ]);
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
        studentIds: exists
          ? prev.studentIds.filter((id) => id !== studentId)
          : [...prev.studentIds, studentId],
      };
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingClassId(null);
  };

  const handleEdit = (classRoom) => {
    setEditingClassId(classRoom.id);
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

      const payload = {
        ...form,
        teacherId: form.teacherId ? Number(form.teacherId) : null,
      };

      if (editingClassId) {
        await updateAdminClass(editingClassId, payload);
      } else {
        await createAdminClass(payload);
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
      await deleteAdminClass(classId);
      await loadData();
      if (editingClassId === classId) {
        resetForm();
      }
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
      const haystack = [
        classRoom.name,
        classRoom.schedule,
        classRoom.description,
        teacherName,
        studentNames,
      ]
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
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Class Management</h1>
        <p className="text-slate-500 mt-1">Create classes, assign teachers, and enroll students.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid grid-cols-1 gap-3 lg:grid-cols-3">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search classes, teachers, students..."
          className="rounded-lg border border-slate-200 px-3 py-2"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2"
        >
          <option value="name-asc">Sort by name A-Z</option>
          <option value="name-desc">Sort by name Z-A</option>
          <option value="students-desc">Most students first</option>
          <option value="students-asc">Fewest students first</option>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            {editingClassId ? 'Edit Class' : 'Create Class'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Class Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Schedule</label>
              <input
                value={form.schedule}
                onChange={(e) => setForm((prev) => ({ ...prev, schedule: e.target.value }))}
                placeholder="Mon/Wed/Fri - 08:00"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 min-h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Assigned Teacher</label>
              <select
                value={form.teacherId}
                onChange={(e) => setForm((prev) => ({ ...prev, teacherId: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="">Unassigned</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.username} ({teacher.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Students</label>
              <div className="rounded-lg border border-slate-200 p-3 max-h-52 overflow-y-auto space-y-2">
                {students.map((student) => (
                  <label key={student.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.studentIds.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                    />
                    <span>{student.username} ({student.email})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingClassId ? 'Update Class' : 'Create Class'}
              </button>
              {editingClassId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Existing Classes</h2>

          {loading ? (
            <p className="text-slate-500 font-semibold">Loading classes...</p>
          ) : (
            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
              {pagedClasses.map((classRoom) => (
                <div key={classRoom.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{classRoom.name}</h3>
                      <p className="text-sm text-slate-500">{classRoom.schedule || 'No schedule set'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(classRoom)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(classRoom.id)}
                        className="rounded-md border border-rose-300 px-3 py-1 text-sm font-semibold text-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mt-2">{classRoom.description || 'No description provided.'}</p>
                  <p className="text-sm text-slate-700 mt-2 font-semibold">
                    Teacher: {classRoom.teacher ? `${classRoom.teacher.username} (${classRoom.teacher.email})` : 'Unassigned'}
                  </p>
                  <p className="text-sm text-slate-700 mt-1">
                    Students: {(classRoom.students || []).length ? classRoom.students.map((s) => s.username).join(', ') : 'No students assigned'}
                  </p>
                </div>
              ))}

              {!filteredClasses.length && (
                <p className="text-slate-500 font-semibold">No classes yet.</p>
              )}
            </div>
          )}
        </div>
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
  );
};

export default AdminClassManagement;
