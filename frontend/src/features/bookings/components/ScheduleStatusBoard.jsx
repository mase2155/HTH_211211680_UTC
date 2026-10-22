import { SLOT_STATE_CLASS, SLOT_STATE_LABELS } from '../../../constants/bookingLabels';
import { formatTimeRange } from '../../../utils/date';

export default function ScheduleStatusBoard({ boardQuery, fieldTypeId, date, onDateChange, onFieldTypeChange, fieldTypes }) {
  const { data, isLoading, isError } = boardQuery;

  return (
    <section className="status-board">
      <div className="status-board-card container p-4 p-md-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h3 className="form-section-title fw-bold mb-1">
              <i className="fa-solid fa-calendar-days me-2" />
              Trạng Thái Sân Trực Tuyến Trong Ngày
            </h3>
            <p className="text-muted mb-0">Cập nhật lịch trống / đã đặt theo thời gian thực</p>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <select
              className="form-select form-select-sm"
              value={fieldTypeId ?? ''}
              onChange={(e) => onFieldTypeChange(Number(e.target.value) || '')}
              aria-label="Loại sân"
            >
              <option value="">-- Loại sân --</option>
              {fieldTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="form-control form-control-sm"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              aria-label="Ngày xem lịch"
            />
          </div>
          <div className="legend-box d-flex gap-3 mt-md-0">
            <span className="badge-status available">
              <i className="fa-solid fa-circle me-1" /> Còn trống
            </span>
            <span className="badge-status booked">
              <i className="fa-solid fa-circle me-1" /> Đã đặt
            </span>
            <span className="badge-status maintenance">
              <i className="fa-solid fa-circle me-1" /> Bảo trì / đã qua
            </span>
          </div>
        </div>

        {!fieldTypeId || !date ? (
          <p className="text-muted text-center py-4">Chọn loại sân và ngày để xem bảng trạng thái.</p>
        ) : isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-warning" role="status" aria-label="Đang tải lịch" />
          </div>
        ) : isError ? (
          <p className="text-danger text-center py-4">Không tải được lịch sân. Vui lòng thử lại.</p>
        ) : !data?.rows?.length ? (
          <p className="text-muted text-center py-4">Không có khung giờ cho loại sân này.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered text-center align-middle custom-status-table">
              <thead>
                <tr>
                  <th>Khung Giờ</th>
                  {data.rows[0].fields.map((field) => (
                    <th key={field.fieldId}>{field.fieldName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.timeSlotId}>
                    <td className="fw-semibold">{formatTimeRange(row.startTime, row.endTime)}</td>
                    {row.fields.map((cell) => (
                      <td key={`${row.timeSlotId}-${cell.fieldId}`}>
                        <span className={`slot-status ${SLOT_STATE_CLASS[cell.state] ?? 'slot-maintenance'}`}>
                          {SLOT_STATE_LABELS[cell.state] ?? cell.state}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
