import { useEffect, useMemo, useState } from 'react';
import {
  createUser,
  deactivateUser,
  deleteUser,
  getUsers,
  updateUser,
} from '@/lib/api';

const createFormBase = {
  username: '',
  fullName: '',
  email: '',
  password: '',
  role: 'ROLE_STUDENT',
  enabled: true,
  avatarUrl: '',
};

const roleLabels = {
  ROLE_ADMIN: 'Quản trị viên',
  ROLE_TEACHER: 'Giáo viên',
  ROLE_STUDENT: 'Học sinh',
  ROLE_PARENT: 'Phụ huynh',
};

const roleOptions = Object.keys(roleLabels);

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
    return users.filter((user) => {
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
  const adminCount = useMemo(() => users.filter((user) => user.role === 'ROLE_ADMIN').length, [users]);
  const inactiveCount = users.length - activeCount;

  const resetForm = () => {
    setForm(createFormBase);
    setEditingUserId(null);
    setCreateOpen(false);
  };

  const openCreate = (role = 'ROLE_STUDENT') => {
    setEditingUserId(null);
    setForm({ ...createFormBase, role });
    setCreateOpen(true);
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
        setSuccess('Cập nhật tài khoản thành công.');
      } else {
        if (!payload.password) {
          throw new Error('Mật khẩu là bắt buộc khi tạo tài khoản mới.');
        }
        await createUser(payload);
        setSuccess(`Đã tạo tài khoản ${roleLabels[payload.role] || 'người dùng'} thành công.`);
      }

      await loadUsers();
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi lưu thông tin người dùng.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (user) => {
    if (!window.confirm(`Ngưng hoạt động tài khoản ${user.username}?`)) return;
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
    if (!window.confirm(`Xóa vĩnh viễn tài khoản ${user.username}?`)) return;
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
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <section className="border-b border-slate-200 pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-500">Quản trị tài khoản</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Quản lý người dùng</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Tạo tài khoản học sinh, giáo viên, phụ huynh hoặc quản trị viên trực tiếp từ dashboard admin.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openCreate('ROLE_ADMIN')}
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                Tạo admin
              </button>
              <button
                type="button"
                onClick={() => openCreate('ROLE_STUDENT')}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Tạo người dùng
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Đang hoạt động</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">{activeCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Quản trị viên</p>
            <p className="mt-2 text-3xl font-black text-indigo-600">{adminCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Ngưng hoạt động</p>
            <p className="mt-2 text-3xl font-black text-rose-600">{inactiveCount}</p>
          </div>
        </div>

        {createOpen && (
          <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  {editingUserId ? 'Chỉnh sửa tài khoản' : form.role === 'ROLE_ADMIN' ? 'Tạo tài khoản admin' : 'Tạo tài khoản mới'}
                </h2>
                <p className="text-sm text-slate-500">
                  Mật khẩu cần 8-32 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold text-slate-700">
                <span>Tên đăng nhập</span>
                <input
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white"
                  required
                />
              </label>

              <label className="space-y-1 text-sm font-semibold text-slate-700">
                <span>Họ tên</span>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white"
                  required
                />
              </label>

              <label className="space-y-1 text-sm font-semibold text-slate-700">
                <span>Email</span>
                <input
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  type="email"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white"
                  required
                />
              </label>

              <label className="space-y-1 text-sm font-semibold text-slate-700">
                <span>Avatar URL</span>
                <input
                  value={form.avatarUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </label>

              <label className="space-y-1 text-sm font-semibold text-slate-700">
                <span>{editingUserId ? 'Mật khẩu mới' : 'Mật khẩu'}</span>
                <input
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder={editingUserId ? 'Bỏ trống nếu không đổi' : ''}
                  type="password"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white"
                  required={!editingUserId}
                />
              </label>

              <label className="space-y-1 text-sm font-semibold text-slate-700">
                <span>Vai trò</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{roleLabels[role]}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
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
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : editingUserId ? 'Cập nhật' : 'Tạo tài khoản'}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-black text-slate-950">Danh sách người dùng</h2>
            </div>

            {loading ? (
              <div className="p-6 text-sm font-semibold text-slate-500">Đang tải danh sách người dùng...</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-5 transition hover:bg-slate-50">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-950">{user.fullName || user.username}</h3>
                          <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                            {roleLabels[user.role] || user.role}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-sm text-slate-500">@{user.username} · {user.email}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Tạo lúc: {user.created ? new Date(user.created).toLocaleString('vi-VN') : 'Không rõ'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Chỉnh sửa
                        </button>
                        {user.isActive ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(user)}
                            className="rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                          >
                            Ngưng hoạt động
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleReactivate(user)}
                            className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                          >
                            Kích hoạt
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {!filteredUsers.length && (
                  <div className="p-6 text-sm font-semibold text-slate-500">Không tìm thấy tài khoản phù hợp.</div>
                )}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Tìm kiếm & lọc</p>
              <div className="mt-3 space-y-3">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm tài khoản..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
                >
                  <option value="ALL">Tất cả vai trò</option>
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
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
              <p className="font-black">Admin mặc định khi deploy</p>
              <p className="mt-2">
                Backend sẽ tự tạo `duckhisuu` nếu database server chưa có tài khoản này.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
