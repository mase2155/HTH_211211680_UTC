export function formatCurrency(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/** Số tiền không kèm ký hiệu, ví dụ 300000 → "300.000" */
export function formatAmount(value) {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return '';
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export function parseAmount(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return Number.NaN;
  return Number.parseInt(digits, 10);
}

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}
