import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getPackages,
  createPaymentLink,
  getPaymentStatus,
  getMyEntitlements,
  cancelMyEntitlement
} from '../../lib/api';
import useAuthStore from '../../stores/useAuthStore';

const FALLBACK_PACKAGES = [
  { packageCode: 'GRADE_6', packageName: 'Gói Lớp 6', gradeLevel: 6, basePrice: 10000 },
  { packageCode: 'GRADE_7', packageName: 'Gói Lớp 7', gradeLevel: 7, basePrice: 12000 },
  { packageCode: 'GRADE_8', packageName: 'Gói Lớp 8', gradeLevel: 8, basePrice: 14000 },
  { packageCode: 'GRADE_9', packageName: 'Gói Lớp 9', gradeLevel: 9, basePrice: 16000 },
];

const PENDING_PAYMENT_ORDER_KEY = 'chemlearn_pending_payment_order_code';

const Payments = () => {
  const [packages, setPackages] = useState([]);
  const [entitlements, setEntitlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEntitlements, setLoadingEntitlements] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const auth = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const returnedOrderCode = searchParams.get('orderCode') || sessionStorage.getItem(PENDING_PAYMENT_ORDER_KEY);
  const returnPollOrderRef = useRef(null);

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

  const loadEntitlements = async () => {
    if (!auth?.isAuthenticated) {
      setEntitlements([]);
      return [];
    }

    try {
      setLoadingEntitlements(true);
      const activeEntitlements = await getMyEntitlements();
      setEntitlements(activeEntitlements);
      return activeEntitlements;
    } catch (err) {
      console.error('Failed to load entitlements:', err);
      setEntitlements([]);
      return [];
    } finally {
      setLoadingEntitlements(false);
    }
  };

  useEffect(() => {
    loadEntitlements();
  }, [auth?.isAuthenticated]);

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      returnPollOrderRef.current = null;
      return;
    }
    if (!returnedOrderCode) return;
    if (returnPollOrderRef.current === returnedOrderCode) return;

    returnPollOrderRef.current = returnedOrderCode;
    setProcessingOrder({ orderCode: returnedOrderCode, packageCode: null });
    setStatusMessage('Đang xác nhận trạng thái thanh toán...');
    pollStatus(returnedOrderCode, 0, true);
  }, [auth?.isAuthenticated, returnedOrderCode]);

  const entitlementsByPackage = entitlements.reduce((acc, entitlement) => {
    acc[entitlement.packageCode] = entitlement;
    return acc;
  }, {});
  const hasActiveSubscription = entitlements.length > 0;
  const visiblePackages = packages;

  const formatDate = (value) => {
    if (!value) return null;
    return new Date(value).toLocaleDateString('vi-VN');
  };

  const handleBuy = async (pkg) => {
    if (!auth?.isAuthenticated) {
      setStatusMessage('Vui lòng đăng nhập trước khi thanh toán.');
      return;
    }

    if (entitlementsByPackage[pkg.packageCode]) {
      setStatusMessage('Tài khoản của bạn đã có gói học này.');
      return;
    }

    const amount = pkg.basePrice || 10000;

    const payload = {
      packageCode: pkg.packageCode,
      amount,
      description: `Mua ${pkg.packageName}`,
      returnUrl: window.location.origin + '/student/subscriptions',
      cancelUrl: window.location.origin + '/student/subscriptions'
    };

    try {
      setLoading(true);
      const res = await createPaymentLink(payload);
      setProcessingOrder({ orderCode: res?.orderCode, packageCode: pkg.packageCode });
      setStatusMessage('Tạo đường dẫn thanh toán, chuyển hướng...');

      if (res?.checkoutUrl) {
        if (res?.orderCode) {
          sessionStorage.setItem(PENDING_PAYMENT_ORDER_KEY, String(res.orderCode));
        }
        // open in same tab to let PayOS redirect back
        window.location.href = res.checkoutUrl;
        return;
      }

      // if only qrCode provided, show it and poll
      if (res?.orderCode) {
        pollStatus(res.orderCode);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Tạo yêu cầu thanh toán thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (entitlement) => {
    if (!entitlement?.id) return;
    const confirmed = window.confirm('Hủy gia hạn gói học này? Bạn vẫn dùng được gói đến ngày hết hạn.');
    if (!confirmed) return;

    try {
      setCancellingId(entitlement.id);
      await cancelMyEntitlement(entitlement.id);
      setStatusMessage('Đã hủy gói học. Bạn vẫn có quyền truy cập đến ngày hết hạn.');
      await loadEntitlements();
    } catch (err) {
      console.error(err);
      setStatusMessage('Không thể hủy gói học lúc này.');
    } finally {
      setCancellingId(null);
    }
  };

  const clearPaymentQuery = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('orderCode');
    nextParams.delete('code');
    nextParams.delete('id');
    nextParams.delete('cancel');
    nextParams.delete('status');
    setSearchParams(nextParams, { replace: true });
    sessionStorage.removeItem(PENDING_PAYMENT_ORDER_KEY);
    returnPollOrderRef.current = null;
  };

  const pollStatus = async (orderCode, attempts = 0, clearQueryOnDone = false) => {
    try {
      const res = await getPaymentStatus(orderCode);
      if (res?.status === 'PAID') {
        setStatusMessage('Thanh toán thành công! Cảm ơn bạn.');
        await loadEntitlements();
        setProcessingOrder(null);
        if (clearQueryOnDone) clearPaymentQuery();
        return;
      }

      if (['CANCELLED', 'EXPIRED', 'FAILED'].includes(res?.status)) {
        setStatusMessage('Thanh toán chưa hoàn tất hoặc đã hết hạn.');
        setProcessingOrder(null);
        if (clearQueryOnDone) clearPaymentQuery();
        return;
      }

      if (attempts > 40) {
        setStatusMessage('Hết thời gian chờ xác nhận thanh toán.');
        setProcessingOrder(null);
        if (clearQueryOnDone) clearPaymentQuery();
        return;
      }

      setTimeout(() => pollStatus(orderCode, attempts + 1, clearQueryOnDone), 3000);
    } catch (err) {
      console.error('poll error', err);
      if (attempts > 40) {
        setStatusMessage('Không thể kiểm tra trạng thái thanh toán.');
        setProcessingOrder(null);
        if (clearQueryOnDone) clearPaymentQuery();
        return;
      }
      setTimeout(() => pollStatus(orderCode, attempts + 1, clearQueryOnDone), 3000);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Gói học của tôi</h2>

      <div className="mb-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        {auth?.user?.fullName ? (
          <span>Đang đăng nhập: {auth.user.fullName}</span>
        ) : (
          <span>Vui lòng đăng nhập để mua gói học.</span>
        )}
        {processingOrder && (
          <div className="mt-1 text-slate-500">
            Đơn đang xử lý: {processingOrder.packageCode ? `${processingOrder.packageCode} - ` : ''}#{processingOrder.orderCode}
          </div>
        )}
      </div>

      {loadingEntitlements && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded border border-blue-100">
          Đang kiểm tra gói học hiện tại...
        </div>
      )}

      {statusMessage && (
        <div className="mb-4 p-3 bg-slate-100 text-slate-800 rounded">{statusMessage}</div>
      )}

      {hasActiveSubscription && (
        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Tài khoản đang có gói học đang hoạt động. Bạn có thể mua thêm gói khác hoặc hủy gói hiện tại nhưng vẫn dùng đến ngày hết hạn.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visiblePackages.map((p) => {
          const entitlement = entitlementsByPackage[p.packageCode];
          const subscribed = Boolean(entitlement);
          const cancelled = entitlement?.status === 'CANCELLED';
          const startDate = formatDate(entitlement?.startAt);
          const endDate = formatDate(entitlement?.endAt);
          const cancelledDate = formatDate(entitlement?.cancelledAt);

          return (
            <div
              key={p.packageCode}
              className={`border rounded p-4 bg-white shadow-sm ${subscribed ? 'border-emerald-200 bg-emerald-50/40' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {p.packageName} - Lớp {p.gradeLevel}
                    {subscribed && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        cancelled
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {cancelled ? 'Đã hủy' : 'Đang dùng'}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{p.description || 'Gói học cơ bản'}</div>

                  {subscribed && (
                    <div className={`mt-3 space-y-1 text-sm ${cancelled ? 'text-amber-800' : 'text-emerald-800'}`}>
                      <div>Trạng thái: <span className="font-bold">{entitlement.status || 'ACTIVE'}</span></div>
                      {startDate && <div>Bắt đầu: <span className="font-semibold">{startDate}</span></div>}
                      {cancelledDate && <div>Ngày hủy: <span className="font-semibold">{cancelledDate}</span></div>}
                      <div>Hết hạn: <span className="font-semibold">{endDate || 'Không giới hạn'}</span></div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-lg">{p.basePrice ? p.basePrice + '₫' : 'Tùy giá'}</div>
                  {subscribed ? (
                    <div className="mt-2 flex flex-col items-end gap-2">
                      <div className={`rounded px-3 py-1 text-sm font-bold text-white ${
                        cancelled ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}>
                        {cancelled ? 'Còn hiệu lực' : 'Đã kích hoạt'}
                      </div>
                      {!cancelled && (
                        <button
                          className="rounded border border-red-200 px-3 py-1 text-sm font-semibold text-red-700 disabled:opacity-60"
                          disabled={cancellingId === entitlement.id || loadingEntitlements}
                          onClick={() => handleCancel(entitlement)}
                        >
                          {cancellingId === entitlement.id ? 'Đang hủy...' : 'Hủy gói'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      className="mt-2 px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60"
                      disabled={loading || loadingEntitlements}
                      onClick={() => handleBuy(p)}
                    >
                      Mua
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Payments;
