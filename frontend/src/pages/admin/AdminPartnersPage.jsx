import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import {
  createPartnerItemApi,
  deletePartnerItemApi,
  fetchPartnerItemsApi,
  updatePartnerItemApi,
} from '../../features/partnerItems/partnerItems.api';
import { getErrorMessage } from '../../utils/errors';

const emptyForm = { title: '', imageUrl: '', isFeatured: false, sortOrder: 0, isActive: true };

export default function AdminPartnersPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.partnerItems({ admin: true, list: true }),
    queryFn: () => fetchPartnerItemsApi({ limit: 100 }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['partnerItems'] });

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId ? updatePartnerItemApi(editingId, form) : createPartnerItemApi(form),
    onSuccess: () => {
      setMessage({ type: 'success', text: editingId ? 'Đã cập nhật đối tác.' : 'Đã thêm đối tác.' });
      setEditingId(null);
      setForm(emptyForm);
      invalidate();
    },
    onError: (err) => setMessage({ type: 'danger', text: getErrorMessage(err) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePartnerItemApi(id),
    onSuccess: () => {
      if (editingId) {
        setEditingId(null);
        setForm(emptyForm);
      }
      invalidate();
    },
    onError: (err) => setMessage({ type: 'danger', text: getErrorMessage(err) }),
  });

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title ?? '',
      imageUrl: item.imageUrl ?? '',
      isFeatured: Boolean(item.isFeatured),
      sortOrder: item.sortOrder ?? 0,
      isActive: Boolean(item.isActive),
    });
    setMessage({ type: '', text: '' });
  }

  const items = data?.items ?? [];

  return (
    <>
      <div className="content-header">
        <h1>Quản lý đối tác</h1>
        <p className="breadcrumb-demo">Section 1 / Đối tác</p>
      </div>
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>{message.text}</div>
      )}
      <p className="small text-muted mb-3">
        Thêm đối tác mới sẽ tự xuất hiện thêm một thẻ trên trang <strong>Đối tác</strong> (cùng kiểu card), không
        cần xóa mục cũ. Thứ tự hiển thị theo cột &quot;Thứ tự&quot;.
      </p>
      <div className="card">
        <div className="card-header">
          <span>Danh sách đối tác</span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingId(null);
              const nextOrder =
                items.length > 0
                  ? Math.max(...items.map((i) => Number(i.sortOrder) || 0)) + 1
                  : 1;
              setForm({ ...emptyForm, sortOrder: nextOrder });
            }}
          >
            <i className="fa-solid fa-plus me-1" /> Thêm
          </button>
        </div>
        <div className="card-body table-responsive">
          {isLoading && <p className="text-muted mb-0">Đang tải…</p>}
          {isError && <p className="text-danger mb-0">Không tải được dữ liệu.</p>}
          {!isLoading && !isError && (
            <table className="table table-hover table-crud align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Nổi bật</th>
                  <th>Thứ tự</th>
                  <th>Hiển thị</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.isFeatured ? 'Có' : 'Không'}</td>
                    <td>{item.sortOrder}</td>
                    <td>{item.isActive ? 'Đang hiện' : 'Ẩn'}</td>
                    <td className="text-end text-nowrap">
                      <div className="btn-action-group d-inline-flex gap-2">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => startEdit(item)}>
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm('Xóa mục đối tác này?')) deleteMutation.mutate(item.id);
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
      <div className="card">
        <div className="card-header">{editingId ? `Sửa #${editingId}` : 'Thêm đối tác'}</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label" htmlFor="partner-title">
                Tiêu đề
              </label>
              <input
                id="partner-title"
                type="text"
                className="form-control"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="partner-image">
                URL ảnh
              </label>
              <input
                id="partner-image"
                type="text"
                className="form-control"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="partner-sort">
                Thứ tự
              </label>
              <input
                id="partner-sort"
                type="number"
                min={0}
                className="form-control"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="col-md-3 d-flex flex-column gap-2 pt-4">
              <label className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                />
                <span className="form-check-label">Nổi bật</span>
              </label>
              <label className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                <span className="form-check-label">Hiển thị trên web</span>
              </label>
            </div>
            <div className="col-12">
              <button
                type="button"
                className="btn btn-warning"
                disabled={!form.title.trim() || saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
