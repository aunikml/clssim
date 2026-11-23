import { apiClient } from './apiClient';

export const classroomService = {
  async getClassrooms() {
    const res = await apiClient.get('/api/v1/classrooms/');
    return res.data?.results || res.data || [];
  },

  async getClassroom(id) {
    const res = await apiClient.get(`/api/v1/classrooms/${id}/`);
    return res.data;
  },

  async getHealth() {
    const res = await apiClient.get('/api/v1/health/');
    return res.data;
  },
};
