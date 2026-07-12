import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  GraduationCap,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import {
  getPackages,
  createPaymentLink,
  getPaymentStatus,
  getMyEntitlements
} from '../../lib/api';
import useAuthStore from '../../stores/useAuthStore';

const FALLBACK_PACKAGES = [
  { packageCode: 'GRADE_6', packageName: 'Chemlearn edu 6', gradeLevel: 6, basePrice: 400000, durationDays: 365, description: 'Mở khóa Study Zone lớp 6' },
  { packageCode: 'GRADE_7', packageName: 'Chemlearn edu 7', gradeLevel: 7, basePrice: 400000, durationDays: 365, description: 'Mở khóa Study Zone lớp 7' },
  { packageCode: 'GRADE_8', packageName: 'Chemlearn edu 8', gradeLevel: 8, basePrice: 400000, durationDays: 365, description: 'Mở khóa Study Zone lớp 8' },
  { packageCode: 'GRADE_9', packageName: 'Chemlearn edu 9', gradeLevel: 9, basePrice: 400000, durationDays: 365, description: 'Mở khóa Study Zone lớp 9' },
];

const PENDING_PAYMENT_ORDER_KEY = 'chemlearn_pending_payment_order_code';

const Payments = () => {
  const [packages, setPackages] = useState([]);
  const [entitlements, setEntitlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEntitlements, setLoadingEntitlements] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
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
  const visiblePackages = [...packages].sort((left, right) => (left.gradeLevel || 99) - (right.gradeLevel || 99));
  const activeGrades = entitlements
    .map((entitlement) => visiblePackages.find((pkg) => pkg.packageCode === entitlement.packageCode)?.gradeLevel)
    .filter(Boolean)
    .sort((left, right) => left - right);
  const activeAccessLabel = activeGrades.length
    ? `Đã mở khóa lớp ${activeGrades.join(', ')}.`
    : 'Bạn đang có gói học đang hoạt động.';

  const formatDate = (value) => {
    if (!value) return null;
    return new Date(value).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (value) => {
    if (!value) return 'Chưa mở bán';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPackageAccessLabel = (pkg) => {
    if (!pkg.gradeLevel) return 'Quyền lợi đang cập nhật';
    return `Study Zone lớp ${pkg.gradeLevel}`;
  };

  const getStatusTone = () => {
    if (!statusMessage) return null;
    const lower = statusMessage.toLowerCase();
    if (lower.includes('thành công') || lower.includes('cảm ơn') || lower.includes('đã hủy')) {
      return {
        icon: CheckCircle2,
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800'
      };
    }
    if (lower.includes('thất bại') || lower.includes('không thể') || lower.includes('hết hạn') || lower.includes('chưa hoàn tất')) {
      return {
        icon: AlertCircle,
        className: 'border-amber-200 bg-amber-50 text-amber-800'
      };
    }
    return {
      icon: Clock3,
      className: 'border-sky-200 bg-sky-50 text-sky-800'
    };
  };

  const handleBuyClick = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleConfirmBuy = async () => {
    if (!selectedPackage) return;
    const pkg = selectedPackage;
    
    if (!auth?.isAuthenticated) {
      setStatusMessage('Vui lòng đăng nhập trước khi thanh toán.');
      setSelectedPackage(null);
      return;
    }

    if (entitlementsByPackage[pkg.packageCode]) {
      setStatusMessage('Tài khoản của bạn đã có gói học này.');
      setSelectedPackage(null);
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
        window.location.href = res.checkoutUrl;
        return;
      }

      if (res?.orderCode) {
        pollStatus(res.orderCode);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Tạo yêu cầu thanh toán thất bại.');
    } finally {
      setLoading(false);
      setSelectedPackage(null);
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

  const statusTone = getStatusTone();
  const StatusIcon = statusTone?.icon;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 shadow-sm">
            <CreditCard className="h-4 w-4 text-sky-600" />
            Subscription center
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Gói học Chemlearn</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Mua quyền truy cập Study Zone theo từng khối lớp. Mỗi gói edu có hiệu lực 365 ngày sau khi thanh toán thành công.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Tài khoản</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            {auth?.user?.fullName || 'Chưa đăng nhập'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500">Gói đang hoạt động</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{entitlements.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <BadgeCheck className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {hasActiveSubscription
              ? activeAccessLabel
              : 'Chưa có gói học nào được kích hoạt.'}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500">Danh mục khả dụng</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{visiblePackages.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-50 text-sky-700">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">Các gói edu đang bán theo từng Study Zone lớp 6-9.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500">Đơn đang xử lý</p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {processingOrder ? `#${processingOrder.orderCode}` : 'Không có'}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-50 text-amber-700">
              {processingOrder ? <Loader2 className="h-6 w-6 animate-spin" /> : <Clock3 className="h-6 w-6" />}
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {processingOrder?.packageCode || 'PayOS sẽ tự động xác nhận khi thanh toán hoàn tất.'}
          </p>
        </div>
      </div>

      {(loadingEntitlements || statusMessage || !auth?.isAuthenticated) && (
        <div className="space-y-3">
          {!auth?.isAuthenticated && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <div className="font-black">Cần đăng nhập để mua gói</div>
                <div className="mt-1 text-amber-700">Bạn vẫn có thể xem danh mục gói, nhưng cần đăng nhập trước khi thanh toán.</div>
              </div>
            </div>
          )}

          {loadingEntitlements && (
            <div className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm font-bold text-sky-800">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang kiểm tra quyền truy cập hiện tại...
            </div>
          )}

          {statusMessage && statusTone && (
            <div className={`flex items-start gap-3 rounded-lg border p-4 text-sm font-semibold ${statusTone.className}`}>
              <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      )}

      {processingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-2xl">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600" />
            <div className="text-lg font-black text-slate-800">Đang xử lý thanh toán</div>
            <div className="mt-2 text-sm text-slate-500">Vui lòng đợi trong giây lát...</div>
          </div>
        </div>
      )}

      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-xl font-black text-slate-800">Xác nhận mua gói</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Bạn có chắc chắn muốn mua gói <strong className="text-slate-900">{selectedPackage.packageName}</strong> với giá <strong className="text-slate-900">{formatCurrency(selectedPackage.basePrice)}</strong> không? Hệ thống sẽ chuyển hướng bạn sang cổng thanh toán.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmBuy}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition"
              >
                Đồng ý mua
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {visiblePackages.map((p) => {
          const entitlement = entitlementsByPackage[p.packageCode];
          const subscribed = Boolean(entitlement);
          const cancelled = entitlement?.status === 'CANCELLED';
          const startDate = formatDate(entitlement?.startAt);
          const endDate = formatDate(entitlement?.endAt);
          const cancelledDate = formatDate(entitlement?.cancelledAt);
          const isProcessingThisPackage = processingOrder?.packageCode === p.packageCode;

          return (
            <article
              key={p.packageCode}
              className={`rounded-lg border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                subscribed ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-sm font-black text-white">
                      {p.gradeLevel || '+'}
                    </span>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">{p.packageName}</h2>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{p.packageCode}</p>
                    </div>
                    {subscribed && (
                      <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-black ${
                        cancelled
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {cancelled ? <Clock3 className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        {cancelled ? 'Đã hủy' : 'Đang dùng'}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {p.description || getPackageAccessLabel(p)}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        <GraduationCap className="h-4 w-4" />
                        Quyền truy cập
                      </div>
                      <div className="mt-1 text-sm font-black text-slate-800">{getPackageAccessLabel(p)}</div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        <CalendarDays className="h-4 w-4" />
                        Thời hạn
                      </div>
                      <div className="mt-1 text-sm font-black text-slate-800">{p.durationDays || 365} ngày</div>
                    </div>
                  </div>

                  {subscribed && (
                    <div className={`mt-4 rounded-md border p-3 text-sm ${
                      cancelled
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    }`}>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide opacity-70">Trạng thái</div>
                          <div className="font-black">{entitlement.status || 'ACTIVE'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide opacity-70">Bắt đầu</div>
                          <div className="font-black">{startDate || 'Đang cập nhật'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide opacity-70">Hết hạn</div>
                          <div className="font-black">{endDate || 'Không giới hạn'}</div>
                        </div>
                      </div>
                      {cancelledDate && (
                        <div className="mt-2 text-xs font-bold">Ngày hủy: {cancelledDate}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex w-full flex-col items-stretch gap-3 sm:w-44 sm:items-end">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Giá gói</div>
                    <div className="mt-1 text-2xl font-black text-slate-900">{formatCurrency(p.basePrice)}</div>
                  </div>

                  {subscribed ? (
                    <div className="flex w-full flex-col gap-2">
                      <div className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-black text-white ${
                        cancelled ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}>
                        {cancelled ? <Clock3 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                        {cancelled ? 'Còn hiệu lực' : 'Đã kích hoạt'}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={loading || processingOrder !== null}
                      onClick={() => handleBuyClick(p)}
                    >
                      {loading && isProcessingThisPackage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      {isProcessingThisPackage ? 'Đang xử lý' : 'Mua gói'}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Payments;
