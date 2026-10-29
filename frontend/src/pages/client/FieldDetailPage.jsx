import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { SLOT_STATE_CLASS, SLOT_STATE_LABELS } from '../../constants/bookingLabels';
import { useFieldSchedule } from '../../features/schedule/schedule.hooks';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import { fetchFieldByIdApi } from '../../features/fields/fields.api';
import { formatCurrency } from '../../utils/format';
import { formatTimeRange, todayDateInput } from '../../utils/date';
import { getErrorMessage } from '../../utils/errors';
import '../../styles/pages/booking.css';

export default function FieldDetailPage() {
  const { fieldId } = useParams();
  const navigate = useNavigate();
  const id = Number(fieldId);
  const [date, setDate] = useState(todayDateInput());

  const fieldQuery = useQuery({
    queryKey: queryKeys.fieldDetail(id),
    queryFn: () => fetchFieldByIdApi(id),
    enabled: Number.isFinite(id) && id > 0,
  });

  const scheduleQuery = useFieldSchedule(id, date);

  const field = fieldQuery.data;
  const slots = scheduleQuery.data?.slots ?? [];

  const goBookSlot = (timeSlotId) => {
    if (!field) return;
    const params = new URLSearchParams({
      fieldId: String(field.id),
      fieldTypeId: String(field.fieldTypeId),
      bookingDate: date,
      timeSlotId: String(timeSlotId),
    });
    navigate(`${ROUTES.booking}?${params.toString()}`);
  };

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="search-page">
        <div className="main_content content-form">
          <p className="text-danger">Mã sân không hợp lệ.</p>
          <Link to={ROUTES.search}>← Tìm sân</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page field-detail-page">
      <div className="main_content">
        <div className="content-form">
          <div className="booking-form-card container p-4 p-md-5 mb-5">
            {fieldQuery.isLoading && (
              <div className="text-center py-4">
                <div className="spinner-border text-warning" role="status" aria-label="Đang tải" />
              </div>
            )}
            {fieldQuery.isError && (
              <p className="text-danger">{getErrorMessage(fieldQuery.error) || 'Không tải được thông tin sân.'}</p>
            )}
            {field && (
              <>
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                  <div>
                    <p className="text-muted small mb-1">
                      <Link to={ROUTES.search}>Tìm sân</Link> / {field.fieldTypeName}
                    </p>
                    <h1 className="form-section-title mb-2">{field.name}</h1>
                    <p className="mb-1">
                      <i className="fa-solid fa-location-dot me-2 text-warning" />
                      {field.address}
                    </p>
                    {field.description && <p className="text-muted mb-0">{field.description}</p>}
                  </div>
                  {field.imageUrl && (
                    <img
                      src={field.imageUrl}
                      alt={field.name}
                      className="rounded border"
                      style={{ maxWidth: '280px', width: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>

                <h3 className="h5 fw-bold mb-3">
                  <i className="fa-solid fa-calendar-day me-2" />
                  Lịch &amp; khung giờ
                </h3>
                <div className="row g-3 align-items-end mb-3">
                  <div className="col-auto">
                    <label className="form-label fw-semibold" htmlFor="field-detail-date">
                      Ngày
                    </label>
                    <input
                      id="field-detail-date"
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                {scheduleQuery.isLoading && <p className="text-muted">Đang tải lịch…</p>}
                {scheduleQuery.isError && <p className="text-danger">Không tải được lịch sân.</p>}
                {!scheduleQuery.isLoading && !scheduleQuery.isError && slots.length === 0 && (
                  <p className="text-muted">Chưa có khung giờ cho loại sân này.</p>
                )}
                {slots.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <thead>
                        <tr>
                          <th>Khung giờ</th>
                          <th>Giá</th>
                          <th>Trạng thái</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {slots.map((slot) => {
                          const available = slot.state === 'Available';
                          return (
                            <tr key={slot.timeSlotId}>
                              <td>{formatTimeRange(slot.startTime, slot.endTime)}</td>
                              <td>{slot.amount != null ? formatCurrency(slot.amount) : '—'}</td>
                              <td>
                                <span className={`slot-status ${SLOT_STATE_CLASS[slot.state] ?? 'slot-maintenance'}`}>
                                  {SLOT_STATE_LABELS[slot.state] ?? slot.state}
                                </span>
                              </td>
                              <td className="text-end">
                                {available ? (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-warning"
                                    onClick={() => goBookSlot(slot.timeSlotId)}
                                  >
                                    Đặt
                                  </button>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
