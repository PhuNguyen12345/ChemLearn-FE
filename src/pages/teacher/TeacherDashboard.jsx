import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  BarChart,
  TrendingUp,
  FileCheck,
  LoaderCircle,
} from 'lucide-react';
import {
  getTeacherStudentPerformance,
  getTeacherSubmissions,
  getTeacherSummary,
} from '@/lib/api';
import useAuthStore from '@/stores/useAuthStore';

const TEACHER_DASHBOARD_TAB_KEY = 'chemlearn_teacher_dashboard_tab';
const teacherDashboardTabs = new Set(['performance', 'submissions']);

const resolveInitialTeacherTab = (preferredTab) => {
  if (preferredTab && teacherDashboardTabs.has(preferredTab)) {
    return preferredTab;
  }

  if (typeof window === 'undefined') return 'performance';

  const storedTab = localStorage.getItem(TEACHER_DASHBOARD_TAB_KEY);
  return storedTab && teacherDashboardTabs.has(storedTab) ? storedTab : 'performance';
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const TeacherDashboard = ({ initialTab }) => {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(() => resolveInitialTeacherTab(initialTab));

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [summaryData, performanceData, submissionsData] = await Promise.all([
        getTeacherSummary(),
        getTeacherStudentPerformance(),
        getTeacherSubmissions(),
      ]);

      setSummary(summaryData);
      setPerformance(toArray(performanceData));
      setSubmissions(toArray(submissionsData));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load teacher dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem(TEACHER_DASHBOARD_TAB_KEY, activeTab);
  }, [activeTab]);

  const completionRate = useMemo(() => {
    if (!performance.length) return 0;
    const totalAssignments = performance.reduce((acc, item) => acc + item.completedAssignments + item.pendingAssignments, 0);
    const completedAssignments = performance.reduce((acc, item) => acc + item.completedAssignments, 0);
    if (!totalAssignments) return 0;
    return Math.round((completedAssignments * 100) / totalAssignments);
  }, [performance]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Welcome back, {user?.username || 'Teacher'}!</h1>
          <p className="text-muted-foreground mt-1">
            Live overview of student results and activity.
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-sm font-semibold text-rose-700">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-8 text-slate-500 font-semibold flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Loading teacher data...
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-cyan-50 border-cyan-100 shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyan-800">Total Students</CardTitle>
                <div className="p-2 bg-cyan-200 rounded-xl">
                  <Users className="h-4 w-4 text-cyan-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{summary?.totalStudents || 0}</div>
                <p className="text-xs font-semibold text-cyan-700 mt-1">Students in your classes</p>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-100 shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-800">Average Score</CardTitle>
                <div className="p-2 bg-amber-200 rounded-xl">
                  <BarChart className="h-4 w-4 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{summary?.averageScore || 0}%</div>
                <p className="text-xs font-semibold text-amber-700 mt-1">Across all quiz attempts</p>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 border-emerald-100 shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-800">Assignment Completion</CardTitle>
                <div className="p-2 bg-emerald-200 rounded-xl">
                  <TrendingUp className="h-4 w-4 text-emerald-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{completionRate}%</div>
                <div className="h-2 w-full bg-emerald-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-indigo-50 border-indigo-100 shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-800">Pending Assignments</CardTitle>
                <div className="p-2 bg-indigo-200 rounded-xl">
                  <FileCheck className="h-4 w-4 text-indigo-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-indigo-700">{summary?.pendingAssignments || 0}</div>
                <p className="text-xs font-semibold text-indigo-600 mt-1">Awaiting completion</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-100/50 p-1 rounded-xl">
              <TabsTrigger value="performance" className="rounded-lg">Student Performance</TabsTrigger>
              <TabsTrigger value="submissions" className="rounded-lg">Recent Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="mt-6">
              <Card className="rounded-2xl shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Student Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b-slate-100">
                        <TableHead>Student</TableHead>
                        <TableHead>Total Attempts</TableHead>
                        <TableHead>Average Score</TableHead>
                        <TableHead>Assignments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {performance.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell className="font-semibold text-slate-700">{student.studentName}</TableCell>
                          <TableCell>{student.attempts}</TableCell>
                          <TableCell>{student.averageScore}%</TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-100 text-emerald-800 border-none mr-2 shadow-none">
                              Done: {student.completedAssignments}
                            </Badge>
                            <Badge className="bg-amber-100 text-amber-800 border-none shadow-none">
                              Pending: {student.pendingAssignments}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submissions" className="mt-6">
              <Card className="rounded-2xl shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Quiz Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quiz</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.attemptId}>
                          <TableCell className="font-medium">{submission.quizTitle}</TableCell>
                          <TableCell>{submission.studentName}</TableCell>
                          <TableCell>{submission.score}%</TableCell>
                          <TableCell>
                            <Badge className="bg-slate-100 text-slate-800 border-none shadow-none">{submission.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};


export default TeacherDashboard;
