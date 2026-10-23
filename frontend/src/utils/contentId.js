/** ID dự kiến = số bản ghi hiện có + 1 (không phụ thuộc IDENTITY sau khi đã xóa bản ghi). */
export function getNextContentId(items, total) {
  const count = typeof total === 'number' ? total : items?.length ?? 0;
  return count + 1;
}
