import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Auto-login as default guest/demo student if desired or leave unauthenticated
      return;
    }
    set({ isLoading: true });
    try {
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (e) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      await authService.login(username, password);
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      // If network error (backend not running), allow demo fallback
      if (err.message?.includes('Network Error') || !err.response) {
        console.warn('Backend server not responding, proceeding with offline session');
        const role = username.includes('teacher') ? 'teacher' : username.includes('observer') ? 'observer' : 'student';
        const demoUser = {
          id: 'local-demo-user',
          username: username || 'student_alice',
          email: `${username || 'student'}@classsim.edu`,
          profile: {
            display_name: username === 'teacher_john' ? 'Teacher John' : username === 'observer_harrison' ? 'Dr. Harrison' : 'Alice Patel',
            role: role,
            organisation: 'ClassSim Academy',
          },
        };
        set({ user: demoUser, isAuthenticated: true, isLoading: false });
        return demoUser;
      }
      const msg = err.response?.data?.detail || 'Login failed. Please check credentials.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  guestLogin: (role = 'student', displayName = '') => {
    const isTeacher = role === 'teacher';
    const isObserver = role === 'observer';
    const demoUser = {
      id: `guest-${Date.now()}`,
      username: isTeacher ? 'teacher_john' : isObserver ? 'observer_harrison' : 'student_alice',
      email: `${role}@classsim.edu`,
      profile: {
        display_name: displayName || (isTeacher ? 'Teacher John' : isObserver ? 'Dr. Harrison (Observer)' : 'Alice Patel (Student)'),
        role: role,
        organisation: 'ClassSim Academy',
      },
    };
    set({ user: demoUser, isAuthenticated: true, isLoading: false, error: null });
    return demoUser;
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.register(data);
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.username?.[0] || 'Registration failed.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },
}));
