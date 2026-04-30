import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Zap, TrendingUp, CheckCircle2, AlertCircle, XCircle, LoaderCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  getParentChildAssessments,
  getParentChildPerformance,
  getParentChildren,
} from '@/lib/api';

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [performance, setPerformance] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        setError('');
        const childrenData = await getParentChildren();
        setChildren(childrenData || []);

        if (childrenData?.length) {
          setSelectedChildId(String(childrenData[0].id));
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load children.');
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, []);

  useEffect(() => {
    const loadChildData = async () => {
      if (!selectedChildId) return;
      try {
        setLoading(true);
        setError('');
        const [performanceData, assessmentsData] = await Promise.all([
          getParentChildPerformance(selectedChildId),
          getParentChildAssessments(selectedChildId),
        ]);
        setPerformance(performanceData);
        setAssessments(assessmentsData || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load child performance data.');
      } finally {
        setLoading(false);
      }
    };

    loadChildData();
  }, [selectedChildId]);

  const scoreTrend = useMemo(() => {
    return assessments
      .filter((item) => item.type === 'QUIZ' && typeof item.score === 'number')
      .slice(0, 7)
      .reverse()
      .map((item, index) => ({
        point: `T${index + 1}`,
        score: item.score,
      }));
  }, [assessments]);

  const passedCount = useMemo(() => {
    return assessments.filter((item) => item.type === 'QUIZ' && (item.score || 0) >= 70).length;
  }, [assessments]);

  const warningCount = useMemo(() => {
    return assessments.filter((item) => item.type === 'QUIZ' && (item.score || 0) >= 50 && (item.score || 0) < 70).length;
  }, [assessments]);

  const failedCount = useMemo(() => {
    return assessments.filter((item) => item.type === 'QUIZ' && (item.score || 0) < 50).length;
  }, [assessments]);

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Parent Dashboard</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            Live progress and assessment visibility for your linked child accounts.
          </p>
        </div>
        {!!children.length && (
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Child</label>
            <select
              className="mt-1 w-full md:w-64 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>{child.username}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-sm font-semibold text-rose-700">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-slate-500 font-semibold flex items-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin" /> Loading parent dashboard data...
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-cyan-600">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Quiz Attempts</CardTitle>
                <div className="p-2 bg-cyan-100 rounded-full">
                  <Clock className="h-5 w-5 text-cyan-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-slate-800">{performance?.attempts || 0}</div>
                <p className="text-xs text-cyan-700 font-medium mt-1 bg-cyan-50 inline-block px-2 py-1 rounded-md">
                  For {performance?.childName || 'selected child'}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Assignment Progress</CardTitle>
                <div className="p-2 bg-amber-100 rounded-full">
                  <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-slate-800">{performance?.assignmentsCompleted || 0}/{performance?.assignmentsTotal || 0}</div>
                <p className="text-xs text-amber-600 font-medium mt-1 bg-amber-50 inline-block px-2 py-1 rounded-md">
                  Completed assignments
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Average Score</CardTitle>
                <div className="p-2 bg-emerald-100 rounded-full">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-slate-800">{performance?.averageScore || 0}%</div>
                <p className="text-xs text-emerald-600 font-medium mt-1 bg-emerald-50 inline-block px-2 py-1 rounded-md">
                  Recent assessment trend
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-600" />
                Quiz Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0891b2" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="point" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="#0891b2" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 overflow-hidden flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Assessments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4 font-bold">Type</th>
                    <th className="px-6 py-4 font-bold">Title</th>
                    <th className="px-6 py-4 font-bold">Score</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessments.map((item, index) => (
                    <tr key={`${item.type}-${item.title}-${index}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-700">{item.type}</td>
                      <td className="px-6 py-4 text-slate-700">{item.title}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{typeof item.score === 'number' ? `${item.score}%` : '-'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {typeof item.score === 'number' && item.score >= 70 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {typeof item.score === 'number' && item.score >= 50 && item.score < 70 && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                          {typeof item.score === 'number' && item.score < 50 && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-emerald-700 uppercase">Passed</p>
                <p className="text-2xl font-black text-emerald-800">{passedCount}</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-amber-700 uppercase">Warning</p>
                <p className="text-2xl font-black text-amber-800">{warningCount}</p>
              </CardContent>
            </Card>
            <Card className="border-rose-200 bg-rose-50">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-rose-700 uppercase">Failed</p>
                <p className="text-2xl font-black text-rose-800">{failedCount}</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ParentDashboard;
