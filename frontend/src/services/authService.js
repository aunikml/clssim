import { apiClient } from './apiClient';

export const authService = {
  async login(username, password) {
    const res = await apiClient.post('/api/v1/auth/login/', { username, password });
    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
    }
    return res.data;
  },

  async register(data) {
    const res = await apiClient.post('/api/v1/auth/register/', data);
    if (res.data.tokens?.access) {
      localStorage.setItem('access_token', res.data.tokens.access);
      localStorage.setItem('refresh_token', res.data.tokens.refresh);
    }
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get('/api/v1/auth/me/');
    return res.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
