import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Clock,
  FlaskConical,
  LoaderCircle,
  Shapes,
} from 'lucide-react';
import {
  getClassAssignments,
  getClassChapters,
  getClassQuizzes,
  getStudentClasses,
} from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

const quizTypeToLabel = {
  EXAM: 'Test',
  MINI_QUIZ: 'Mini Quiz',
  FREE: 'Practice Quiz',
};

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError('');

        const [classList, chapterData, quizData, assignmentData] = await Promise.all([
          getStudentClasses(),
          getClassChapters(classId),
          getClassQuizzes(classId),
          getClassAssignments(classId),
        ]);

        const foundClass = (classList || []).find((item) => item.id === classId) || null;

        setClassInfo(foundClass);
        setChapters(chapterData || []);
        setQuizzes(quizData || []);
        setAssignments(assignmentData || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load class details.');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      loadDetail();
    }
  }, [classId]);

  const tests = useMemo(
    () => quizzes.filter((quiz) => String(quiz.quizType || '').toUpperCase() === 'EXAM'),
    [quizzes],
  );

  const practiceQuizzes = useMemo(
    () => quizzes.filter((quiz) => String(quiz.quizType || '').toUpperCase() !== 'EXAM'),
    [quizzes],
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Loading class content...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/student/classes')}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to classes
      </button>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-slate-800">
            {classInfo?.name || 'Class workspace'}
          </CardTitle>
          <CardDescription className="text-sm font-semibold text-slate-500">
            Class code: {classInfo?.classCode || 'N/A'}
          </CardDescription>
          <p className="text-sm text-slate-600">
            {classInfo?.description || 'This page shows content for this class only: quizzes, assignments, and tests.'}
          </p>
        </CardHeader>
      </Card>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailSection
          icon={BookOpen}
          title="Chapters"
          count={chapters.length}
          emptyText="No chapters available for this class."
          items={chapters}
          renderItem={(chapter) => (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="font-bold text-slate-800">{chapter.title}</div>
              <div className="mt-1 text-xs text-slate-500">{chapter.description || 'No description'}</div>
            </div>
          )}
        />

        <DetailSection
          icon={ClipboardList}
          title="Quizzes"
          count={practiceQuizzes.length}
          emptyText="No quizzes posted for this class."
          items={practiceQuizzes}
          renderItem={(quiz) => (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-800">{quiz.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{quiz.description || 'Class quiz'}</div>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                  {quizTypeToLabel[String(quiz.quizType || '').toUpperCase()] || 'Quiz'}
                </span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                <Clock className="h-3.5 w-3.5" />
                {quiz.durationMinutes || '-'} min • {quiz.questionCount || 0} questions
              </div>
            </div>
          )}
        />

        <DetailSection
          icon={Shapes}
          title="Assignments"
          count={assignments.length}
          emptyText="No assignments posted for this class."
          items={assignments}
          renderItem={(assignment) => (
            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
              <div className="font-bold text-slate-800">{assignment.title}</div>
              <div className="mt-1 text-xs text-slate-500">
                Due {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'No due date'}
              </div>
            </div>
          )}
        />

        <DetailSection
          icon={FlaskConical}
          title="Tests"
          count={tests.length}
          emptyText="No tests posted for this class."
          items={tests}
          renderItem={(test) => (
            <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-800">{test.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{test.description || 'Class test'}</div>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-violet-700">
                  Test
                </span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                <Clock className="h-3.5 w-3.5" />
                {test.durationMinutes || '-'} min • {test.questionCount || 0} questions
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

const DetailSection = ({ icon: Icon, title, count, items, emptyText, renderItem }) => (
  <Card className="border-slate-200 shadow-sm">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-slate-900 px-2 py-2 text-white">
            <Icon className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg font-black text-slate-800">{title}</CardTitle>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{count}</span>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-500">
          {emptyText}
        </div>
      ) : (
        items.map((item) => (
          <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
        ))
      )}
    </CardContent>
  </Card>
);

export default ClassDetail;
