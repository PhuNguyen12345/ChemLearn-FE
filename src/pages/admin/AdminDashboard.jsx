import React from 'react';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  Activity, 
  Download,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Line, 
  LineChart,
  ResponsiveContainer
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';

// --- MOCK DATA ---

const userGrowthData = [
  { month: 'Jan', users: 1200 },
  { month: 'Feb', users: 1900 },
  { month: 'Mar', users: 2400 },
  { month: 'Apr', users: 3100 },
  { month: 'May', users: 4800 },
  { month: 'Jun', users: 6500 },
];

const revenueData = [
  { month: 'Jan', revenue: 15400 },
  { month: 'Feb', revenue: 21200 },
  { month: 'Mar', revenue: 26800 },
  { month: 'Apr', revenue: 32100 },
  { month: 'May', revenue: 38900 },
  { month: 'Jun', revenue: 45231 },
];

const recentSignups = [
  {
    id: 1,
    name: 'Nguyen Van A',
    email: 'nguyenvana@gmail.com',
    role: 'Student',
    status: 'Active',
    avatar: 'NA',
  },
  {
    id: 2,
    name: 'Tran Thi B',
    email: 'tranthib@school.edu.vn',
    role: 'Teacher',
    status: 'Active',
    avatar: 'TB',
  },
  {
    id: 3,
    name: 'Le Hoang C',
    email: 'lehoangc@gmail.com',
    role: 'Parent',
    status: 'Pending',
    avatar: 'LC',
  },
  {
    id: 4,
    name: 'Pham Dinh D',
    email: 'phamdinhd@gmail.com',
    role: 'Student',
    status: 'Active',
    avatar: 'PD',
  },
];

const userGrowthConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--primary))",
  },
};

const revenueConfig = {
  revenue: {
    label: "Revenue ($)",
    color: "hsl(var(--chart-2))",
  },
};

const AdminDashboard = () => {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Tổng quan hệ thống</h2>
          <p className="text-muted-foreground">Theo dõi số liệu nền tảng, tăng trưởng người dùng và doanh thu.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="hidden sm:flex">
            Chọn khoảng thời gian
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Tải báo cáo
          </Button>
        </div>
      </div>

      {/* 2. Top Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.231.890 VNĐ</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">+20.1%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.350</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">+180.1%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gói hoạt động</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">+19%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian hoạt động</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">+0.001%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* User Growth Chart - Takes up more space */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Tăng trưởng người dùng</CardTitle>
            <CardDescription>Số lượng người dùng mới đăng ký trong 6 tháng qua.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={userGrowthConfig} className="h-[300px] w-full">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="users" stroke="var(--color-users)" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Xu hướng doanh thu</CardTitle>
            <CardDescription>Tổng doanh thu theo tháng.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={revenueConfig} className="h-[300px] w-full">
              <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

      </div>

      {/* 4. Recent Signups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký gần đây</CardTitle>
          <CardDescription>
            Danh sách người dùng mới đăng ký.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px]">Người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSignups.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {/* Mock Avatar Image */}
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                        <AvatarFallback>{user.avatar}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                       user.role === 'Student' ? 'bg-sky-100 text-sky-700 hover:bg-sky-100' :
                       user.role === 'Teacher' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' :
                       'bg-teal-100 text-teal-700 hover:bg-teal-100'
                    }>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <span className={`h-2 w-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                       <span className="text-sm font-medium">{user.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Mở menu</span>
                    </Button>
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
