import React, { useEffect, useState, useMemo } from 'react';
import { loginParent, getChildren, getChildOverview, getChildGamification, getChildScoreTimeline } from '../../api/parentApi';
import { ParentStatsCard } from '../../components/ui/ParentStatsCard';
import { GamificationGrid } from '../../components/ui/GamificationGrid';
import { Timeline } from '../../components/ui/Timeline';
import { Award, BookOpen, GraduationCap, ChevronDown, Activity, Users } from 'lucide-react';
import { initiateAccountLink, getPendingAccountLinks } from '../../api/accountLinkApi';
import { toast } from 'sonner';
import MailDeliveryReminder from '@/components/shared/MailDeliveryReminder';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');

  const [overview, setOverview] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [timelineData, setTimelineData] = useState([]);

  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState(null);
  
  // Account Linking
  const [linkEmail, setLinkEmail] = useState('');
  const [pendingLinks, setPendingLinks] = useState([]);
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchAllChildData(selectedChildId);
    }
  }, [selectedChildId]);

  const fetchChildren = async () => {
    try {
      const data = await getChildren();
      setChildren(data);
      if (data.length > 0) {
        setSelectedChildId(data[0].studentId);
      }
      fetchPendingLinks();
    } catch (err) {
      setError('Không thể lấy danh sách học sinh. Vui lòng kiểm tra kết nối.');
    } finally {
      setIsLoadingChildren(false);
    }
  };

  const fetchPendingLinks = async () => {
    try {
      const links = await getPendingAccountLinks();
      setPendingLinks(links);
    } catch (err) {
      console.error("Failed to fetch pending links", err);
    }
  };

  const handleLinkAccount = async () => {
    if (!linkEmail) return;
    try {
      setIsLinking(true);
      await initiateAccountLink(linkEmail);
      toast.success('Yêu cầu liên kết đã được gửi! Vui lòng chờ học sinh xác nhận.');
      setLinkEmail('');
      fetchPendingLinks();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
    } finally {
      setIsLinking(false);
    }
  };

  const fetchAllChildData = async (studentId) => {
    setIsLoadingStats(true);
    try {
      const [overviewData, gamificationData, scoresData] = await Promise.all([
        getChildOverview(studentId),
        getChildGamification(studentId),
        getChildScoreTimeline(studentId)
      ]);
      setOverview(overviewData);
      setGamification(gamificationData);
      setTimelineData(scoresData);
    } catch (err) {
      console.error(err);
      // Fallback data for demonstration if API fails or is not fully implemented
      setOverview({
        recentAverageScore: 0,
        completedAssignments: 0,
        totalAssignments: 0,
        completionPercentage: 0
      });
      setGamification({ level: 1, pendingQuests: [] });
      setTimelineData([]);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const selectedChild = children.find(c => c.studentId === selectedChildId);

  // Combine Gamification Quests and Mock Feedbacks into Timeline
  const combinedTimelineItems = useMemo(() => {
    const items = [];

    // Add quests
    if (gamification?.pendingQuests) {
      gamification.pendingQuests.forEach(quest => {
        items.push({
          type: 'quest',
          title: `Nhiệm vụ: ${quest.questTitle}`,
          description: quest.description,
          date: 'Đang diễn ra',
          progress: {
            current: quest.currentProgress,
            total: quest.requiredAmount
          }
        });
      });
    }

    // Add mocked teacher feedbacks
    items.push({
      type: 'feedback',
      title: 'Nhận xét từ GV Hóa học',
      description: 'Con học bài rất tốt, có nhiều tiến bộ trong phần nhận biết chất.',
      date: new Date().toLocaleDateString('vi-VN')
    });

    return items;
  }, [gamification]);

  // Format chart data
  const chartData = useMemo(() => {
    if (!timelineData) return [];
    return timelineData.map((item, index) => ({
      name: `Bài ${index + 1}`,
      score: item.score,
      title: item.quizTitle
    }));
  }, [timelineData]);

  if (isLoadingChildren) {
    return <div className="flex h-[80vh] items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>;
  }

  if (error || children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {error ? 'Đã xảy ra lỗi' : 'Chưa liên kết học sinh'}
        </h2>
        <p className="text-slate-500 mt-2 max-w-md">
          {error || 'Tài khoản phụ huynh của bạn chưa được liên kết với bất kỳ học sinh nào. Vui lòng gửi yêu cầu liên kết để bắt đầu theo dõi tiến độ học tập.'}
        </p>

        {/* Blank state linking form */}
        <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full text-left">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Liên kết Tài khoản Học sinh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Nhập email của học sinh để gửi yêu cầu liên kết.</p>
              <MailDeliveryReminder className="mb-4" />
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="student@example.com"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button 
                  onClick={handleLinkAccount} 
                  disabled={isLinking || !linkEmail} 
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  Gửi Yêu Cầu
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase text-slate-400 mb-3">Yêu cầu đang chờ xác nhận</h3>
              {pendingLinks.length > 0 ? (
                <div className="space-y-3">
                  {pendingLinks.map(link => (
                    <div key={link.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate mr-2">{link.targetEmail}</div>
                      <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded-lg whitespace-nowrap">Đang chờ</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center border border-slate-200 dark:border-slate-700 border-dashed">Không có yêu cầu nào đang chờ</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      {/* Header & Child Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <img
            src={selectedChild?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChild?.fullName}`}
            alt="avatar"
            className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {selectedChild?.fullName}
            </h1>
            <p className="text-slate-500 text-sm">
              Trường: {selectedChild?.schoolName} • Lớp {selectedChild?.gradeLevel}
            </p>
          </div>
        </div>

        {children.length > 1 && (
          <div className="relative">
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="appearance-none w-full md:w-64 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            >
              {children.map(c => (
                <option key={c.studentId} value={c.studentId}>
                  Xem thông tin: {c.fullName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Stats & Charts */}
        <div className="lg:col-span-2 space-y-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ParentStatsCard
              title="Điểm trung bình (Gần đây)"
              value={overview?.recentAverageScore || 0}
              subtitle="Trên thang điểm 10"
              icon={Award}
              isLoading={isLoadingStats}
              colorClass="text-amber-500"
              bgClass="bg-amber-500/10"
            />
            <ParentStatsCard
              title="Tiến độ bài tập"
              value={`${overview?.completionPercentage || 0}%`}
              subtitle={`${overview?.completedAssignments || 0} / ${overview?.totalAssignments || 0} bài đã làm`}
              icon={BookOpen}
              isLoading={isLoadingStats}
              colorClass="text-blue-500"
              bgClass="bg-blue-500/10"
            />
          </div>

          {/* Line Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Lịch sử điểm số
            </h2>
            <div className="h-72">
              {isLoadingStats ? (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      domain={[0, 10]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value, name, props) => [value, props.payload.title]}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Activity className="w-12 h-12 mb-3 opacity-20" />
                  <p>Chưa có dữ liệu bài kiểm tra</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Account Linking Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Liên kết Tài khoản Học sinh
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Nhập email của học sinh để gửi yêu cầu liên kết theo dõi quá trình học tập.</p>
                <MailDeliveryReminder className="mb-4" />
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="student@example.com"
                    value={linkEmail}
                    onChange={(e) => setLinkEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button 
                    onClick={handleLinkAccount} 
                    disabled={isLinking || !linkEmail} 
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Gửi Yêu Cầu
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase text-slate-400 mb-3">Yêu cầu đang chờ xác nhận</h3>
                {pendingLinks.length > 0 ? (
                  <div className="space-y-3">
                    {pendingLinks.map(link => (
                      <div key={link.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate mr-2">{link.targetEmail}</div>
                        <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded-lg whitespace-nowrap">Đang chờ</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center border border-slate-200 dark:border-slate-700 border-dashed">Không có yêu cầu nào đang chờ</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Gamification & Timeline */}
        <div className="space-y-8">
          <GamificationGrid level={gamification?.level} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              Hoạt động gần đây
            </h2>
            {isLoadingStats ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <Timeline items={combinedTimelineItems} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
