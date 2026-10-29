import { httpClient } from '../../api/httpClient';

export async function updateProfileApi(payload) {
  const { data } = await httpClient.patch('/users/me', payload);
  return data.data;
}

export async function changePasswordApi(payload) {
  const { data } = await httpClient.patch('/users/me/password', payload);
  return data.data;
}

export async function fetchAdminUsersApi(params = {}) {
  const { data } = await httpClient.get('/users', {
    params: { page: 1, limit: 100, ...params },
  });
  return { items: data.data, meta: data.meta };
}

export async function adminUpdateUserApi(id, payload) {
  const { data } = await httpClient.patch(`/users/${id}`, payload);
  return data.data;
}
