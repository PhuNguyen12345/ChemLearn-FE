import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentClasses, joinClassByCode, leaveClass } from '../../lib/api';
import { Loader, AlertCircle, Lock, Users, Calendar, CheckCircle, Flame, Zap, Shield, Sparkles } from 'lucide-react';

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
      'active': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', label: 'Active' },
      'inactive': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', label: 'Inactive' },
      'archived': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', label: 'Archived' },
    };
    const config = statusConfig[status] || statusConfig['inactive'];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text} border ${config.border}`}>
        {status === 'active' && <CheckCircle className="w-3 h-3" />}
        {config.label}
      </span>
    );
  };

  // Card color cycle
  const cardColors = [
    { border: 'border-blue-200 border-b-blue-400', hover: 'hover:border-b-blue-500', iconBg: 'bg-blue-500', text: 'text-blue-700' },
    { border: 'border-purple-200 border-b-purple-400', hover: 'hover:border-b-purple-500', iconBg: 'bg-purple-500', text: 'text-purple-700' },
    { border: 'border-emerald-200 border-b-emerald-400', hover: 'hover:border-b-emerald-500', iconBg: 'bg-emerald-500', text: 'text-emerald-700' },
    { border: 'border-amber-200 border-b-amber-400', hover: 'hover:border-b-amber-500', iconBg: 'bg-amber-400', text: 'text-amber-700' },
    { border: 'border-rose-200 border-b-rose-400', hover: 'hover:border-b-rose-500', iconBg: 'bg-rose-500', text: 'text-rose-700' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Loading Classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-[0_10px_30px_rgba(168,85,247,0.4)] border-b-4 border-purple-700">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-44 h-44 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="absolute top-8 right-14 text-pink-200 animate-bounce" style={{ animationDuration: '3.1s', animationDelay: '0.5s' }}>
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm mb-2">My Classes 📚</h1>
          <p className="text-purple-100 text-base md:text-lg font-semibold opacity-90 max-w-xl">
            Quản lý các lớp học của bạn và quay lại hành trình học tập của bạn!
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Code Entry Section */}
        <div className="p-6 bg-white rounded-[1.5rem] border-2 border-sky-200 border-b-[6px] border-b-sky-400 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-6 h-6 text-sky-500 fill-sky-100" />
            <h2 className="text-xl font-black text-slate-800">Tham gia lớp mới</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-5">Nhập mã lớp học được cung cấp bởi giảng viên để tham gia</p>
          <form onSubmit={handleJoinClass} className="flex gap-3">
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength="10"
              className="flex-1 px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 uppercase tracking-widest font-black text-slate-700 placeholder:text-slate-400 transition-all"
            />
            <button
              type="submit"
              disabled={joiningClass || !classCode.trim()}
              className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-black rounded-xl border-b-[5px] border-sky-700 active:border-b active:translate-y-1 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-sky-300/50"
            >
              {joiningClass ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Đang tham gia...
                </>
              ) : (
                'Tham gia lớp học'
              )}
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-[1rem]">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-bold text-red-800">{error}</p>
          </div>
        )}

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="p-10 bg-white rounded-[2rem] border-2 border-slate-200 border-b-[6px] border-b-slate-300 shadow-sm text-center">
             <div className="w-20 h-20 mx-auto bg-slate-100 rounded-[1.5rem] flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-black text-slate-700 mb-2">Chưa có lớp học</h3>
             <p className="text-slate-500 font-semibold max-w-sm mx-auto">Tham gia lớp học bằng mã lớp ở trên để bắt đầu hành trình của bạn!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls, idx) => {
              const colorTheme = cardColors[idx % cardColors.length];
              return (
                <div
                  key={cls.id}
                  onClick={() => cls.id && navigate(`/student/class/${cls.id}`)}
                  className={`group flex flex-col p-6 rounded-[1.5rem] bg-white border-2 border-b-[6px] ${colorTheme.border} ${colorTheme.hover} active:border-b-2 active:translate-y-1 transition-all duration-150 shadow-sm cursor-pointer relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                  
                  <div className="relative z-10 flex items-start justify-between gap-2 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-800 leading-tight mb-1 group-hover:text-slate-900 line-clamp-2">{cls.name}</h3>
                      <p className="text-xs font-bold text-slate-400 line-clamp-1">{cls.description}</p>
                    </div>
                    {getStatusBadge(cls.status || 'active')}
                  </div>

                  <div className="relative z-10 mt-auto pt-4 space-y-3">
                    {cls.instructorName && (
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-[0.75rem] flex items-center justify-center text-white font-black text-sm shadow-sm ${colorTheme.iconBg}`}>
                          {cls.instructorName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                          <p className={`text-sm font-bold ${colorTheme.text}`}>{cls.instructorName}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        {cls.enrollmentCount || 0} thành viên
                      </div>
                      {cls.enrollmentDate && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(cls.enrollmentDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className={`text-xs font-black uppercase tracking-widest ${colorTheme.text}`}>ENTER CLASS →</span>
                      <button
                        type="button"
                        onClick={(e) => openLeaveConfirmation(e, cls.id)}
                        disabled={leavingClassId === cls.id || !cls.id}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
                      >
                        {leavingClassId === cls.id ? 'LEAVING...' : 'LEAVE'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leave Class Confirmation Modal */}
      {leaveConfirmClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeLeaveConfirmation} />
           <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-7 shadow-2xl border-4 border-slate-100 animate-in zoom-in-95 duration-200">
             <div className="w-14 h-14 bg-red-100 rounded-[1.25rem] flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-500" />
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">Rời khỏi lớp học?</h2>
             <p className="text-sm font-semibold text-slate-500 mb-6">Bạn sẽ bị xóa khỏi lớp học này và sẽ cần mã để tham gia lại.</p>
             
             <label className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-[1rem] cursor-pointer mb-6 hover:bg-slate-100 transition-colors">
               <input
                 type="checkbox"
                 checked={leaveAcknowledged}
                 onChange={(e) => setLeaveAcknowledged(e.target.checked)}
                 className="w-5 h-5 rounded-[0.4rem] border-2 border-slate-300 text-red-500 focus:ring-red-500/20 focus:ring-offset-0"
               />
               <span className="text-sm font-bold text-slate-700">Em hiểu những hậu quả</span>
             </label>

             <div className="flex gap-3">
               <button
                 type="button"
                 onClick={closeLeaveConfirmation}
                 disabled={leavingClassId === leaveConfirmClass}
                 className="flex-1 py-3 px-4 rounded-xl font-black text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 transition-colors"
               >
                 Hủy
               </button>
               <button
                 type="button"
                 onClick={handleLeaveClass}
                 disabled={!leaveAcknowledged || leavingClassId === leaveConfirmClass}
                 className="flex-1 py-3 px-4 rounded-xl font-black text-white bg-red-500 border-b-[4px] border-red-700 hover:bg-red-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 disabled:border-b-[4px]"
               >
                 Rời khỏi
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
