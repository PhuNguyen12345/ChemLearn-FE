import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Zap, TrendingUp, TrendingDown, BookOpen, Beaker, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- MOCK DATA ---
const weeklyLearningData = [
  { day: 'Mon', hours: 1.5 },
  { day: 'Tue', hours: 2.5 },
  { day: 'Wed', hours: 1.0 },
  { day: 'Thu', hours: 3.0 },
  { day: 'Fri', hours: 2.0 },
  { day: 'Sat', hours: 4.5 },
  { day: 'Sun', hours: 3.5 },
];

const recentTests = [
  { id: 1, name: 'Atomic Structure Quiz', date: 'Mar 15, 2026', score: 92, status: 'Passed' },
  { id: 2, name: 'Chemical Bonding Midterm', date: 'Mar 10, 2026', score: 85, status: 'Passed' },
  { id: 3, name: 'Stoichiometry Basics', date: 'Mar 05, 2026', score: 68, status: 'Warning' },
  { id: 4, name: 'Periodic Table Practice', date: 'Feb 28, 2026', score: 45, status: 'Failed' },
];

const enrolledCourses = [
  { id: 1, name: 'Chemistry 101: Fundamentals', enrollDate: 'Jan 15, 2026', expiryDate: 'Jun 15, 2026', progress: 78 },
  { id: 2, name: 'Organic Chemistry Prep', enrollDate: 'Mar 01, 2026', expiryDate: 'Sep 01, 2026', progress: 35 },
  { id: 3, name: 'Virtual Lab Experiments', enrollDate: 'Feb 10, 2026', expiryDate: 'Aug 10, 2026', progress: 55 },
];

const ParentDashboard = () => {
  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Parent Dashboard</h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">
          Monitor your child's chemistry learning progress, study streaks, and recent achievements.
        </p>
      </div>

      {/* Top Summary Cards (Grid) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Learning Time */}
        <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Learning Time</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-800">18.0 <span className="text-lg font-medium text-slate-500">hrs</span></div>
            <p className="text-xs text-blue-600 font-medium mt-1 bg-blue-50 inline-block px-2 py-1 rounded-md">
              +4.5 hrs this week
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Learning Streak */}
        <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Learning Streak</CardTitle>
            <div className="p-2 bg-amber-100 rounded-full">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-800">5 <span className="text-lg font-medium text-slate-500">Days</span></div>
            <p className="text-xs text-amber-600 font-medium mt-1 bg-amber-50 inline-block px-2 py-1 rounded-md">
              Keep the fire alive! 🔥
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Overall Trend */}
        <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Overall Trend</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-800">Stable <span className="text-lg font-medium text-slate-500">↗</span></div>
            <p className="text-xs text-emerald-600 font-medium mt-1 bg-emerald-50 inline-block px-2 py-1 rounded-md">
              Test scores are consistently &gt;= 80%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Time Graph (Recharts) */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Hours Studied (Current Week)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyLearningData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Data Tables Section (2 Columns) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Table 1: Recent Test Results */}
        <Card className="shadow-sm border-slate-200 overflow-hidden flex flex-col">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Recent Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-bold">Quiz Name</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Score</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 uppercase-sm">
                {recentTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{test.name}</td>
                    <td className="px-6 py-4 text-slate-500">{test.date}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${test.score >= 80 ? 'text-emerald-600' : test.score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {test.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                        ${test.status === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 
                          test.status === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}
                      `}>
                        {test.status === 'Passed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {test.status === 'Warning' && <AlertCircle className="w-3.5 h-3.5" />}
                        {test.status === 'Failed' && <XCircle className="w-3.5 h-3.5" />}
                        {test.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Table 2: Total Course Enrolls */}
        <Card className="shadow-sm border-slate-200 overflow-hidden flex flex-col">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Total Course Enrolls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-bold">Course Name</th>
                  <th className="px-6 py-4 font-bold">Enroll Date</th>
                  <th className="px-6 py-4 font-bold">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrolledCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          {course.name.includes('Lab') ? <Beaker className="w-4 h-4 text-indigo-500" /> : <BookOpen className="w-4 h-4 text-indigo-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{course.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Expires: {course.expiryDate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{course.enrollDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 w-[120px]">
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${course.progress >= 70 ? 'bg-emerald-500' : course.progress >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600">{course.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;
