/** ID dự kiến cho bài tin / đối tác mới — khớp với IDENTITY SQL Server (max hiện tại + 1). */
export function getNextContentId(items) {
  if (!items?.length) return 1;
  return items.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}
