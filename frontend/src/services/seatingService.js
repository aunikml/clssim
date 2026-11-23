import { apiClient } from './apiClient';

export const seatingService = {
  async getSessionSeats(sessionId) {
    const res = await apiClient.get(`/api/v1/sessions/${sessionId}/seats/`);
    return res.data;
  },

  async reserveSeat(sessionId, seatIdentifier) {
    const res = await apiClient.post(`/api/v1/sessions/${sessionId}/seats/reserve/`, {
      seat_identifier: seatIdentifier,
    });
    return res.data;
  },

  async releaseSeat(sessionId) {
    const res = await apiClient.post(`/api/v1/sessions/${sessionId}/seats/release/`);
    return res.data;
  },
};
