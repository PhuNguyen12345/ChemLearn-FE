import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getTeacherClasses, 
  getTeacherQuizzes, 
  getTeacherAssignments,
  createTeacherAssignment,
  deleteTeacherAssignment
} from '@/lib/api';
import { 
  ChevronLeft, 
  FilePenLine, 
  Plus, 
  Trash2, 
  LoaderCircle, 
  CheckCircle2,
  Calendar,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const TeacherClassQuizzes = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [targetClass, setTargetClass] = useState(null);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [classes, quizzes, assigns] = await Promise.all([
        getTeacherClasses(),
        getTeacherQuizzes(),
        getTeacherAssignments()
      ]);
      
      const foundClass = classes.find(c => c.id === classId);
      if (!foundClass) return;
      
      setTargetClass(foundClass);
      setAllQuizzes(quizzes || []);
      setAssignments(assigns.filter(a => a.classId === classId && a.quizId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [classId]);

  const handleAssignQuiz = async () => {
    if (!selectedQuizId) return;
    try {
      setProcessingId(selectedQuizId);
      await createTeacherAssignment({
        quizId: selectedQuizId,
        classId,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null
      });
      setSelectedQuizId('');
      setDueDate('');
      await loadData();
    } catch (err) {
      alert('Failed to assign quiz');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('Remove this quiz from class?')) return;
    try {
      setProcessingId(assignmentId);
      await deleteTeacherAssignment(assignmentId);
      await loadData();
    } catch (err) {
      alert('Failed to remove quiz');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const assignedQuizIds = new Set(assignments.map(a => a.quizId));

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/teacher/classes')} className="rounded-full h-10 w-10 p-0">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Quản lý bài kiểm tra</h1>
            <p className="text-slate-500 font-bold">Lớp học: {targetClass?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg font-black text-slate-800">Thêm bài kiểm tra mới</CardTitle>
              <CardDescription className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
                Chọn bài kiểm tra từ thư viện của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Quiz</label>
                <select 
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-700 bg-white"
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                >
                  <option value="">Chọn một bài kiểm tra...</option>
                  {allQuizzes.filter(q => !assignedQuizIds.has(q.id)).map(q => (
                    <option key={q.id} value={q.id}>{q.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Due Date (Optional)</label>
                <input 
                  type="datetime-local"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-700 bg-white"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <Button 
                className="w-full rounded-xl h-11 font-black bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"
                disabled={!selectedQuizId || processingId}
                onClick={handleAssignQuiz}
              >
                {processingId && !processingId.length > 20 ? <LoaderCircle className="animate-spin mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
                Thêm bài kiểm tra
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Assignments */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Current Class Quizzes</h2>
          {assignments.length === 0 ? (
            <div className="py-12 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
              <div className="mx-auto w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                <FilePenLine className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold italic text-sm">Không có bài kiểm tra được giao cho lớp này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assignments.map(assign => {
                const quiz = allQuizzes.find(q => q.id === assign.quizId);
                return (
                  <Card key={assign.id} className="border-slate-100 hover:border-indigo-100 transition-colors shadow-sm overflow-hidden group">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <FilePenLine className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {quiz?.title || assign.title || 'Untitled Quiz'}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                              {quiz?.quizType || 'QUIZ'}
                            </span>
                            {assign.dueDate && (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                                <Calendar className="h-3 w-3" />
                                Hết hạn: {new Date(assign.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link to={`/teacher/classes/${classId}/quizzes/${quiz?.id}/submissions`}>
                          <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold gap-2">
                            <Eye className="h-4 w-4" />
                            Bài làm của sinh viên
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 w-9 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          onClick={() => handleRemoveAssignment(assign.id)}
                          disabled={processingId === assign.id}
                        >
                          {processingId === assign.id ? <LoaderCircle className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherClassQuizzes;
