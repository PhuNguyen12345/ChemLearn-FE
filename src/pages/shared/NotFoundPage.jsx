import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, Home, SearchX } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const handleGoHome = () => {
    if (!isAuthenticated || !user) {
      navigate('/');
      return;
    }
    
    switch (user.role) {
      case 'ROLE_STUDENT':
        navigate('/student/home');
        break;
      case 'ROLE_TEACHER':
        navigate('/teacher/dashboard');
        break;
      case 'ROLE_ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'ROLE_PARENT':
        navigate('/parent/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[70vh] bg-transparent text-slate-800 p-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full text-center flex flex-col items-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
          <SearchX className="w-24 h-24 text-blue-500 relative z-10 drop-shadow-md" />
          <AlertOctagon className="w-10 h-10 text-red-500 absolute -bottom-2 -right-2 z-20 drop-shadow-md bg-white rounded-full p-1" />
        </div>
        
        <h1 className="text-5xl font-black text-slate-800 mb-3 drop-shadow-sm">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Không tìm thấy nội dung!</h2>
        
        <p className="text-slate-500 mb-8 leading-relaxed font-medium">
          Có vẻ như trang hoặc tài liệu bạn đang cố gắng truy cập không tồn tại, đã bị xóa, hoặc bạn đã nhập sai đường dẫn. Hãy kiểm tra lại URL nhé!
        </p>
        
        <button
          onClick={handleGoHome}
          className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-95"
        >
          <Home className="w-5 h-5" />
          Quay về Trang Chủ
        </button>
      </div>
    </div>
  );
}
