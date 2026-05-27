import { useEffect, useMemo, useState } from 'react';
import {
  createUser,
  deactivateUser,
  deleteUser,
  getUsers,
  updateUser,
} from '@/lib/api';

const emptyForm = {
  username: '',
  fullName: '',
  email: '',
  password: '',
  role: 'ROLE_STUDENT',
  enabled: true,
  avatarUrl: '',
};

const roleLabels = {
  ROLE_ADMIN: 'Admin',
  ROLE_TEACHER: 'Teacher',
  ROLE_STUDENT: 'Student',
  ROLE_PARENT: 'Parent',
};

const roleOptions = Object.keys(roleLabels);

const createFormBase = {
  username: '',
  fullName: '',
  email: '',
  password: '',
  role: 'ROLE_STUDENT',
  enabled: true,
  avatarUrl: '',
};

const editFormBase = {
  ...createFormBase,
  password: '',
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(createFormBase);
  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi khi tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return [...users].filter((user) => {
      const roleMatches = roleFilter === 'ALL' || user.role === roleFilter;
      if (!term) return roleMatches;

      const haystack = [user.username, user.fullName, user.email, user.role]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return roleMatches && haystack.includes(term);
    });
  }, [users, roleFilter, searchTerm]);

  const activeCount = useMemo(() => users.filter((user) => user.isActive !== false).length, [users]);
  const inactiveCount = users.length - activeCount;

  const resetForm = () => {
    setForm(createFormBase);
    setEditingUserId(null);
    setCreateOpen(false);
  };

  const openEdit = (user) => {
    setCreateOpen(true);
    setEditingUserId(user.id);
    setForm({
      username: user.username || '',
      fullName: user.fullName || '',
      email: user.email || '',
      password: '',
      role: user.role || 'ROLE_STUDENT',
      enabled: user.isActive ?? true,
      avatarUrl: user.avatarUrl || '',
    });
  };

  const openCreate = () => {
    setEditingUserId(null);
    setForm(createFormBase);
    setCreateOpen((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role,
        enabled: form.enabled,
        avatarUrl: form.avatarUrl.trim() || null,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      if (editingUserId) {
        await updateUser(editingUserId, payload);
        setSuccess('Cập nhật tài khoản người dùng thành công.');
      } else {
        if (!payload.password) {
          throw new Error('Mật khẩu là bắt buộc khi tạo tài khoản mới.');
        }
        await createUser(payload);
        setSuccess('Tạo tài khoản người dùng thành công.');
      }

      await loadUsers();
      setForm(createFormBase);
      setEditingUserId(null);
      setCreateOpen(false);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi lưu thông tin người dùng.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (user) => {
    if (!window.confirm(`Deactivate ${user.username}?`)) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await deactivateUser(user.id);
      setSuccess(`${user.username} đã bị vô hiệu hóa.`);
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi khi vô hiệu hóa người dùng.');
    } finally {
      setSaving(false);
    }
  };

  const handleReactivate = async (user) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await updateUser(user.id, { enabled: true });
      setSuccess(`${user.username} đã được kích hoạt lại.`);
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi khi kích hoạt lại người dùng.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Xóa vĩnh viễn ${user.username}?`)) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await deleteUser(user.id);
      setSuccess(`${user.username} đã bị xóa.`);
      await loadUsers();
      if (editingUserId === user.id) {
        resetForm();
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi khi xóa người dùng.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 pt-6">
      <div className="max-w-7xl mx-auto w-full space-y-5">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Quản lý người dùng</h1>
              <p className="mt-1 text-sm text-slate-500">Tạo, cập nhật, xem và vô hiệu hóa quyền truy cập tài khoản từ một nơi.</p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{activeCount} Hoạt động</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{inactiveCount} Ngưng hoạt động</span>
            </div>
          </div>

          <div className="sticky top-4 z-30">
            <div className="max-w-xl">
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                {createOpen && !editingUserId ? 'Close create form' : 'Create user'}
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-out ${createOpen ? 'mt-3 max-h-[560px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'}`}>
                <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{editingUserId ? 'Chỉnh sửa thông tin người dùng' : 'Tạo tài khoản mới'}</h2>
                      <p className="text-xs text-slate-500">Khung tạo nhanh để quản lý tài khoản quản trị.</p>
                    </div>
                    {editingUserId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                      >
                        Hủy chỉnh sửa
                      </button>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <input
                      value={form.username}
                      onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="Username"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                      required
                    />
                    <input
                      value={form.fullName}
                      onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Full name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                      required
                    />
                    <input
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                      type="email"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                      required
                    />
                    <input
                      value={form.avatarUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                      placeholder="Avatar URL"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                    <input
                      value={form.password}
                      onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder={editingUserId ? 'New password (optional)' : 'Password'}
                      type="password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                      required={!editingUserId}
                    />
                    <select
                      value={form.role}
                      onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>{roleLabels[role]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.enabled}
                        onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                      />
                      Tài khoản hoạt động
                    </label>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : editingUserId ? 'Update user' : 'Create user'}
                    </button>

                    {!editingUserId && createOpen && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
          <div className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 bg-secondary">
                <h2 className="text-lg font-bold text-slate-900">Danh sách người dùng</h2>
              </div>

              {loading ? (
                <div className="p-6 text-sm font-semibold text-slate-500">Đang tải danh sách người dùng...</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="p-5 transition hover:bg-slate-50/80">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">{user.fullName || user.username}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-slate-600">
                              {roleLabels[user.role] || user.role}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">@{user.username} · {user.email}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            Tạo lúc: {user.created ? new Date(user.created).toLocaleString() : 'Không rõ'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            className="rounded-full border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                          >
                            Chỉnh sửa
                          </button>
                          {user.isActive ? (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(user)}
                              className="rounded-full border border-amber-300 px-3.5 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                            >
                              Ngưng hoạt động
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleReactivate(user)}
                              className="rounded-full border border-emerald-300 px-3.5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                            >
                              Hoạt động
                            </button>
                          )}
                          
                        </div>
                      </div>
                    </div>
                  ))}

                  {!filteredUsers.length && (
                    <div className="p-6 text-sm font-semibold text-slate-500">Không tìm thấy tài khoản hợp lệ.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 space-y-4 self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Tìm kiếm & Lọc</p>
              <div className="mt-3 space-y-3">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm tài khoản..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                >
                  <option value="ALL">Tất cả các vai trò</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{roleLabels[role]}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('ALL');
                  }}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Xoá bộ lọc
                </button>
              </div>
            </div>

            
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;