import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import {
  createFieldApi,
  deleteFieldApi,
  fetchAdminFieldsApi,
  fetchFieldPricesApi,
  replaceFieldPricesApi,
  updateFieldApi,
} from '../../features/fields/fields.api';
import { fetchFieldTypesApi } from '../../features/fieldTypes/fieldTypes.api';
import { fetchTimeSlotsApi } from '../../features/timeSlots/timeSlots.api';
import { getErrorMessage } from '../../utils/errors';
import { formatAmount, parseAmount } from '../../utils/format';
import { getNextContentId } from '../../utils/contentId';

const FIELD_STATUSES = [
  { value: 'Active', label: 'Hoạt động' },
  { value: 'Maintenance', label: 'Bảo trì' },
  { value: 'Inactive', label: 'Ngừng hoạt động' },
];

function statusLabel(value) {
  return FIELD_STATUSES.find((s) => s.value === value)?.label ?? value;
}

function buildFieldSaveSuccessMessage(payload, field) {
  const statusChanged = payload.status !== undefined && payload.status !== field.status;
  const nameChanged = payload.name !== undefined && payload.name !== field.name;
  const addressChanged = payload.address !== undefined && payload.address !== field.address;
  if (statusChanged && !nameChanged && !addressChanged) {
    return `Đã cập nhật trạng thái sân thành công (${statusLabel(payload.status)}).`;
  }
  if (statusChanged && (nameChanged || addressChanged)) {
    return `Đã lưu thông tin và trạng thái sân thành công (${statusLabel(payload.status)}).`;
  }
  return 'Đã lưu thông tin sân thành công.';
}

function FieldPricesModal({ field, onClose, onNotice }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({});

  const pricesQuery = useQuery({
    queryKey: ['admin', 'fieldPrices', field.id],
    queryFn: () => fetchFieldPricesApi(field.id),
    enabled: Boolean(field?.id),
  });

  const slotsQuery = useQuery({
    queryKey: queryKeys.timeSlots(field.fieldTypeId),
    queryFn: () => fetchTimeSlotsApi({ fieldTypeId: field.fieldTypeId, limit: 100 }),
    enabled: Boolean(field?.fieldTypeId),
  });

  useEffect(() => {
    const next = {};
    for (const row of pricesQuery.data ?? []) {
      next[`${row.timeSlotId}-${row.dayType}`] = formatAmount(row.amount);
    }
    setDraft(next);
  }, [pricesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const items = [];
      for (const slot of slotsQuery.data ?? []) {
        for (const dayType of ['Weekday', 'Weekend']) {
          const key = `${slot.id}-${dayType}`;
          const raw = draft[key];
          const amount = parseAmount(raw);
          if (Number.isNaN(amount) || amount < 0) {
            throw new Error('Giá phải là số nguyên không âm');
          }
          items.push({ timeSlotId: slot.id, dayType, amount });
        }
      }
      if (items.length === 0) {
        throw new Error('Chưa có khung giờ cho loại sân này');
      }
      return replaceFieldPricesApi(field.id, items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'fieldPrices', field.id] });
      onNotice({ type: 'success', text: 'Đã cập nhật giá và khung giờ thành công.' });
      onClose();
    },
    onError: (err) => {
      onNotice({ type: 'danger', text: getErrorMessage(err) });
    },
  });

  const slots = slotsQuery.data ?? [];
  const loading = pricesQuery.isLoading || slotsQuery.isLoading;

  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog" style={{ background: 'rgba(0,0,0,.45)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Giá &amp; khung giờ — {field.name}
            </h5>
            <button type="button" className="btn-close" aria-label="Đóng" onClick={onClose} />
          </div>
          <div className="modal-body">
            <p className="small text-muted">
              Khung giờ theo loại sân <strong>{field.fieldTypeName}</strong>. Giá áp dụng cho từng khung (ngày thường /
              cuối tuần).
            </p>
            {loading && <p className="text-muted">Đang tải bảng giá…</p>}
            {(pricesQuery.isError || slotsQuery.isError) && (
              <p className="text-danger">Không tải được giá hoặc khung giờ.</p>
            )}
            {saveMutation.isError && (
              <div className="alert alert-danger py-2">{getErrorMessage(saveMutation.error)}</div>
            )}
            {!loading && slots.length > 0 && (
              <div className="table-responsive">
                <table className="table table-sm table-bordered align-middle">
                  <thead>
                    <tr>
                      <th>Khung giờ</th>
                      <th>Ngày thường (VND)</th>
                      <th>Cuối tuần (VND)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot) => (
                      <tr key={slot.id}>
                        <td>
                          {slot.startTime} – {slot.endTime}
                        </td>
                        {['Weekday', 'Weekend'].map((dayType) => {
                          const key = `${slot.id}-${dayType}`;
                          return (
                            <td key={dayType}>
                              <input
                                type="text"
                                inputMode="numeric"
                                className="form-control form-control-sm"
                                value={draft[key] ?? ''}
                                onChange={(e) => {
                                  const parsed = parseAmount(e.target.value);
                                  setDraft((prev) => ({
                                    ...prev,
                                    [key]:
                                      Number.isNaN(parsed) && !e.target.value.trim()
                                        ? ''
                                        : formatAmount(Number.isNaN(parsed) ? 0 : parsed),
                                  }));
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && slots.length === 0 && (
              <p className="text-warning mb-0">Loại sân chưa có khung giờ trong hệ thống.</p>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={saveMutation.isPending || loading || slots.length === 0}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminFieldsPage() {
  const queryClient = useQueryClient();
  const [filterTypeId, setFilterTypeId] = useState('');
  const [priceField, setPriceField] = useState(null);
  const [notice, setNotice] = useState(null);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [createForm, setCreateForm] = useState({
    fieldTypeId: '',
    name: '',
    address: '',
    description: '',
    status: 'Active',
  });

  const listParams = useMemo(() => {
    const p = { limit: 100 };
    if (filterTypeId) p.fieldTypeId = Number(filterTypeId);
    return p;
  }, [filterTypeId]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.adminFields(listParams),
    queryFn: () => fetchAdminFieldsApi(listParams),
  });

  const typesQuery = useQuery({
    queryKey: ['admin', 'fieldTypes'],
    queryFn: () => fetchFieldTypesApi({ limit: 50 }),
  });

  const invalidateFields = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'fields'] });

  const fields = useMemo(() => {
    const items = data?.items ?? [];
    return [...items].sort((a, b) => Number(a.id) - Number(b.id));
  }, [data?.items]);
  const fieldTypes = typesQuery.data ?? [];
  const nextFieldId = getNextContentId(fields, data?.meta?.total);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateFieldApi(id, payload),
    onSuccess: (_, { fieldSnapshot, payload, onDone }) => {
      invalidateFields();
      setNotice({ type: 'success', text: buildFieldSaveSuccessMessage(payload, fieldSnapshot) });
      onDone?.();
    },
    onError: (err) => {
      setNotice({
        type: 'danger',
        text: getErrorMessage(err) || 'Không lưu được thay đổi sân. Vui lòng thử lại.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFieldApi(id),
    onSuccess: () => {
      if (editingFieldId) {
        setEditingFieldId(null);
        setEditForm(null);
      }
      invalidateFields();
      setNotice({ type: 'success', text: 'Đã xóa sân.' });
    },
    onError: (err) => {
      setNotice({ type: 'danger', text: getErrorMessage(err) });
    },
  });

  const editingField = useMemo(
    () => fields.find((f) => f.id === editingFieldId) ?? null,
    [fields, editingFieldId],
  );

  function startEditField(field) {
    setEditingFieldId(field.id);
    setEditForm({
      name: field.name ?? '',
      address: field.address ?? '',
      description: field.description ?? '',
      status: field.status ?? 'Active',
    });
    setNotice(null);
  }

  function cancelEditField() {
    setEditingFieldId(null);
    setEditForm(null);
  }

  const handleSaveEditField = () => {
    if (!editingField || !editForm) return;
    setNotice(null);
    const payload = {};
    const name = editForm.name.trim();
    const address = editForm.address.trim();
    const description = editForm.description.trim();
    if (name !== editingField.name) payload.name = name;
    if (address !== (editingField.address ?? '')) payload.address = address;
    if (description !== (editingField.description ?? '')) payload.description = description || undefined;
    if (editForm.status !== editingField.status) payload.status = editForm.status;
    if (Object.keys(payload).length === 0) {
      setNotice({ type: 'warning', text: 'Chưa có thay đổi để lưu.' });
      return;
    }
    updateMutation.mutate({
      id: editingField.id,
      payload,
      fieldSnapshot: editingField,
      onDone: cancelEditField,
    });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createFieldApi({
        fieldTypeId: Number(createForm.fieldTypeId),
        name: createForm.name.trim(),
        address: createForm.address.trim(),
        description: createForm.description.trim() || undefined,
        status: createForm.status,
      }),
    onSuccess: () => {
      setCreateForm({
        fieldTypeId: '',
        name: '',
        address: '',
        description: '',
        status: 'Active',
      });
      invalidateFields();
    },
  });

  const countByType = useMemo(() => {
    const map = {};
    for (const f of fields.filter((x) => x.status !== 'Inactive')) {
      map[f.fieldTypeName] = (map[f.fieldTypeName] ?? 0) + 1;
    }
    return map;
  }, [fields]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!createForm.fieldTypeId || !createForm.name.trim() || !createForm.address.trim()) return;
    createMutation.mutate();
  };

  return (
    <>
      <div className="content-header">
        <h1>Quản lý sân</h1>
      </div>

      {notice && (
        <div className={`alert alert-${notice.type} alert-dismissible fade show`} role="alert">
          {notice.text}
          <button
            type="button"
            className="btn-close"
            aria-label="Đóng"
            onClick={() => setNotice(null)}
          />
        </div>
      )}

      {createMutation.isError && (
        <div className="alert alert-danger">{getErrorMessage(createMutation.error)}</div>
      )}

      <div className="card mb-3">
        <div className="card-header">Thêm sân mới</div>
        <div className="card-body">
          <form className="row g-2 align-items-end" onSubmit={handleCreate}>
            <div className="col-md-1">
              <label className="form-label small mb-1">ID</label>
              <input
                type="text"
                className="form-control form-control-sm"
                readOnly
                disabled
                value={nextFieldId}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small mb-1">Loại sân</label>
              <select
                className="form-select form-select-sm"
                value={createForm.fieldTypeId}
                required
                onChange={(e) => setCreateForm((f) => ({ ...f, fieldTypeId: e.target.value }))}
              >
                <option value="">— Chọn loại —</option>
                {fieldTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small mb-1">Tên sân</label>
              <input
                className="form-control form-control-sm"
                placeholder="VD: Bóng đá - Sân số 1"
                value={createForm.name}
                required
                maxLength={150}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small mb-1">Địa chỉ</label>
              <input
                className="form-control form-control-sm"
                value={createForm.address}
                required
                maxLength={255}
                onChange={(e) => setCreateForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small mb-1">Trạng thái</label>
              <select
                className="form-select form-select-sm"
                value={createForm.status}
                onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value }))}
              >
                {FIELD_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-1">
              <button type="submit" className="btn btn-sm btn-success w-100" disabled={createMutation.isPending}>
                {createMutation.isPending ? '…' : 'Thêm'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <span>Danh sách sân ({fields.length})</span>
          <div className="d-flex align-items-center gap-2">
            <label className="small text-muted mb-0">Lọc loại:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: '12rem' }}
              value={filterTypeId}
              onChange={(e) => setFilterTypeId(e.target.value)}
            >
              <option value="">Tất cả</option>
              {fieldTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body table-responsive">
          {isLoading && <p className="text-muted mb-0">Đang tải…</p>}
          {isError && (
            <p className="text-danger mb-0">
              Không tải được danh sách sân. {getErrorMessage(error)}
            </p>
          )}
          {!isLoading && !isError && fields.length === 0 && (
            <p className="text-muted mb-0">
              Chưa có sân trong cơ sở dữ liệu. Chạy <code>npm run db:seed</code> trong thư mục backend hoặc thêm sân
              bằng form phía trên.
            </p>
          )}
          {!isLoading && !isError && fields.length > 0 && (
            <table className="table table-hover table-crud">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên sân</th>
                  <th>Địa chỉ</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.name}</td>
                    <td>{f.address}</td>
                    <td>{f.fieldTypeName}</td>
                    <td>{statusLabel(f.status)}</td>
                    <td className="text-nowrap">
                      <div className="btn-action-group d-inline-flex flex-wrap gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => startEditField(f)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setPriceField(f)}
                        >
                          Giá &amp; giờ
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm(`Xóa sân "${f.name}"? Hành động này không thể hoàn tác.`)) {
                              deleteMutation.mutate(f.id);
                            }
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
          {!isLoading && fields.length > 0 && (
            <p className="small text-muted mb-0 mt-2">
              Tóm tắt sân đang hoạt động / bảo trì:{' '}
              {Object.entries(countByType).map(([name, n]) => (
                <span key={name} className="me-2">
                  {name}: <strong>{n}</strong>/3
                </span>
              ))}
            </p>
          )}
        </div>
      </div>

      {editingField && editForm && (
        <div className="card mt-3">
          <div className="card-header">Sửa sân #{editingField.id}</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label small" htmlFor="edit-field-id">
                  ID
                </label>
                <input
                  id="edit-field-id"
                  type="text"
                  className="form-control form-control-sm"
                  readOnly
                  disabled
                  value={editingField.id}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Loại sân</label>
                <input className="form-control form-control-sm" value={editingField.fieldTypeName} readOnly disabled />
              </div>
              <div className="col-md-3">
                <label className="form-label small" htmlFor="edit-field-name">
                  Tên sân
                </label>
                <input
                  id="edit-field-name"
                  className="form-control form-control-sm"
                  maxLength={150}
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small" htmlFor="edit-field-status">
                  Trạng thái
                </label>
                <select
                  id="edit-field-status"
                  className="form-select form-select-sm"
                  value={editForm.status}
                  disabled={updateMutation.isPending}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                >
                  {FIELD_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label small" htmlFor="edit-field-address">
                  Địa chỉ
                </label>
                <input
                  id="edit-field-address"
                  className="form-control form-control-sm"
                  maxLength={255}
                  value={editForm.address}
                  onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label small" htmlFor="edit-field-description">
                  Mô tả
                </label>
                <textarea
                  id="edit-field-description"
                  className="form-control form-control-sm"
                  rows={3}
                  maxLength={2000}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="col-12 d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  disabled={
                    !editForm.name.trim() ||
                    !editForm.address.trim() ||
                    updateMutation.isPending
                  }
                  onClick={handleSaveEditField}
                >
                  {updateMutation.isPending ? 'Đang lưu…' : 'Lưu'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  disabled={updateMutation.isPending}
                  onClick={cancelEditField}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {priceField && (
        <FieldPricesModal
          field={priceField}
          onClose={() => setPriceField(null)}
          onNotice={setNotice}
        />
      )}
    </>
  );
}
