import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export function register() {
  return Promise.reject(new Error('Chưa triển khai: authService.register'));
}

export function login() {
  return Promise.reject(new Error('Chưa triển khai: authService.login'));
}

export default api;
