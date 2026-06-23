import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Atom, ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Lock, Mail, Send, User, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MailDeliveryReminder from '@/components/shared/MailDeliveryReminder';
import api from '@/lib/api';
import useAuthStore from '../../stores/useAuthStore';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_.]).{8,32}$/;
const USERNAME_REGEX = /^\S+$/;
const FULL_NAME_REGEX = /^[\p{L}]+(?: [\p{L}]+)*$/u;

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
  const [step, setStep] = useState('form');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const setField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    if (!USERNAME_REGEX.test(formData.username.trim())) {
      return 'Tên đăng nhập không được chứa khoảng trắng.';
    }
    if (!FULL_NAME_REGEX.test(formData.fullName.trim())) {
      return 'Họ và tên chỉ được chứa chữ cái và khoảng trắng.';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Mật khẩu xác nhận không khớp.';
    }
    if (!PASSWORD_REGEX.test(formData.password)) {
      return 'Mật khẩu phải dài 8-32 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.';
    }
    return '';
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/register/otp', {
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        gradeLevel: Number(formData.gradeLevel),
        gender: formData.gender,
        role: 'ROLE_STUDENT',
      });
      setStep('otp');
      setSuccess('Mã OTP đã được gửi đến email của bạn. Vui lòng nhập mã để hoàn tất đăng ký.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!/^\d{6}$/.test(otpCode)) {
      setError('Vui lòng nhập mã OTP gồm 6 chữ số.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/otp/verify', {
        email: formData.email.trim(),
        otpCode,
      });
      logout();
      setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/auth/login', { replace: true }), 900);
    } catch (err) {
      setError(err?.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/api/auth/otp/resend', { email: formData.email.trim() });
      setSuccess('Đã gửi lại OTP. Vui lòng kiểm tra hộp thư.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Chưa thể gửi lại OTP. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.35),transparent_32%),radial-gradient(circle_at_75%_60%,rgba(59,130,246,0.32),transparent_34%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <Atom className="h-6 w-6 text-cyan-200" />
          </div>
          <span className="text-xl font-bold">ChemLearn</span>
        </div>
        <div className="relative z-10 max-w-xl space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Xác thực email</p>
          <h1 className="text-5xl font-black leading-tight">Bắt đầu hành trình hóa học an toàn hơn</h1>
          <p className="text-lg leading-8 text-slate-200">
            Tài khoản mới sẽ được kích hoạt sau khi xác thực OTP qua email, giúp ChemLearn bảo vệ danh tính và quyền truy cập học tập của bạn.
          </p>
        </div>
        <p className="relative z-10 text-sm text-slate-400">© 2026 ChemLearn Platform</p>
      </section>

      <main className="flex min-h-screen items-center justify-center bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-7"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              {step === 'otp' ? 'Xác thực OTP' : 'Đăng ký tài khoản'}
            </h2>
            <p className="text-sm text-slate-500">
              {step === 'otp'
                ? `Nhập mã OTP đã gửi đến ${formData.email}.`
                : 'Tạo tài khoản học sinh ChemLearn mới.'}
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
          {step === 'otp' && <MailDeliveryReminder />}

          {step === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
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
                Xác thực OTP <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" onClick={() => setStep('form')} disabled={loading}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Sửa
                </Button>
                <Button type="button" variant="outline" onClick={handleResendOtp} disabled={loading}>
                  <Send className="mr-2 h-4 w-4" /> Gửi lại
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Khối lớp</Label>
                  <select
                    id="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={(event) => setField('gradeLevel', event.target.value)}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    {[6, 7, 8, 9].map((grade) => (
                      <option key={grade} value={grade}>Lớp {grade}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(event) => setField('gender', event.target.value)}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option value="boy">Nam</option>
                    <option value="girl">Nữ</option>
                  </select>
                </div>
              </div>

              <TextInput icon={User} id="username" label="Tên đăng nhập" value={formData.username} onChange={(value) => setField('username', value)} />
              <TextInput icon={UserCheck} id="fullName" label="Họ và tên" value={formData.fullName} onChange={(value) => setField('fullName', value)} />
              <TextInput icon={Mail} id="email" label="Email" type="email" value={formData.email} onChange={(value) => setField('email', value)} />

              <PasswordInput
                id="password"
                label="Mật khẩu"
                value={formData.password}
                show={showPassword}
                setShow={setShowPassword}
                onChange={(value) => setField('password', value)}
              />
              <PasswordInput
                id="confirmPassword"
                label="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
                onChange={(value) => setField('confirmPassword', value)}
              />

              <p className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                Mật khẩu cần 8-32 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.
              </p>
              <Button type="submit" disabled={loading} className="w-full">
                Gửi OTP đăng ký <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          <div className="border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
            Đã có tài khoản?{' '}
            <Link to="/auth/login" className="font-bold text-blue-600 hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function TextInput({ icon: Icon, id, label, type = 'text', value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="pl-10" required />
      </div>
    </div>
  );
}

function PasswordInput({ id, label, value, show, setShow, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-10 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
