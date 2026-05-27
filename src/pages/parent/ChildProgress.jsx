import React from 'react';
import { User, Award, Beaker, BookOpen, Star } from 'lucide-react';

const mockData = {
  parentName: 'Sarah',
  studentName: 'Alex',
  overallProgress: 'Làm Tốt!',
  currentModule: { name: 'Phản ứng hóa học', progress: 75 },
  quizAverage: 86,
  recentAchievement: {
    title: 'Chứng chỉ hoàn thành: Giới thiệu về nguyên tử',
    date: 'Ngày 15 tháng 3 năm 2026',
  },
  timeline: [
    { day: 'Thứ 2', type: 'lab', title: 'Phòng thí nghiệm ảo - Trộn dung dịch', icon: Beaker },
    { day: 'Thứ 4', type: 'lesson', title: 'Bài học - Bảng tuần hoàn', icon: BookOpen },
    { day: 'Thứ 6', type: 'quiz', title: 'Kiểm tra - Liên kết cơ bản', icon: Star },
  ],
  feedback: [
    {
      id: 1,
      teacherName: 'Mr. Davis',
      role: 'Giáo viên Hóa học',
      quote: "Alex đã thể hiện sự nhiệt tình trong các buổi học thực hành ảo! Hãy tiếp tục phát huy.",
    },
    {
      id: 2,
      teacherName: 'Ms. Robinson',
      role: 'Giáo viên Hóa học',
      quote: "Em đã có sự cải thiện đáng kể trong các bài kiểm tra gần đây. Em đang nắm bắt các khái niệm rất tốt.",
    },
  ],
};

const ChildProgress = () => {
  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* 1. Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          Chào mừng, {mockData.parentName}. Đây là tiến độ của {mockData.studentName}.
        </h1>
      </div>

      {/* 2. Top Section (Grid layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Student Summary */}
        <div className="bg-amber-50 rounded-xl p-6 shadow-sm border border-amber-100 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-16 h-16 bg-amber-200 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div className="flex-1 w-full space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Tóm tắt</h2>
            <p className="text-amber-700 font-medium">Tiến độ tổng thể: {mockData.overallProgress}</p>

            <div className="space-y-3">
               <div>
                 <div className="flex justify-between text-sm mb-1 text-slate-600 font-medium">
                   <span>Module hiện tại: {mockData.currentModule.name}</span>
                   <span>{mockData.currentModule.progress}%</span>
                 </div>
                 <div className="w-full bg-amber-200/50 rounded-full h-2">
                   <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${mockData.currentModule.progress}%` }}></div>
                 </div>
               </div>

               <div>
                 <div className="flex justify-between text-sm mb-1 text-slate-600 font-medium">
                   <span>Điểm trung bình Quiz</span>
                   <span>{mockData.quizAverage}%</span>
                 </div>
                 <div className="w-full bg-amber-200/50 rounded-full h-2">
                   <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${mockData.quizAverage}%` }}></div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Card: Recent Achievement */}
        <div className="bg-orange-50 rounded-xl p-6 shadow-sm border border-orange-100 flex flex-col items-center justify-center text-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 w-full text-left">Thành tích gần đây</h2>
          <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
            <Award className="w-10 h-10" />
          </div>
          <div>
            <p className="font-bold text-slate-700 text-lg">{mockData.recentAchievement.title}</p>
            <p className="text-orange-600 font-medium mt-1">{mockData.recentAchievement.date}</p>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: "Weekly Activity Timeline" */}
      <div className="bg-teal-50 rounded-xl p-8 shadow-sm border border-teal-100">
        <h2 className="text-xl font-bold text-slate-800 mb-8">Timeline hoạt động trong tuần</h2>
        
        <div className="relative w-full py-4">
          {/* Continuous Line */}
          <div className="absolute h-1 bg-teal-200 w-full top-1/2 left-0 -translate-y-1/2 z-0 rounded-full hidden sm:block"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-8 sm:gap-0">
            {mockData.timeline.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <p className="font-bold text-slate-600 mb-2">{item.day}</p>
                <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 border-4 border-teal-50 flex items-center justify-center shadow-sm">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-center mt-3 max-w-[150px]">
                  <p className="text-sm font-medium text-teal-800">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: "Teacher Feedback" */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Nhận xét của giáo viên</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockData.feedback.map((fb) => (
            <div key={fb.id} className="bg-indigo-50 rounded-xl p-6 shadow-sm border border-indigo-100 flex gap-4">
              <div className="w-10 h-10 bg-indigo-200 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{fb.teacherName}</h3>
                <p className="text-xs font-medium text-indigo-500 mb-2">{fb.role}</p>
                <p className="text-slate-600 italic text-sm leading-relaxed">"{fb.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChildProgress;
