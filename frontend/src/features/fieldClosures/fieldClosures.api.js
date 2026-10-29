import { httpClient } from '../../api/httpClient';

export async function fetchFieldClosuresApi(fieldId) {
  const { data } = await httpClient.get(`/fields/${fieldId}/closures`);
  return data.data;
}

export async function createFieldClosureApi(fieldId, payload) {
  const { data } = await httpClient.post(`/fields/${fieldId}/closures`, payload);
  return data.data;
}

export async function deleteFieldClosureApi(fieldId, closureId) {
  await httpClient.delete(`/fields/${fieldId}/closures/${closureId}`);
}
