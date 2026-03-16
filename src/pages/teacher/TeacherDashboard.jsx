import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, BarChart, TrendingUp, FileCheck, Plus, MoreHorizontal } from 'lucide-react';

const MOCK_STUDENTS = [
  { name: "Sarah L.", avatar: "SL", score: "95%", status: "Completed", statusColor: "text-green-600", grade: "A", gradeColor: "bg-green-100 text-green-800" },
  { name: "Mike B.", avatar: "MB", score: "78%", status: "Pending", statusColor: "text-amber-500", grade: "B", gradeColor: "bg-blue-100 text-blue-800" },
  { name: "Erom C.", avatar: "EC", score: "65%", status: "Pending", statusColor: "text-amber-500", grade: "C", gradeColor: "bg-orange-100 text-orange-800" },
  { name: "Emily C.", avatar: "EC", score: "60%", status: "Overdue", statusColor: "text-red-500", grade: "A", gradeColor: "bg-green-100 text-green-800" },
  { name: "Alex J.", avatar: "AJ", score: "88%", status: "Completed", statusColor: "text-green-600", grade: "B", gradeColor: "bg-blue-100 text-blue-800" },
];

const TeacherDashboard = () => {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Welcome back, Mr. Davis!</h1>
          <p className="text-muted-foreground mt-1">
            Here's your class overview for Chemistry 101.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 shadow-md transition-all">
            <Plus className="mr-2 h-4 w-4" /> Create Lesson
          </Button>
          <Button className="bg-gradient-to-r from-orange-400 to-peach-400 hover:from-orange-500 hover:to-orange-400 text-white border-0 shadow-md transition-all">
            <Plus className="mr-2 h-4 w-4" /> Create Quiz
          </Button>
        </div>
      </div>

      {/* 2. Top Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="bg-blue-50 border-blue-100 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Students</CardTitle>
            <div className="p-2 bg-blue-200 rounded-xl">
              <Users className="h-4 w-4 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">45 Students</div>
            <p className="text-xs font-semibold text-blue-600 mt-1">
              +3 this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-100 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Average Score</CardTitle>
            <div className="p-2 bg-orange-200 rounded-xl">
              <BarChart className="h-4 w-4 text-orange-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">82% (B+)</div>
            <p className="text-xs font-semibold text-orange-600 mt-1">
              &uarr; 2% from last quiz
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Class Progress</CardTitle>
            <div className="p-2 bg-green-200 rounded-xl">
              <TrendingUp className="h-4 w-4 text-green-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">65% Complete</div>
            <div className="h-2 w-full bg-green-200 rounded-full mt-2 overflow-hidden">
               <div className="h-full bg-green-500 w-[65%] rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-100 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Pending Assignments</CardTitle>
            <div className="p-2 bg-purple-200 rounded-xl">
              <FileCheck className="h-4 w-4 text-purple-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-purple-700">28</div>
            <p className="text-xs font-semibold text-purple-600 mt-1">
              Needs your review
            </p>
          </CardContent>
        </Card>

      </div>
      
      {/* 3. Tabbed Navigation Section */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl">
          <TabsTrigger value="lessons" className="rounded-lg">Lessons</TabsTrigger>
          <TabsTrigger value="quizzes" className="rounded-lg">Quizzes</TabsTrigger>
          <TabsTrigger value="assignments" className="rounded-lg">Assignments</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg">Student Performance</TabsTrigger>
        </TabsList>
        
        {/* 4. "Student Performance" Tab Content */}
        <TabsContent value="performance" className="mt-6">
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Student Performance Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-slate-100">
                    <TableHead>Student Name</TableHead>
                    <TableHead>Recent Quiz Score</TableHead>
                    <TableHead>Assignment Status</TableHead>
                    <TableHead>Overall Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_STUDENTS.map((student, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {student.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-slate-700">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">{student.score}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <span className={`h-2 w-2 rounded-full ${
                             student.status === 'Completed' ? 'bg-green-500' : 
                             student.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'
                           }`}></span>
                           <span className={`text-sm font-medium ${student.statusColor}`}>{student.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`rounded-md hover:bg-opacity-80 border-none ${student.gradeColor}`}>
                          {student.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lessons">
          <Card className="rounded-2xl p-10"><p className="text-center text-muted-foreground">Lessons content coming soon.</p></Card>
        </TabsContent>
        <TabsContent value="quizzes">
          <Card className="rounded-2xl p-10"><p className="text-center text-muted-foreground">Quizzes content coming soon.</p></Card>
        </TabsContent>
        <TabsContent value="assignments">
          <Card className="rounded-2xl p-10"><p className="text-center text-muted-foreground">Assignments content coming soon.</p></Card>
        </TabsContent>

      </Tabs>

    </div>
  );
};

export default TeacherDashboard;
