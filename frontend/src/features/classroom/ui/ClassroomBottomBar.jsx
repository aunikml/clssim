import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  DirectionsWalk as WalkIcon,
  AirlineSeatReclineNormal as SitIcon,
  ArrowUpward as StandIcon,
  PanTool as HandIcon,
  EditNote as NoteIcon,
  ThumbUp as AgreeIcon,
  HelpOutline as QuestionIcon,
  Celebration as ApplaudIcon,
  Brush as BrushIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  GraphicEq as AcousticIcon,
  Close as CloseIcon,
  ChatBubbleOutline as ChatIcon,
  QuestionAnswer as AskIcon,
  Bolt as DisruptionIcon,
  Flight as AirplaneIcon,
  MarkChatUnread as NoteTossIcon,
  DeleteSweep as SpillIcon,
  LocalDrink as BottleIcon,
  Vibration as VibrationIcon,
  Bedtime as SleepIcon,
  Tv as TvIcon,
  Devices as DevicesIcon,
  Flare as LaserIcon,
  School as TeacherIcon,
  RecordVoiceOver as CallStudentIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  Gavel as DisciplineIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  Quiz as QuizIcon,
  Star as StarIcon,
  TouchApp as TapIcon,
  AltRoute as PacingIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useClassroomStore } from '../../../store/classroomStore';
import { useSessionStore } from '../../../store/sessionStore';
import { studentInteractionService } from '../../../services/studentInteractionService';
import {
  teacherInteractionService,
  TEACHER_STUDENT_ROSTER,
  TEACHER_PACING_STATIONS,
} from '../../../services/teacherInteractionService';
import { lectureService, HEART_ANATOMY_QUIZ } from '../../../services/lectureService';

export const ClassroomBottomBar = () => {
  const selectedSeatId = useClassroomStore((state) => state.selectedSeatId);
  const isSeated = useClassroomStore((state) => state.isSeated);
  const seatedSeatId = useClassroomStore((state) => state.seatedSeatId);
  const promptNearSeatId = useClassroomStore((state) => state.promptNearSeatId);
  const sitDown = useClassroomStore((state) => state.sitDown);
  const standUp = useClassroomStore((state) => state.standUp);
  const activeGesture = useClassroomStore((state) => state.activeGesture);
  const setActiveGesture = useClassroomStore((state) => state.setActiveGesture);
  const toggleBoardModal = useClassroomStore((state) => state.toggleBoardModal);
  const isMicMuted = useClassroomStore((state) => state.isMicMuted);
  const toggleMic = useClassroomStore((state) => state.toggleMic);
  const cameraDistanceTier = useClassroomStore((state) => state.cameraDistanceTier);
  const cycleCameraTier = useClassroomStore((state) => state.cycleCameraTier);
  const userRole = useClassroomStore((state) => state.userRole);
  const cameraMode = useClassroomStore((state) => state.cameraMode);
  const setCameraMode = useClassroomStore((state) => state.setCameraMode);
  const teachingDisplayMode = useClassroomStore((state) => state.teachingDisplayMode);
  const showStudentDevices = useClassroomStore((state) => state.showStudentDevices);
  const openDeviceInspection = useClassroomStore((state) => state.openDeviceInspection);
  const openNotebook = useClassroomStore((state) => state.openNotebook);

  const hasDevice = teachingDisplayMode === 'digital_screen' && showStudentDevices;

  // Disruption menu state
  const [disruptionAnchorEl, setDisruptionAnchorEl] = useState(null);
  const isDisruptionMenuOpen = Boolean(disruptionAnchorEl);

  const handleOpenDisruptions = (e) => {
    setDisruptionAnchorEl(e.currentTarget);
  };

  const handleCloseDisruptions = () => {
    setDisruptionAnchorEl(null);
  };

  const handleTriggerDisruption = (type) => {
    studentInteractionService.triggerDisruption(type);
    handleCloseDisruptions();
  };

  // Teacher mode states & menus
  const isLaserPointerActive = useClassroomStore((state) => state.isLaserPointerActive);
  const toggleLaserPointer = useClassroomStore((state) => state.toggleLaserPointer);
  const isLecturePaused = useClassroomStore((state) => state.isLecturePaused);
  const lectureState = useClassroomStore((state) => state.lectureState);
  const lectureTimer = useClassroomStore((state) => state.lectureTimer);
  const currentQuizQuestionIndex = useClassroomStore((state) => state.currentQuizQuestionIndex);
  const teacherPraiseScore = useClassroomStore((state) => state.teacherPraiseScore);
  const isDeviceBroadcastLocked = useClassroomStore((state) => state.isDeviceBroadcastLocked);
  const toggleDeviceBroadcastLock = useClassroomStore((state) => state.toggleDeviceBroadcastLock);

  const [callStudentAnchorEl, setCallStudentAnchorEl] = useState(null);
  const isCallStudentMenuOpen = Boolean(callStudentAnchorEl);

  const [disciplineAnchorEl, setDisciplineAnchorEl] = useState(null);
  const isDisciplineMenuOpen = Boolean(disciplineAnchorEl);

  const [pacingAnchorEl, setPacingAnchorEl] = useState(null);
  const isPacingMenuOpen = Boolean(pacingAnchorEl);

  const [milestoneAnchorEl, setMilestoneAnchorEl] = useState(null);
  const isMilestoneMenuOpen = Boolean(milestoneAnchorEl);

  // Pedagogical metrics
  const teacherAudioDistance = useClassroomStore((state) => state.teacherAudioDistance);
  const acousticAudibilityPercent = useClassroomStore((state) => state.acousticAudibilityPercent);
  const blackboardLegibility = useClassroomStore((state) => state.blackboardLegibility);

  // Second Life Object Inspection
  const inspectTarget = useClassroomStore((state) => state.inspectTarget);
  const clearInspectTarget = useClassroomStore((state) => state.clearInspectTarget);

  const seats = useSessionStore((state) => state.seats);
  const mySeatId = useSessionStore((state) => state.mySeatId);
  const reserveSeat = useSessionStore((state) => state.reserveSeat);
  const releaseSeat = useSessionStore((state) => state.releaseSeat);
  const error = useSessionStore((state) => state.error);
  const successMessage = useSessionStore((state) => state.successMessage);
  const clearMessages = useSessionStore((state) => state.clearMessages);

  const targetSeatId = selectedSeatId || promptNearSeatId || seatedSeatId;
  const targetSeat = seats.find((s) => s.seat_identifier === targetSeatId);
  const isOccupied = targetSeat?.status === 'occupied';
  const isMine = targetSeatId === mySeatId;

  const handleReserve = async () => {
    if (targetSeatId) {
      try {
        await reserveSeat(targetSeatId);
      } catch (e) {
        // Handled in store
      }
    }
  };

  const handleRelease = async () => {
    await releaseSeat();
  };

  return (
    <>
      <Snackbar
        open={Boolean(error || successMessage)}
        autoHideDuration={4000}
        onClose={clearMessages}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 7 }}
      >
        {error ? (
          <Alert severity="error" onClose={clearMessages} sx={{ width: '100%', borderRadius: 2 }}>
            {error}
          </Alert>
        ) : (
          <Alert severity="success" onClose={clearMessages} sx={{ width: '100%', borderRadius: 2 }}>
            {successMessage}
          </Alert>
        )}
      </Snackbar>

      <Box
        component={motion.div}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        sx={{
          position: 'absolute',
          bottom: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.2,
          maxWidth: '96vw',
        }}
      >
        {/* Object Inspection Exit Notification */}
        {inspectTarget && (
          <Paper
            elevation={6}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 2.5,
              py: 0.8,
              borderRadius: '20px',
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              border: '2px solid #38bdf8',
              color: '#ffffff',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Inspecting: {inspectTarget.name}
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<CloseIcon />}
              onClick={clearInspectTarget}
              sx={{ backgroundColor: '#0284c7', fontSize: '0.72rem', py: 0.2 }}
            >
              Exit Inspect [Esc]
            </Button>
          </Paper>
        )}

        {/* Main Interactive Bar */}
        <Paper
          elevation={4}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.2,
            borderRadius: '16px',
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          {userRole === 'teacher' ? (
            // Teacher Mode Status Indicator
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <TeacherIcon sx={{ color: '#10b981', fontSize: 24 }} />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                    Teacher John · Faculty Instructor
                  </Typography>
                  <Chip
                    label={lectureState === 'qa' ? 'Live Q&A Assessment' : lectureState === 'lecturing' ? `Milestone Point ${lectureTimer < 100 ? '1' : lectureTimer < 200 ? '2' : '3'} of 3` : 'Ready to Teach'}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '9.5px',
                      fontWeight: 800,
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '11px' }}>
                  Front Teaching Zone · [W A S D] Pace Classroom · [L] Laser Pointer
                </Typography>
              </Box>
            </Box>
          ) : userRole === 'observer' ? (
            // Observer Mode Status Indicator
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <VideocamIcon sx={{ color: '#a855f7', fontSize: 24 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                  Evaluator / Observer Station
                </Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '11px' }}>
                  Passive Observation · Full Room Telemetry Active
                </Typography>
              </Box>
            </Box>
          ) : isSeated ? (
            // Seated State Controls (Student Mode Only)
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SitIcon sx={{ color: '#10b981' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                    Seated at {seatedSeatId} · Facing Blackboard
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    [Mouse] Head Turn · [Q / E] Lean Around Heads · [Space / X] Stand Up · [N] Notebook · [T] Screen Mode
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<StandIcon />}
                onClick={standUp}
                sx={{ borderRadius: '8px', fontSize: '0.78rem' }}
              >
                Stand Up [Space]
              </Button>
            </>
          ) : (
            // Standing / Walking State Controls (Student Mode Only)
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WalkIcon sx={{ color: '#38bdf8' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                    {promptNearSeatId ? `Near Desk ${promptNearSeatId}` : 'Classroom Navigation'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                    [W A S D] Stroll · [Mouse Drag] Orbit · [T] Screen Mode · Click to Inspect
                  </Typography>
                </Box>
              </Box>

              {promptNearSeatId ? (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<SitIcon />}
                  onClick={() => sitDown(promptNearSeatId)}
                  sx={{ borderRadius: '8px', fontSize: '0.78rem', backgroundColor: '#10b981' }}
                >
                  Sit Down [E]
                </Button>
              ) : selectedSeatId ? (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<WalkIcon />}
                  onClick={() => sitDown(selectedSeatId)}
                  sx={{ borderRadius: '8px', fontSize: '0.78rem', color: '#60a5fa' }}
                >
                  Go to {selectedSeatId}
                </Button>
              ) : null}
            </>
          )}

          {/* Student Mode Specialized Action Toolbar */}
          {userRole === 'student' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, borderLeft: '1px solid rgba(255,255,255,0.15)', pl: 1.5 }}>
              {/* 1. Side Talk with neighbor */}
              <Tooltip title="Whisper to neighboring student (cycles different conversation each time) [T]">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => studentInteractionService.triggerSideTalk()}
                  startIcon={<ChatIcon sx={{ color: '#fbbf24' }} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    borderColor: 'rgba(251, 191, 36, 0.4)',
                    color: '#fbbf24',
                    fontWeight: 700,
                    px: 1,
                    '&:hover': { backgroundColor: 'rgba(251, 191, 36, 0.15)' },
                  }}
                >
                  Side Talk
                </Button>
              </Tooltip>

              {/* 2. Ask Question (Interrupts ongoing lecture) */}
              <Tooltip title="Raise hand to interrupt lecture & ask Teacher John a biology question">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => studentInteractionService.askQuestionDuringLecture()}
                  startIcon={<AskIcon sx={{ color: '#ffffff' }} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    px: 1.2,
                    '&:hover': { backgroundColor: '#0369a1' },
                  }}
                >
                  Ask Question
                </Button>
              </Tooltip>

              {/* 3. Classroom Disruptions Dropdown */}
              <Tooltip title="Perform subtle classroom distractions (airplane, note toss, tin spill, water bottle, phone buzz, doze off)">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleOpenDisruptions}
                  startIcon={<DisruptionIcon sx={{ color: '#f87171' }} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    borderColor: 'rgba(248, 113, 113, 0.4)',
                    color: '#f87171',
                    fontWeight: 700,
                    px: 1,
                    '&:hover': { backgroundColor: 'rgba(248, 113, 113, 0.15)' },
                  }}
                >
                  Disruptions
                </Button>
              </Tooltip>

              {/* Disruptions Menu */}
              <Menu
                anchorEl={disruptionAnchorEl}
                open={isDisruptionMenuOpen}
                onClose={handleCloseDisruptions}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                PaperProps={{
                  sx: {
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                    minWidth: 240,
                  },
                }}
              >
                <MenuItem onClick={() => handleTriggerDisruption('airplane')}>
                  <ListItemIcon><AirplaneIcon sx={{ color: '#38bdf8' }} fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Paper Airplane" secondary="Glides across desks" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                </MenuItem>
                <MenuItem onClick={() => handleTriggerDisruption('note_toss')}>
                  <ListItemIcon><NoteTossIcon sx={{ color: '#fbbf24' }} fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Secret Note Toss" secondary="Arcing ball between rows" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                </MenuItem>
                <MenuItem onClick={() => handleTriggerDisruption('spill_tin')}>
                  <ListItemIcon><SpillIcon sx={{ color: '#f87171' }} fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Spill Pencil Tin" secondary="Pencils scatter with Foley" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                </MenuItem>
                <MenuItem onClick={() => handleTriggerDisruption('water_bottle')}>
                  <ListItemIcon><BottleIcon sx={{ color: '#06b6d4' }} fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Metal Hydroflask" secondary="Clatters and rolls down aisle" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                </MenuItem>
                <MenuItem onClick={() => handleTriggerDisruption('phone_vibrate')}>
                  <ListItemIcon><VibrationIcon sx={{ color: '#a855f7' }} fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Vibrating Phone" secondary="Haptic wooden buzz & screen glow" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                </MenuItem>
                <MenuItem onClick={() => handleTriggerDisruption('doze_startle')}>
                  <ListItemIcon><SleepIcon sx={{ color: '#ec4899' }} fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Head-Bob Startle" secondary="Dozes off then snaps upright" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                </MenuItem>
              </Menu>

              {/* 4. Board / Digital Screen Focus Mode */}
              <Tooltip title="Toggle direct view onto the front blackboard / digital screen [3]">
                <Button
                  variant={cameraMode === 'board' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setCameraMode(cameraMode === 'board' ? 'walk' : 'board')}
                  startIcon={<TvIcon sx={{ color: '#38bdf8' }} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    backgroundColor: cameraMode === 'board' ? '#0284c7' : 'transparent',
                    borderColor: 'rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    px: 1,
                    '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.15)' },
                  }}
                >
                  Focus Screen [3]
                </Button>
              </Tooltip>

              {/* 5. Device Inspection vs Written Notes Inspection */}
              {hasDevice ? (
                <Tooltip title="Inspect the synchronized laptop/tablet device mirroring the digital screen">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={openDeviceInspection}
                    startIcon={<DevicesIcon sx={{ color: '#ffffff' }} />}
                    sx={{
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      backgroundColor: '#0d9488',
                      color: '#ffffff',
                      fontWeight: 700,
                      px: 1.1,
                      '&:hover': { backgroundColor: '#0f766e' },
                    }}
                  >
                    Inspect Device
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip title="Open handwritten desk notebook [N]">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={openNotebook}
                    startIcon={<NoteIcon sx={{ color: '#38bdf8' }} />}
                    sx={{
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      borderColor: '#38bdf8',
                      color: '#38bdf8',
                      px: 1,
                      '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.15)' },
                    }}
                  >
                    Notebook [N]
                  </Button>
                </Tooltip>
              )}

              {/* Emotes */}
              <Tooltip title="Nod affirmatively in agreement">
                <Button
                  variant={activeGesture === 'nodding' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setActiveGesture('nodding')}
                  startIcon={<AgreeIcon />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    backgroundColor: activeGesture === 'nodding' ? '#34d399' : 'transparent',
                    color: activeGesture === 'nodding' ? '#000000' : '#34d399',
                    borderColor: '#34d399',
                    px: 0.9,
                  }}
                >
                  Nod
                </Button>
              </Tooltip>

              <Tooltip title="Applaud the teacher or classmate">
                <Button
                  variant={activeGesture === 'applauding' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setActiveGesture('applauding')}
                  startIcon={<ApplaudIcon />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    backgroundColor: activeGesture === 'applauding' ? '#a855f7' : 'transparent',
                    color: activeGesture === 'applauding' ? '#ffffff' : '#a855f7',
                    borderColor: '#a855f7',
                    px: 0.9,
                  }}
                >
                  Clap
                </Button>
              </Tooltip>
            </Box>
          )}

          {/* Teacher Mode Specialized Action Toolbar */}
          {userRole === 'teacher' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, borderLeft: '1px solid rgba(255,255,255,0.15)', pl: 1.5 }}>
              {/* Feature 1: Pacing Stations */}
              <Tooltip title="Pace to key lecturing locations (Podium, Blackboard, Aisle)">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => setPacingAnchorEl(e.currentTarget)}
                  startIcon={<PacingIcon sx={{ color: '#34d399' }} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    borderColor: 'rgba(52, 211, 153, 0.4)',
                    color: '#34d399',
                    fontWeight: 700,
                    px: 1,
                    '&:hover': { backgroundColor: 'rgba(52, 211, 153, 0.15)' },
                  }}
                >
                  Pacing
                </Button>
              </Tooltip>

              <Menu
                anchorEl={pacingAnchorEl}
                open={isPacingMenuOpen}
                onClose={() => setPacingAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                PaperProps={{
                  sx: {
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                    minWidth: 220,
                  },
                }}
              >
                {TEACHER_PACING_STATIONS.map((station) => (
                  <MenuItem
                    key={station.id}
                    onClick={() => {
                      teacherInteractionService.paceToStation(station.id);
                      setPacingAnchorEl(null);
                    }}
                  >
                    <ListItemIcon><PacingIcon sx={{ color: '#34d399' }} fontSize="small" /></ListItemIcon>
                    <ListItemText primary={station.label} secondary={station.desc} secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                  </MenuItem>
                ))}
              </Menu>

              {/* Feature 1: Cold Calling / Call on Student */}
              <Tooltip title="Call on a specific medical student by name to answer a clinical cardiology question">
                <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => setCallStudentAnchorEl(e.currentTarget)}
                  startIcon={<CallStudentIcon sx={{ color: '#ffffff' }} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontWeight: 700,
                    px: 1.1,
                    '&:hover': { backgroundColor: '#047857' },
                  }}
                >
                  Call on Student
                </Button>
              </Tooltip>

              <Menu
                anchorEl={callStudentAnchorEl}
                open={isCallStudentMenuOpen}
                onClose={() => setCallStudentAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                PaperProps={{
                  sx: {
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                    minWidth: 260,
                  },
                }}
              >
                {TEACHER_STUDENT_ROSTER.map((student) => (
                  <MenuItem
                    key={student.id}
                    onClick={() => {
                      teacherInteractionService.callOnStudent(student.id);
                      setCallStudentAnchorEl(null);
                    }}
                  >
                    <ListItemIcon><CallStudentIcon sx={{ color: '#10b981' }} fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary={`${student.name} (${student.seatId})`}
                      secondary={student.topic}
                      secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }}
                    />
                  </MenuItem>
                ))}
              </Menu>

              {/* Feature 2: Laser Pointer on Board */}
              <Tooltip title="Toggle Red Interactive Presentation Laser Pointer projected on the board [L]">
                <Button
                  variant={isLaserPointerActive ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => teacherInteractionService.toggleLaserPointer()}
                  startIcon={<LaserIcon sx={{ color: isLaserPointerActive ? '#ffffff' : '#f87171' }} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    backgroundColor: isLaserPointerActive ? '#dc2626' : 'transparent',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: isLaserPointerActive ? '#ffffff' : '#f87171',
                    fontWeight: 700,
                    px: 1,
                    '&:hover': { backgroundColor: isLaserPointerActive ? '#b91c1c' : 'rgba(239, 68, 68, 0.15)' },
                  }}
                >
                  Laser Pointer
                </Button>
              </Tooltip>

              {/* Feature 2: Milestone Scrubbing & Play/Pause (Or Start Presentation when Idle) */}
              {lectureState === 'idle' ? (
                <Tooltip title="Launch 5-Minute Cardiology PowerPoint Presentation [Space]">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => lectureService.startLecture()}
                    startIcon={<PlayIcon sx={{ color: '#ffffff' }} />}
                    sx={{
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontWeight: 800,
                      px: 1.4,
                      boxShadow: '0 0 16px rgba(16, 185, 129, 0.5)',
                      '&:hover': {
                        backgroundColor: '#059669',
                        boxShadow: '0 0 24px rgba(16, 185, 129, 0.8)',
                      },
                    }}
                  >
                    Start Presentation [▶]
                  </Button>
                </Tooltip>
              ) : (
                <>
                  <ButtonGroup size="small" sx={{ borderRadius: '8px' }}>
                    <Tooltip title="Jump to Previous Lecture Milestone">
                      <Button
                        onClick={() => {
                          const curPoint = lectureTimer < 100 ? 1 : lectureTimer < 200 ? 2 : 3;
                          teacherInteractionService.jumpToMilestone(Math.max(1, curPoint - 1));
                        }}
                        sx={{ borderColor: 'rgba(56, 189, 248, 0.3)', color: '#38bdf8', px: 0.6 }}
                      >
                        <PrevIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                    <Tooltip title={isLecturePaused ? 'Resume Lecture' : 'Pause Lecture'}>
                      <Button
                        onClick={() => teacherInteractionService.toggleLecturePlayPause()}
                        sx={{
                          borderColor: 'rgba(56, 189, 248, 0.3)',
                          color: isLecturePaused ? '#f59e0b' : '#38bdf8',
                          px: 0.8,
                        }}
                      >
                        {isLecturePaused ? <PlayIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
                      </Button>
                    </Tooltip>
                    <Tooltip title="Jump to Next Lecture Milestone">
                      <Button
                        onClick={() => {
                          const curPoint = lectureTimer < 100 ? 1 : lectureTimer < 200 ? 2 : 3;
                          teacherInteractionService.jumpToMilestone(Math.min(3, curPoint + 1));
                        }}
                        sx={{ borderColor: 'rgba(56, 189, 248, 0.3)', color: '#38bdf8', px: 0.6 }}
                      >
                        <NextIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                  </ButtonGroup>

                  {/* Feature 2: Milestone Selector Dropdown */}
                  <Tooltip title="Select cardiology lecture milestone point">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => setMilestoneAnchorEl(e.currentTarget)}
                      sx={{
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        borderColor: 'rgba(56, 189, 248, 0.4)',
                        color: '#38bdf8',
                        fontWeight: 700,
                        px: 0.8,
                      }}
                    >
                      {lectureState === 'qa' ? 'Q&A' : lectureTimer < 100 ? 'Pt 1' : lectureTimer < 200 ? 'Pt 2' : 'Pt 3'}
                    </Button>
                  </Tooltip>

                  <Menu
                    anchorEl={milestoneAnchorEl}
                    open={isMilestoneMenuOpen}
                    onClose={() => setMilestoneAnchorEl(null)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    PaperProps={{
                      sx: {
                        backgroundColor: '#0f172a',
                        color: '#f8fafc',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '12px',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                        minWidth: 260,
                      },
                    }}
                  >
                    <MenuItem onClick={() => { teacherInteractionService.jumpToMilestone(1); setMilestoneAnchorEl(null); }}>
                      <ListItemText primary="Point 1: Circulatory System" secondary="0:00 - Vascular highway & pillars" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                    </MenuItem>
                    <MenuItem onClick={() => { teacherInteractionService.jumpToMilestone(2); setMilestoneAnchorEl(null); }}>
                      <ListItemText primary="Point 2: Parts of the Heart" secondary="1:40 - 4 Chambers, valves, myocardium" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                    </MenuItem>
                    <MenuItem onClick={() => { teacherInteractionService.jumpToMilestone(3); setMilestoneAnchorEl(null); }}>
                      <ListItemText primary="Point 3: Blood Journey" secondary="3:20 - Dual circulation Figure-8 loop" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                    </MenuItem>
                    <MenuItem onClick={() => { teacherInteractionService.jumpToMilestone(4); setMilestoneAnchorEl(null); }}>
                      <ListItemText primary="Point 4: Live Practicum & Pop Quiz" secondary="5:00 - 5 Question synchronized assessment" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                    </MenuItem>
                  </Menu>
                </>
              )}

              {/* Feature 3: Discipline & Praise Dropdown */}
              <Tooltip title="Manage classroom attention, refocus distracted students, or award praise points">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => setDisciplineAnchorEl(e.currentTarget)}
                  startIcon={<DisciplineIcon sx={{ color: '#f59e0b' }} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    color: '#f59e0b',
                    fontWeight: 700,
                    px: 1,
                    '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
                  }}
                >
                  Discipline & Praise
                </Button>
              </Tooltip>

              <Menu
                anchorEl={disciplineAnchorEl}
                open={isDisciplineMenuOpen}
                onClose={() => setDisciplineAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                PaperProps={{
                  sx: {
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                    minWidth: 260,
                  },
                }}
              >
                <MenuItem onClick={() => { teacherInteractionService.issueVerbalReminder(); setDisciplineAnchorEl(null); }}>
                  <ListItemIcon><RecordVoiceOverIcon sx={{ color: '#f59e0b' }} fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Issue Verbal Reminder" secondary="Teacher calls for quiet & attention" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                </MenuItem>
                <MenuItem onClick={() => { teacherInteractionService.tapDeskToRefocus('Liam Patel', 'R1-S3'); setDisciplineAnchorEl(null); }}>
                  <ListItemIcon><TapIcon sx={{ color: '#f87171' }} fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Tap Desk to Refocus" secondary="Knuckles tap Liam's desk (R1-S3)" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                </MenuItem>
                <MenuItem onClick={() => { teacherInteractionService.awardPraise('Sophia Garcia'); setDisciplineAnchorEl(null); }}>
                  <ListItemIcon><StarIcon sx={{ color: '#fde047' }} fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Award Academic Praise (+5 pts)" secondary="Commend Sophia's clinical engagement" secondaryTypographyProps={{ sx: { color: '#94a3b8', fontSize: '10px' } }} />
                </MenuItem>
              </Menu>

              {/* Feature 4: Live Assessment Dispatcher */}
              <Tooltip title={`Dispatch Question ${currentQuizQuestionIndex + 1} to all 20 student desk terminals`}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => teacherInteractionService.dispatchAssessmentQuestion(currentQuizQuestionIndex)}
                  startIcon={<QuizIcon sx={{ color: '#ffffff' }} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    fontWeight: 700,
                    px: 1,
                    '&:hover': { backgroundColor: '#b45309' },
                  }}
                >
                  Dispatch Q{currentQuizQuestionIndex + 1}
                </Button>
              </Tooltip>

              <Tooltip title="Reveal answer, student respondent, and clinical reasoning on board and devices">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => teacherInteractionService.revealAssessmentAnswer()}
                  startIcon={<CheckIcon sx={{ color: '#34d399' }} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    borderColor: 'rgba(52, 211, 153, 0.4)',
                    color: '#34d399',
                    fontWeight: 700,
                    px: 1,
                    '&:hover': { backgroundColor: 'rgba(52, 211, 153, 0.15)' },
                  }}
                >
                  Reveal Answer
                </Button>
              </Tooltip>

              {/* Feature 4: Device Broadcast Lock Toggle */}
              <Tooltip title={isDeviceBroadcastLocked ? "Student devices locked to 4K Smartboard" : "Student devices unlocked for free notes"}>
                <Button
                  variant={isDeviceBroadcastLocked ? "contained" : "outlined"}
                  size="small"
                  onClick={() => teacherInteractionService.toggleBroadcastLock()}
                  startIcon={isDeviceBroadcastLocked ? <LockIcon sx={{ fontSize: 14 }} /> : <UnlockIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    backgroundColor: isDeviceBroadcastLocked ? '#475569' : 'transparent',
                    borderColor: '#64748b',
                    color: '#f8fafc',
                    px: 0.8,
                  }}
                >
                  {isDeviceBroadcastLocked ? 'Lock Sync' : 'Unlock Sync'}
                </Button>
              </Tooltip>

              {/* Board Focus Mode */}
              <Tooltip title="Focus directly onto the front teaching board [3]">
                <Button
                  variant={cameraMode === 'board' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setCameraMode(cameraMode === 'board' ? 'teacher' : 'board')}
                  startIcon={<TvIcon sx={{ color: '#38bdf8' }} />}
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    backgroundColor: cameraMode === 'board' ? '#0284c7' : 'transparent',
                    borderColor: 'rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    px: 0.9,
                    '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.15)' },
                  }}
                >
                  Board [3]
                </Button>
              </Tooltip>
            </Box>
          )}

          {/* Blackboard Drawing Modal [B] */}
          <Tooltip title="Open Interactive Blackboard Canvas [B]">
            <Button
              variant="outlined"
              size="small"
              startIcon={<BrushIcon />}
              onClick={toggleBoardModal}
              sx={{
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#38bdf8',
                borderColor: '#0284c7',
                '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.1)' },
              }}
            >
              Board [B]
            </Button>
          </Tooltip>

          {/* Microphone Toggle */}
          <Tooltip title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}>
            <Button
              variant={isMicMuted ? 'outlined' : 'contained'}
              size="small"
              startIcon={isMicMuted ? <MicOffIcon /> : <MicIcon />}
              onClick={toggleMic}
              sx={{
                borderRadius: '8px',
                fontSize: '0.78rem',
                backgroundColor: isMicMuted ? 'transparent' : '#ef4444',
                borderColor: '#64748b',
                color: '#f8fafc',
              }}
            >
              {isMicMuted ? 'Mic Off' : 'Speaking'}
            </Button>
          </Tooltip>

          {/* Camera View Tier [V] */}
          {!isSeated && (
            <Tooltip title="Cycle Virtual World Camera Distance [V]: Close, Follow, Wide">
              <Button
                variant="outlined"
                size="small"
                startIcon={<VideocamIcon />}
                onClick={cycleCameraTier}
                sx={{
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  color: '#e2e8f0',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                Cam [V] ({['Close', 'Follow', 'Wide'][cameraDistanceTier] || 'Follow'})
              </Button>
            </Tooltip>
          )}

          {/* Seat reservation actions */}
          {targetSeatId && !isOccupied && !isMine && (
            <Button
              variant="text"
              size="small"
              onClick={handleReserve}
              sx={{ borderRadius: '8px', fontSize: '0.75rem', color: '#60a5fa' }}
            >
              Reserve {targetSeatId}
            </Button>
          )}

          {isMine && isSeated && (
            <Button
              variant="text"
              color="warning"
              size="small"
              onClick={handleRelease}
              sx={{ fontSize: '0.75rem' }}
            >
              Release Seat
            </Button>
          )}
        </Paper>

        {/* Traditional Classroom Pedagogical Immersion Bar */}
        <Paper
          elevation={2}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2.5,
            py: 0.9,
            borderRadius: '16px',
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <AcousticIcon sx={{ color: acousticAudibilityPercent > 70 ? '#10b981' : '#f59e0b', fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600 }}>
              Acoustic Audibility: {acousticAudibilityPercent}% ({teacherAudioDistance}m from Podium)
            </Typography>
          </Box>

          <Box sx={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.15)' }} />

          <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
            Board Visibility: <strong style={{ color: blackboardLegibility.startsWith('High') ? '#34d399' : '#fde047' }}>{blackboardLegibility}</strong>
          </Typography>
        </Paper>
      </Box>
    </>
  );
};
