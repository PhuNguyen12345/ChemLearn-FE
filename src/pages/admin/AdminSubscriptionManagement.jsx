import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import {
  createAdminPackage,
  deleteAdminPackage,
  getAdminPackages,
  getAdminStudentEntitlements,
  grantAdminPackageToStudent,
  revokeAdminStudentEntitlement,
  updateAdminPackage,
} from '@/lib/api';

const packageFormBase = {
  packageCode: '',
  packageName: '',
  gradeLevel: '',
  basePrice: '',
  durationDays: '',
  description: '',
  benefitsJson: '',
  isActive: true,
};

const grantFormBase = {
  studentEmail: '',
  packageCode: '',
  durationDays: '',
  reason: '',
};

const normalizeEntitlementStatus = (status) => {
  if (!status) return 'UNKNOWN';
  return String(status).toUpperCase();
};

const statusStyles = {
  ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
  EXPIRED: 'bg-amber-100 text-amber-800 border-amber-200',
  PENDING: 'bg-slate-100 text-slate-700 border-slate-200',
  UNKNOWN: 'bg-slate-100 text-slate-700 border-slate-200',
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

const parseOptionalInt = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export default function AdminSubscriptionManagement() {
  const [packages, setPackages] = useState([]);
  const [entitlements, setEntitlements] = useState([]);

  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingEntitlements, setLoadingEntitlements] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [packageForm, setPackageForm] = useState(packageFormBase);
  const [editingPackageCode, setEditingPackageCode] = useState(null);
  const [packageFormOpen, setPackageFormOpen] = useState(false);

  const [grantForm, setGrantForm] = useState(grantFormBase);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadPackages = async () => {
    try {
      setLoadingPackages(true);
      setError('');
      const data = await getAdminPackages();
      setPackages(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load subscription packages.');
    } finally {
      setLoadingPackages(false);
    }
  };

  const loadEntitlements = async (studentEmail) => {
    if (!studentEmail) {
      setEntitlements([]);
      return;
    }

    try {
      setLoadingEntitlements(true);
      setError('');
      const data = await getAdminStudentEntitlements(studentEmail);
      setEntitlements(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load student entitlements.');
    } finally {
      setLoadingEntitlements(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const filteredPackages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return packages;

    return packages.filter((item) => {
      return [item.packageCode, item.packageName, item.description, item.gradeLevel]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [packages, searchTerm]);

  const activePackageCount = useMemo(
    () => packages.filter((item) => item.isActive !== false).length,
    [packages],
  );

  const resetPackageForm = () => {
    setPackageForm(packageFormBase);
    setEditingPackageCode(null);
    setPackageFormOpen(false);
  };

  const openCreatePackage = () => {
    setEditingPackageCode(null);
    setPackageForm(packageFormBase);
    setPackageFormOpen((prev) => !prev);
  };

  const openEditPackage = (item) => {
    setEditingPackageCode(item.packageCode);
    setPackageFormOpen(true);
    setPackageForm({
      packageCode: item.packageCode || '',
      packageName: item.packageName || '',
      gradeLevel: item.gradeLevel ?? '',
      basePrice: item.basePrice ?? '',
      durationDays: item.durationDays ?? '',
      description: item.description || '',
      benefitsJson: item.benefitsJson || '',
      isActive: item.isActive !== false,
    });
  };

  const closeDeleteDialog = () => {
    if (saving) return;
    setDeleteTarget(null);
  };

  const handleSavePackage = async (event) => {
    event.preventDefault();

    const payload = {
      packageCode: packageForm.packageCode.trim(),
      packageName: packageForm.packageName.trim(),
      gradeLevel: parseOptionalInt(packageForm.gradeLevel),
      basePrice: parseOptionalInt(packageForm.basePrice),
      durationDays: parseOptionalInt(packageForm.durationDays),
      description: packageForm.description.trim() || null,
      benefitsJson: packageForm.benefitsJson.trim() || null,
      isActive: Boolean(packageForm.isActive),
    };

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!payload.packageCode || !payload.packageName) {
        throw new Error('Package code and package name are required.');
      }

      if (editingPackageCode) {
        await updateAdminPackage(editingPackageCode, payload);
        setSuccess(`Package ${editingPackageCode} updated successfully.`);
      } else {
        await createAdminPackage(payload);
        setSuccess(`Package ${payload.packageCode} created successfully.`);
      }

      await loadPackages();
      resetPackageForm();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save package.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePackage = async (packageCode) => {
    setDeleteTarget({ type: 'package', item: { packageCode } });
  };

  const handleRevokeEntitlement = async (entitlement) => {
    setDeleteTarget({
      type: 'entitlement',
      item: {
        ...entitlement,
        studentEmail: entitlement.email || entitlement.studentEmail || grantForm.studentEmail.trim(),
      },
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (deleteTarget.type === 'package') {
        await deleteAdminPackage(deleteTarget.item.packageCode);
        setSuccess(`Package ${deleteTarget.item.packageCode} deleted.`);
        await loadPackages();
        if (editingPackageCode === deleteTarget.item.packageCode) {
          resetPackageForm();
        }
      } else {
        await revokeAdminStudentEntitlement(deleteTarget.item.id, {
          reason: 'Revoked by admin',
        });
        setSuccess(`Entitlement ${deleteTarget.item.id} revoked.`);
        await loadEntitlements(deleteTarget.item.studentEmail);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to complete delete action.');
    } finally {
      setSaving(false);
      setDeleteTarget(null);
    }
  };

  const handleGrantPackage = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        email: grantForm.studentEmail.trim(),
        packageCode: grantForm.packageCode,
        durationDays: parseOptionalInt(grantForm.durationDays),
        note: grantForm.reason.trim() || null,
      };

      if (!payload.email || !payload.packageCode) {
        throw new Error('Student email and package are required to grant access.');
      }

      await grantAdminPackageToStudent(payload);
      setSuccess(`Granted ${payload.packageCode} to ${payload.email}.`);
      await loadEntitlements(payload.email);
      setGrantForm((prev) => ({ ...prev, durationDays: '', reason: '' }));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to grant package.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 p-4 pt-6 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Subscription Admin</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Package & Entitlement Management</h1>
              <p className="mt-1 text-sm text-slate-500">Create, update, delete packages and grant or revoke student subscriptions.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                {activePackageCount} active packages
              </span>
              <button
                type="button"
                onClick={loadPackages}
                disabled={loadingPackages}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${loadingPackages ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search packages by code, name, grade, or description..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>
            <button
              type="button"
              onClick={openCreatePackage}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              {packageFormOpen && !editingPackageCode ? 'Close form' : 'Create package'}
            </button>
          </div>

          <div className={`overflow-hidden transition-all duration-300 ${packageFormOpen ? 'mt-4 max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <form onSubmit={handleSavePackage} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{editingPackageCode ? 'Edit package' : 'Create package'}</h2>
                  <p className="text-xs text-slate-500">Maintain subscription packages available for students.</p>
                </div>
                {editingPackageCode && (
                  <button
                    type="button"
                    onClick={resetPackageForm}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                  >
                    Cancel edit
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <input
                  value={packageForm.packageCode}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, packageCode: event.target.value }))}
                  placeholder="Package code (e.g., GRADE_6)"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                  required
                  disabled={Boolean(editingPackageCode)}
                />
                <input
                  value={packageForm.packageName}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, packageName: event.target.value }))}
                  placeholder="Package name"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                  required
                />
                <input
                  value={packageForm.gradeLevel}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, gradeLevel: event.target.value }))}
                  placeholder="Grade level (optional)"
                  type="number"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                />
                <input
                  value={packageForm.basePrice}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, basePrice: event.target.value }))}
                  placeholder="Base price"
                  type="number"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                />
                <input
                  value={packageForm.durationDays}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, durationDays: event.target.value }))}
                  placeholder="Duration days"
                  type="number"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                />
                <label className="inline-flex h-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={packageForm.isActive}
                    onChange={(event) => setPackageForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                  Package active
                </label>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <textarea
                  value={packageForm.description}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Description"
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                />
                <textarea
                  value={packageForm.benefitsJson}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, benefitsJson: event.target.value }))}
                  placeholder="Benefits JSON (optional)"
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {editingPackageCode ? 'Update package' : 'Create package'}
                </button>
                {!editingPackageCode && (
                  <button
                    type="button"
                    onClick={resetPackageForm}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{success}</div>}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">Existing packages</h2>
            </div>
            {loadingPackages ? (
              <div className="p-6 text-sm font-semibold text-slate-500">Loading packages...</div>
            ) : filteredPackages.length ? (
              <div className="divide-y divide-slate-100">
                {filteredPackages.map((item) => (
                  <article key={item.packageCode} className="p-5 transition hover:bg-slate-50/70">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{item.packageName}</h3>
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                            {item.packageCode}
                          </span>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${item.isActive !== false ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {item.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{item.description || 'No description'}</p>
                        <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                          <span>Grade: {item.gradeLevel ?? 'N/A'}</span>
                          <span>Price: {item.basePrice ?? 'N/A'}</span>
                          <span>Duration: {item.durationDays ?? 'N/A'} days</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditPackage(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePackage(item.packageCode)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-6 text-sm font-semibold text-slate-500">No package found.</div>
            )}
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Grant package to student</h2>
              <p className="mt-1 text-xs text-slate-500">Grant access manually to a student by email.</p>

              <form onSubmit={handleGrantPackage} className="mt-3 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500">Student email</span>
                  <input
                    value={grantForm.studentEmail}
                    onChange={(event) => setGrantForm((prev) => ({ ...prev, studentEmail: event.target.value }))}
                    placeholder="student@example.com"
                    type="email"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500">Package</span>
                  <select
                    value={grantForm.packageCode}
                    onChange={(event) => setGrantForm((prev) => ({ ...prev, packageCode: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    required
                  >
                    <option value="">Select package</option>
                    {packages.map((item) => (
                      <option key={item.packageCode} value={item.packageCode}>
                        {item.packageCode} - {item.packageName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500">Duration days (optional)</span>
                  <input
                    value={grantForm.durationDays}
                    onChange={(event) => setGrantForm((prev) => ({ ...prev, durationDays: event.target.value }))}
                    placeholder="365"
                    type="number"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500">Reason (optional)</span>
                  <textarea
                    value={grantForm.reason}
                    onChange={(event) => setGrantForm((prev) => ({ ...prev, reason: event.target.value }))}
                    placeholder="Grant reason"
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Grant package
                  </button>
                  <button
                    type="button"
                    onClick={() => loadEntitlements(grantForm.studentEmail.trim())}
                    disabled={loadingEntitlements || !grantForm.studentEmail.trim()}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UserRound className="h-4 w-4" />
                    View entitlements
                  </button>
                </div>
              </form>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-bold text-slate-900">Student entitlements</h3>
              </div>

              {loadingEntitlements ? (
                <div className="p-4 text-sm font-semibold text-slate-500">Loading entitlements...</div>
              ) : entitlements.length ? (
                <div className="divide-y divide-slate-100">
                  {entitlements.map((item) => {
                    const status = normalizeEntitlementStatus(item.status);
                    const canRevoke = status === 'ACTIVE' || status === 'PENDING';

                    return (
                      <article key={item.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                              {item.packageCode}
                            </span>
                            <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusStyles[status] || statusStyles.UNKNOWN}`}>
                              {status}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs text-slate-500">
                            <p>ID: {item.id}</p>
                            <p>Start: {formatDateTime(item.startAt)}</p>
                            <p>End: {formatDateTime(item.endAt)}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRevokeEntitlement(item)}
                            disabled={!canRevoke || saving}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Revoke
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-sm font-semibold text-slate-500">No entitlements loaded yet.</div>
              )}
            </div>
          </section>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start gap-4 border-b border-slate-100 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-slate-900">
                  {deleteTarget.type === 'package' ? 'Delete package' : 'Revoke subscription'}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {deleteTarget.type === 'package'
                    ? `Delete package ${deleteTarget.item.packageCode}? Students will lose access to this package.`
                    : `Revoke entitlement ${deleteTarget.item.id}? The student will lose access to this package.`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={saving}
                className="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 p-5">
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={saving}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {deleteTarget.type === 'package' ? 'Confirm delete' : 'Confirm revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
