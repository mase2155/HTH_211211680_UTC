/** Ngày local dạng YYYY-MM-DD (input type="date"). */
export function todayDateInput() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/** Cộng/trừ ngày trên chuỗi YYYY-MM-DD (múi giờ local). */
export function addDaysToDateInput(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return '';
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}
