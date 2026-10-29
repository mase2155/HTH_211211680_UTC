import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFieldClosureApi,
  deleteFieldClosureApi,
  fetchFieldClosuresApi,
} from '../../features/fieldClosures/fieldClosures.api';
import { getErrorMessage } from '../../utils/errors';
import { todayDateInput } from '../../utils/date';

export default function FieldClosuresModal({ field, onClose, onNotice }) {
  const queryClient = useQueryClient();
  const [closedDate, setClosedDate] = useState(todayDateInput());
  const [reason, setReason] = useState('');

  const closuresQuery = useQuery({
    queryKey: ['admin', 'fieldClosures', field.id],
    queryFn: () => fetchFieldClosuresApi(field.id),
    enabled: Boolean(field?.id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'fieldClosures', field.id] });
    queryClient.invalidateQueries({ queryKey: ['schedule'] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createFieldClosureApi(field.id, {
        closedDate,
        reason: reason.trim() || undefined,
      }),
    onSuccess: () => {
      setReason('');
      invalidate();
      onNotice({ type: 'success', text: 'Đã thêm ngày nghỉ / bảo trì.' });
    },
    onError: (err) => onNotice({ type: 'danger', text: getErrorMessage(err) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (closureId) => deleteFieldClosureApi(field.id, closureId),
    onSuccess: () => {
      invalidate();
      onNotice({ type: 'success', text: 'Đã xóa ngày nghỉ.' });
    },
    onError: (err) => onNotice({ type: 'danger', text: getErrorMessage(err) }),
  });

  const items = closuresQuery.data ?? [];

  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog" style={{ background: 'rgba(0,0,0,.45)' }}>
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Ngày nghỉ — {field.name}</h5>
            <button type="button" className="btn-close" aria-label="Đóng" onClick={onClose} />
          </div>
          <div className="modal-body">
            <form
              className="row g-2 mb-3"
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
            >
              <div className="col-md-4">
                <label className="form-label small" htmlFor="closure-date">
                  Ngày
                </label>
                <input
                  id="closure-date"
                  type="date"
                  className="form-control form-control-sm"
                  required
                  value={closedDate}
                  onChange={(e) => setClosedDate(e.target.value)}
                />
              </div>
              <div className="col-md-5">
                <label className="form-label small" htmlFor="closure-reason">
                  Lý do (tùy chọn)
                </label>
                <input
                  id="closure-reason"
                  type="text"
                  className="form-control form-control-sm"
                  maxLength={255}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button type="submit" className="btn btn-sm btn-primary w-100" disabled={createMutation.isPending}>
                  Thêm
                </button>
              </div>
            </form>
            {closuresQuery.isLoading && <p className="text-muted small mb-0">Đang tải…</p>}
            {closuresQuery.isError && <p className="text-danger small mb-0">Không tải được danh sách ngày nghỉ.</p>}
            {!closuresQuery.isLoading && items.length === 0 && (
              <p className="text-muted small mb-0">Chưa có ngày nghỉ cho sân này.</p>
            )}
            {items.length > 0 && (
              <ul className="list-group list-group-flush">
                {items.map((row) => (
                  <li key={row.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>
                      <strong>{row.closedDate}</strong>
                      {row.reason ? <span className="text-muted small ms-2">{row.reason}</span> : null}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Xóa ngày nghỉ ${row.closedDate}?`)) {
                          deleteMutation.mutate(row.id);
                        }
                      }}
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
