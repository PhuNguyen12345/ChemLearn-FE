import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getTeacherClasses, 
  getTeacherChapters, 
  addChapterToClass, 
  removeChapterFromClass 
} from '@/lib/api';
import { 
  ChevronLeft, 
  BookOpen, 
  Plus, 
  Trash2, 
  LoaderCircle, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const TeacherClassChapters = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [targetClass, setTargetClass] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [classes, chapters] = await Promise.all([
        getTeacherClasses(),
        getTeacherChapters()
      ]);
      
      const foundClass = classes.find(c => c.id === classId);
      if (!foundClass) {
        setError('Không tìm thấy lớp học');
        return;
      }
      
      setTargetClass(foundClass);
      setAllChapters(chapters || []);
    } catch (err) {
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [classId]);

  const handleToggleChapter = async (chapterId, isAssigned) => {
    try {
      setProcessingId(chapterId);
      if (isAssigned) {
        await removeChapterFromClass(classId, chapterId);
      } else {
        await addChapterToClass(classId, chapterId);
      }
      await loadData();
    } catch (err) {
      alert('Không thể cập nhật bài học');
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

  const assignedChapterIds = new Set((targetClass?.chapters || []).map(c => c.id));

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/teacher/classes')} className="rounded-full h-10 w-10 p-0">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Quản lý chương</h1>
            <p className="text-slate-500 font-bold">Lớp học: {targetClass?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assigned Chapters */}
        <Card className="border-emerald-100 bg-emerald-50/30">
          <CardHeader>
            <CardTitle className="text-lg font-black text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Đã gán cho lớp
            </CardTitle>
            <CardDescription className="text-emerald-600/70 font-semibold">
              Nội dung hiển thị cho học sinh trong lớp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {targetClass?.chapters?.length === 0 ? (
              <div className="py-8 text-center text-emerald-600/50 font-bold italic">
                Chưa có chương nào.
              </div>
            ) : (
              targetClass.chapters.map(chapter => (
                <div key={chapter.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{chapter.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{chapter.description}</div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => handleToggleChapter(chapter.id, true)}
                    disabled={processingId === chapter.id}
                  >
                    {processingId === chapter.id ? <LoaderCircle className="animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Available Chapters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-500" />
              Các chương khả dụng
            </CardTitle>
            <CardDescription className="font-semibold">
              Chọn các chương để thêm vào lớp học.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {allChapters.filter(c => !assignedChapterIds.has(c.id)).length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-bold italic">
                Đã gán hết các chương.
              </div>
            ) : (
              allChapters.filter(c => !assignedChapterIds.has(c.id)).map(chapter => (
                <div key={chapter.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{chapter.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{chapter.description}</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    onClick={() => handleToggleChapter(chapter.id, false)}
                    disabled={processingId === chapter.id}
                  >
                    {processingId === chapter.id ? <LoaderCircle className="animate-spin" /> : 'Assign'}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherClassChapters;
