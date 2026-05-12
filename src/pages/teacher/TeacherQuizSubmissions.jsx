import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getTeacherSubmissions, 
  getTeacherSubmissionDetail,
  gradeTeacherSubmission,
  getTeacherQuizzes,
  getTeacherClasses
} from '@/lib/api';
import { 
  ChevronLeft, 
  FilePenLine, 
  LoaderCircle, 
  CheckCircle2,
  Clock,
  User as UserIcon,
  AlertCircle,
  Search,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TeacherQuizSubmissions = () => {
  const { classId, quizId } = useParams();
  const navigate = useNavigate();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [targetClass, setTargetClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection state
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [gradingScore, setGradingScore] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subs, quizzes, classes] = await Promise.all([
        getTeacherSubmissions(),
        getTeacherQuizzes(),
        getTeacherClasses()
      ]);
      
      const foundQuiz = quizzes.find(q => q.id === quizId);
      const foundClass = classes.find(c => c.id === classId);
      
      setQuiz(foundQuiz);
      setTargetClass(foundClass);
      
      // Filter submissions for this specific quiz
      // Note: The backend returns all submissions for teacher's quizzes.
      // We should ideally filter by classId too if the backend supports it.
      // For now, filtering by quizTitle and then maybe student check if possible.
      const filtered = subs.filter(s => s.quizTitle === foundQuiz?.title);
      setSubmissions(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [quizId]);

  const handleViewDetail = async (submission) => {
    try {
      setDetailLoading(true);
      const detail = await getTeacherSubmissionDetail(submission.attemptId);
      setSelectedSubmission(detail);
      setGradingScore(detail.score || '');
    } catch (err) {
      alert('Failed to load submission details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;
    try {
      setSubmittingGrade(true);
      await gradeTeacherSubmission(selectedSubmission.attemptId, {
        finalScore: parseInt(gradingScore)
      });
      setSelectedSubmission(null);
      await loadData();
    } catch (err) {
      alert('Failed to submit grade');
    } finally {
      setSubmittingGrade(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredSubmissions = submissions.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full h-10 w-10 p-0">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Submissions</h1>
            <p className="text-slate-500 font-bold">{quiz?.title} • {targetClass?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List Side */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search student..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/10 transition outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
            {filteredSubmissions.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold italic text-sm">No submissions found.</p>
              </div>
            ) : (
              filteredSubmissions.map(sub => (
                <button 
                  key={sub.attemptId}
                  onClick={() => handleViewDetail(sub)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                    selectedSubmission?.attemptId === sub.attemptId 
                      ? 'border-indigo-500 bg-indigo-50/30' 
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                      {sub.studentName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-800 text-sm">{sub.studentName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                        {sub.status === 'NEEDS_GRADING' ? (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[9px] font-black h-4 uppercase px-1.5">Needs Grading</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[9px] font-black h-4 uppercase px-1.5">Graded</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-700">{sub.score}%</div>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${selectedSubmission?.attemptId === sub.attemptId ? 'translate-x-1 text-indigo-500' : 'text-slate-300'}`} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail Side */}
        <div className="lg:col-span-7">
          {detailLoading ? (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <LoaderCircle className="w-8 h-8 animate-spin text-indigo-500" />
            </Card>
          ) : selectedSubmission ? (
            <Card className="border-slate-200 shadow-xl overflow-hidden border-t-8 border-t-indigo-500 h-full flex flex-col">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black text-slate-800">{selectedSubmission.studentName}</CardTitle>
                      <CardDescription className="font-bold text-xs">Submission Detail</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-600">{selectedSubmission.score}%</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Score</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar max-h-[calc(100vh-400px)]">
                {selectedSubmission.answers?.map((ans, idx) => (
                  <div key={ans.questionId} className="space-y-3 pb-6 border-b border-slate-100 last:border-0">
                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0 mt-1">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-700 leading-relaxed mb-2">{ans.prompt}</div>
                        
                        {ans.questionType === 'ESSAY' ? (
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 italic text-slate-600 text-sm whitespace-pre-wrap">
                            {ans.selectedOption || <span className="text-slate-300 font-bold">No answer provided.</span>}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-700">
                              Correct: {ans.correctOption}
                            </div>
                            <div className={`p-2 rounded-lg border text-[11px] font-bold ${ans.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                              Answered: {ans.selectedOption}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="bg-slate-50 p-6 border-t border-slate-100">
                <div className="w-full space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Update Final Score (0-100)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        className="w-full rounded-xl border-2 border-slate-200 p-2.5 text-sm font-black text-indigo-600 focus:border-indigo-500 transition outline-none"
                        value={gradingScore}
                        onChange={(e) => setGradingScore(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleGrade}
                      disabled={submittingGrade}
                      className="rounded-xl h-11 px-8 font-black bg-slate-800 hover:bg-slate-900 shadow-md transition-all active:scale-95"
                    >
                      {submittingGrade ? <LoaderCircle className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Save Grade
                    </Button>
                  </div>
                  <div className="flex items-start gap-2 text-[10px] font-bold text-slate-400 bg-white p-3 rounded-xl border border-slate-100">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Updating the score will mark the submission as COMPLETED. Make sure to review all essay questions before saving.
                  </div>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 min-h-[400px]">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4">
                <ClipboardList className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">No submission selected</h3>
              <p className="text-slate-400 font-bold max-w-xs mx-auto">Select a student submission from the list on the left to view details and grade essays.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherQuizSubmissions;
