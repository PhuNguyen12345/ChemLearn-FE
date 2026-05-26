import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createTeacherAssignment,
  createTeacherClass,
  deleteTeacherClass,
  deleteTeacherAssignment,
  getTeacherClasses,
  getTeacherAssignments,
  getTeacherQuizzes,
  updateTeacherClass,
  getTeacherChapters,
  addChapterToClass,
  removeChapterFromClass,
} from '@/lib/api';
import { 
  Copy, 
  Edit3, 
  Plus, 
  Trash2, 
  Users, 
  BookOpen, 
  FilePenLine, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  LayoutTemplate, 
  ChevronLeft, 
  ChevronRight,
  LoaderCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';



const emptyForm = {
  name: '',
  grade: '',
  classType: '',
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
  const [pageSize, setPageSize] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const classesData = await getTeacherClasses();
      setClasses(classesData || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load assigned classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingClassId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (classRoom) => {
    setEditingClassId(classRoom.id);
    setForm({
      name: classRoom.name || '',
      grade: classRoom.grade || '',
      classType: classRoom.classType || '',
      description: classRoom.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      const payload = {
        name: form.name.trim(),
        grade: form.grade ? Number(form.grade) : null,
        classType: form.classType,
        description: form.description.trim(),
      };

      if (editingClassId) {
        await updateTeacherClass(editingClassId, payload);
        setSuccess('Class updated successfully.');
      } else {
        await createTeacherClass(payload);
        setSuccess('Class created successfully.');
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
      await deleteTeacherClass(classId);
      await loadClasses();
      setSuccess('Class deleted.');
    } catch (err) {
      setError('Failed to delete class.');
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async (classCode) => {
    if (!classCode) return;
    try {
      await navigator.clipboard.writeText(classCode);
      setSuccess(`Copied class code ${classCode}.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Could not copy the class code.');
    }
  };

  const filteredClasses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const items = [...classes].filter((classRoom) => {
      if (!term) return true;
      return [classRoom.name, classRoom.classCode]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });

    items.sort((left, right) => {
      if (sortBy === 'students-desc') return (right.students?.length || 0) - (left.students?.length || 0);
      if (sortBy === 'name-desc') return right.name.localeCompare(left.name);
      return left.name.localeCompare(right.name);
    });

    return items;
  }, [classes, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / pageSize));
  const pagedClasses = filteredClasses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Quản lý lớp học</h1>
          <p className="text-slate-500 font-bold mt-1">Quản lý lớp học và tương tác học tập của học sinh.</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 font-black shadow-lg shadow-indigo-100 gap-2"
        >
          <Plus className="h-5 w-5" />
          Thêm lớp mới
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by class name or code..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-none bg-slate-50 font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 md:w-48 bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="name-asc">A - Z</option>
            <option value="name-desc">Z - A</option>
            <option value="students-desc">Nhiều học sinh nhất</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 flex items-center gap-3 text-rose-600 font-bold animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3 text-emerald-600 font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* Classes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoaderCircle className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagedClasses.map((classRoom) => (
            <Card key={classRoom.id} className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group overflow-hidden flex flex-col border-2">
              <CardContent className="p-8 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-14 w-14 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                    <LayoutTemplate className="h-7 w-7" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(classRoom)} className="rounded-xl h-9 w-9 p-0 hover:bg-slate-100">
                      <Edit3 className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(classRoom.id)} className="rounded-xl h-9 w-9 p-0 hover:bg-rose-50 text-rose-400 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                  {classRoom.name}
                </h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <button 
                    onClick={() => copyCode(classRoom.classCode)}
                    className="text-xs font-black bg-indigo-600 text-white px-3 py-1 rounded-full tracking-[0.2em] shadow-md shadow-indigo-100 active:scale-95 transition-transform"
                  >
                    {classRoom.classCode}
                  </button>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {(classRoom.students || []).length} Học sinh
                  </span>
                </div>

                <p className="text-slate-500 font-bold text-sm leading-relaxed line-clamp-2 mb-8 flex-1">
                  {classRoom.description || 'No description provided for this classroom.'}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-auto pt-6 border-t border-slate-50">
                  <Link to={`/teacher/classes/${classRoom.id}/chapters`} className="flex-1">
                    <Button variant="outline" className="w-full h-12 rounded-2xl flex-col gap-1 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 group/btn">
                      <BookOpen className="h-4 w-4 text-slate-400 group-hover/btn:text-indigo-600" />
                      <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500 group-hover/btn:text-indigo-600">Chapters</span>
                    </Button>
                  </Link>
                  <Link to={`/teacher/classes/${classRoom.id}/quizzes`} className="flex-1">
                    <Button variant="outline" className="w-full h-12 rounded-2xl flex-col gap-1 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 group/btn">
                      <FilePenLine className="h-4 w-4 text-slate-400 group-hover/btn:text-indigo-600" />
                      <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500 group-hover/btn:text-indigo-600">Quizzes</span>
                    </Button>
                  </Link>
                  <Link to={`/teacher/classes/${classRoom.id}/students`} className="flex-1">
                    <Button variant="outline" className="w-full h-12 rounded-2xl flex-col gap-1 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 group/btn">
                      <Users className="h-4 w-4 text-slate-400 group-hover/btn:text-emerald-600" />
                      <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500 group-hover/btn:text-emerald-600">Students</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredClasses.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-2xl h-12 w-12 p-0 border-slate-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-black text-slate-700">Page {currentPage} of {totalPages}</span>
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-2xl h-12 w-12 p-0 border-slate-200"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10">
              <h2 className="text-3xl font-black text-slate-800 mb-2">
                {editingClassId ? 'Edit Classroom' : 'New Classroom'}
              </h2>
              <p className="text-slate-500 font-bold mb-8">
                {editingClassId ? 'Cập nhật thông tin lớp học.' : 'Tạo một không gian học tập mới cho học sinh.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tên lớp học</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-2xl bg-slate-50 border-none px-5 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                    placeholder="Hóa học lớp 10..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Khối</label>
                    <select
                      value={form.grade}
                      onChange={(e) => setForm((prev) => ({ ...prev, grade: e.target.value }))}
                      className="w-full rounded-2xl bg-slate-50 border-none px-5 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      required
                    >
                      <option value="" disabled>Chọn khối</option>
                      <option value="6">Lớp 6</option>
                      <option value="7">Lớp 7</option>
                      <option value="8">Lớp 8</option>
                      <option value="9">Lớp 9</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Loại sách</label>
                    <select
                      value={form.classType}
                      onChange={(e) => setForm((prev) => ({ ...prev, classType: e.target.value }))}
                      className="w-full rounded-2xl bg-slate-50 border-none px-5 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      required
                    >
                      <option value="" disabled>Chọn loại sách</option>
                      <option value="Kết nối tri thức">Kết nối tri thức</option>
                      <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                      <option value="Cánh diều">Cánh diều</option>
                    </select>
                  </div>
                </div>


                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full min-h-[120px] rounded-2xl bg-slate-50 border-none px-5 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none"
                    placeholder="Mô tả chi tiết về lớp học..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-14 rounded-2xl font-black text-slate-500 hover:bg-slate-50"
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 h-14 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                  >
                    {saving ? <LoaderCircle className="animate-spin" /> : editingClassId ? 'Update Class' : 'Create Class'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClassManagement;
