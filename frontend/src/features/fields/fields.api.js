import { httpClient } from '../../api/httpClient';

const multipartConfig = {
  transformRequest: [
    (payload, headers) => {
      delete headers['Content-Type'];
      return payload;
    },
  ],
};

function buildFieldFormData(payload, imageFile) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return formData;
}

export async function fetchFieldsApi(params = {}) {
  const { data } = await httpClient.get('/fields', {
    params: { page: 1, limit: 100, status: 'Active', ...params },
  });
  return { items: data.data, meta: data.meta };
}

/** Admin: không lọc mặc định theo Active — middleware route gán Active chỉ cho khách. */
export async function fetchAdminFieldsApi(params = {}) {
  const { data } = await httpClient.get('/fields', {
    params: { page: 1, limit: 100, ...params },
  });
  return { items: data.data, meta: data.meta };
}

export async function createFieldApi(payload, imageFile) {
  if (!imageFile) {
    const { data } = await httpClient.post('/fields', payload);
    return data.data;
  }
  const { data } = await httpClient.post('/fields', buildFieldFormData(payload, imageFile), multipartConfig);
  return data.data;
}

export async function fetchFieldPricesApi(fieldId) {
  const { data } = await httpClient.get(`/fields/${fieldId}/prices`);
  return data.data;
}

export async function replaceFieldPricesApi(fieldId, items) {
  const { data } = await httpClient.put(`/fields/${fieldId}/prices`, { items });
  return data.data;
}

export async function fetchFieldByIdApi(id) {
  const { data } = await httpClient.get(`/fields/${id}`);
  return data.data;
}

export async function updateFieldApi(id, payload, imageFile) {
  if (!imageFile) {
    const { data } = await httpClient.patch(`/fields/${id}`, payload);
    return data.data;
  }
  const body = { ...payload };
  if (Object.keys(body).length === 0) {
    throw new Error('Cần ít nhất một trường text khi chỉ tải ảnh (backend validate).');
  }
  const { data } = await httpClient.patch(
    `/fields/${id}`,
    buildFieldFormData(body, imageFile),
    multipartConfig,
  );
  return data.data;
}

export async function deleteFieldApi(id) {
  await httpClient.delete(`/fields/${id}`);
}
