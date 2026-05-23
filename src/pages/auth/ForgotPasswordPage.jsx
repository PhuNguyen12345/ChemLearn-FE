import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, Loader2, Atom, ShieldCheck, Clock3, Sparkles } from 'lucide-react';
import api from '../../lib/api';

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
    const particleCount = 22;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 4 + 2,
        color: i % 2 === 0 ? 'rgba(255, 255, 255, 0.34)' : 'rgba(255, 255, 255, 0.16)'
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

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

function ResetLoader() {
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
        Đang gửi yêu cầu...
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('loading');
    try {
      await api.post('/api/auth/forgot-password', { email });
      setStatus('success');
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      setStatus('idle');
    }
  };

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50/50 font-sans">
      <div className="relative w-full lg:w-1/2 bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900 flex flex-col justify-between p-8 sm:p-16 text-white overflow-hidden shrink-0 min-h-[360px] lg:min-h-screen">
        <GraphicCanvas />

        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-300/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Atom className="w-6 h-6 text-teal-300 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">ChemLearn</span>
        </div>

        <div className="relative z-10 my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 max-w-lg"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white tracking-tight">
              Khôi Phục Quyền Truy Cập
            </h1>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              Gửi link đặt lại mật khẩu nhanh chóng qua email để bạn có thể đăng nhập lại an toàn vào ChemLearn.
            </p>

            <div className="grid grid-cols-1 gap-4 pt-4">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-teal-400/20 text-teal-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Bảo Mật Hơn</h4>
                  <p className="text-white/70 text-xs sm:text-sm">Link chỉ dùng một lần và hết hạn sau 30 phút.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-purple-400/20 text-purple-300">
                  <Clock3 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Khôi Phục Nhanh</h4>
                  <p className="text-white/70 text-xs sm:text-sm">Mở lại tài khoản trong vài phút với quy trình đơn giản.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-cyan-400/20 text-cyan-300">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Trải Nghiệm Đồng Bộ</h4>
                  <p className="text-white/70 text-xs sm:text-sm">Giữ phong cách giao diện nhất quán với toàn bộ khu vực đăng nhập.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 text-white/50 text-xs mt-auto">
          © 2026 ChemLearn Platform. Thiết kế hướng tới tương lai giáo dục.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white min-h-screen">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md space-y-8"
        >
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quên mật khẩu</h2>
            <p className="text-slate-500 text-sm mt-2">Nhập email để nhận link đặt lại mật khẩu.</p>
          </div>

          <AnimatePresence mode="wait">
            {status === 'loading' ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ResetLoader />
              </motion.div>
            ) : isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="rounded-[2rem] border border-emerald-100 bg-emerald-50/70 p-8 shadow-sm text-center space-y-4"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Kiểm tra hộp thư</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Nếu email <span className="font-semibold text-slate-900">{email}</span> tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu.
                </p>
                <p className="text-slate-500 text-sm">Link có hiệu lực trong <strong className="text-slate-900">30 phút</strong>.</p>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
                </Link>
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
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 shrink-0 mt-0.5">!</span>
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-100 pl-10 w-full h-11 rounded-md border px-3 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {status === 'loading' ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...</>
                    ) : (
                      'Gửi Link Đặt Lại Mật Khẩu'
                    )}
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
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
