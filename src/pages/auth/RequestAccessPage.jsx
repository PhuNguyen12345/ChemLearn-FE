import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  Phone,
  Briefcase,
  GraduationCap,
  BookOpen,
  UserCheck, 
  Atom, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  School,
  LineChart,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_.]).{8,32}$/;
const USERNAME_REGEX = /^\S+$/;
const FULL_NAME_REGEX = /^[\p{L}]+(?: [\p{L}]+)*$/u;

const getUsernameError = (value) => {
  if (!value.trim()) return 'Vui lòng nhập username.';
  if (!USERNAME_REGEX.test(value)) return 'Username không được chứa khoảng trắng.';
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

export default function RequestAccessPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ROLE_TEACHER');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [degree, setDegree] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    fullName: '',
  });

  const handleFieldChange = (field, value) => {
    if (field === 'username') {
      setUsername(value);
      setFieldErrors((current) => ({
        ...current,
        username: getUsernameError(value),
      }));
      return;
    }

    if (field === 'fullName') {
      setFullName(value);
      setFieldErrors((current) => ({
        ...current,
        fullName: getFullNameError(value),
      }));
    }
  };

  const validateBeforeSubmit = () => {
    const normalizedUsername = username.trim();
    const normalizedFullName = fullName.trim();
    const usernameError = getUsernameError(normalizedUsername);
    const fullNameError = getFullNameError(normalizedFullName);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateBeforeSubmit()) {
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setError('Password must be 8-32 characters and include uppercase, lowercase, number, and special character.');
      return;
    }

    setIsLoading(true);

    const normalizedUsername = username.trim();
    const normalizedFullName = fullName.trim();

    try {
      await api.post('/api/auth/register', {
        username: normalizedUsername,
        fullName: normalizedFullName,
        email,
        role,
        password,
        phoneNumber,
        workplace: role === 'ROLE_TEACHER' ? workplace : undefined,
        degree: role === 'ROLE_TEACHER' ? degree : undefined,
        specialization: role === 'ROLE_TEACHER' ? specialization : undefined,
        jobTitle: role === 'ROLE_PARENT' ? jobTitle : undefined,
      });

      setSuccess('Account request submitted. Your account is pending admin approval.');
      setUsername('');
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhoneNumber('');
      setWorkplace('');
      setDegree('');
      setSpecialization('');
      setJobTitle('');
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Gửi yêu cầu thất bại.';
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
              Đồng Hành Cùng Học Sinh
            </h1>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              Dành cho Giáo viên và Phụ huynh. Gửi yêu cầu để được cấp quyền quản lý lớp học hoặc theo sát lộ trình làm bài thực hành của con.
            </p>

            {/* Core features listing */}
            <div className="grid grid-cols-1 gap-4 pt-4">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-teal-400/20 text-teal-300">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Quản Lý Lớp Học (Giáo Viên)</h4>
                  <p className="text-white/70 text-xs sm:text-sm">Tạo lời mời học sinh, theo dõi bảng xếp hạng thi đua và chấm điểm tự động.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-purple-400/20 text-purple-300">
                  <LineChart className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Theo Dõi Lộ Trình (Phụ Huynh)</h4>
                  <p className="text-white/70 text-xs sm:text-sm">Xem kết quả kiểm tra, thống kê thời gian học của con để hỗ trợ kịp thời.</p>
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

      {/* RIGHT SECTION: White Request Access Service */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white min-h-screen">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header Info */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Yêu Cầu Quyền Truy Cập</h2>
            <p className="text-slate-500 text-sm mt-2">Dành cho Giáo viên và Phụ huynh đăng ký tài khoản mới</p>
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
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang gửi yêu cầu xác thực...</p>
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
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                      Username
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a username..."
                        value={username}
                        onChange={(e) => handleFieldChange('username', e.target.value)}
                        pattern="^\\S+$"
                        title="Username must not contain whitespace"
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
                        <User className="w-4 h-4" />
                      </div>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Nhập họ và tên đầy đủ..."
                        value={fullName}
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
                        placeholder="name@school.edu.vn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                      Password
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                      Vai trò đăng ký
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 text-slate-900 pl-10 pr-3 py-2 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="ROLE_TEACHER">Giáo Viên (Teacher)</option>
                        <option value="ROLE_PARENT">Phụ Huynh (Parent)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                      Phone number
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="09xx xxx xxx"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10"
                      />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {role === 'ROLE_TEACHER' && (
                      <motion.div
                        key="teacher-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="workplace" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                              Workplace
                            </Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <School className="w-4 h-4" />
                              </div>
                              <Input
                                id="workplace"
                                type="text"
                                placeholder="School or organization"
                                value={workplace}
                                onChange={(e) => setWorkplace(e.target.value)}
                                required={role === 'ROLE_TEACHER'}
                                className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="degree" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                              Degree
                            </Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <GraduationCap className="w-4 h-4" />
                              </div>
                              <select
                                id="degree"
                                value={degree}
                                onChange={(e) => setDegree(e.target.value)}
                                required={role === 'ROLE_TEACHER'}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white text-slate-900 pl-10 pr-3 py-2 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100"
                              >
                                <option value="">Select degree</option>
                                <option value="Cử nhân">Cử nhân</option>
                                <option value="Thạc sĩ">Thạc sĩ</option>
                                <option value="Tiến sĩ">Tiến sĩ</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="specialization" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                              Specialization
                            </Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <Input
                                id="specialization"
                                type="text"
                                placeholder="Chemistry, organic chemistry..."
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                required={role === 'ROLE_TEACHER'}
                                className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {role === 'ROLE_PARENT' && (
                      <motion.div
                        key="parent-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1.5 rounded-lg border border-teal-100 bg-teal-50/40 p-3">
                          <Label htmlFor="jobTitle" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                            Job title
                          </Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <Input
                              id="jobTitle"
                              type="text"
                              placeholder="Engineer, business owner..."
                              value={jobTitle}
                              onChange={(e) => setJobTitle(e.target.value)}
                              required={role === 'ROLE_PARENT'}
                              className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    Gửi Yêu Cầu <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                {/* Sub routing services */}
                <div className="pt-4 border-t border-slate-100 text-center">
                  <Link to="/login" className="text-slate-500 hover:text-slate-700 text-sm inline-flex items-center gap-1.5 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  );
}
