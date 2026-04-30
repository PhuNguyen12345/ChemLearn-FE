import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronRight, GraduationCap, Link as LinkIcon, LoaderCircle, Sparkles, Users } from 'lucide-react';
import { getStudentClasses, joinClassByCode } from '../../lib/api';

const accentSets = [
  'from-sky-500 to-cyan-500',
  'from-indigo-500 to-violet-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
];

const ClassesPage = ({ onOpenClass }) => {
  const [classes, setClasses] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getStudentClasses();
        setClasses(data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load your classes.');
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  const handleJoin = async (event) => {
    event.preventDefault();
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    try {
      setJoining(true);
      setError('');
      setMessage('');
      const joined = await joinClassByCode(trimmedCode);
      setClasses((prev) => [joined, ...prev.filter((item) => item.id !== joined.id)]);
      setCode('');
      setMessage(`Joined ${joined.name}.`);
      onOpenClass?.(joined);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to join class.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 p-6 md:p-8 text-white shadow-[0_18px_50px_rgba(37,99,235,0.2)]">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-14 -left-14 h-56 w-56 rounded-full bg-cyan-200/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.35em] text-cyan-50 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              Joined classes
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Your classes, organized like a learning dashboard</h2>
            <p className="max-w-xl text-sm md:text-base font-semibold text-cyan-50/90 leading-relaxed">
              Open any class card to jump directly into its Study Zone, chapters, quizzes, and assignments.
            </p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-md min-w-[260px]">
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-cyan-50/80">
              <Users className="h-4 w-4" />
              Join by code
            </div>
            <form onSubmit={handleJoin} className="space-y-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter class code"
                className="w-full rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-sm font-semibold tracking-[0.2em] uppercase text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-cyan-300"
                inputMode="numeric"
                maxLength={6}
              />
              <button
                type="submit"
                disabled={joining}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LinkIcon className="h-4 w-4" />
                {joining ? 'Joining...' : 'Join class'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800">Joined class cards</h3>
          <p className="text-sm font-semibold text-slate-500">Tap a card to enter that class study space.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">
          <GraduationCap className="h-4 w-4 text-indigo-500" />
          {classes.length} classes
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading your classes...
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white p-10 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h4 className="text-lg font-black text-slate-800">No classes yet</h4>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Join a class with a code to start seeing its chapters, quizzes, and assignments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((classRoom, index) => (
            <button
              key={classRoom.id}
              onClick={() => onOpenClass?.(classRoom)}
              className="group text-left rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`mb-5 h-28 rounded-[1.5rem] bg-gradient-to-br ${accentSets[index % accentSets.length]} p-5 text-white shadow-lg`}>
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur">
                      Class {classRoom.gradeLevel ?? '—'}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black tracking-[0.3em] text-white/90">
                      {classRoom.classCode}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black tracking-tight">{classRoom.name}</h4>
                    <p className="mt-1 text-sm font-semibold text-white/85">Your class workspace</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    Class code
                  </span>
                  <span className="font-black tracking-[0.2em] text-slate-900">{classRoom.classCode}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    Study zone
                  </span>
                  <span className="inline-flex items-center gap-1 font-black text-indigo-600">
                    Open
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                  Tap this card to view chapters, assignments, and quizzes for this class.
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
