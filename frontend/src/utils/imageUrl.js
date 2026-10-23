/** Lấy tên file hiển thị từ URL ảnh (upload hoặc /news/...). */
export function imageUrlToFileName(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return '';
  const path = imageUrl.split('?')[0].trim();
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? '';
}
