import { useEffect, useRef, useState } from 'react';
import { imageUrlToFileName } from '../../utils/imageUrl';

const ACCEPT = 'image/jpeg,image/png,image/webp';

export default function SiteImagePicker({
  id,
  label,
  imageUrl,
  pendingFile,
  onPendingFileChange,
  onImageUrlChange,
  disabled,
}) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const fileName = pendingFile?.name || imageUrlToFileName(imageUrl);
  const previewSrc = pendingFile ? previewUrl : imageUrl;

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    onPendingFileChange(file);
  };

  const handleClear = () => {
    onPendingFileChange(null);
    onImageUrlChange('');
  };

  const hasImage = Boolean(pendingFile || imageUrl);

  return (
    <div>
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
      )}
      <p className="small text-muted mb-1">
        Ảnh chọn từ máy chỉ được ghi vào thư mục ảnh của dự án (backend/uploads/site-content) sau khi thêm hoặc sửa
        thành công.
      </p>
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <input
          id={id}
          type="text"
          className="form-control form-control-sm"
          style={{ maxWidth: '20rem' }}
          readOnly
          value={fileName || 'Chưa chọn ảnh'}
          title={pendingFile ? pendingFile.name : imageUrl || ''}
        />
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={disabled}
          onClick={handlePick}
        >
          Chọn ảnh từ máy
        </button>
        {hasImage && (
          <button
            type="button"
            className="btn btn-link btn-sm text-danger p-0"
            disabled={disabled}
            onClick={handleClear}
          >
            Bỏ ảnh
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="d-none"
        onChange={handleFileChange}
      />
      {previewSrc && (
        <img
          src={previewSrc}
          alt=""
          className="mt-2 rounded border"
          style={{ maxHeight: '6rem', maxWidth: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  );
}
