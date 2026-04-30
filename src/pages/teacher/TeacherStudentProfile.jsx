import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTeacherStudentAccount } from '@/lib/api';

const TeacherStudentProfile = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudent = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getTeacherStudentAccount(studentId);
        setStudent(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load student account.');
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [studentId]);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Student Account</h1>
        <Link to="/teacher/classes" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 font-semibold">
          Back to Classes
        </Link>
      </div>

      {loading && <p className="text-slate-500 font-semibold">Loading student...</p>}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!loading && student && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 max-w-3xl">
          <div>
            <p className="text-sm text-slate-500">Username</p>
            <p className="text-xl font-bold text-slate-800">{student.username}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="text-base font-semibold text-slate-700">{student.email}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p className="text-base font-semibold text-slate-700">{student.enabled ? 'Active' : 'Disabled'}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Classes with you</p>
            <p className="text-base font-semibold text-slate-700">{(student.classes || []).join(', ') || 'No classes'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentProfile;
