import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useFieldTypes } from '../../features/fieldTypes/fieldTypes.hooks';
import { useFields } from '../../features/fields/fields.hooks';
import { todayDateInput } from '../../utils/date';
import '../../styles/pages/booking.css';

export default function SearchFieldsPage() {
  const fieldTypesQuery = useFieldTypes();
  const fieldTypes = fieldTypesQuery.data ?? [];

  const [keyword, setKeyword] = useState('');
  const [fieldTypeId, setFieldTypeId] = useState('');
  const [bookingDate, setBookingDate] = useState(todayDateInput());
  const [applied, setApplied] = useState({ keyword: '', fieldTypeId: '', bookingDate: todayDateInput() });

  const fieldsQuery = useFields({
    keyword: applied.keyword || undefined,
    fieldTypeId: applied.fieldTypeId || undefined,
    bookingDate: applied.bookingDate || undefined,
  });

  const items = fieldsQuery.data?.items ?? [];

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied({ keyword: keyword.trim(), fieldTypeId, bookingDate });
  };

  return (
    <div className="search-page">
      <div className="main_content">
        <div className="content-form">
          <div className="booking-form-card container p-4 p-md-5 mb-5">
            <h3 className="form-section-title mb-4">Tìm kiếm sân</h3>
            <form className="row g-3 mb-4" onSubmit={handleSearch}>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Từ khóa (tên sân)</label>
                <input
                  type="text"
                  className="form-control"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nhập tên sân..."
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Loại sân</label>
                <select className="form-select" value={fieldTypeId} onChange={(e) => setFieldTypeId(e.target.value)}>
                  <option value="">Tất cả</option>
                  {fieldTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Ngày chơi</label>
                <input
                  type="date"
                  className="form-control"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button type="submit" className="btn-submit-booking w-100 py-2">
                  Tìm
                </button>
              </div>
            </form>

            {fieldsQuery.isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-warning" role="status" aria-label="Đang tải" />
              </div>
            ) : fieldsQuery.isError ? (
              <p className="text-danger">Không tải được danh sách sân.</p>
            ) : items.length === 0 ? (
              <p className="text-muted">Không tìm thấy sân phù hợp.</p>
            ) : (
              <div className="row g-3">
                {items.map((field) => (
                  <div key={field.id} className="col-12 col-md-6">
                    <div className="border rounded p-3 h-100 bg-white">
                      <h5 className="fw-bold">{field.name}</h5>
                      <p className="text-muted mb-1">{field.fieldTypeName}</p>
                      <p className="mb-2">{field.address}</p>
                      <Link to={ROUTES.fieldDetail(field.id)} className="btn btn-sm btn-outline-secondary me-2">
                        Chi tiết
                      </Link>
                      <Link to={ROUTES.booking} className="btn btn-sm btn-warning">
                        Đặt sân
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
