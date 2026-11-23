import { create } from 'zustand';
import { sessionService } from '../services/sessionService';
import { seatingService } from '../services/seatingService';
import { websocketService } from '../services/websocketService';
import { computeClassroomSeatingLayout } from '../utils/classroomConfig';

export const DEFAULT_PEER_ROSTER = [
  { username: 'maya', display_name: 'Maya Patel', shirt_color: '#ec4899', style: 'attentive_notetaker' },
  { username: 'liam', display_name: 'Liam Chen', shirt_color: '#06b6d4', style: 'attentive_nodder' },
  { username: 'sophia', display_name: 'Sophia Garcia', shirt_color: '#8b5cf6', style: 'eager_participant' },
  { username: 'noah', display_name: 'Noah Kim', shirt_color: '#10b981', style: 'diligent_notetaker' },
  { username: 'emma', display_name: 'Emma Watson', shirt_color: '#f97316', style: 'calm_observer' },
  { username: 'ethan', display_name: 'Ethan Davis', shirt_color: '#6366f1', style: 'inquisitive_confused' },
  { username: 'olivia', display_name: 'Olivia Brown', shirt_color: '#14b8a6', style: 'backrow_leaner' },
  { username: 'lucas', display_name: 'Lucas Miller', shirt_color: '#f43f5e', style: 'eager_participant' },
  { username: 'ava', display_name: 'Ava Johnson', shirt_color: '#d97706', style: 'attentive_notetaker' },
  { username: 'mason', display_name: 'Mason Martinez', shirt_color: '#2563eb', style: 'attentive_nodder' },
  { username: 'isabella', display_name: 'Isabella Taylor', shirt_color: '#db2777', style: 'eager_participant' },
  { username: 'james', display_name: 'James Anderson', shirt_color: '#059669', style: 'calm_observer' },
  { username: 'charlotte', display_name: 'Charlotte Thomas', shirt_color: '#7c3aed', style: 'diligent_notetaker' },
  { username: 'benjamin', display_name: 'Benjamin Jackson', shirt_color: '#ea580c', style: 'inquisitive_confused' },
  { username: 'mia', display_name: 'Mia White', shirt_color: '#0284c7', style: 'attentive_notetaker' },
  { username: 'william', display_name: 'William Harris', shirt_color: '#4f46e5', style: 'attentive_nodder' },
  { username: 'harper', display_name: 'Harper Martin', shirt_color: '#e11d48', style: 'eager_participant' },
  { username: 'alexander', display_name: 'Alexander Thompson', shirt_color: '#0d9488', style: 'backrow_leaner' },
  { username: 'evelyn', display_name: 'Evelyn Garcia', shirt_color: '#9333ea', style: 'attentive_notetaker' },
  { username: 'elijah', display_name: 'Elijah Martinez', shirt_color: '#ca8a04', style: 'calm_observer' },
  { username: 'abigail', display_name: 'Abigail Robinson', shirt_color: '#16a34a', style: 'diligent_notetaker' },
  { username: 'daniel', display_name: 'Daniel Clark', shirt_color: '#2563eb', style: 'attentive_nodder' },
  { username: 'emily', display_name: 'Emily Rodriguez', shirt_color: '#e11d48', style: 'eager_participant' },
  { username: 'henry', display_name: 'Henry Lewis', shirt_color: '#475569', style: 'inquisitive_confused' },
  { username: 'elizabeth', display_name: 'Elizabeth Lee', shirt_color: '#0891b2', style: 'attentive_notetaker' },
  { username: 'sebastian', display_name: 'Sebastian Walker', shirt_color: '#65a30d', style: 'calm_observer' },
  { username: 'sofia', display_name: 'Sofia Hall', shirt_color: '#c026d3', style: 'eager_participant' },
  { username: 'jack', display_name: 'Jack Allen', shirt_color: '#0284c7', style: 'backrow_leaner' },
  { username: 'avery', display_name: 'Avery Young', shirt_color: '#d97706', style: 'attentive_nodder' },
  { username: 'samuel', display_name: 'Samuel Hernandez', shirt_color: '#15803d', style: 'diligent_notetaker' },
];

export const buildInitialSeats = (existingSeats = [], userSeatId = null, classSize = 20) => {
  const layout = computeClassroomSeatingLayout(classSize);
  const result = [];

  layout.desks.forEach((desk, idx) => {
    const id = desk.id;
    const found = existingSeats.find((s) => s.seat_identifier === id);

    if (id === userSeatId) {
      result.push({
        seat_identifier: id,
        row_number: desk.row,
        column_number: desk.col,
        status: 'occupied',
        occupied_by: { username: 'You', display_name: 'You' },
      });
    } else if (found && found.status === 'occupied' && found.occupied_by) {
      result.push(found);
    } else if (idx % 4 !== 2) {
      // ~75% of desks populated with realistic animated peer classmates
      const classmate = DEFAULT_PEER_ROSTER[idx % DEFAULT_PEER_ROSTER.length];
      result.push({
        seat_identifier: id,
        row_number: desk.row,
        column_number: desk.col,
        status: 'occupied',
        occupied_by: classmate,
        style: classmate.style,
        shirtColor: classmate.shirt_color,
      });
    } else {
      // Remaining ~25% open seats available for player
      result.push(found || {
        seat_identifier: id,
        row_number: desk.row,
        column_number: desk.col,
        status: 'available',
        occupied_by: null,
      });
    }
  });

  return result;
};

export const useSessionStore = create((set, get) => ({
  session: null,
  seats: [],
  mySeatId: null,
  wsConnected: false,
  isLoading: false,
  error: null,
  successMessage: null,

  setSuccessMessage: (msg) => set({ successMessage: msg }),
  clearMessages: () => set({ error: null, successMessage: null }),

  updateClassSize: (size) => {
    set({
      seats: buildInitialSeats([], get().mySeatId, size),
    });
  },

  fetchSessionAndSeats: async (sessionId) => {
    set({ isLoading: true });
    try {
      let activeSession = null;
      if (sessionId) {
        activeSession = await sessionService.getSession(sessionId);
      } else {
        const sessions = await sessionService.getSessions();
        if (sessions.length > 0) {
          activeSession = sessions[0];
        }
      }

      if (activeSession) {
        set({ session: activeSession });
        const seatData = await seatingService.getSessionSeats(activeSession.id);
        const rawSeats = seatData.seats || [];
        const mergedSeats = buildInitialSeats(rawSeats, get().mySeatId);
        set({ seats: mergedSeats, isLoading: false });

        // Connect WebSocket
        websocketService.connect(activeSession.id);
        get().setupWebSocketListeners();
      } else {
        // Generate placeholder local seats with peer classmates
        set({ seats: buildInitialSeats([], get().mySeatId), isLoading: false });
      }
    } catch (err) {
      console.warn('Could not fetch session/seats from backend, using default seats layout:', err);
      set({ seats: buildInitialSeats([], get().mySeatId), isLoading: false });
    }
  },

  reserveSeat: async (seatIdentifier) => {
    const { session } = get();
    if (!session) {
      // Local preview mode: simulate reservation
      set((state) => ({
        mySeatId: seatIdentifier,
        seats: state.seats.map((s) =>
          s.seat_identifier === seatIdentifier
            ? { ...s, status: 'occupied', occupied_by: { username: 'You', display_name: 'You' } }
            : s.seat_identifier === state.mySeatId
            ? { ...s, status: 'available', occupied_by: null }
            : s
        ),
        successMessage: `Seat ${seatIdentifier} reserved!`,
      }));
      return;
    }

    try {
      const res = await seatingService.reserveSeat(session.id, seatIdentifier);
      set((state) => ({
        mySeatId: res.seat_id,
        successMessage: `Seat ${res.seat_id} successfully reserved!`,
        error: null,
      }));
      // Refresh seat status
      const seatData = await seatingService.getSessionSeats(session.id);
      set({ seats: seatData.seats || [] });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to reserve seat.';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  releaseSeat: async () => {
    const { session, mySeatId } = get();
    if (!session) {
      set((state) => ({
        mySeatId: null,
        seats: state.seats.map((s) =>
          s.seat_identifier === mySeatId ? { ...s, status: 'available', occupied_by: null } : s
        ),
        successMessage: 'Seat released.',
      }));
      return;
    }

    try {
      await seatingService.releaseSeat(session.id);
      set({ mySeatId: null, successMessage: 'Seat released successfully.', error: null });
      const seatData = await seatingService.getSessionSeats(session.id);
      set({ seats: seatData.seats || [] });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to release seat.';
      set({ error: msg });
    }
  },

  setupWebSocketListeners: () => {
    websocketService.on('connection_change', ({ status }) => {
      set({ wsConnected: status === 'connected' });
    });

    websocketService.on('seat.reserved', (event) => {
      const { payload } = event;
      set((state) => ({
        seats: state.seats.map((s) =>
          s.seat_identifier === payload.seat_id
            ? {
                ...s,
                status: 'occupied',
                occupied_by: {
                  username: payload.username,
                  display_name: payload.display_name,
                },
              }
            : s
        ),
      }));
    });

    websocketService.on('seat.released', (event) => {
      const { payload } = event;
      set((state) => ({
        seats: state.seats.map((s) =>
          s.seat_identifier === payload.seat_id
            ? { ...s, status: 'available', occupied_by: null }
            : s
        ),
      }));
    });

    websocketService.on('role.changed', (event) => {
      const { payload } = event;
      set((state) => {
        if (!state.session) return state;
        return {
          session: {
            ...state.session,
            active_teacher:
              payload.new_role === 'teacher'
                ? { username: payload.username, display_name: payload.username }
                : state.session.active_teacher,
          },
        };
      });
    });

    websocketService.on('session.started', () => {
      set((state) => ({ session: state.session ? { ...state.session, status: 'active' } : null }));
    });

    websocketService.on('session.paused', () => {
      set((state) => ({ session: state.session ? { ...state.session, status: 'paused' } : null }));
    });

    websocketService.on('session.completed', () => {
      set((state) => ({ session: state.session ? { ...state.session, status: 'completed' } : null }));
    });
  },
}));
