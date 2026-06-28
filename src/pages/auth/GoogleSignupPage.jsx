import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import useAuthStore from '../../stores/useAuthStore';
import { loginWithGoogle } from '@/lib/api';

export default function GoogleSignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  
  const [form, setForm] = useState({ gradeLevel: '6', gender: 'MALE', schoolName: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const pendingGoogleIdToken = location.state?.pendingGoogleIdToken;

  useEffect(() => {
    if (!pendingGoogleIdToken) {
      navigate('/auth/login', { replace: true });
    }
  }, [pendingGoogleIdToken, navigate]);

  if (!pendingGoogleIdToken) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authData = await loginWithGoogle({
        idToken: pendingGoogleIdToken,
        gradeLevel: Number(form.gradeLevel),
        gender: form.gender,
        schoolName: form.schoolName.trim() || undefined,
      });

      login(authData);

      switch (authData.role) {
        case 'ROLE_STUDENT':
          navigate('/student/home', { replace: true });
          break;
        case 'ROLE_TEACHER':
          navigate('/teacher/dashboard', { replace: true });
          break;
        case 'ROLE_PARENT':
          navigate('/parent/dashboard', { replace: true });
          break;
        case 'ROLE_ADMIN':
          navigate('/admin/dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Đăng ký tài khoản Google thất bại.';
      setError(String(backendMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50/50 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-xl"
      >
        <div className="flex items-center gap-3 text-blue-600 mb-6">
          <Sparkles className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hoàn tất đăng ký</h2>
        </div>

        <p className="text-sm text-slate-600 mb-6">
          Xin chào! Để hoàn tất việc tạo tài khoản ChemLearn bằng Google, vui lòng cho chúng tôi biết thêm một vài thông tin về bạn.
        </p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-lg text-sm mb-6"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="gradeLevel" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
              Lớp Đang Học <span className="text-red-500">*</span>
            </Label>
            <select
              id="gradeLevel"
              value={form.gradeLevel}
              onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
              className="w-full h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              {[6, 7, 8, 9].map((grade) => (
                <option key={grade} value={String(grade)}>
                  Lớp {grade}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
              Giới tính <span className="text-red-500">*</span>
            </Label>
            <select
              id="gender"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="schoolName" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
              Trường học (Tùy chọn)
            </Label>
            <Input
              id="schoolName"
              type="text"
              placeholder="VD: THCS Chu Văn An"
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md shadow-blue-500/10 cursor-pointer flex justify-center items-center"
            >
              {isLoading ? 'Đang xử lý...' : (
                <>Hoàn tất <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => navigate('/auth/login')}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer font-medium hover:underline"
          >
            Quay lại Đăng nhập
          </button>
        </div>
      </motion.div>
    </div>
  );
}
