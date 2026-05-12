import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentClasses, joinClassByCode, leaveClass } from '../../lib/api';
import { Loader, AlertCircle, Lock, Users, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function ClassesLanding() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classCode, setClassCode] = useState('');
  const [joiningClass, setJoiningClass] = useState(false);
  const [leavingClassId, setLeavingClassId] = useState(null);
  const [leaveConfirmClass, setLeaveConfirmClass] = useState(null);
  const [leaveAcknowledged, setLeaveAcknowledged] = useState(false);

  const normalizeClasses = (payload) => {
    if (!Array.isArray(payload)) return [];

    return payload.map((cls) => ({
      id: cls.id || cls.classId || null,
      name: cls.name || 'Untitled class',
      description: cls.description || `Class code: ${cls.classCode || 'N/A'}`,
      status: cls.status || 'active',
      instructorName: cls.instructorName || (cls.teacherId ? `Teacher ${String(cls.teacherId).slice(0, 8)}` : null),
      enrollmentCount: cls.enrollmentCount ?? cls.participantCount ?? 0,
      enrollmentDate: cls.enrollmentDate || cls.createdAt || null,
    }));
  };

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStudentClasses();
      setClasses(normalizeClasses(response));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setError('Please enter a class code');
      return;
    }

    try {
      setJoiningClass(true);
      setError(null);
      await joinClassByCode(classCode.trim());
      setClassCode('');
      await fetchClasses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join class');
    } finally {
      setJoiningClass(false);
    }
  };

  const openLeaveConfirmation = (e, classId) => {
    e.stopPropagation();
    const normalizedClassId = String(classId || '').trim();
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(normalizedClassId)) {
      setError('Cannot leave this class because the class id is invalid. Please refresh and try again.');
      return;
    }

    setError(null);
    setLeaveConfirmClass(normalizedClassId);
    setLeaveAcknowledged(false);
  };

  const closeLeaveConfirmation = () => {
    setLeaveConfirmClass(null);
    setLeaveAcknowledged(false);
  };

  const handleLeaveClass = async () => {
    if (!leaveConfirmClass || !leaveAcknowledged) {
      return;
    }

    try {
      setLeavingClassId(leaveConfirmClass);
      setError(null);
      await leaveClass(leaveConfirmClass);
      setClasses((previous) => previous.filter((cls) => cls.id !== leaveConfirmClass));
      closeLeaveConfirmation();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave class');
    } finally {
      setLeavingClassId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      'inactive': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
      'archived': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Archived' },
    };
    const config = statusConfig[status] || statusConfig['inactive'];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {status === 'active' && <CheckCircle className="w-3 h-3" />}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Classes</h1>
          <p className="text-gray-600">Manage your enrolled classes and join new ones</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Code Entry Section */}
        <Card className="mb-12 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Join a New Class
            </CardTitle>
            <CardDescription>Enter the class code provided by your instructor to join a new class</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinClass} className="flex gap-3">
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="Enter class code (e.g., ABC123)"
                maxLength="10"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-widest font-semibold"
              />
              <button
                type="submit"
                disabled={joiningClass || !classCode.trim()}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {joiningClass ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Class'
                )}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-slate-100 rounded-full">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">No Classes Yet</p>
              <p className="text-gray-500 mb-6">Join a class using the code above to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Card
                key={cls.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-blue-300 overflow-hidden group"
                onClick={() => cls.id && navigate(`/student/class/${cls.id}`)}
              >
                {/* Color bar at top */}
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-600" />

                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg leading-tight">{cls.name}</CardTitle>
                    {getStatusBadge(cls.status || 'active')}
                  </div>
                  <CardDescription className="line-clamp-2">{cls.description || 'No description'}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Instructor Info */}
                  {cls.instructorName && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {cls.instructorName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Instructor</p>
                        <p className="font-semibold text-gray-900">{cls.instructorName}</p>
                      </div>
                    </div>
                  )}

                  {/* Enrollment and Participants */}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 font-semibold">{cls.enrollmentCount || 0} members</span>
                    </div>
                    {cls.enrollmentDate && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 text-xs">
                          {new Date(cls.enrollmentDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Click to expand indicator */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-blue-600 font-semibold">Click to view content</span>
                    <button
                      type="button"
                      onClick={(e) => openLeaveConfirmation(e, cls.id)}
                      disabled={leavingClassId === cls.id || !cls.id}
                      className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      {leavingClassId === cls.id ? 'Leaving...' : 'Leave class'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {leaveConfirmClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" role="dialog" aria-modal="true" aria-labelledby="leave-class-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Confirm leave</p>
              <h2 id="leave-class-title" className="mt-2 text-2xl font-bold text-slate-900">Are you sure?</h2>
              <p className="mt-2 text-sm text-slate-600">Leaving this class will remove it from your class list. You can rejoin later only if you have the class code again.</p>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={leaveAcknowledged}
                onChange={(event) => setLeaveAcknowledged(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span>I want to leave this class</span>
            </label>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeLeaveConfirmation}
                disabled={leavingClassId === leaveConfirmClass}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleLeaveClass}
                disabled={!leaveAcknowledged || leavingClassId === leaveConfirmClass}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
