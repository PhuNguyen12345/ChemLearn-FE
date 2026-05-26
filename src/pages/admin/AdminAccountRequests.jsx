import { useEffect, useMemo, useState } from 'react';
import { Check, Clock, Mail, RefreshCw, Search, ShieldCheck, UserRoundCheck, X } from 'lucide-react';
import {
  approveAccessRequest,
  getAuthAccessRequests,
  rejectAccessRequest,
} from '@/lib/api';

const roleLabels = {
  ROLE_TEACHER: 'Teacher',
  ROLE_PARENT: 'Parent',
};

const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-800 border-rose-200',
};

const normalizeRequests = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const formatDate = (value) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
};

export default function AdminAccountRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAuthAccessRequests();
      setRequests(normalizeRequests(data));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load account requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === 'PENDING').length,
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return requests.filter((request) => {
      const statusMatches = statusFilter === 'ALL' || request.status === statusFilter;
      const roleMatches = request.role === 'ROLE_TEACHER' || request.role === 'ROLE_PARENT';
      if (!statusMatches || !roleMatches) return false;
      if (!term) return true;

      return [request.fullName, request.email, request.role, request.additionalInfo]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [requests, searchTerm, statusFilter]);

  const handleDecision = async (request, decision) => {
    const action = decision === 'approve' ? approveAccessRequest : rejectAccessRequest;
    try {
      setSavingId(request.id);
      setError('');
      setSuccess('');
      await action(request.id);
      setSuccess(`${request.fullName || request.email} was ${decision === 'approve' ? 'approved' : 'declined'}.`);
      await loadRequests();
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${decision} request.`);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="flex-1 p-4 pt-6 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Phê duyệt</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Yêu cầu phê duyệt tài khoản</h1>
              <p className="mt-1 text-sm text-slate-500">Phê duyệt hoặc từ chối các yêu cầu tài khoản giáo viên và phụ huynh đang chờ xử lý.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">
                <Clock className="h-4 w-4" />
                {pendingCount} pending
              </span>
              <button
                type="button"
                onClick={loadRequests}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Tải lại
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kiếm theo tên, email, vai trò hoặc thông tin chi tiết..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            >
              <option value="PENDING">Chờ xử lý</option>
              <option value="APPROVED">Đã phê duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
              <option value="ALL">Tất cả trạng thái</option>
            </select>
          </div>  
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{success}</div>}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-6 text-sm font-semibold text-slate-500">Đang tải...</div>
          ) : filteredRequests.length ? (
            <div className="divide-y divide-slate-100">
              {filteredRequests.map((request) => {
                const isPending = request.status === 'PENDING';
                return (
                  <article key={request.id} className="p-5 transition hover:bg-slate-50/70">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold text-slate-900">{request.fullName || 'Unnamed request'}</h2>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyles[request.status] || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                            {request.status || 'UNKNOWN'}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {roleLabels[request.role] || request.role}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Mail className="h-4 w-4" />
                            {request.email}
                          </span>
                          <span>Ngày tạo: {formatDate(request.createdAt)}</span>
                        </div>

                        {request.additionalInfo && (
                          <pre className="max-w-3xl whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                            {request.additionalInfo}
                          </pre>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <button
                          type="button"
                          onClick={() => handleDecision(request, 'approve')}
                          disabled={!isPending || savingId === request.id}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          Phê duyệt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(request, 'reject')}
                          disabled={!isPending || savingId === request.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3.5 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
              <UserRoundCheck className="h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">Không tìm được tài khoản hợp lệ.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
