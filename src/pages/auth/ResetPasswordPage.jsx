import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const getStrength = (p) => {
    if (p.length === 0) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp.');
      setStatus('error');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('');
    try {
      await api.post('/api/auth/reset-password', { token, newPassword });
      setStatus('success');
      setMessage('Mật khẩu đã được đặt lại thành công!');
    } catch (err) {
      setStatus('error');
      setMessage(err?.response?.data?.message || 'Có lỗi xảy ra. Link có thể đã hết hạn.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 w-full max-w-md text-center shadow-2xl">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Link không hợp lệ</h2>
          <p className="text-slate-400 mb-6">Đường dẫn thiếu token. Vui lòng yêu cầu lại.</p>
          <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Yêu cầu lại →
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 w-full max-w-md text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center ring-2 ring-emerald-400/30">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Thành công!</h2>
          <p className="text-slate-400 mb-8">{message}</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center ring-2 ring-violet-400/30">
              <Lock className="w-8 h-8 text-violet-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Đặt Lại Mật Khẩu</h1>
          <p className="text-slate-400 text-sm">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New password */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Mật khẩu mới</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Strength bar */}
            {newPassword.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-white/10'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400">Độ mạnh: <span className="font-semibold text-white">{strengthLabels[strength]}</span></p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Xác nhận mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-11 pr-12 py-3.5 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-500/50 focus:ring-red-500'
                    : 'border-white/10 focus:ring-violet-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1.5 text-xs text-red-400">Mật khẩu không khớp</p>
            )}
          </div>

          {/* Error */}
          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Đang cập nhật...</>
            ) : (
              'Đặt Lại Mật Khẩu'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
