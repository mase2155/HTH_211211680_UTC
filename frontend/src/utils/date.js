/** Ngày local dạng YYYY-MM-DD (input type="date"). */
export function todayDateInput() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return '';
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}
