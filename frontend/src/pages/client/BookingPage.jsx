import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { PAYMENT_METHOD_LABELS } from '../../constants/bookingLabels';
import ScheduleStatusBoard from '../../features/bookings/components/ScheduleStatusBoard';
import { useCreateBooking } from '../../features/bookings/bookings.hooks';
import { createBookingSchema } from '../../features/bookings/bookings.schemas';
import { useAuth } from '../../features/auth/AuthContext';
import { useFieldTypes } from '../../features/fieldTypes/fieldTypes.hooks';
import { useFields } from '../../features/fields/fields.hooks';
import { useScheduleBoard } from '../../features/schedule/schedule.hooks';
import { useTimeSlots } from '../../features/timeSlots/timeSlots.hooks';
import { todayDateInput } from '../../utils/date';
import { getErrorMessage } from '../../utils/errors';
import '../../styles/pages/booking.css';

export default function BookingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const fieldTypesQuery = useFieldTypes();
  const fieldTypes = fieldTypesQuery.data ?? [];

  const [fieldTypeId, setFieldTypeId] = useState('');
  const [boardDate, setBoardDate] = useState(todayDateInput());

  const fieldsQuery = useFields(fieldTypeId ? { fieldTypeId } : {});
  const fields = fieldsQuery.data?.items ?? [];
  const timeSlotsQuery = useTimeSlots(fieldTypeId);
  const timeSlots = timeSlotsQuery.data ?? [];
  const boardQuery = useScheduleBoard(fieldTypeId, boardDate);

  const createBooking = useCreateBooking();
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      fieldId: '',
      timeSlotId: '',
      bookingDate: todayDateInput(),
      customerName: '',
      customerPhone: '',
      note: '',
      paymentMethod: 'Online',
    },
  });

  const watchDate = watch('bookingDate');

  useEffect(() => {
    if (user) {
      setValue('customerName', user.fullName ?? '');
      setValue('customerPhone', user.phone ?? '');
    }
  }, [user, setValue]);

  useEffect(() => {
    if (watchDate) setBoardDate(watchDate);
  }, [watchDate]);

  useEffect(() => {
    resetField('fieldId');
    resetField('timeSlotId');
  }, [fieldTypeId, resetField]);

  const onFieldTypeChange = (value) => {
    setFieldTypeId(value);
  };

  const onSubmit = async (values) => {
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: ROUTES.booking } });
      return;
    }
    setSubmitError('');
    try {
      const booking = await createBooking.mutateAsync({
        ...values,
        fieldId: Number(values.fieldId),
        timeSlotId: Number(values.timeSlotId),
        note: values.note || undefined,
      });
      if (booking.paymentMethod === 'Online' && booking.paymentStatus === 'Unpaid') {
        navigate(ROUTES.payment(booking.id));
      } else {
        navigate(ROUTES.history);
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  const busy = isSubmitting || createBooking.isPending;

  return (
    <div className="booking-page">
      <div className="main_content">
        <section className="booking-form">
          <div className="content-form">
            <div className="booking-form-card container p-4 p-md-5 mb-5">
              <h3 className="form-section-title mb-4">
                <i className="fa-solid fa-file-pen me-2" /> Phiếu Đặt Sân Trực Tuyến
              </h3>
              {!isAuthenticated && (
                <div className="alert alert-warning">
                  Bạn cần{' '}
                  <Link to={ROUTES.login} state={{ from: ROUTES.booking }}>
                    đăng nhập
                  </Link>{' '}
                  để gửi yêu cầu đặt sân.
                </div>
              )}
              {submitError && (
                <div className="alert alert-danger" role="alert">
                  {submitError}
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Họ và tên khách hàng</label>
                    <input type="text" className="form-control" {...register('customerName')} />
                    {errors.customerName && <p className="form-error-text">{errors.customerName.message}</p>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Số điện thoại liên hệ</label>
                    <input type="tel" className="form-control" {...register('customerPhone')} />
                    {errors.customerPhone && <p className="form-error-text">{errors.customerPhone.message}</p>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Loại sân</label>
                    <select
                      className="form-select"
                      value={fieldTypeId}
                      onChange={(e) => onFieldTypeChange(Number(e.target.value) || '')}
                      required
                    >
                      <option value="">-- Chọn loại sân --</option>
                      {fieldTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Chọn sân</label>
                    <select className="form-select" {...register('fieldId')} disabled={!fieldTypeId}>
                      <option value="">-- Chọn sân cụ thể --</option>
                      {fields.map((field) => (
                        <option key={field.id} value={field.id}>
                          {field.name}
                        </option>
                      ))}
                    </select>
                    {errors.fieldId && <p className="form-error-text">{errors.fieldId.message}</p>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Ngày đá</label>
                    <input type="date" className="form-control" {...register('bookingDate')} />
                    {errors.bookingDate && <p className="form-error-text">{errors.bookingDate.message}</p>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Khung giờ</label>
                    <select className="form-select" {...register('timeSlotId')} disabled={!fieldTypeId}>
                      <option value="">-- Chọn khung giờ --</option>
                      {timeSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
                        </option>
                      ))}
                    </select>
                    {errors.timeSlotId && <p className="form-error-text">{errors.timeSlotId.message}</p>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Hình thức thanh toán</label>
                    <select className="form-select" {...register('paymentMethod')}>
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Yêu cầu / Ghi chú thêm</label>
                    <textarea className="form-control" rows={2} {...register('note')} />
                  </div>
                  <div className="col-12 text-end mt-4">
                    <button type="submit" className="btn-submit-booking px-5 py-2" disabled={busy}>
                      <i className="fa-solid fa-check-circle me-2" />
                      {busy ? 'Đang xử lý...' : 'Gửi Yêu Cầu Đặt Sân'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        <ScheduleStatusBoard
          boardQuery={boardQuery}
          fieldTypeId={fieldTypeId}
          date={boardDate}
          onDateChange={setBoardDate}
          onFieldTypeChange={onFieldTypeChange}
          fieldTypes={fieldTypes}
        />
      </div>
    </div>
  );
}
