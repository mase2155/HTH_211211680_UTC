import { httpClient } from '../../api/httpClient';

export async function uploadSiteContentImageApi(file) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await httpClient.post('/site-content-images', formData, {
    transformRequest: [
      (payload, headers) => {
        delete headers['Content-Type'];
        return payload;
      },
    ],
  });
  return data.data;
}

async function uploadPendingFile(pendingFile) {
  const result = await uploadSiteContentImageApi(pendingFile);
  return result.imageUrl;
}

/**
 * Lưu tin/đối tác: ảnh từ máy chỉ ghi vào backend/uploads/site-content/ sau khi thêm mới thành công;
 * khi sửa thì tải ảnh rồi cập nhật cùng một lần Lưu.
 */
export async function saveSiteContentWithPendingImage({
  editingId,
  form,
  pendingImageFile,
  createApi,
  updateApi,
}) {
  if (!pendingImageFile) {
    return editingId ? updateApi(editingId, form) : createApi(form);
  }

  if (editingId) {
    const imageUrl = await uploadPendingFile(pendingImageFile);
    return updateApi(editingId, { ...form, imageUrl });
  }

  const created = await createApi({
    ...form,
    imageUrl: form.imageUrl?.trim() ? form.imageUrl : null,
  });
  const imageUrl = await uploadPendingFile(pendingImageFile);
  return updateApi(created.id, { ...form, imageUrl });
}
