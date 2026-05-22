import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Atom, 
  FlaskConical, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  Copy, 
  X, 
  ChevronRight,
  HelpCircle,
  Sparkles,
  Award,
  Gamepad2
} from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api, { loginWithGoogle } from '@/lib/api';

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

// Clean Boiling Beaker Loading Animation
function ChemicalLoader() {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-10">
      <div className="relative w-12 h-16">
        <svg viewBox="0 0 64 80" className="w-full h-full text-blue-500 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12H42V24L56 64C59 72 53 76 45 76H19C11 76 5 72 8 64L22 24V12Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
          <path d="M10.2 59C11 53 14 51 18 51C22 51 24 54 28 54C32 54 34 51 38 51C42 51 44 54 48 54C52 54 54 52 55.8 59C54 62 12 62 10.2 59Z" fill="rgba(59, 130, 246, 0.2)" />
        </svg>
        <span className="bubble-animation w-2 h-2 left-5 bottom-6 bg-blue-400 opacity-60" style={{ animationDelay: '0.1s' }} />
        <span className="bubble-animation w-2 h-2 left-8 bottom-5 bg-teal-400 opacity-60" style={{ animationDelay: '0.5s' }} />
        <span className="bubble-animation w-1.5 h-1.5 left-4 bottom-8 bg-blue-300 opacity-60" style={{ animationDelay: '0.9s' }} />
      </div>
      <p className="text-xs font-semibold text-slate-500 animate-pulse uppercase tracking-wider">
        Đang xử lý thông tin...
      </p>
    </div>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const demoAccounts = [
    { label: 'Học Sinh', user: 'student1', pass: 'Password123!', role: 'STUDENT' },
    { label: 'Giáo Viên', user: 'teacher1', pass: 'Password123!', role: 'TEACHER' },
    { label: 'Phụ Huynh', user: 'parent1', pass: 'Password123!', role: 'PARENT' },
    { label: 'Quản Trị', user: 'admin', pass: '1231', role: 'ADMIN' },
  ];

  const handleGoogleCredential = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Đăng nhập Google thất bại.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const authData = await loginWithGoogle(credentialResponse.credential);
      login(authData);

      switch (authData.role) {
        case 'ROLE_STUDENT':
          navigate('/student/home');
          break;
        case 'ROLE_TEACHER':
          navigate('/teacher/dashboard');
          break;
        case 'ROLE_PARENT':
          navigate('/parent/dashboard');
          break;
        case 'ROLE_ADMIN':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Đăng nhập Google thất bại.';
      setError(String(backendMessage));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) return;

    const scriptId = 'google-identity-script';
    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });

      const buttonContainer = document.getElementById('googleSignInButton');
      if (buttonContainer && !buttonContainer.hasChildNodes()) {
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          width: 320,
        });
      }
    };

    if (document.getElementById(scriptId)) {
      initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => setError('Không thể tải Google Sign-In.');
    document.body.appendChild(script);
  }, [googleClientId]);

  // returnTo is set when redirected from ConfirmLinkPage
  const returnTo = location.state?.returnTo;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });

      const authData = response.data;
      login(authData);

      // If we came from a link (e.g. confirm-link), go back there
      if (returnTo) {
        navigate(returnTo);
        return;
      }

      switch (authData.role) {
        case 'ROLE_STUDENT':
          navigate('/student/home');
          break;
        case 'ROLE_TEACHER':
          navigate('/teacher/dashboard');
          break;
        case 'ROLE_PARENT':
          navigate('/parent/dashboard');
          break;
        case 'ROLE_ADMIN':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.';
      setError(String(backendMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const fillDemoAccount = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setShowSetupModal(false);
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
              Phòng Thí Nghiệm Hóa Học Số Hóa 
            </h1>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              Trải nghiệm học tập hóa học nâng cao với mô phỏng trực quan, các bài thực hành chuyên sâu và tính năng gamification hấp dẫn dành cho học sinh.
            </p>

            {/* Core features listing */}
            <div className="grid grid-cols-1 gap-4 pt-4">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-teal-400/20 text-teal-300">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Mô Phỏng Phòng Thí Nghiệm</h4>
                  <p className="text-white/70 text-xs sm:text-sm">Trực quan hóa các phản ứng và hiện tượng hóa học phức tạp.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-purple-400/20 text-purple-300">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Gamification Thú Vị</h4>
                  <p className="text-white/70 text-xs sm:text-sm">Học tập thông qua trò chơi, bảng xếp hạng và hệ thống huy hiệu.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-cyan-400/20 text-cyan-300">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Kết Nối Toàn Diện</h4>
                  <p className="text-white/70 text-xs sm:text-sm">Liên kết chặt chẽ thông tin giữa Học sinh, Giáo viên và Phụ huynh.</p>
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

      {/* RIGHT SECTION: White Authentication Service */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white min-h-screen">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header Info */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Đăng Nhập</h2>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ChemicalLoader />
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

                {/* Form fields */}
                <form onSubmit={handleLogin} className="space-y-5">
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
                        placeholder="Tên tài khoản..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                        Mật khẩu
                      </Label>
                      <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-500 hover:underline">
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    Đăng Nhập <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                {/* Sub routing services */}
                <div className="space-y-3 pt-6 border-t border-slate-100 text-center">
                  <div className="text-sm text-slate-500">
                    Chưa có tài khoản?{" "}
                    <Link to="/register" className="text-blue-600 font-bold hover:text-blue-500 hover:underline">
                      Đăng ký ngay
                    </Link>
                  </div>
                  
                  <div className="text-sm text-slate-500">
                    Giáo viên / Phụ huynh?{" "}
                    <Link to="/request-access" className="text-teal-600 font-bold hover:text-teal-500 hover:underline">
                      Yêu cầu tài khoản
                    </Link>
                  </div>
                </div>

                {/* Google Sign In Integration */}
                <div className="pt-4 border-t border-slate-100 flex flex-col items-center">
                  <div className="text-xs text-slate-400 mb-4 font-semibold uppercase tracking-wider">Hoặc tiếp tục với</div>
                  
                  {googleClientId ? (
                    <div className="w-full flex justify-center">
                      <div 
                        id="googleSignInButton" 
                        className="rounded-lg overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSetupModal(true)}
                      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-350 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm group cursor-pointer"
                    >
                      <svg className="w-5 h-5 group-hover:scale-105 transition-transform animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                      </svg>
                      Google Authentication
                    </button>
                  )}
                </div>

                <div className="text-center pt-2">
                  <Link to="/" className="text-slate-400 hover:text-slate-600 text-xs inline-flex items-center gap-1 transition-colors">
                    Quay lại trang chủ
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modern Dialog/Modal for Developer presets (styled in Light Mode) */}
      <AnimatePresence>
        {showSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSetupModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative z-10 w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <HelpCircle className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-lg text-slate-800">Cấu hình Google Sign-In</h3>
                </div>
                <button 
                  onClick={() => setShowSetupModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                <p>
                  Hệ thống chưa được liên kết với ID xác thực Google OAuth. Để hoàn tất cấu hình, vui lòng thêm:
                </p>

                <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-100 font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-blue-600 font-bold uppercase mb-1">Backend (application.properties)</div>
                    <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-600 truncate mr-2">google.client-id=your-id</span>
                      <button 
                        onClick={() => copyToClipboard('google.client-id=YOUR_CLIENT_ID', 'backend')}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {copiedText === 'backend' ? <span className="text-xs text-green-600 font-bold">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-teal-655 font-bold uppercase mb-1">Frontend (.env)</div>
                    <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-600 truncate mr-2">VITE_GOOGLE_CLIENT_ID=your-id</span>
                      <button 
                        onClick={() => copyToClipboard('VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID', 'frontend')}
                        className="text-slate-400 hover:text-teal-600 transition-colors"
                      >
                        {copiedText === 'frontend' ? <span className="text-xs text-green-600 font-bold">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 bg-blue-50/50 border border-blue-100 p-3 rounded-lg">
                  💡 Bạn có thể khởi tạo OAuth credentials miễn phí trên <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">Google Cloud Console</a>.
                </div>

                {/* Local Preset Accounts */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    🚀 Chọn tài khoản dùng thử cục bộ:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {demoAccounts.map((demo) => (
                      <button
                        key={demo.label}
                        onClick={() => fillDemoAccount(demo.user, demo.pass)}
                        className="flex items-center justify-between text-left bg-slate-50 hover:bg-blue-50/50 hover:text-blue-600 border border-slate-200 text-xs px-3 py-2.5 rounded-lg transition-all group cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{demo.label}</div>
                          <div className="text-[10px] text-slate-450">{demo.user}</div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
