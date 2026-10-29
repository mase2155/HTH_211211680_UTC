import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import { fetchAdminFieldTypesApi } from '../../features/fieldTypes/fieldTypes.api';
import {
  createTimeSlotApi,
  deleteTimeSlotApi,
  fetchAdminTimeSlotsApi,
  updateTimeSlotApi,
} from '../../features/timeSlots/timeSlots.api';
import { toTimeInputValue } from '../../utils/date';
import { getErrorMessage } from '../../utils/errors';
import { getNextContentId } from '../../utils/contentId';

const emptyForm = { fieldTypeId: '', startTime: '', endTime: '', isActive: true };

function compareTimeSlots(a, b) {
  const typeDiff = Number(a.fieldTypeId) - Number(b.fieldTypeId);
  if (typeDiff !== 0) return typeDiff;
  const startDiff = String(a.startTime).localeCompare(String(b.startTime));
  if (startDiff !== 0) return startDiff;
  return Number(a.id) - Number(b.id);
}

export default function AdminTimeSlotsPage() {
  const queryClient = useQueryClient();
  const [filterTypeId, setFilterTypeId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState({ type: '', text: '' });

  const typesQuery = useQuery({
    queryKey: queryKeys.adminFieldTypes,
    queryFn: () => fetchAdminFieldTypesApi(),
  });

  const fieldTypes = useMemo(() => {
    const rows = typesQuery.data?.items ?? [];
    return [...rows]
      .filter((t) => t.isActive !== false)
      .sort((a, b) => Number(a.id) - Number(b.id));
  }, [typesQuery.data?.items]);

  const listParams = useMemo(() => {
    const p = {};
    if (filterTypeId) p.fieldTypeId = filterTypeId;
    return p;
  }, [filterTypeId]);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.adminTimeSlots(listParams),
    queryFn: () => fetchAdminTimeSlotsApi(listParams),
  });

  const items = useMemo(() => {
    const rows = data?.items ?? [];
    return [...rows].sort(compareTimeSlots);
  }, [data?.items]);

  const nextId = getNextContentId(items, data?.meta?.total);
  const formDisplayId = editingId ?? nextId;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'timeSlots'] });
    queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
    queryClient.invalidateQueries({ queryKey: ['schedule'] });
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const startTime = toTimeInputValue(form.startTime);
      const endTime = toTimeInputValue(form.endTime);
      if (editingId) {
        const current = items.find((s) => s.id === editingId);
        const payload = {};
        const curStart = toTimeInputValue(current?.startTime);
        const curEnd = toTimeInputValue(current?.endTime);
        if (startTime && startTime !== curStart) payload.startTime = startTime;
        if (endTime && endTime !== curEnd) payload.endTime = endTime;
        if (form.isActive !== current?.isActive) payload.isActive = form.isActive;
        return updateTimeSlotApi(editingId, payload);
      }
      return createTimeSlotApi({
        fieldTypeId: Number(form.fieldTypeId),
        startTime,
        endTime,
      });
    },
    onSuccess: () => {
      setMessage({
        type: 'success',
        text: editingId ? 'Đã cập nhật khung giờ.' : 'Đã thêm khung giờ.',
      });
      setEditingId(null);
      setForm(emptyForm);
      invalidate();
    },
    onError: (err) => setMessage({ type: 'danger', text: getErrorMessage(err) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTimeSlotApi(id),
    onSuccess: () => {
      if (editingId) {
        setEditingId(null);
        setForm(emptyForm);
      }
      invalidate();
      setMessage({ type: 'success', text: 'Đã xóa khung giờ.' });
    },
    onError: (err) => setMessage({ type: 'danger', text: getErrorMessage(err) }),
  });

  function startEdit(slot) {
    setEditingId(slot.id);
    setForm({
      fieldTypeId: String(slot.fieldTypeId),
      startTime: toTimeInputValue(slot.startTime),
      endTime: toTimeInputValue(slot.endTime),
      isActive: slot.isActive !== false,
    });
    setMessage({ type: '', text: '' });
  }

  function startCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      fieldTypeId: filterTypeId || (fieldTypes[0] ? String(fieldTypes[0].id) : ''),
    });
    setMessage({ type: '', text: '' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage({ type: '', text: '' });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const startTime = toTimeInputValue(form.startTime);
    const endTime = toTimeInputValue(form.endTime);
    if (!startTime || !endTime) return;
    if (!editingId && !form.fieldTypeId) {
      setMessage({ type: 'warning', text: 'Chọn loại sân trước khi thêm khung giờ.' });
      return;
    }
    if (endTime <= startTime) {
      setMessage({ type: 'warning', text: 'Giờ kết thúc phải sau giờ bắt đầu.' });
      return;
    }
    if (editingId) {
      const current = items.find((s) => s.id === editingId);
      const unchanged =
        current &&
        startTime === toTimeInputValue(current.startTime) &&
        endTime === toTimeInputValue(current.endTime) &&
        form.isActive === current.isActive;
      if (unchanged) {
        setMessage({ type: 'warning', text: 'Chưa có thay đổi để lưu.' });
        return;
      }
    }
    saveMutation.mutate();
  };

  const editingSlot = editingId ? items.find((s) => s.id === editingId) : null;
  const formTitle = editingId ? 'Thay đổi thông tin khung giờ' : 'Thêm khung giờ';

  return (
    <>
      <div className="content-header">
        <h1>Quản lý khung giờ</h1>
        <p className="text-muted small mb-0">
          Khung giờ theo loại sân (BR01). Không chồng lấn; không đổi giờ khi còn đơn tương lai (BR02).
        </p>
      </div>
      {message.text && (
        <div
          className={`alert alert-${message.type === 'success' ? 'success' : message.type === 'warning' ? 'warning' : 'danger'}`}
        >
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="card-header d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <span>Danh sách khung giờ ({items.length})</span>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <label className="small text-muted mb-0" htmlFor="slot-filter-type">
              Loại sân:
            </label>
            <select
              id="slot-filter-type"
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
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={startCreate}
              disabled={fieldTypes.length === 0}
            >
              <i className="fa-solid fa-plus me-1" /> Thêm
            </button>
          </div>
        </div>
        <div className="card-body table-responsive">
          {typesQuery.isLoading && <p className="text-muted mb-0">Đang tải loại sân…</p>}
          {typesQuery.isError && <p className="text-danger mb-0">Không tải được loại sân.</p>}
          {!typesQuery.isLoading && fieldTypes.length === 0 && (
            <p className="text-warning mb-0">Chưa có loại sân hoạt động. Thêm loại sân trước khi tạo khung giờ.</p>
          )}
          {fieldTypes.length > 0 && isLoading && <p className="text-muted mb-0">Đang tải khung giờ…</p>}
          {fieldTypes.length > 0 && isError && <p className="text-danger mb-0">Không tải được khung giờ.</p>}
          {fieldTypes.length > 0 && !isLoading && !isError && items.length === 0 && (
            <p className="text-muted mb-0">Chưa có khung giờ{filterTypeId ? ' cho loại đã chọn' : ''}.</p>
          )}
          {fieldTypes.length > 0 && !isLoading && !isError && items.length > 0 && (
            <table className="table table-hover table-crud align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Loại sân</th>
                  <th>Bắt đầu</th>
                  <th>Kết thúc</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((slot) => (
                  <tr key={slot.id} className={editingId === slot.id ? 'table-active' : undefined}>
                    <td>{slot.id}</td>
                    <td>{slot.fieldTypeName}</td>
                    <td>{toTimeInputValue(slot.startTime)}</td>
                    <td>{toTimeInputValue(slot.endTime)}</td>
                    <td>{slot.isActive ? 'Đang dùng' : 'Ngừng'}</td>
                    <td className="text-end text-nowrap">
                      <div className="btn-action-group d-inline-flex gap-2">
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => startEdit(slot)}>
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm(`Xóa khung ${toTimeInputValue(slot.startTime)}–${toTimeInputValue(slot.endTime)}?`)) {
                              deleteMutation.mutate(slot.id);
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
        </div>
      </div>

      {fieldTypes.length > 0 && (
        <div className="card mt-3">
          <div className="card-header">{formTitle}</div>
          <div className="card-body">
            <form className="row g-3" onSubmit={handleSubmit}>
              <div className="col-md-2">
                <label className="form-label" htmlFor="slot-id">
                  ID
                </label>
                <input id="slot-id" type="text" className="form-control" readOnly disabled value={formDisplayId} />
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="slot-type">
                  Loại sân
                </label>
                {editingId ? (
                  <input
                    id="slot-type"
                    type="text"
                    className="form-control"
                    readOnly
                    disabled
                    value={editingSlot?.fieldTypeName ?? ''}
                  />
                ) : (
                  <select
                    id="slot-type"
                    className="form-select"
                    required
                    value={form.fieldTypeId}
                    onChange={(e) => setForm((f) => ({ ...f, fieldTypeId: e.target.value }))}
                  >
                    <option value="">— Chọn —</option>
                    {fieldTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="col-md-2">
                <label className="form-label" htmlFor="slot-start">
                  Giờ bắt đầu
                </label>
                <input
                  id="slot-start"
                  type="time"
                  className="form-control"
                  required
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label" htmlFor="slot-end">
                  Giờ kết thúc
                </label>
                <input
                  id="slot-end"
                  type="time"
                  className="form-control"
                  required
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
              {editingId && (
                <div className="col-md-2">
                  <label className="form-label" htmlFor="slot-active">
                    Trạng thái
                  </label>
                  <select
                    id="slot-active"
                    className="form-select"
                    value={form.isActive ? '1' : '0'}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === '1' }))}
                  >
                    <option value="1">Đang dùng</option>
                    <option value="0">Ngừng</option>
                  </select>
                </div>
              )}
              <div className="col-12">
                <button type="submit" className="btn btn-warning btn-sm" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Đang lưu…' : editingId ? 'Cập nhật' : 'Thêm khung giờ'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm ms-2"
                    onClick={cancelEdit}
                    disabled={saveMutation.isPending}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
