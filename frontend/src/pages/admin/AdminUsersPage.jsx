import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import { useAuth } from '../../features/auth/AuthContext';
import { adminUpdateUserApi, fetchAdminUsersApi } from '../../features/users/users.api';
import { getErrorMessage } from '../../utils/errors';

const ROLE_LABELS = { Admin: 'Quản trị', Customer: 'Khách hàng' };

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [applied, setApplied] = useState({ keyword: '', role: '' });
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', isActive: true });
  const [message, setMessage] = useState({ type: '', text: '' });

  const filters = useMemo(
    () => ({
      keyword: applied.keyword || undefined,
      role: applied.role || undefined,
    }),
    [applied],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.adminUsers(filters),
    queryFn: () => fetchAdminUsersApi(filters),
  });

  const items = data?.items ?? [];
  const editingUser = items.find((u) => u.id === editingId) ?? null;

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!editingUser) return Promise.reject(new Error('Chưa chọn người dùng.'));
      const payload = {};
      const fullName = form.fullName.trim();
      const phone = form.phone.trim();
      if (fullName !== editingUser.fullName) payload.fullName = fullName;
      if (phone !== (editingUser.phone ?? '')) payload.phone = phone || null;
      if (form.isActive !== editingUser.isActive) payload.isActive = form.isActive;
      return adminUpdateUserApi(editingId, payload);
    },
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Đã cập nhật người dùng.' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => setMessage({ type: 'danger', text: getErrorMessage(err) }),
  });

  function startEdit(u) {
    setEditingId(u.id);
    setForm({
      fullName: u.fullName ?? '',
      phone: u.phone ?? '',
      isActive: u.isActive !== false,
    });
    setMessage({ type: '', text: '' });
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied({ keyword: keyword.trim(), role: roleFilter });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    if (currentUser?.id === editingUser.id && !form.isActive) {
      setMessage({ type: 'warning', text: 'Không thể khóa tài khoản đang đăng nhập.' });
      return;
    }
    const unchanged =
      form.fullName.trim() === editingUser.fullName &&
      form.phone.trim() === (editingUser.phone ?? '') &&
      form.isActive === editingUser.isActive;
    if (unchanged) {
      setMessage({ type: 'warning', text: 'Chưa có thay đổi để lưu.' });
      return;
    }
    saveMutation.mutate();
  };

  return (
    <>
      <div className="content-header">
        <h1>Quản lý người dùng</h1>
      </div>
      {message.text && (
        <div
          className={`alert alert-${message.type === 'success' ? 'success' : message.type === 'warning' ? 'warning' : 'danger'}`}
        >
          {message.text}
        </div>
      )}

      <div className="card mb-3">
        <div className="card-body">
          <form className="row g-2 align-items-end" onSubmit={handleSearch}>
            <div className="col-md-5">
              <label className="form-label small">Từ khóa (tên, email)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo tên hoặc email…"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small">Vai trò</label>
              <select className="form-select form-select-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="Customer">Khách hàng</option>
                <option value="Admin">Quản trị</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-sm btn-primary w-100">
                Lọc
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Danh sách ({items.length})</div>
        <div className="card-body table-responsive">
          {isLoading && <p className="text-muted mb-0">Đang tải…</p>}
          {isError && <p className="text-danger mb-0">Không tải được danh sách người dùng.</p>}
          {!isLoading && !isError && items.length === 0 && (
            <p className="text-muted mb-0">Không có người dùng phù hợp bộ lọc.</p>
          )}
          {!isLoading && !isError && items.length > 0 && (
            <table className="table table-hover table-crud align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className={editingId === u.id ? 'table-active' : undefined}>
                    <td>{u.id}</td>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{ROLE_LABELS[u.role] ?? u.role}</td>
                    <td>{u.isActive ? 'Hoạt động' : 'Đã khóa'}</td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(u)}>
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="card mt-3">
          <div className="card-header">Sửa người dùng #{editingUser.id}</div>
          <div className="card-body">
            <form className="row g-3" onSubmit={handleSave}>
              <div className="col-md-4">
                <label className="form-label small">Email</label>
                <input type="text" className="form-control form-control-sm" readOnly disabled value={editingUser.email} />
              </div>
              <div className="col-md-4">
                <label className="form-label small" htmlFor="user-fullname">
                  Họ tên
                </label>
                <input
                  id="user-fullname"
                  type="text"
                  className="form-control form-control-sm"
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small" htmlFor="user-phone">
                  Số điện thoại
                </label>
                <input
                  id="user-phone"
                  type="tel"
                  className="form-control form-control-sm"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small" htmlFor="user-active">
                  Trạng thái tài khoản
                </label>
                <select
                  id="user-active"
                  className="form-select form-select-sm"
                  value={form.isActive ? '1' : '0'}
                  disabled={currentUser?.id === editingUser.id}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === '1' }))}
                >
                  <option value="1">Hoạt động</option>
                  <option value="0">Khóa</option>
                </select>
                {currentUser?.id === editingUser.id && (
                  <p className="small text-muted mb-0 mt-1">Không thể tự khóa tài khoản admin đang đăng nhập.</p>
                )}
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-warning btn-sm" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Đang lưu…' : 'Lưu'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm ms-2"
                  onClick={() => {
                    setEditingId(null);
                    setMessage({ type: '', text: '' });
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
