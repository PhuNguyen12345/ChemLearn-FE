import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Info, 
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
import { submitAccessRequest } from '@/lib/api';

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
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ROLE_TEACHER');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await submitAccessRequest({
        fullName,
        email,
        role,
        additionalInfo,
      });

      setSuccess('Yêu cầu gửi thành công! Quản trị viên sẽ kiểm duyệt và liên hệ qua email của bạn.');
      setFullName('');
      setEmail('');
      setAdditionalInfo('');
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
      <div className="relative w-full lg:w-1/2 bg-gradient-to-tr from-indigo-650 via-blue-600 to-teal-500 flex flex-col justify-between p-8 sm:p-16 text-white overflow-hidden shrink-0 min-h-[360px] lg:min-h-screen">
        {/* Floating chemistry grid background */}
        <GraphicCanvas />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />

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
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10"
                      />
                    </div>
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
                    <Label htmlFor="additionalInfo" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                      Thông tin thêm (Trường học, Số điện thoại...)
                    </Label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
                        <Info className="w-4 h-4" />
                      </div>
                      <textarea
                        id="additionalInfo"
                        placeholder="Trường lớp công tác hoặc thông tin liên quan giúp ban quản trị phê duyệt nhanh hơn..."
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        className="flex min-h-[90px] w-full rounded-md border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 pl-10 pr-3 py-2 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100"
                      />
                    </div>
                  </div>

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
