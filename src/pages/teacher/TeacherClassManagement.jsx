import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createTeacherClass,
  deleteTeacherClass,
  getTeacherClasses,
  updateTeacherClass,
  getTeacherChapters,
  addChapterToClass,
  removeChapterFromClass,
} from '@/lib/api';
import { Copy, Edit3, Plus, Trash2, Users } from 'lucide-react';

const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  timeZone: VN_TIME_ZONE,
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: VN_TIME_ZONE,
});

const parseDateValue = (dateValue) => {
  const [year, month, day] = (dateValue || '').split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const getSchoolYearEndDate = (startDate) => {
  const startMonth = startDate.getMonth() + 1;
  const startYear = startDate.getFullYear();
  const endYear = startMonth >= 9 ? startYear + 1 : startYear;
  return new Date(endYear, 4, 31);
};

const calculateWeeklySessionCount = (startDate, endDate) => {
  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
};

const buildVietnamSchoolYearSchedule = (dateValue, timeValue) => {
  const startDate = parseDateValue(dateValue);
  if (!startDate || !timeValue) {
    return { scheduleText: '', endDate: null, sessionCount: 0, weekdayText: '' };
  }

  const endDate = getSchoolYearEndDate(startDate);
  const weekdayText = weekdayFormatter.format(startDate);
  const sessionCount = calculateWeeklySessionCount(startDate, endDate);

  const scheduleText = `Weekly ${weekdayText} at ${timeValue} (ICT) from ${dateFormatter.format(startDate)} to ${dateFormatter.format(endDate)}`;

  return {
    scheduleText,
    endDate,
    sessionCount,
    weekdayText,
  };
};

const emptyForm = {
  name: '',
  scheduleStartDate: '',
  scheduleStartTime: '',
  schedule: '',
  description: '',
};

const TeacherClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingClassId, setEditingClassId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [pageSize, setPageSize] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [chapters, setChapters] = useState([]);
  const [managingChaptersFor, setManagingChaptersFor] = useState({});

  const schedulePreview = useMemo(
    () => buildVietnamSchoolYearSchedule(form.scheduleStartDate, form.scheduleStartTime),
    [form.scheduleStartDate, form.scheduleStartTime]
  );

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const [classesData, chaptersData] = await Promise.all([getTeacherClasses(), getTeacherChapters()]);
      setClasses(classesData || []);
      setChapters(chaptersData || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load assigned classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, pageSize]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingClassId(null);
  };

  const handleEdit = (classRoom) => {
    setEditingClassId(classRoom.id);
    setSuccess('');
    setForm({
      name: classRoom.name || '',
      scheduleStartDate: '',
      scheduleStartTime: '',
      schedule: classRoom.schedule || '',
      description: classRoom.description || '',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!editingClassId && (!form.scheduleStartDate || !form.scheduleStartTime)) {
        setError('Please pick a start date and start time for the recurring schedule.');
        setSaving(false);
        return;
      }

      const generatedSchedule = buildVietnamSchoolYearSchedule(form.scheduleStartDate, form.scheduleStartTime).scheduleText;
      const finalSchedule = generatedSchedule || form.schedule.trim();

      const payload = {
        name: form.name.trim(),
        schedule: finalSchedule,
        description: form.description.trim(),
      };

      if (editingClassId) {
        await updateTeacherClass(editingClassId, payload);
        setSuccess('Class updated successfully.');
      } else {
        await createTeacherClass(payload);
        setSuccess('Class created successfully. Share the code with your students.');
      }

      await loadClasses();
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
      await deleteTeacherClass(classId);
      await loadClasses();
      if (editingClassId === classId) {
        resetForm();
      }
      setSuccess('Class deleted.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete class.');
    } finally {
      setSaving(false);
    }
  };

  const toggleChapterForClass = async (classId, chapterId, isAssigned) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      if (isAssigned) {
        await removeChapterFromClass(classId, chapterId);
        setSuccess('Chapter removed from class.');
      } else {
        await addChapterToClass(classId, chapterId);
        setSuccess('Chapter assigned to class.');
      }
      await loadClasses();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update chapter assignment.');
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async (classCode) => {
    if (!classCode) return;
    try {
      await navigator.clipboard.writeText(classCode);
      setSuccess(`Copied class code ${classCode}.`);
    } catch {
      setError('Could not copy the class code.');
    }
  };

  const filteredClasses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const items = [...classes].filter((classRoom) => {
      if (!term) return true;

      const studentNames = (classRoom.students || []).map((student) => student.username).join(' ');
      return [classRoom.name, classRoom.schedule, classRoom.description, classRoom.classCode, studentNames]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });

    items.sort((left, right) => {
      if (sortBy === 'students-desc') return (right.students?.length || 0) - (left.students?.length || 0);
      if (sortBy === 'students-asc') return (left.students?.length || 0) - (right.students?.length || 0);
      if (sortBy === 'name-desc') return right.name.localeCompare(left.name);
      return left.name.localeCompare(right.name);
    });

    return items;
  }, [classes, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / pageSize));
  const pagedClasses = filteredClasses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Classes</h1>
        <p className="mt-1 text-slate-500">Create your own classes and share the generated code with students.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-3">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search classes or students..."
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

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
            <Plus className="h-5 w-5 text-indigo-500" />
            {editingClassId ? 'Edit My Class' : 'Create My Class'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Class Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Schedule Start Date</label>
              <input
                type="date"
                value={form.scheduleStartDate}
                onChange={(e) => setForm((prev) => ({ ...prev, scheduleStartDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                required={!editingClassId}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Class Start Time</label>
              <input
                type="time"
                value={form.scheduleStartTime}
                onChange={(e) => setForm((prev) => ({ ...prev, scheduleStartTime: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                required={!editingClassId}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingClassId ? 'Update Class' : 'Create Class'}
              </button>
              {editingClassId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-800">Existing Classes</h2>

          {loading ? (
            <p className="font-semibold text-slate-500">Loading classes...</p>
          ) : (
            <div className="max-h-[640px] space-y-4 overflow-y-auto pr-1">
              {pagedClasses.map((classRoom) => (
                <div key={classRoom.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{classRoom.name}</h3>
                      <p className="text-sm text-slate-500">{classRoom.schedule || 'No schedule set'}</p>
                      <p className="mt-2 text-sm text-slate-600">{classRoom.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(classRoom)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700"
                      >
                        <Edit3 className="mr-1 inline-block h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(classRoom.id)}
                        className="rounded-md border border-rose-200 px-3 py-1 text-sm font-semibold text-rose-700"
                      >
                        <Trash2 className="mr-1 inline-block h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Class Code</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-full bg-indigo-600 px-3 py-1 text-sm font-black tracking-[0.35em] text-white">
                          {classRoom.classCode || '------'}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyCode(classRoom.classCode)}
                          className="rounded-full border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600"
                        >
                          <Copy className="mr-1 inline-block h-3.5 w-3.5" />
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Students</p>
                      <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Users className="h-4 w-4 text-indigo-500" />
                        {(classRoom.students || []).length} enrolled
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
                    {(classRoom.students || []).map((student) => (
                      <Link
                        key={student.id}
                        to={student.accountLink || `/teacher/students/${student.id}`}
                        className="block rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                      >
                        <span className="font-semibold text-slate-700">{student.username}</span>
                        <span className="text-slate-500"> ({student.email})</span>
                      </Link>
                    ))}

                    {!classRoom.students?.length && (
                      <p className="text-sm text-slate-500">No students joined yet.</p>
                    )}
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setManagingChaptersFor((s) => ({ ...s, [classRoom.id]: !s[classRoom.id] }))}
                      className="mb-2 rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700"
                    >
                      Manage Chapters
                    </button>

                    {managingChaptersFor[classRoom.id] && (
                      <div className="space-y-2">
                        {chapters.map((ch) => {
                          const isAssigned = (classRoom.chapters || []).some((c) => c.id === ch.id);
                          return (
                            <div key={ch.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                              <div>
                                <div className="font-semibold text-slate-700">{ch.title}</div>
                                <div className="text-sm text-slate-500">{ch.description}</div>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => toggleChapterForClass(classRoom.id, ch.id, isAssigned)}
                                  disabled={saving}
                                  className={`rounded-md px-3 py-1 text-sm font-semibold ${isAssigned ? 'border border-rose-200 text-rose-700' : 'bg-indigo-600 text-white'}`}
                                >
                                  {isAssigned ? 'Unassign' : 'Assign'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!filteredClasses.length && (
                <p className="font-semibold text-slate-500">You are not assigned to any class yet.</p>
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

export default TeacherClassManagement;
