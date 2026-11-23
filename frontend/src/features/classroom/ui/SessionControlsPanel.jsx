import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  CheckCircle as CompleteIcon,
  School as TeacherIcon,
  Person as StudentIcon,
  MicOff as MicOffIcon,
  PanTool as HandIcon,
  AutoFixHigh as EraseIcon,
  AirlineSeatReclineNormal as SeatIcon,
  RecordVoiceOver as LectureIcon,
  FastForward as FastForwardIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useSessionStore } from '../../../store/sessionStore';
import { useClassroomStore } from '../../../store/classroomStore';
import { useAuthStore } from '../../../store/authStore';
import { sessionService } from '../../../services/sessionService';
import { lectureService } from '../../../services/lectureService';
import { classroomAtmosphereAudioService } from '../../../services/classroomAtmosphereAudioService';
import { websocketService } from '../../../services/websocketService';

export const SessionControlsPanel = ({ open, onClose }) => {
  const session = useSessionStore((state) => state.session);
  const seats = useSessionStore((state) => state.seats);
  const fetchSessionAndSeats = useSessionStore((state) => state.fetchSessionAndSeats);
  const classroom = useClassroomStore((state) => state.classroom);
  const config = useClassroomStore((state) => state.config);
  const user = useAuthStore((state) => state.user);
  const lectureState = useClassroomStore((state) => state.lectureState);

  const [loadingAction, setLoadingAction] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState(null);

  const handleStart = async () => {
    if (!session) return;
    setLoadingAction(true);
    try {
      await sessionService.startSession(session.id);
      await fetchSessionAndSeats(session.id);
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(false);
  };

  const handlePause = async () => {
    if (!session) return;
    setLoadingAction(true);
    try {
      await sessionService.pauseSession(session.id);
      await fetchSessionAndSeats(session.id);
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(false);
  };

  const handleComplete = async () => {
    if (!session) return;
    setLoadingAction(true);
    try {
      await sessionService.completeSession(session.id);
      await fetchSessionAndSeats(session.id);
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(false);
  };

  const handleAssignRole = async (targetUserId, role) => {
    if (!session) return;
    setLoadingAction(true);
    try {
      await sessionService.assignRole(session.id, targetUserId, role);
      await fetchSessionAndSeats(session.id);
      setAdminFeedback(`Role updated successfully.`);
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(false);
  };

  // Admin Controls: Facilitation & Discipline
  const handleMuteAll = () => {
    useClassroomStore.getState().setMicMuted(true);
    websocketService.send({ action: 'admin.mute_all' });
    setAdminFeedback('All student microphones have been muted.');
  };

  const handleLowerAllHands = () => {
    useClassroomStore.getState().setActiveGesture(null);
    websocketService.send({ action: 'admin.lower_all_hands' });
    setAdminFeedback('All student hands have been lowered.');
  };

  const handleClearBlackboard = () => {
    websocketService.send({ action: 'blackboard.clear' });
    classroomAtmosphereAudioService.playEraserWipe();
    setAdminFeedback('Blackboard has been cleared with felt eraser.');
  };

  const handleResetSeats = () => {
    useSessionStore.setState((state) => ({
      mySeatId: null,
      seats: state.seats.map((s) => ({
        ...s,
        status: 'available',
        occupied_by: null,
      })),
    }));
    useClassroomStore.getState().standUp();
    setAdminFeedback('All desk seats have been reset to available.');
  };

  const occupiedSeatsCount = seats.filter((s) => s.status === 'occupied').length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Session Management
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {adminFeedback && (
          <Alert
            severity="info"
            onClose={() => setAdminFeedback(null)}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {adminFeedback}
          </Alert>
        )}

        {/* Facilitator & Discipline Controls */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>
            CLASSROOM FACILITATION & DISCIPLINE
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            <Tooltip title="Mute all student microphones to maintain room silence">
              <Button
                variant="outlined"
                size="small"
                startIcon={<MicOffIcon />}
                onClick={handleMuteAll}
                sx={{ borderColor: '#ef4444', color: '#f87171', justifyContent: 'flex-start', fontSize: '0.75rem' }}
              >
                Mute All Students
              </Button>
            </Tooltip>
            <Tooltip title="Reset and lower all raised hands across the room">
              <Button
                variant="outlined"
                size="small"
                startIcon={<HandIcon />}
                onClick={handleLowerAllHands}
                sx={{ borderColor: '#f59e0b', color: '#fbbf24', justifyContent: 'flex-start', fontSize: '0.75rem' }}
              >
                Lower All Hands
              </Button>
            </Tooltip>
            <Tooltip title="Wipe all chalk drawings from the blackboard">
              <Button
                variant="outlined"
                size="small"
                startIcon={<EraseIcon />}
                onClick={handleClearBlackboard}
                sx={{ borderColor: '#38bdf8', color: '#38bdf8', justifyContent: 'flex-start', fontSize: '0.75rem' }}
              >
                Clear Blackboard
              </Button>
            </Tooltip>
            <Tooltip title="Reset all 20 student desks to available status">
              <Button
                variant="outlined"
                size="small"
                startIcon={<SeatIcon />}
                onClick={handleResetSeats}
                sx={{ borderColor: '#10b981', color: '#34d399', justifyContent: 'flex-start', fontSize: '0.75rem' }}
              >
                Reset All Desks
              </Button>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Instructional Lecture Protocol */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}>
              HEART ANATOMY LECTURE PROTOCOL
            </Typography>
            <Chip
              label={`State: ${lectureState.toUpperCase()}`}
              size="small"
              color={lectureState === 'lecturing' ? 'primary' : lectureState === 'countdown' ? 'warning' : 'default'}
              sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<LectureIcon />}
              onClick={() => {
                lectureService.startCountdown();
                setAdminFeedback('Started 20s pre-class countdown.');
              }}
              sx={{ fontSize: '0.75rem' }}
            >
              Start 20s Countdown
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FastForwardIcon />}
              onClick={() => {
                lectureService.startLecture();
                setAdminFeedback('Skipped countdown — 5-minute Cardiovascular & Heart Anatomy lecture started.');
              }}
              sx={{ fontSize: '0.75rem' }}
            >
              Skip to Lecture
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<StopIcon />}
              onClick={() => {
                lectureService.stopAll();
                setAdminFeedback('Heart Anatomy lecture stopped.');
              }}
              sx={{ fontSize: '0.75rem' }}
            >
              Stop / Reset
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Session Status & Lifecycle Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>
            SESSION STATUS
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {session?.title || 'Interactive Pedagogy Practicum'}
              </Typography>
              <Chip
                label={session?.status?.toUpperCase() || 'ACTIVE'}
                color={session?.status === 'active' ? 'success' : 'default'}
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={<StartIcon />}
                onClick={handleStart}
                disabled={loadingAction || session?.status === 'active'}
              >
                Start
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="warning"
                startIcon={<PauseIcon />}
                onClick={handlePause}
                disabled={loadingAction || session?.status === 'paused'}
              >
                Pause
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Classroom Dimension Data */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>
            CLASSROOM SPECIFICATIONS
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Dimensions</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {config.dimensions?.width}m × {config.dimensions?.length}m
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Total Desks</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {seats.length} Seats (4×5 Grid)
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Occupancy</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                {occupiedSeatsCount} / {seats.length} Occupied
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Participants & Roles */}
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>
            PARTICIPANTS & ROLES
          </Typography>
          <List dense disablePadding>
            {session?.participants?.map((p) => (
              <ListItem key={p.id} sx={{ px: 0, py: 0.8 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {p.user?.profile?.display_name || p.user?.username}
                      </Typography>
                      {p.seat_identifier && (
                        <Chip
                          label={p.seat_identifier}
                          size="small"
                          sx={{ height: 18, fontSize: '0.68rem', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={p.user?.email}
                />
                <ListItemSecondaryAction>
                  <Chip
                    icon={p.role === 'teacher' ? <TeacherIcon fontSize="small" /> : <StudentIcon fontSize="small" />}
                    label={p.role.toUpperCase()}
                    color={p.role === 'teacher' ? 'primary' : 'default'}
                    size="small"
                  />
                  {p.role !== 'teacher' && (
                    <Button
                      size="small"
                      sx={{ ml: 1, fontSize: '0.72rem' }}
                      onClick={() => handleAssignRole(p.user.id, 'teacher')}
                    >
                      Make Teacher
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
