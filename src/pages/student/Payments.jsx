import React, { useEffect, useState } from 'react';
import { getPackages, createPaymentLink, getPaymentStatus, getMyEntitlements } from '../../lib/api';
import useAuthStore from '../../stores/useAuthStore';

const FALLBACK_PACKAGES = [
  { packageCode: 'GRADE_6', packageName: 'Gói Lớp 6', gradeLevel: 6, basePrice: 10000 },
  { packageCode: 'GRADE_7', packageName: 'Gói Lớp 7', gradeLevel: 7, basePrice: 12000 },
  { packageCode: 'GRADE_8', packageName: 'Gói Lớp 8', gradeLevel: 8, basePrice: 14000 },
  { packageCode: 'GRADE_9', packageName: 'Gói Lớp 9', gradeLevel: 9, basePrice: 16000 },
];

const Payments = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const auth = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        const pkgs = await getPackages();
        if (pkgs && pkgs.length) setPackages(pkgs);
        else setPackages(FALLBACK_PACKAGES);
      } catch (err) {
        setPackages(FALLBACK_PACKAGES);
      }
    })();
  }, []);

  const ensureUserId = () => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?.id || null;
    } catch {
      return null;
    }
  };

  const handleBuy = async (pkg) => {
    const userId = ensureUserId();
    if (!userId) {
      setStatusMessage('Vui lòng đăng nhập trước khi thanh toán.');
      return;
    }

    const orderCode = Date.now();
    const amount = pkg.basePrice || 10000;

    const payload = {
      orderCode,
      userId,
      packageCode: pkg.packageCode,
      amount,
      description: `Mua ${pkg.packageName}`,
      returnUrl: window.location.origin + '/payments/result',
      cancelUrl: window.location.origin + '/payments/cancel'
    };

    try {
      setLoading(true);
      const res = await createPaymentLink(payload);
      setProcessingOrder({ orderCode, packageCode: pkg.packageCode });
      setStatusMessage('Tạo đường dẫn thanh toán, chuyển hướng...');

      if (res?.checkoutUrl) {
        // open in same tab to let PayOS redirect back
        window.location.href = res.checkoutUrl;
        return;
      }

      // if only qrCode provided, show it and poll
      pollStatus(orderCode);
    } catch (err) {
      console.error(err);
      setStatusMessage('Tạo yêu cầu thanh toán thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async (orderCode, attempts = 0) => {
    try {
      const res = await getPaymentStatus(orderCode);
      if (res?.status === 'PAID') {
        setStatusMessage('Thanh toán thành công! Cảm ơn bạn.');
        // optionally refresh entitlements
        try { await getMyEntitlements(); } catch {}
        setProcessingOrder(null);
        return;
      }

      if (attempts > 40) {
        setStatusMessage('Hết thời gian chờ xác nhận thanh toán.');
        setProcessingOrder(null);
        return;
      }

      setTimeout(() => pollStatus(orderCode, attempts + 1), 3000);
    } catch (err) {
      console.error('poll error', err);
      if (attempts > 40) {
        setStatusMessage('Không thể kiểm tra trạng thái thanh toán.');
        setProcessingOrder(null);
        return;
      }
      setTimeout(() => pollStatus(orderCode, attempts + 1), 3000);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Mua gói học (Lớp 6 - 9)</h2>

      <div className="mb-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        {auth?.user?.fullName ? (
          <span>Đang đăng nhập: {auth.user.fullName}</span>
        ) : (
          <span>Vui lòng đăng nhập để mua gói học.</span>
        )}
        {processingOrder && (
          <div className="mt-1 text-slate-500">
            Đơn đang xử lý: {processingOrder.packageCode} - #{processingOrder.orderCode}
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-slate-100 text-slate-800 rounded">{statusMessage}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((p) => (
          <div key={p.packageCode} className="border rounded p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{p.packageName} - Lớp {p.gradeLevel}</div>
                <div className="text-sm text-slate-500 mt-1">{p.description || 'Gói học cơ bản'}</div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-lg">{p.basePrice ? p.basePrice + '₫' : 'Tùy giá'}</div>
                <button
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
                  disabled={loading}
                  onClick={() => handleBuy(p)}
                >
                  Mua
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Payments;
