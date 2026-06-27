import React, { useEffect, useState } from 'react';
import {
  BookOpenCheck,
  FilePlus2,
  LoaderCircle,
  MessageCircle,
} from 'lucide-react';
import useAuthStore from '@/stores/useAuthStore';
import { getStudentProfileData } from '@/api/studentApi';
import ChatBox from '@/components/student/ai/ChatBox';
import GenerateExamForm from '@/components/student/ai/GenerateExamForm';
import ExamPreview from '@/components/student/ai/ExamPreview';
import GeneratedExamHistory from '@/components/student/ai/GeneratedExamHistory';

const TABS = [
  { id: 'chat', label: 'Chat cùng Bi', icon: MessageCircle },
  { id: 'exam', label: 'Tạo đề ôn tập', icon: FilePlus2 },
];

const BI_AVATAR = '/bi-companion.png';

const BOOK_TYPES = [
  { value: 'KNTT', label: 'KNTT' },
  { value: 'CTST', label: 'CTST' },
  { value: 'CD', label: 'CD' },
];

const AiTutorPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('chat');
  const [profileLoading, setProfileLoading] = useState(true);
  const [context, setContext] = useState({
    grade: 8,
    bookType: 'KNTT',
  });
  const [exam, setExam] = useState(null);
  const [examHistoryRefreshKey, setExamHistoryRefreshKey] = useState(0);

  const studentId = user?.id;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getStudentProfileData();
        if (data?.gradeLevel) {
          setContext((current) => ({ ...current, grade: data.gradeLevel }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateContext = (field, value) => {
    setContext((current) => ({ ...current, [field]: value }));
  };

  const handleExamGenerated = (data) => {
    setExam(data);
    setExamHistoryRefreshKey((current) => current + 1);
  };

  return (
    <div className="flex w-full flex-col gap-5 pb-8">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-violet-100 bg-white shadow-sm ring-4 ring-violet-50">
              <img
                src={BI_AVATAR}
                alt="Bi"
                className="h-full w-full object-contain p-1"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Học cùng Bi</h1>
              <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-500">
                <BookOpenCheck className="h-4 w-4 text-teal-600" />
                KHTN/Hóa học THCS Việt Nam
                {profileLoading && <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />}
              </div>
            </div>
          </div>

          {activeTab === 'exam' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[380px]">
              <label className="space-y-1.5">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Lớp</span>
                <select
                  value={context.grade}
                  onChange={(event) => updateContext('grade', Number(event.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                >
                  {[6, 7, 8, 9].map((grade) => (
                    <option key={grade} value={grade}>Lớp {grade}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Bộ sách</span>
                <select
                  value={context.bookType}
                  onChange={(event) => updateContext('bookType', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                >
                  {BOOK_TYPES.map((book) => (
                    <option key={book.value} value={book.value}>{book.label}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      </section>

      <nav className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-black transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === 'chat' && (
        <ChatBox
          studentId={studentId}
          context={context}
        />
      )}

      {activeTab === 'exam' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <GenerateExamForm
              studentId={studentId}
              context={context}
              onExamGenerated={handleExamGenerated}
            />
            <GeneratedExamHistory
              studentId={studentId}
              refreshKey={examHistoryRefreshKey}
              onExamSelected={setExam}
            />
          </div>
          <ExamPreview
            exam={exam}
            studentId={studentId}
          />
        </div>
      )}
    </div>
  );
};

export default AiTutorPage;
