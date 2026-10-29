import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import {
  createFieldTypeApi,
  deleteFieldTypeApi,
  fetchAdminFieldTypesApi,
  updateFieldTypeApi,
} from '../../features/fieldTypes/fieldTypes.api';
import { getErrorMessage } from '../../utils/errors';
import { getNextContentId } from '../../utils/contentId';

const emptyForm = { name: '', description: '', isActive: true };

export default function AdminFieldTypesPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.adminFieldTypes,
    queryFn: () => fetchAdminFieldTypesApi(),
  });

  const items = data?.items ?? [];
  const nextId = getNextContentId(items, data?.meta?.total);
  const formDisplayId = editingId ?? nextId;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.adminFieldTypes });
    queryClient.invalidateQueries({ queryKey: queryKeys.fieldTypes });
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const name = form.name.trim();
      const description = form.description.trim();
      if (editingId) {
        const payload = {};
        const current = items.find((t) => t.id === editingId);
        if (name !== current?.name) payload.name = name;
        if (description !== (current?.description ?? '')) payload.description = description || undefined;
        if (form.isActive !== current?.isActive) payload.isActive = form.isActive;
        return updateFieldTypeApi(editingId, payload);
      }
      return createFieldTypeApi({
        name,
        description: description || undefined,
      });
    },
    onSuccess: () => {
      setMessage({
        type: 'success',
        text: editingId ? 'Đã cập nhật loại sân.' : 'Đã thêm loại sân.',
      });
      setEditingId(null);
      setForm(emptyForm);
      invalidate();
    },
    onError: (err) => setMessage({ type: 'danger', text: getErrorMessage(err) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFieldTypeApi(id),
    onSuccess: () => {
      if (editingId) {
        setEditingId(null);
        setForm(emptyForm);
      }
      invalidate();
      setMessage({ type: 'success', text: 'Đã xóa loại sân.' });
    },
    onError: (err) => setMessage({ type: 'danger', text: getErrorMessage(err) }),
  });

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name ?? '',
      description: item.description ?? '',
      isActive: item.isActive !== false,
    });
    setMessage({ type: '', text: '' });
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage({ type: '', text: '' });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      const current = items.find((t) => t.id === editingId);
      const name = form.name.trim();
      const description = form.description.trim();
      const unchanged =
        current &&
        name === current.name &&
        description === (current.description ?? '') &&
        form.isActive === current.isActive;
      if (unchanged) {
        setMessage({ type: 'warning', text: 'Chưa có thay đổi để lưu.' });
        return;
      }
    }
    saveMutation.mutate();
  };

  return (
    <>
      <div className="content-header">
        <h1>Quản lý loại sân</h1>
      </div>
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>{message.text}</div>
      )}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Danh sách loại sân ({items.length})</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={startCreate}>
            <i className="fa-solid fa-plus me-1" /> Thêm
          </button>
        </div>
        <div className="card-body table-responsive">
          {isLoading && <p className="text-muted mb-0">Đang tải…</p>}
          {isError && <p className="text-danger mb-0">Không tải được dữ liệu.</p>}
          {!isLoading && !isError && items.length === 0 && (
            <p className="text-muted mb-0">Chưa có loại sân. Thêm mới bằng form bên dưới.</p>
          )}
          {!isLoading && !isError && items.length > 0 && (
            <table className="table table-hover table-crud align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td className="text-muted small">{item.description || '—'}</td>
                    <td>{item.isActive ? 'Đang dùng' : 'Ngừng'}</td>
                    <td className="text-end text-nowrap">
                      <div className="btn-action-group d-inline-flex gap-2">
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => startEdit(item)}>
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm(`Xóa loại sân "${item.name}"?`)) deleteMutation.mutate(item.id);
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-header">{editingId ? `Sửa loại sân #${editingId}` : 'Thêm loại sân'}</div>
        <div className="card-body">
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-2">
              <label className="form-label" htmlFor="field-type-id">
                ID
              </label>
              <input id="field-type-id" type="text" className="form-control" readOnly disabled value={formDisplayId} />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="field-type-name">
                Tên loại sân
              </label>
              <input
                id="field-type-name"
                type="text"
                className="form-control"
                required
                maxLength={50}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            {editingId && (
              <div className="col-md-3">
                <label className="form-label" htmlFor="field-type-active">
                  Trạng thái
                </label>
                <select
                  id="field-type-active"
                  className="form-select"
                  value={form.isActive ? '1' : '0'}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === '1' }))}
                >
                  <option value="1">Đang dùng</option>
                  <option value="0">Ngừng hoạt động</option>
                </select>
              </div>
            )}
            <div className="col-12">
              <label className="form-label" htmlFor="field-type-desc">
                Mô tả
              </label>
              <input
                id="field-type-desc"
                type="text"
                className="form-control"
                maxLength={255}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-warning btn-sm" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Đang lưu…' : editingId ? 'Cập nhật' : 'Thêm loại sân'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm ms-2"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
