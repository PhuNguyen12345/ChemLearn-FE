import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getTeacherClasses,
  getTeacherSubmissions,
  removeStudentFromTeacherClass
} from '@/lib/api';
import { 
  ChevronLeft, 
  Users, 
  Search, 
  Mail, 
  ExternalLink,
  LoaderCircle,
  GraduationCap,
  Trophy,
  UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const TeacherClassStudents = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [targetClass, setTargetClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [submissions, setSubmissions] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classes, allSubmissions] = await Promise.all([
        getTeacherClasses(),
        getTeacherSubmissions()
      ]);
      
      const foundClass = classes.find(c => c.id === classId);
      if (!foundClass) return;
      
      setTargetClass(foundClass);
      setSubmissions(allSubmissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [classId]);

  const handleRemoveStudent = async (studentId, studentName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${studentName} khỏi lớp này không?`)) {
      try {
        await removeStudentFromTeacherClass(classId, studentId);
        // Remove from local state
        setTargetClass(prev => ({
          ...prev,
          students: prev.students.filter(s => s.id !== studentId)
        }));
      } catch (err) {
        console.error('Không thể xóa sinh viên:', err);
        alert('Không thể xóa sinh viên. Vui lòng thử lại sau.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredStudents = (targetClass?.students || []).filter(student => 
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/teacher/classes')} className="rounded-full h-10 w-10 p-0">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Danh sách sinh viên tham gia lớp học</h1>
            <p className="text-slate-500 font-bold">{targetClass?.name} • {targetClass?.students?.length || 0} Sinh viên</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] border-slate-100 shadow-sm bg-indigo-50/50 border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{targetClass?.students?.length || 0}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số sinh viên</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-100 shadow-sm bg-emerald-50/50 border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">
                {submissions.filter(s => targetClass.students.some(st => st.username === s.studentName)).length}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số bài đã nộp</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-100 shadow-sm bg-amber-50/50 border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">
                {targetClass.classCode}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mã lớp học</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and List */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden border-2">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-black text-slate-800">Danh sách sinh viên tham gia lớp học</CardTitle>
              <CardDescription className="font-bold">Quản lý và xem thông tin của tất cả sinh viên trong lớp.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/10 transition outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Quizzes</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold italic">
                      Không tìm thấy sinh viên nào trong lớp.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const studentSubs = submissions.filter(s => s.studentName === student.username);
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                              <AvatarFallback className="bg-indigo-100 text-indigo-600 font-black text-xs">
                                {student.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{student.username}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                            <Mail className="h-3.5 w-3.5 text-slate-300" />
                            {student.email}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase">
                              {studentSubs.length} Bài kiểm tra
                            </span>
                            {studentSubs.length > 0 && (
                               <span className="text-[10px] font-black text-emerald-600">
                                 Trung bình: {Math.round(studentSubs.reduce((acc, curr) => acc + curr.score, 0) / studentSubs.length)}%
                               </span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/teacher/students/${student.id}`}>
                              <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 gap-2 font-bold h-9">
                                Xem hồ sơ
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRemoveStudent(student.id, student.username)}
                              className="rounded-xl border-slate-200 text-rose-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 gap-2 font-bold h-9"
                            >
                              Xóa
                              <UserMinus className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherClassStudents;
