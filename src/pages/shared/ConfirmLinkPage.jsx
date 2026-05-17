import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmAccountLink } from '../../api/accountLinkApi';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function ConfirmLinkPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Đường dẫn không hợp lệ (thiếu token).');
            return;
        }

        const doConfirm = async () => {
            try {
                await confirmAccountLink(token);
                setStatus('success');
                setMessage('Liên kết tài khoản thành công! Hai tài khoản đã được kết nối.');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || err.message || 'Xác nhận liên kết thất bại. Link có thể đã hết hạn hoặc đã được sử dụng.');
            }
        };

        doConfirm();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 text-center border border-slate-100">
                {status === 'loading' && (
                    <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                        <h2 className="text-xl font-bold text-slate-800">Đang xác nhận liên kết...</h2>
                        <p className="text-slate-500">Vui lòng đợi trong giây lát</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center space-y-4 py-4">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">Thành công!</h2>
                        <p className="text-slate-600 font-medium">{message}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 px-6 rounded-xl transition-colors shadow-md shadow-emerald-200"
                        >
                            Quay về Trang chủ
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center space-y-4 py-4">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-2">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">Thất bại</h2>
                        <p className="text-slate-600 font-medium">{message}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-3 px-6 rounded-xl transition-colors shadow-md shadow-slate-200 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" /> Trở về trang chủ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
