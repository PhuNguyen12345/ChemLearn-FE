import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Atom, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Trophy,
  GraduationCap
} from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_.]).{8,32}$/;
const USERNAME_REGEX = /^\S+$/;
const FULL_NAME_REGEX = /^[\p{L}]+(?: [\p{L}]+)*$/u;

const getUsernameError = (value) => {
  if (!value.trim()) return 'Tên đăng nhập là bắt buộc.';
  if (!USERNAME_REGEX.test(value)) return 'Tên đăng nhập không được chứa khoảng trắng.';
  return '';
};

const getFullNameError = (value) => {
  const normalizedValue = value.trim();
  if (!normalizedValue) return 'Họ và tên là bắt buộc.';
  if (!FULL_NAME_REGEX.test(normalizedValue)) return 'Họ và tên chỉ được chứa chữ cái và khoảng trắng.';
  return '';
};

// Interactive Light-mode Molecular Canvas for Left Panel Graphic
function GraphicCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const particleCount = 25;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 4 + 2,
        color: i % 2 === 0 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.15)'
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 150) * 0.12})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gradeLevel: '6',
    gender: 'boy',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    fullName: '',
  });
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));

    if (field === 'username') {
      setFieldErrors((current) => ({
        ...current,
        username: getUsernameError(value),
      }));
    }

    if (field === 'fullName') {
      setFieldErrors((current) => ({
        ...current,
        fullName: getFullNameError(value),
      }));
    }
  };

  const validateBeforeSubmit = () => {
    const usernameError = getUsernameError(formData.username);
    const fullNameError = getFullNameError(formData.fullName);

    setFieldErrors({
      username: usernameError,
      fullName: fullNameError,
    });

    if (usernameError || fullNameError) {
      setError(usernameError || fullNameError);
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!PASSWORD_REGEX.test(formData.password)) {
      setError('Mật khẩu phải từ 8-32 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
      return;
    }

    if (!validateBeforeSubmit()) {
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        gradeLevel: Number(formData.gradeLevel),
        gender: formData.gender,
      });

      logout();
      setSuccess('Đăng ký thành công! Đang chuyển hướng sang trang đăng nhập...');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Đăng ký thất bại. Tên tài khoản hoặc email có thể đã được sử dụng.';
      setError(String(backendMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50/50 font-sans">
      
      {/* LEFT SECTION: Graphics & Concept Showcase */}
      <div className="relative w-full lg:w-1/2 bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900 flex flex-col justify-between p-8 sm:p-16 text-white overflow-hidden shrink-0 min-h-[360px] lg:min-h-screen">
        {/* Floating chemistry grid background */}
        <GraphicCanvas />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-300/5 rounded-full blur-3xl pointer-events-none" />

        {/* Logo and branding */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Atom className="w-6 h-6 text-teal-300 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">ChemLearn</span>
        </div>

        {/* Website concept presentation */}
        <div className="relative z-10 my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 max-w-lg"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white tracking-tight">
              Khởi Đầu Hành Trình Hóa Học
            </h1>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              Tạo tài khoản học sinh ChemLearn của bạn để mở khóa các bài học tương tác, thực hành thí nghiệm và nhận điểm thưởng khi hoàn thành bài tập!
            </p>

            {/* Core features listing */}
            <div className="grid grid-cols-1 gap-4 pt-4">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-teal-400/20 text-teal-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Học Tập Chủ Động</h4>
                  <p className="text-white/70 text-xs sm:text-sm font-medium">Truy cập hàng trăm lý thuyết hóa học kèm hình ảnh minh họa sống động.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-purple-400/20 text-purple-300">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base font-bold">Nhiệm Vụ & Bảng Xếp Hạng</h4>
                  <p className="text-white/70 text-xs sm:text-sm">Tranh tài cùng bạn học, giữ chuỗi ngày streak học tập để tăng hạng.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-white/50 text-xs mt-auto">
          © 2026 ChemLearn Platform. Thiết kế hướng tới tương lai giáo dục.
        </div>
      </div>

      {/* RIGHT SECTION: White Registration Service */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white min-h-screen">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header Info */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Đăng Ký Tài Khoản</h2>
            <p className="text-slate-500 text-sm mt-2">Đăng ký tài khoản học sinh ChemLearn mới</p>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                <div className="flex flex-col items-center justify-center space-y-3 py-10">
                  <div className="relative w-12 h-16 text-blue-500">
                    <svg viewBox="0 0 64 80" className="w-full h-full text-blue-500 drop-shadow-sm animate-pulse" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 12H42V24L56 64C59 72 53 76 45 76H19C11 76 5 72 8 64L22 24V12Z" stroke="currentColor" strokeWidth="4" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang khởi tạo tài khoản...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-lg text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-start gap-2 bg-emerald-55 border border-emerald-200 text-emerald-700 p-3.5 rounded-lg text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                    <span>{success}</span>
                  </motion.div>
                )}

                {/* Form fields */}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="gradeLevel" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                        Khối lớp
                      </Label>
                      <select
                        id="gradeLevel"
                        value={formData.gradeLevel}
                        onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                        className="w-full h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-blue-100"
                        required
                      >
                        {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
                          <option key={grade} value={String(grade)}>
                            Lớp {grade}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="gender" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                        Giới tính
                      </Label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-blue-100"
                        required
                      >
                        <option value="boy">Nam</option>
                        <option value="girl">Nữ</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                      Tên đăng nhập
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Nhập tên đăng nhập..."
                        value={formData.username}
                        onChange={(e) => handleFieldChange('username', e.target.value)}
                        pattern="^\\S+$"
                        title="Tên đăng nhập không được chứa khoảng trắng"
                        required
                        className={`bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-blue-100 pl-10 ${fieldErrors.username ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                      />
                    </div>
                    {fieldErrors.username && (
                      <p className="text-xs font-medium text-red-600">{fieldErrors.username}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                      Họ và tên
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Nhập đầy đủ họ tên..."
                        value={formData.fullName}
                        onChange={(e) => handleFieldChange('fullName', e.target.value)}
                        pattern="^[\\p{L}]+(?: [\\p{L}]+)*$"
                        title="Họ và tên chỉ được chứa chữ cái và khoảng trắng"
                        required
                        className={`bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-blue-100 pl-10 ${fieldErrors.fullName ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="text-xs font-medium text-red-600">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                      Địa chỉ Email
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu..."
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                      Xác nhận mật khẩu
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Xác nhận lại mật khẩu..."
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-450 leading-relaxed bg-slate-50 border border-slate-100 p-2.5 rounded-lg space-y-0.5">
                    <p>📌 Mật khẩu bao gồm: 8-32 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt.</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    Đăng Ký Tài Khoản <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                {/* Sub routing services */}
                <div className="pt-4 border-t border-slate-100 text-center">
                  <div className="text-sm text-slate-500">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="text-blue-600 font-bold hover:text-blue-500 hover:underline">
                      Đăng nhập ngay
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  );
}
