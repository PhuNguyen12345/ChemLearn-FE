import React from 'react';
import {
  Activity,
  Beaker,
  BookOpen,
  Bug,
  Download,
  Flag,
  Heart,
  Map,
  MessageSquare,
  Send,
  Users,
  Zap,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getAdminDashboardSummary,
  getAdminFeedbackReports,
  getUsers,
  sendAdminBiMessage,
  updateAdminFeedbackReport,
} from '@/lib/api';

const moduleColors = ['#0891b2', '#7c3aed', '#16a34a', '#f59e0b'];
const roleColors = ['#0ea5e9', '#6366f1', '#14b8a6', '#f43f5e'];

const statusLabel = {
  OPEN: 'Mới',
  REVIEWING: 'Đang xử lý',
  RESOLVED: 'Đã xử lý',
};

const priorityClass = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-sky-100 text-sky-700',
  HIGH: 'bg-rose-100 text-rose-700',
};

const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN');

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const StatCard = ({ title, value, helper, icon, accent }) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-semibold text-slate-600">{title}</CardTitle>
      <div className={`rounded-lg p-2 ${accent}`}>
        {React.createElement(icon, { className: 'h-4 w-4' })}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-slate-900">{formatNumber(value)}</div>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [summary, setSummary] = React.useState(null);
  const [reports, setReports] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [replyForms, setReplyForms] = React.useState({});
  const [replySubmitting, setReplySubmitting] = React.useState({});

  const loadDashboard = React.useCallback(async () => {
    try {
      setLoading(true);
      const [summaryData, reportData, userData] = await Promise.all([
        getAdminDashboardSummary(),
        getAdminFeedbackReports(),
        getUsers(),
      ]);
      setSummary(summaryData);
      setReports(reportData);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không tải được dashboard admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleStatusChange = async (reportId, status) => {
    try {
      const updated = await updateAdminFeedbackReport(reportId, { status });
      const nextReports = reports.map((report) => (report.id === reportId ? updated : report));
      setReports(nextReports);
      setSummary((current) =>
        current
          ? {
              ...current,
              openReports: nextReports.filter((report) => report.status !== 'RESOLVED').length,
            }
          : current
      );
      toast.success('Đã cập nhật trạng thái report.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không cập nhật được report.');
    }
  };

  const setReplyField = (reportId, value) => {
    setReplyForms((current) => ({
      ...current,
      [reportId]: value,
    }));
  };

  const handleSendReply = async (report) => {
    const message = (replyForms[report.id] || '').trim();
    if (!message) {
      toast.error('Vui lòng nhập nội dung trả lời học sinh.');
      return;
    }

    if (!report.reporterId) {
      toast.error('Report này chưa có học sinh để gửi phản hồi.');
      return;
    }

    try {
      setReplySubmitting((current) => ({ ...current, [report.id]: true }));
      await sendAdminBiMessage({
        studentId: report.reporterId,
        title: `Admin phản hồi: ${report.title || 'Tin nhắn của bạn'}`.slice(0, 180),
        message,
      });
      setReplyField(report.id, '');
      toast.success('Đã gửi tin nhắn vào chat Bi của học sinh.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không gửi được tin nhắn cho học sinh.');
    } finally {
      setReplySubmitting((current) => ({ ...current, [report.id]: false }));
    }
  };

  const moduleUsage = (summary?.moduleUsage || []).map((item, index) => ({
    ...item,
    value: item.health,
    fill: moduleColors[index % moduleColors.length],
  }));

  const roleBreakdown = (summary?.roleBreakdown || []).map((item, index) => ({
    ...item,
    value: item.count,
    fill: roleColors[index % roleColors.length],
  }));

  const findModuleHealth = (names) =>
    moduleUsage.find((item) => names.includes(item.name))?.health || 0;

  const systemModules = [
    {
      label: 'Progress map',
      icon: Map,
      total: `${formatNumber(summary?.mapIslands)} đảo / ${formatNumber(summary?.mapNodes)} nodes`,
      active: `${formatNumber(summary?.nodeProgressRecords)} lượt tiến độ`,
      health: findModuleHealth(['Progress map']),
      tone: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      label: 'Lab ảo',
      icon: Beaker,
      total: `${formatNumber(summary?.labs)} lab`,
      active: `${formatNumber(summary?.labProgressRecords)} lượt thực hành`,
      health: findModuleHealth(['Lab ảo', 'Lab ao']),
      tone: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      label: 'Bài học',
      icon: BookOpen,
      total: `${formatNumber(summary?.lessons)} bài / ${formatNumber(summary?.chapters)} chương`,
      active: `${formatNumber((summary?.completedLessonProgress || 0) + (summary?.inProgressLessonProgress || 0))} tiến độ`,
      health: findModuleHealth(['Bài học', 'Bai hoc']),
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Pet',
      icon: Heart,
      total: `${formatNumber(summary?.petSpecies)} loài / ${formatNumber(summary?.eggItems)} trứng`,
      active: `${formatNumber(summary?.studentPets)} pet của học sinh`,
      health: findModuleHealth(['Pet']),
      tone: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  const lessonProgress = [
    { name: 'Đang học', value: summary?.inProgressLessonProgress || 0, fill: '#0ea5e9' },
    { name: 'Hoàn thành', value: summary?.completedLessonProgress || 0, fill: '#22c55e' },
  ];

  const recentUsers = users.slice(0, 5);
  const openReports = reports.filter((report) => report.status !== 'RESOLVED').length;

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard quản trị</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi người dùng, bài học, lab ảo, progress map, pet và report/feedback.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={loadDashboard} disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          Tải lại dữ liệu
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Người đăng ký" value={summary?.totalUsers} helper={`${formatNumber(summary?.students)} học sinh`} icon={Users} accent="bg-sky-100 text-sky-700" />
        <StatCard title="Người dùng active" value={summary?.activeUsers} helper="Tài khoản đang hoạt động" icon={Activity} accent="bg-emerald-100 text-emerald-700" />
        <StatCard title="Phiên học/tiến độ" value={(summary?.labProgressRecords || 0) + (summary?.nodeProgressRecords || 0) + (summary?.completedLessonProgress || 0) + (summary?.inProgressLessonProgress || 0)} helper="Lab, bài học và progress map" icon={Zap} accent="bg-amber-100 text-amber-700" />
        <StatCard title="Report cần xem" value={summary?.openReports ?? openReports} helper={`${formatNumber(summary?.totalReports || reports.length)} report/feedback`} icon={Flag} accent="bg-rose-100 text-rose-700" />
      </div>

      <div className="grid gap-4 xl:grid-cols-7">
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Mức sử dụng module</CardTitle>
            <CardDescription>Tổng tài nguyên và lượt tương tác theo module.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleUsage} layout="vertical" margin={{ left: 18, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis dataKey="name" type="category" width={96} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value, name, item) => [`${value}%`, item?.payload?.name]} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {moduleUsage.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Phân bổ vai trò</CardTitle>
            <CardDescription>Số lượng tài khoản theo vai trò.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleBreakdown} dataKey="value" nameKey="role" innerRadius={64} outerRadius={96} paddingAngle={4}>
                  {roleBreakdown.map((entry) => (
                    <Cell key={entry.role} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {systemModules.map((module) => (
          <Card key={module.label} className={`border ${module.tone}`}>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <module.icon className="h-5 w-5" />
                <Badge variant="secondary">{module.health}% sử dụng</Badge>
              </div>
              <CardTitle className="text-base">{module.label}</CardTitle>
              <CardDescription>{module.total}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                <span>{module.active}</span>
                <span>{module.health}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/70">
                <div className="h-full rounded-full bg-current" style={{ width: `${module.health}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-7">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Tiến độ bài học</CardTitle>
            <CardDescription>Số bản ghi đang học và đã hoàn thành.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={lessonProgress} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={4}>
                  {lessonProgress.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Tài khoản gần đây</CardTitle>
            <CardDescription>Danh sách tài khoản mới nhất lấy từ backend.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id || user.username}>
                    <TableCell className="font-medium">{user.fullName || user.username}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                    <TableCell>{user.isActive ? 'Active' : 'Disabled'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Report & feedback từ học sinh</CardTitle>
              <CardDescription>Dữ liệu được lưu trong backend và admin có thể cập nhật trạng thái.</CardDescription>
            </div>
            <Badge className="w-fit bg-rose-100 text-rose-700 hover:bg-rose-100">{openReports} mục cần xử lý</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nội dung</TableHead>
                <TableHead>Người gửi</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Chat lại</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="max-w-md">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-lg bg-slate-100 p-2 text-slate-600">
                        {report.type === 'BUG' ? <Bug className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{report.title}</div>
                        <div className="line-clamp-2 text-sm text-muted-foreground">{report.message}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{report.reporterName || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{report.reporterEmail || '-'}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{report.type}</Badge></TableCell>
                  <TableCell><Badge className={priorityClass[report.priority] || priorityClass.MEDIUM}>{report.priority}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(report.createdAt)}</TableCell>
                  <TableCell>
                    <select
                      value={report.status}
                      onChange={(event) => handleStatusChange(report.id, event.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="OPEN">{statusLabel.OPEN}</option>
                      <option value="REVIEWING">{statusLabel.REVIEWING}</option>
                      <option value="RESOLVED">{statusLabel.RESOLVED}</option>
                    </select>
                  </TableCell>
                  <TableCell className="min-w-64">
                    <div className="space-y-2">
                      <textarea
                        value={replyForms[report.id] || ''}
                        onChange={(event) => setReplyField(report.id, event.target.value)}
                        placeholder="Nhắn động viên, hướng dẫn hoặc phản hồi cho học sinh..."
                        rows={2}
                        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-cyan-400"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="w-full bg-cyan-600 hover:bg-cyan-700"
                        disabled={replySubmitting[report.id] || !(replyForms[report.id] || '').trim()}
                        onClick={() => handleSendReply(report)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {replySubmitting[report.id] ? 'Đang gửi...' : 'Gửi qua Bi'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
