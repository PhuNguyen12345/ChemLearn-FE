import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

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

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 w-full max-w-md text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center ring-2 ring-emerald-400/30">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Kiểm tra hộp thư!</h2>
          <p className="text-slate-400 mb-2">
            Nếu email <span className="text-indigo-300 font-semibold">{email}</span> tồn tại trong hệ thống,
            chúng tôi đã gửi link đặt lại mật khẩu.
          </p>
          <p className="text-slate-500 text-sm mb-8">Link có hiệu lực trong <strong className="text-white">30 phút</strong>.</p>
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
          </Link>
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
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center ring-2 ring-indigo-400/30">
              <Mail className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Quên mật khẩu?</h1>
          <p className="text-slate-400 text-sm">
            Nhập email của bạn, chúng tôi sẽ gửi link để đặt lại mật khẩu.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...</>
            ) : (
              'Gửi Link Đặt Lại Mật Khẩu'
            )}
          </button>
        </form>

        {/* Back */}
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
