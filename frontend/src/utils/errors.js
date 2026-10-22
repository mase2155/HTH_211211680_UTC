export function getErrorMessage(error, fallback = 'Đã xảy ra lỗi, vui lòng thử lại') {
  return error?.response?.data?.error?.message || error?.message || fallback;
}
