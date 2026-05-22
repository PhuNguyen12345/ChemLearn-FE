import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Atom, 
  AlertCircle, 
  CheckCircle2, 
  Briefcase, 
  Phone, 
  GraduationCap, 
  School, 
  BookOpen, 
  ArrowRight,
  UserCheck,
  Award,
  Sparkles,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { acceptInvite } from '@/lib/api';

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

export default function InviteAcceptPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');

  // Teacher fields
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [degree, setDegree] = useState('');
  const [workplace, setWorkplace] = useState('');

  // Parent fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Mã mời (token) không hợp lệ hoặc bị thiếu.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await acceptInvite({
        token,
        username,
        password,
        fullName,
        bio,
        specialization,
        degree,
        workplace,
        phoneNumber,
        jobTitle,
      });

      setSuccess('Tài khoản kích hoạt thành công! Đang chuyển hướng sang trang đăng nhập...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Kích hoạt tài khoản thất bại.';
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
              Chào Mừng Đến Với ChemLearn
            </h1>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              Bạn nhận được lời mời tham gia từ ban quản trị. Hãy điền các thông tin bảo mật và hồ sơ bổ sung để hoàn tất kích hoạt tài khoản của bạn.
            </p>

            {/* Core features listing */}
            <div className="grid grid-cols-1 gap-4 pt-4">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-teal-400/20 text-teal-300">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Thiết Lập Bảo Mật</h4>
                  <p className="text-white/70 text-xs sm:text-sm">Đăng ký tên tài khoản và mật khẩu bảo mật riêng để đăng nhập các dịch vụ học tập.</p>
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

      {/* RIGHT SECTION: White Accept Invitation Service */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white min-h-screen">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header Info */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hoàn Tất Kích Hoạt</h2>
            <p className="text-slate-500 text-sm mt-2">Kích hoạt tài khoản và cập nhật hồ sơ thành viên của bạn</p>
          </div>

          {!token && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
              <span>Thiếu mã mời (token) trong liên kết. Vui lòng kiểm tra lại Email mời của bạn hoặc liên hệ Admin.</span>
            </motion.div>
          )}

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
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang cập nhật tài khoản...</p>
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Account section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-blue-600 border-b border-slate-100 pb-1 uppercase tracking-wider">
                      1. Thông tin bắt buộc
                    </h3>
                    
                    <div className="space-y-3">
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
                            placeholder="Nhập tên tài khoản..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={!token}
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
                            placeholder="Nhập mật khẩu mới..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={!token}
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
                            placeholder="Nhập đầy đủ họ và tên..."
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            disabled={!token}
                            className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile detail section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-teal-600 border-b border-slate-100 pb-1 uppercase tracking-wider">
                      2. Hồ sơ chi tiết (Tùy chọn)
                    </h3>
                    
                    {/* Teacher Profiles */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-3">
                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-wider">
                        <School className="w-3.5 h-3.5" /> Cho Giáo Viên:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="workplace" className="text-[9px] text-slate-400 font-bold uppercase">Nơi công tác</Label>
                          <Input
                            id="workplace"
                            type="text"
                            placeholder="Trường THPT..."
                            value={workplace}
                            onChange={(e) => setWorkplace(e.target.value)}
                            className="h-8 text-xs bg-white border-slate-200"
                            disabled={!token}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="specialization" className="text-[9px] text-slate-400 font-bold uppercase">Chuyên môn</Label>
                          <Input
                            id="specialization"
                            type="text"
                            placeholder="Hóa học lớp 10..."
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            className="h-8 text-xs bg-white border-slate-200"
                            disabled={!token}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="degree" className="text-[9px] text-slate-400 font-bold uppercase">Bằng cấp</Label>
                          <Input
                            id="degree"
                            type="text"
                            placeholder="Cử nhân, Thạc sĩ..."
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                            className="h-8 text-xs bg-white border-slate-200"
                            disabled={!token}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="bio" className="text-[9px] text-slate-400 font-bold uppercase">Tiểu sử</Label>
                          <Input
                            id="bio"
                            type="text"
                            placeholder="Giới thiệu ngắn..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="h-8 text-xs bg-white border-slate-200"
                            disabled={!token}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Parent Profiles */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-3">
                      <span className="text-[10px] font-bold text-teal-600 flex items-center gap-1 uppercase tracking-wider">
                        <User className="w-3.5 h-3.5" /> Cho Phụ Huynh:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="phoneNumber" className="text-[9px] text-slate-400 font-bold uppercase">Số điện thoại</Label>
                          <Input
                            id="phoneNumber"
                            type="text"
                            placeholder="09xx..."
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="h-8 text-xs bg-white border-slate-200"
                            disabled={!token}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="jobTitle" className="text-[9px] text-slate-400 font-bold uppercase">Nghề nghiệp</Label>
                          <Input
                            id="jobTitle"
                            type="text"
                            placeholder="Kỹ sư, Kinh doanh..."
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="h-8 text-xs bg-white border-slate-200"
                            disabled={!token}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!token}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    Kích Hoạt Tài Khoản <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                {/* Sub routing services */}
                <div className="pt-4 border-t border-slate-100 text-center">
                  <Link to="/login" className="text-slate-400 hover:text-slate-600 text-xs inline-flex items-center gap-1 transition-colors">
                    Quay lại đăng nhập
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
