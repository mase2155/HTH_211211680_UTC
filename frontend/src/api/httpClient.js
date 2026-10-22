import axios from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const httpClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    if (original.url?.includes('/auth/login') || original.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }

    original._retry = true;
    if (!refreshPromise) {
      refreshPromise = httpClient
        .post('/auth/refresh')
        .then((res) => {
          setAccessToken(res.data.data.accessToken);
          return res.data.data.accessToken;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return httpClient(original);
    } catch (refreshError) {
      clearAccessToken();
      return Promise.reject(refreshError);
    }
  },
);
