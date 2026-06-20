import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Atom, CheckCircle2, KeyRound, Loader2, Mail, Send, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MailDeliveryReminder from '@/components/shared/MailDeliveryReminder';
import api from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const requestOtp = async (event) => {
    event?.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim() });
      setStep('otp');
      setSuccess('Nếu email tồn tại trong hệ thống, mã OTP đã được gửi đến hộp thư của bạn.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!/^\d{6}$/.test(otpCode)) {
      setError('Vui lòng nhập mã OTP gồm 6 chữ số.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/forgot-password/verify-otp', {
        email: email.trim(),
        otpCode,
      });
      navigate(`/reset-password?token=${encodeURIComponent(response.data.resetToken)}`, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.35),transparent_32%),radial-gradient(circle_at_75%_60%,rgba(99,102,241,0.34),transparent_34%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <Atom className="h-6 w-6 text-cyan-200" />
          </div>
          <span className="text-xl font-bold">ChemLearn</span>
        </div>
        <div className="relative z-10 max-w-xl space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Khôi phục tài khoản</p>
          <h1 className="text-5xl font-black leading-tight">OTP giúp đổi mật khẩu an toàn hơn</h1>
          <p className="text-lg leading-8 text-slate-200">
            ChemLearn sẽ gửi mã OTP qua email. Sau khi xác thực, bạn mới được mở màn hình đặt lại mật khẩu.
          </p>
        </div>
        <p className="relative z-10 text-sm text-slate-400">Mã OTP có hiệu lực trong 5 phút</p>
      </section>

      <main className="flex min-h-screen items-center justify-center bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-7"
        >
          <div className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              {step === 'otp' ? 'Nhập mã OTP' : 'Quên mật khẩu'}
            </h2>
            <p className="text-sm leading-6 text-slate-500">
              {step === 'otp'
                ? `Nhập mã OTP đã gửi đến ${email}.`
                : 'Nhập email tài khoản để nhận mã OTP đặt lại mật khẩu.'}
            </p>
          </div>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
          {step === 'otp' && <MailDeliveryReminder />}

          {step === 'email' ? (
            <form onSubmit={requestOtp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Gửi mã OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="otpCode">Mã OTP</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="otpCode"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 text-center text-lg font-bold tracking-[0.35em]"
                    placeholder="000000"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                Xác thực và đổi mật khẩu <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" onClick={() => setStep('email')} disabled={loading}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Sửa email
                </Button>
                <Button type="button" variant="outline" onClick={requestOtp} disabled={loading}>
                  <Send className="mr-2 h-4 w-4" /> Gửi lại
                </Button>
              </div>
            </form>
          )}

          <div className="border-t border-slate-100 pt-5 text-center">
            <Link to="/auth/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
