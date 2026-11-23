import { apiClient } from './apiClient';

export const sessionService = {
  async getSessions() {
    const res = await apiClient.get('/api/v1/sessions/');
    return res.data?.results || res.data || [];
  },

  async getSession(sessionId) {
    const res = await apiClient.get(`/api/v1/sessions/${sessionId}/`);
    return res.data;
  },

  async joinSession(sessionId, role = 'student') {
    const res = await apiClient.post(`/api/v1/sessions/${sessionId}/join/`, { role });
    return res.data;
  },

  async leaveSession(sessionId) {
    const res = await apiClient.post(`/api/v1/sessions/${sessionId}/leave/`);
    return res.data;
  },

  async assignRole(sessionId, userId, role) {
    const res = await apiClient.post(`/api/v1/sessions/${sessionId}/assign-role/`, {
      user_id: userId,
      role,
    });
    return res.data;
  },

  async startSession(sessionId) {
    const res = await apiClient.post(`/api/v1/sessions/${sessionId}/start/`);
    return res.data;
  },

  async pauseSession(sessionId) {
    const res = await apiClient.post(`/api/v1/sessions/${sessionId}/pause/`);
    return res.data;
  },

  async completeSession(sessionId) {
    const res = await apiClient.post(`/api/v1/sessions/${sessionId}/complete/`);
    return res.data;
  },
};
