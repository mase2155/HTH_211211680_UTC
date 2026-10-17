export default function Modal({ open, title, children, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div role="dialog" aria-modal="true">
      <h2>{title}</h2>
      {children}
      <button type="button" onClick={onClose}>
        Đóng
      </button>
    </div>
  );
}
