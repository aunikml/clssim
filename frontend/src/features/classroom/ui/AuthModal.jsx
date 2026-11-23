import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { useAuthStore } from '../../../store/authStore';

export const AuthModal = ({ open, onClose }) => {
  const [tab, setTab] = useState(0); // 0: Login, 1: Register
  const [username, setUsername] = useState('student_alice');
  const [password, setPassword] = useState('password123');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [organisation, setOrganisation] = useState('');

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      if (tab === 0) {
        await login(username, password);
      } else {
        await register({
          username,
          email,
          password,
          display_name: displayName,
          organisation,
        });
      }
      onClose();
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleQuickLogin = (uname) => {
    setUsername(uname);
    setPassword('password123');
  };

  if (isAuthenticated && user) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Signed In Profile</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ py: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {user.profile?.display_name || user.username}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
              Username: {user.username}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Email: {user.email}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Organisation: {user.profile?.organisation || 'Classroom Simulator Academy'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              logout();
              onClose();
            }}
            sx={{ fontWeight: 800 }}
          >
            Log Out & Exit to Home
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Back to Class
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
          <Tab label="Sign In" />
          <Tab label="Create Account" />
        </Tabs>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {localError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
            </Alert>
          )}

          {tab === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                size="small"
                required
              />

              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
                  Quick Seeded Accounts (Click to test):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '0.72rem' }}
                    onClick={() => handleQuickLogin('student_alice')}
                  >
                    Alice (Student)
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '0.72rem' }}
                    onClick={() => handleQuickLogin('teacher_john')}
                  >
                    John (Teacher)
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '0.72rem' }}
                    onClick={() => handleQuickLogin('facilitator')}
                  >
                    Dr. Sarah (Facilitator)
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. Maria Gonzalez"
              />
              <TextField
                label="Organisation"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. Lincoln High School"
              />
              <TextField
                label="Password (min 6 chars)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                size="small"
                required
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Processing...' : tab === 0 ? 'Sign In' : 'Register'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
