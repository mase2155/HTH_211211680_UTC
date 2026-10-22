const {
  getDayType,
  isValidDate,
  addDays,
  hasStarted,
  isCancellable,
  minutesUntil,
} = require('../../src/utils/datetime');

describe('datetime', () => {
  test('Thứ 7 và Chủ nhật là Weekend, còn lại là Weekday', () => {
    expect(getDayType('2026-10-24')).toBe('Weekend'); // Thứ 7
    expect(getDayType('2026-10-25')).toBe('Weekend'); // Chủ nhật
    expect(getDayType('2026-10-26')).toBe('Weekday'); // Thứ 2
  });

  test('isValidDate từ chối ngày không tồn tại', () => {
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('2026-10-22')).toBe(true);
  });

  test('addDays cộng ngày đúng khi qua tháng', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
  });

  test('tính phút còn lại theo giờ Việt Nam (UTC+7)', () => {
    // 18:00 giờ VN = 11:00 UTC
    const reference = new Date('2026-10-22T10:00:00Z'); // 17:00 giờ VN
    expect(minutesUntil('2026-10-22', '18:00', reference)).toBe(60);
  });

  test('hasStarted: khung giờ đã bắt đầu hay chưa', () => {
    const reference = new Date('2026-10-22T11:30:00Z'); // 18:30 giờ VN
    expect(hasStarted('2026-10-22', '18:00', reference)).toBe(true);
    expect(hasStarted('2026-10-22', '19:00', reference)).toBe(false);
  });

  test('isCancellable: phải còn đủ số phút tối thiểu trước giờ bắt đầu', () => {
    const reference = new Date('2026-10-22T10:00:00Z'); // 17:00 giờ VN
    expect(isCancellable('2026-10-22', '18:00', 60, reference)).toBe(true);
    expect(isCancellable('2026-10-22', '18:00', 90, reference)).toBe(false);
  });
});
