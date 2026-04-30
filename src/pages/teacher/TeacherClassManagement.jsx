import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeacherClasses } from '@/lib/api';

const TeacherClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [pageSize, setPageSize] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getTeacherClasses();
        setClasses(data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load assigned classes.');
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, pageSize]);

  const filteredClasses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const items = [...classes].filter((classRoom) => {
      if (!term) return true;

      const studentNames = (classRoom.students || []).map((student) => student.username).join(' ');
      return [classRoom.name, classRoom.schedule, classRoom.description, studentNames]
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
        <p className="text-slate-500 mt-1">View class details and quickly open linked student accounts.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid grid-cols-1 gap-3 lg:grid-cols-3">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search assigned classes or students..."
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

      {loading ? (
        <p className="text-slate-500 font-semibold">Loading classes...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pagedClasses.map((classRoom) => (
            <div key={classRoom.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800">{classRoom.name}</h2>
              <p className="text-sm text-slate-500 mt-1">{classRoom.schedule || 'No schedule set'}</p>
              <p className="text-sm text-slate-600 mt-3">{classRoom.description || 'No description provided.'}</p>

              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Students</p>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
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
                    <p className="text-sm text-slate-500">No students assigned.</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!filteredClasses.length && (
            <p className="text-slate-500 font-semibold">You are not assigned to any class yet.</p>
          )}
        </div>
      )}

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