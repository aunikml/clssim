import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  MenuOpen as MenuOpenIcon,
  Menu as MenuIcon,
  RecordVoiceOver as LectureIcon,
  SportsEsports as PhysicsIcon,
  GraphicEq as AcousticsIcon,
  AdminPanelSettings as FacilitatorIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipPrevious as SkipPrevIcon,
  SkipNext as SkipNextIcon,
  Replay10 as Replay10Icon,
  Forward10 as Forward10Icon,
  Timeline as TimelineIcon,
  BookmarkBorder as BookmarkIcon,
  AltRoute as SectionIcon,
  FastForward as FastForwardIcon,
  Stop as StopIcon,
  Flight as AirplaneIcon,
  MarkChatUnread as NoteIcon,
  DeleteSweep as SpillIcon,
  LocalDrink as BottleIcon,
  Vibration as VibrationIcon,
  Bedtime as SleepIcon,
  RestartAlt as ResetIcon,
  School as TeacherIcon,
  Person as StudentIcon,
  CenterFocusStrong as BoardIcon,
  Visibility as ObserverIcon,
  ViewInAr as IsoIcon,
  VolumeUp as VolumeIcon,
  CheckCircle as CheckIcon,
  HelpOutline as QuestionIcon,
  Tv as TvIcon,
  Devices as DevicesIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassroomStore } from '../../../store/classroomStore';
import { useSessionStore } from '../../../store/sessionStore';
import { lectureService, HEART_ANATOMY_QUIZ, LECTURE_SECTIONS } from '../../../services/lectureService';
import { spatialAudioService } from '../../../services/spatialAudioService';

/**
 * Unified Simulation Control Cockpit Dock
 * Organizes all classroom tools, live telemetry, physics triggers, and lecture protocol
 * into 4 professional tabs:
 * 1. Lecture & Curriculum (Heart Anatomy, live transcript, stages, Q&A)
 * 2. Classroom Dynamics (Rapier Physics micro-events, stationery, autonomous jitter)
 * 3. Pedagogical Acoustics (Distance to teacher, sound falloff %, sightlines)
 * 4. Facilitator & Seating (Seat reservations, camera angles, role switcher)
 */
export const ClassroomCockpitDock = ({ open, onToggle }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSectionsExpanded, setIsSectionsExpanded] = useState(false);

  // Classroom Store
  const lectureState = useClassroomStore((state) => state.lectureState);
  const lectureCountdown = useClassroomStore((state) => state.lectureCountdown);
  const lectureTimer = useClassroomStore((state) => state.lectureTimer);
  const lectureTranscript = useClassroomStore((state) => state.lectureTranscript);
  const lectureTopic = useClassroomStore((state) => state.lectureTopic);
  const currentQuizQuestionIndex = useClassroomStore((state) => state.currentQuizQuestionIndex);
  const isTeacherSpeaking = useClassroomStore((state) => state.isTeacherSpeaking);
  const isLecturePaused = useClassroomStore((state) => state.isLecturePaused);
  const activeDisruptionEvent = useClassroomStore((state) => state.activeDisruptionEvent);
  const setActiveDisruptionEvent = useClassroomStore((state) => state.setActiveDisruptionEvent);
  const userRole = useClassroomStore((state) => state.userRole);
  const setUserRole = useClassroomStore((state) => state.setUserRole);
  const cameraMode = useClassroomStore((state) => state.cameraMode);
  const setCameraMode = useClassroomStore((state) => state.setCameraMode);
  const teacherAudioDistance = useClassroomStore((state) => state.teacherAudioDistance);
  const acousticAudibilityPercent = useClassroomStore((state) => state.acousticAudibilityPercent);
  const blackboardLegibility = useClassroomStore((state) => state.blackboardLegibility);
  const isSeated = useClassroomStore((state) => state.isSeated);
  const seatedSeatId = useClassroomStore((state) => state.seatedSeatId);
  const teachingDisplayMode = useClassroomStore((state) => state.teachingDisplayMode);
  const toggleTeachingDisplayMode = useClassroomStore((state) => state.toggleTeachingDisplayMode);
  const showStudentDevices = useClassroomStore((state) => state.showStudentDevices);
  const toggleStudentDevices = useClassroomStore((state) => state.toggleStudentDevices);
  const classSize = useClassroomStore((state) => state.classSize) || 20;
  const setClassSize = useClassroomStore((state) => state.setClassSize);

  // Session Store
  const session = useSessionStore((state) => state.session);
  const seats = useSessionStore((state) => state.seats);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getStageTitle = (t) => {
    if (t < 100) return 'Point 1: What is the Circulatory System?';
    if (t < 200) return 'Point 2: Parts of the Heart (4 Chambers & Valves)';
    return 'Point 3: The Journey of Blood in the Circulatory System';
  };

  return (
    <>
      {/* Floating Toggle Button (Top Right) */}
      <Box
        sx={{
          position: 'absolute',
          top: 68,
          right: 20,
          zIndex: 1100,
          pointerEvents: 'auto',
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={onToggle}
          startIcon={open ? <MenuOpenIcon /> : <MenuIcon />}
          sx={{
            backgroundColor: open ? '#1e3a8a' : 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            color: '#f8fafc',
            textTransform: 'none',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: '24px',
            px: 2,
            py: 0.8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            '&:hover': {
              backgroundColor: '#1d4ed8',
              borderColor: '#38bdf8',
            },
          }}
        >
          {open ? 'Hide Cockpit' : 'Simulation Cockpit Dock'}
        </Button>
      </Box>

      {/* Slide-out Cockpit Dock Panel */}
      <AnimatePresence>
        {open && (
          <Paper
            component={motion.div}
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            elevation={12}
            sx={{
              position: 'absolute',
              top: 64,
              bottom: 24,
              right: 18,
              width: { xs: '90vw', sm: 380 },
              maxWidth: '92vw',
              zIndex: 1050,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              borderRadius: '16px',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              pointerEvents: 'auto',
            }}
          >
            {/* Cockpit Header */}
            <Box
              sx={{
                p: 2,
                pb: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.4) 100%)',
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#f8fafc', lineHeight: 1.2 }}>
                  Classroom Cockpit Dock
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Pedagogical Observer & Facilitator Suite
                </Typography>
              </Box>
              <IconButton size="small" onClick={onToggle} sx={{ color: '#94a3b8', '&:hover': { color: '#f8fafc' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* 4 Dock Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              variant="fullWidth"
              sx={{
                minHeight: 44,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                '& .MuiTab-root': {
                  minHeight: 44,
                  py: 1,
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#94a3b8',
                  '&.Mui-selected': {
                    color: '#38bdf8',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#38bdf8',
                  height: 3,
                },
              }}
            >
              <Tab icon={<LectureIcon sx={{ fontSize: 18 }} />} label="Lecture" />
              <Tab icon={<PhysicsIcon sx={{ fontSize: 18 }} />} label="Dynamics" />
              <Tab icon={<AcousticsIcon sx={{ fontSize: 18 }} />} label="Acoustics" />
              <Tab icon={<FacilitatorIcon sx={{ fontSize: 18 }} />} label="Control" />
            </Tabs>

            {/* Tab Contents Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* TAB 0: LECTURE & TIMELINE */}
              {activeTab === 0 && (
                <>
                  {/* Status Banner */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                        Curriculum Phase
                      </Typography>
                      <Chip
                        label={
                          lectureState === 'countdown'
                            ? `Countdown (${lectureCountdown}s)`
                            : lectureState === 'lecturing'
                            ? 'Live 5-Min Masterclass'
                            : lectureState === 'qa'
                            ? 'Q&A Assessment'
                            : 'Ready / Idle'
                        }
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor:
                            lectureState === 'lecturing'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : lectureState === 'countdown'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(148, 163, 184, 0.15)',
                          color:
                            lectureState === 'lecturing'
                              ? '#34d399'
                              : lectureState === 'countdown'
                              ? '#fbbf24'
                              : '#94a3b8',
                        }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 700 }}>
                      Cardiovascular System & Anatomy of the Human Heart
                    </Typography>

                    {lectureState === 'lecturing' && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#38bdf8', fontSize: '10px' }}>
                            {getStageTitle(lectureTimer)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 700, fontSize: '11px' }}>
                            {formatTimer(lectureTimer)} / 5:00
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((lectureTimer / 300) * 100, 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #38bdf8 0%, #34d399 100%)',
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Live Teacher Audio / Google TTS Speech Stream */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <VolumeIcon sx={{ color: isTeacherSpeaking ? '#4ade80' : '#94a3b8', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                        Teacher John (Google TTS Natural Voice)
                      </Typography>
                      {isTeacherSpeaking && (
                        <Chip
                          label="Speaking"
                          size="small"
                          sx={{ height: 18, fontSize: '10px', backgroundColor: '#065f46', color: '#6ee7b7' }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: lectureTranscript ? '#f8fafc' : '#64748b',
                        fontStyle: lectureTranscript ? 'italic' : 'normal',
                        fontSize: '12px',
                        lineHeight: 1.5,
                        minHeight: 48,
                      }}
                    >
                      {lectureTranscript ? `"${lectureTranscript}"` : 'Teacher is waiting to begin lecture...'}
                    </Typography>
                  </Box>

                  {/* LECTURE NAVIGATION & TIMELINE SCRUBBER (INTERACTIVE SECTION JUMPER) */}
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                    }}
                  >
                    {/* Header with Title & Current Time Badge */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimelineIcon sx={{ color: '#38bdf8', fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 800 }}>
                          Lecture Navigation & Seek
                        </Typography>
                      </Box>
                      <Chip
                        label={`${formatTimer(lectureTimer)} / 5:00`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: 'rgba(56, 189, 248, 0.2)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                        }}
                      />
                    </Box>

                    {/* Interactive 0:00 to 5:00 Timeline Slider Scrubber */}
                    <Box sx={{ px: 1 }}>
                      <Slider
                        value={Math.min(lectureTimer, 300)}
                        min={0}
                        max={300}
                        step={1}
                        onChange={(e, val) => lectureService.seekTo(val, true)}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(val) => formatTimer(val)}
                        sx={{
                          color: '#38bdf8',
                          height: 6,
                          '& .MuiSlider-track': {
                            background: 'linear-gradient(90deg, #38bdf8 0%, #f43f5e 45%, #4ade80 80%, #fbbf24 100%)',
                            border: 'none',
                          },
                          '& .MuiSlider-rail': {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          },
                          '& .MuiSlider-thumb': {
                            width: 16,
                            height: 16,
                            backgroundColor: '#ffffff',
                            border: '2px solid #38bdf8',
                            boxShadow: '0 0 10px rgba(56, 189, 248, 0.8)',
                            '&:hover, &.Mui-focusVisible': {
                              boxShadow: '0 0 16px rgba(56, 189, 248, 1)',
                            },
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -0.5 }}>
                        <Typography variant="caption" sx={{ color: '#38bdf8', fontSize: '9px', fontWeight: 700 }}>
                          Pt 1 (0:00)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#f43f5e', fontSize: '9px', fontWeight: 700 }}>
                          Pt 2 (1:40)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#4ade80', fontSize: '9px', fontWeight: 700 }}>
                          Pt 3 (3:20)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#fbbf24', fontSize: '9px', fontWeight: 700 }}>
                          Q&A (5:00)
                        </Typography>
                      </Box>
                    </Box>

                    {/* Transport Control Buttons Bar */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        backgroundColor: 'rgba(30, 41, 59, 0.6)',
                        p: 0.8,
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <Tooltip title="Previous Section">
                        <IconButton
                          size="small"
                          onClick={() => lectureService.previousSection()}
                          sx={{ color: '#cbd5e1', '&:hover': { color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.15)' } }}
                        >
                          <SkipPrevIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Skip Back 15s">
                        <IconButton
                          size="small"
                          onClick={() => lectureService.skipSeconds(-15)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
                        >
                          <Replay10Icon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={isLecturePaused ? 'Resume Lecture' : lectureState === 'lecturing' ? 'Pause Lecture' : 'Start Lecture'}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => {
                            if (lectureState === 'idle' || lectureState === 'countdown') {
                              lectureService.startLecture();
                            } else {
                              lectureService.togglePause();
                            }
                          }}
                          sx={{
                            minWidth: 42,
                            height: 34,
                            borderRadius: '20px',
                            backgroundColor: isLecturePaused ? '#10b981' : lectureState === 'lecturing' ? '#0284c7' : '#e11d48',
                            color: '#ffffff',
                            fontWeight: 800,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                            '&:hover': {
                              backgroundColor: isLecturePaused ? '#059669' : lectureState === 'lecturing' ? '#0369a1' : '#be123c',
                            },
                          }}
                        >
                          {lectureState === 'lecturing' && !isLecturePaused ? (
                            <PauseIcon fontSize="small" />
                          ) : (
                            <PlayIcon fontSize="small" />
                          )}
                        </Button>
                      </Tooltip>

                      <Tooltip title="Skip Forward 15s">
                        <IconButton
                          size="small"
                          onClick={() => lectureService.skipSeconds(15)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
                        >
                          <Forward10Icon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Next Section">
                        <IconButton
                          size="small"
                          onClick={() => lectureService.nextSection()}
                          sx={{ color: '#cbd5e1', '&:hover': { color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.15)' } }}
                        >
                          <SkipNextIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Quick-Jump Milestone Buttons (The 3 Points + Assessment) */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.6 }}>
                      <Button
                        size="small"
                        variant={lectureTimer < 100 && lectureState === 'lecturing' ? 'contained' : 'outlined'}
                        onClick={() => lectureService.seekTo(0, true)}
                        sx={{
                          py: 0.5,
                          px: 0.5,
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'none',
                          backgroundColor: lectureTimer < 100 && lectureState === 'lecturing' ? '#0284c7' : 'transparent',
                          borderColor: 'rgba(56, 189, 248, 0.35)',
                          color: '#38bdf8',
                          lineHeight: 1.1,
                          textAlign: 'center',
                        }}
                      >
                        Pt 1: Intro<br />(0:00)
                      </Button>
                      <Button
                        size="small"
                        variant={lectureTimer >= 100 && lectureTimer < 200 && lectureState === 'lecturing' ? 'contained' : 'outlined'}
                        onClick={() => lectureService.seekTo(100, true)}
                        sx={{
                          py: 0.5,
                          px: 0.5,
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'none',
                          backgroundColor: lectureTimer >= 100 && lectureTimer < 200 && lectureState === 'lecturing' ? '#e11d48' : 'transparent',
                          borderColor: 'rgba(244, 63, 94, 0.35)',
                          color: '#f43f5e',
                          lineHeight: 1.1,
                          textAlign: 'center',
                        }}
                      >
                        Pt 2: Heart<br />(1:40)
                      </Button>
                      <Button
                        size="small"
                        variant={lectureTimer >= 200 && lectureTimer < 300 && lectureState === 'lecturing' ? 'contained' : 'outlined'}
                        onClick={() => lectureService.seekTo(200, true)}
                        sx={{
                          py: 0.5,
                          px: 0.5,
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'none',
                          backgroundColor: lectureTimer >= 200 && lectureTimer < 300 && lectureState === 'lecturing' ? '#059669' : 'transparent',
                          borderColor: 'rgba(74, 222, 128, 0.35)',
                          color: '#4ade80',
                          lineHeight: 1.1,
                          textAlign: 'center',
                        }}
                      >
                        Pt 3: Blood<br />(3:20)
                      </Button>
                      <Button
                        size="small"
                        variant={lectureState === 'qa' || lectureTimer >= 300 ? 'contained' : 'outlined'}
                        onClick={() => lectureService.startQA()}
                        sx={{
                          py: 0.5,
                          px: 0.5,
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'none',
                          backgroundColor: lectureState === 'qa' || lectureTimer >= 300 ? '#d97706' : 'transparent',
                          borderColor: 'rgba(251, 191, 36, 0.35)',
                          color: '#fbbf24',
                          lineHeight: 1.1,
                          textAlign: 'center',
                        }}
                      >
                        Q&A Quiz<br />(5:00)
                      </Button>
                    </Box>

                    {/* Detailed Section Navigation List (Collapsible, default collapsed) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      <Box
                        onClick={() => setIsSectionsExpanded(!isSectionsExpanded)}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          p: 0.8,
                          borderRadius: '8px',
                          backgroundColor: 'rgba(30, 41, 59, 0.6)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          userSelect: 'none',
                          transition: 'background-color 0.15s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(56, 189, 248, 0.12)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 700, fontSize: '11px' }}>
                            Curriculum Sections ({LECTURE_SECTIONS.length})
                          </Typography>
                          <Chip
                            label={isSectionsExpanded ? 'Expanded' : 'Collapsed'}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '9px',
                              fontWeight: 700,
                              backgroundColor: isSectionsExpanded ? 'rgba(56, 189, 248, 0.25)' : 'rgba(148, 163, 184, 0.15)',
                              color: isSectionsExpanded ? '#38bdf8' : '#94a3b8',
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '10px' }}>
                            {isSectionsExpanded ? 'Click to hide' : 'Click to expand'}
                          </Typography>
                          <IconButton size="small" sx={{ p: 0.2, color: '#38bdf8' }}>
                            {isSectionsExpanded ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />}
                          </IconButton>
                        </Box>
                      </Box>

                      <AnimatePresence>
                        {isSectionsExpanded && (
                          <Box
                            component={motion.div}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            sx={{
                              maxHeight: 220,
                              overflowY: 'auto',
                              pr: 0.5,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.7,
                              '&::-webkit-scrollbar': { width: '4px' },
                              '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(56, 189, 248, 0.3)', borderRadius: '2px' },
                            }}
                          >
                        {LECTURE_SECTIONS.map((sec) => {
                          const isCurrent =
                            sec.id === 'qa_assessment'
                              ? lectureState === 'qa' || lectureTimer >= 300
                              : lectureState === 'lecturing' &&
                                lectureTimer >= sec.startSec &&
                                lectureTimer < (sec.endSec || sec.startSec + 50);

                          const pointColor =
                            sec.point === 1 ? '#38bdf8' : sec.point === 2 ? '#f43f5e' : sec.point === 3 ? '#4ade80' : '#fbbf24';

                          return (
                            <Box
                              key={sec.id}
                              onClick={() => {
                                if (sec.id === 'qa_assessment') {
                                  lectureService.startQA();
                                } else {
                                  lectureService.seekTo(sec.startSec, true);
                                }
                              }}
                              sx={{
                                p: 1,
                                borderRadius: '8px',
                                backgroundColor: isCurrent ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.65)',
                                border: isCurrent ? `2px solid ${pointColor}` : '1px solid rgba(255, 255, 255, 0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.18s ease-in-out',
                                '&:hover': {
                                  backgroundColor: 'rgba(56, 189, 248, 0.22)',
                                  borderColor: pointColor,
                                  transform: 'translateX(3px)',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor: pointColor,
                                      boxShadow: isCurrent ? `0 0 8px ${pointColor}` : 'none',
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '11px' }}>
                                    {sec.title}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                  {isCurrent && (
                                    <Chip
                                      label="Active"
                                      size="small"
                                      sx={{
                                        height: 16,
                                        fontSize: '9px',
                                        fontWeight: 800,
                                        backgroundColor: pointColor,
                                        color: '#0f172a',
                                      }}
                                    />
                                  )}
                                  <Chip
                                    label={sec.timeLabel}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                      color: pointColor,
                                      border: `1px solid ${pointColor}44`,
                                    }}
                                  />
                                </Box>
                              </Box>
                              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '10px', display: 'block', pl: 1.8 }}>
                                {sec.subtext}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </AnimatePresence>
                </Box>
              </Box>

                  {/* Classroom Hardware Display Mode Toggle */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TvIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
                        <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                          Teaching Display Hardware
                        </Typography>
                      </Box>
                      <Chip
                        label={teachingDisplayMode === 'digital_screen' ? '4K Smart Screen' : 'Chalkboard'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: teachingDisplayMode === 'digital_screen' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                          color: teachingDisplayMode === 'digital_screen' ? '#38bdf8' : '#cbd5e1',
                        }}
                      />
                    </Box>

                    <Button
                      variant={teachingDisplayMode === 'digital_screen' ? 'contained' : 'outlined'}
                      size="small"
                      fullWidth
                      startIcon={<TvIcon />}
                      onClick={toggleTeachingDisplayMode}
                      sx={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'none',
                        backgroundColor: teachingDisplayMode === 'digital_screen' ? '#0284c7' : 'transparent',
                        borderColor: 'rgba(56, 189, 248, 0.4)',
                        color: teachingDisplayMode === 'digital_screen' ? '#ffffff' : '#38bdf8',
                        '&:hover': {
                          backgroundColor: teachingDisplayMode === 'digital_screen' ? '#0369a1' : 'rgba(56, 189, 248, 0.15)',
                        },
                      }}
                    >
                      {teachingDisplayMode === 'digital_screen'
                        ? 'Switch to Traditional Slate Blackboard'
                        : 'Switch to 4K Digital Screen & Whiteboard'}
                    </Button>

                    {/* Student Devices Toggle Option (Only displayed when Digital Screen is chosen) */}
                    {teachingDisplayMode === 'digital_screen' && (
                      <Box
                        sx={{
                          mt: 1.2,
                          p: 1.2,
                          borderRadius: '8px',
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.8,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DevicesIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
                            <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 800 }}>
                              Student devices
                            </Typography>
                          </Box>
                          <Switch
                            size="small"
                            checked={showStudentDevices}
                            onChange={toggleStudentDevices}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#38bdf8',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#0284c7',
                              },
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '10px', lineHeight: 1.4 }}>
                          {showStudentDevices
                            ? 'Laptops and tablets randomly distributed across desks, mirroring 4K screen live and displaying pop quiz questions.'
                            : 'Student devices hidden (traditional desk arrangement).'}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Lecture Controls */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                      Pedagogy Protocol Actions
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayIcon />}
                        onClick={() => lectureService.startCountdown()}
                        sx={{
                          backgroundColor: '#e11d48',
                          fontSize: '11px',
                          fontWeight: 700,
                          '&:hover': { backgroundColor: '#be123c' },
                        }}
                      >
                        Start Lecture
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FastForwardIcon />}
                        disabled={lectureState === 'idle'}
                        onClick={() => lectureService.startQA()}
                        sx={{
                          borderColor: 'rgba(56, 189, 248, 0.4)',
                          color: '#38bdf8',
                          fontSize: '11px',
                        }}
                      >
                        Skip to Q&A
                      </Button>
                    </Box>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<StopIcon />}
                      disabled={lectureState === 'idle'}
                      onClick={() => lectureService.stopAll()}
                      sx={{ color: '#94a3b8', fontSize: '11px' }}
                    >
                      Reset Lecture Protocol
                    </Button>
                  </Box>
                </>
              )}

              {/* TAB 1: CLASSROOM DYNAMICS (RAPIER PHYSICS) */}
              {activeTab === 1 && (
                <>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 700, mb: 0.5 }}>
                      Rapier Physics Engine
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.4, display: 'block' }}>
                      WebAssembly rigid-body simulation with dynamic gravity (-9.81 m/s²), collision impulses, and procedural Foley acoustics.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip label="Colliders: Active" size="small" sx={{ height: 20, fontSize: '10px', backgroundColor: '#065f46', color: '#6ee7b7' }} />
                      <Chip label="Foley Synth: Web Audio" size="small" sx={{ height: 20, fontSize: '10px', backgroundColor: '#1e3a8a', color: '#93c5fd' }} />
                    </Box>
                  </Box>

                  {/* Micro-Events Triggers */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                      Trigger Classroom Micro-Events
                    </Typography>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AirplaneIcon sx={{ color: '#38bdf8' }} />}
                      onClick={() => setActiveDisruptionEvent('airplane')}
                      sx={{
                        justifyContent: 'flex-start',
                        borderColor: 'rgba(56, 189, 248, 0.3)',
                        color: '#f8fafc',
                        fontSize: '11px',
                        py: 0.8,
                        '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.1)' },
                      }}
                    >
                      Paper Airplane (Folds & Glides Across Desks)
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<NoteIcon sx={{ color: '#fbbf24' }} />}
                      onClick={() => setActiveDisruptionEvent('note_toss')}
                      sx={{
                        justifyContent: 'flex-start',
                        borderColor: 'rgba(251, 191, 36, 0.3)',
                        color: '#f8fafc',
                        fontSize: '11px',
                        py: 0.8,
                        '&:hover': { backgroundColor: 'rgba(251, 191, 36, 0.1)' },
                      }}
                    >
                      Secret Paper Note Toss (Arcing Toss Between Desks)
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SpillIcon sx={{ color: '#f87171' }} />}
                      onClick={() => setActiveDisruptionEvent('spill_tin')}
                      sx={{
                        justifyContent: 'flex-start',
                        borderColor: 'rgba(248, 113, 113, 0.3)',
                        color: '#f8fafc',
                        fontSize: '11px',
                        py: 0.8,
                        '&:hover': { backgroundColor: 'rgba(248, 113, 113, 0.1)' },
                      }}
                    >
                      Spill Pencil Tin (Pencils Clatter with Foley Audio)
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<BottleIcon sx={{ color: '#06b6d4' }} />}
                      onClick={() => setActiveDisruptionEvent('water_bottle')}
                      sx={{
                        justifyContent: 'flex-start',
                        borderColor: 'rgba(6, 182, 212, 0.3)',
                        color: '#f8fafc',
                        fontSize: '11px',
                        py: 0.8,
                        '&:hover': { backgroundColor: 'rgba(6, 182, 212, 0.1)' },
                      }}
                    >
                      Metal Hydroflask (Clatters & Rolls Down Aisle)
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VibrationIcon sx={{ color: '#a855f7' }} />}
                      onClick={() => setActiveDisruptionEvent('phone_vibrate')}
                      sx={{
                        justifyContent: 'flex-start',
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                        color: '#f8fafc',
                        fontSize: '11px',
                        py: 0.8,
                        '&:hover': { backgroundColor: 'rgba(168, 85, 247, 0.1)' },
                      }}
                    >
                      Vibrating Phone (Haptic Wooden Resonance)
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SleepIcon sx={{ color: '#ec4899' }} />}
                      onClick={() => setActiveDisruptionEvent('doze_startle')}
                      sx={{
                        justifyContent: 'flex-start',
                        borderColor: 'rgba(236, 72, 153, 0.3)',
                        color: '#f8fafc',
                        fontSize: '11px',
                        py: 0.8,
                        '&:hover': { backgroundColor: 'rgba(236, 72, 153, 0.1)' },
                      }}
                    >
                      Head-Bob Startle (Student Dozes & Jerks Awake)
                    </Button>

                    <Button
                      variant="text"
                      size="small"
                      startIcon={<ResetIcon />}
                      onClick={() => setActiveDisruptionEvent('reset')}
                      sx={{ color: '#94a3b8', fontSize: '11px' }}
                    >
                      Reset All Fallen Stationery
                    </Button>
                  </Box>

                  {/* Autonomous dynamics notice */}
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: '1px dashed rgba(148, 163, 184, 0.25)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '11px' }}>
                      💡 Micro-events occur autonomously at randomized 25-55 second intervals to simulate authentic classroom distractions for teacher management practice.
                    </Typography>
                  </Box>
                </>
              )}

              {/* TAB 2: PEDAGOGICAL ACOUSTICS & SIGHTLINES */}
              {activeTab === 2 && (
                <>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                      Spatial Vantage & Acoustic Metrics
                    </Typography>

                    {/* Metric 1: Distance to Teacher */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Distance to Teacher John
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700 }}>
                          {teacherAudioDistance} meters
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(10, Math.min(100, 100 - (teacherAudioDistance / 10) * 100))}
                        sx={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)' }}
                      />
                    </Box>

                    {/* Metric 2: Acoustic Audibility */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Acoustic Audibility Index
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700 }}>
                          {acousticAudibilityPercent}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={acousticAudibilityPercent}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': { backgroundColor: '#10b981' },
                        }}
                      />
                    </Box>

                    {/* Metric 3: Blackboard Legibility */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Chalkboard Sightline Legibility
                      </Typography>
                      <Chip
                        label={blackboardLegibility}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: blackboardLegibility === 'High' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: blackboardLegibility === 'High' ? '#34d399' : '#fbbf24',
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                      Spatial Audio Configuration
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VolumeIcon />}
                      onClick={() => spatialAudioService.toggleAcousticTestVoice()}
                      sx={{
                        borderColor: 'rgba(52, 211, 153, 0.3)',
                        color: '#34d399',
                        fontSize: '11px',
                        justifyContent: 'flex-start',
                      }}
                    >
                      Podium Acoustic Test Beacon (Falloff Check)
                    </Button>
                  </Box>
                </>
              )}

              {/* TAB 3: FACILITATOR & CLASSROOM SEATING */}
              {activeTab === 3 && (
                <>
                  {/* Role Selector */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, mb: 1, display: 'block' }}>
                      Active Simulation Perspective
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                      <Button
                        variant={userRole === 'student' ? 'contained' : 'outlined'}
                        size="small"
                        startIcon={<StudentIcon />}
                        onClick={() => setUserRole('student')}
                        sx={{
                          fontSize: '11px',
                          backgroundColor: userRole === 'student' ? '#0284c7' : 'transparent',
                        }}
                      >
                        Student
                      </Button>
                      <Button
                        variant={userRole === 'teacher' ? 'contained' : 'outlined'}
                        size="small"
                        startIcon={<TeacherIcon />}
                        onClick={() => setUserRole('teacher')}
                        sx={{
                          fontSize: '11px',
                          backgroundColor: userRole === 'teacher' ? '#3b82f6' : 'transparent',
                        }}
                      >
                        Teacher
                      </Button>
                      <Button
                        variant={userRole === 'observer' ? 'contained' : 'outlined'}
                        size="small"
                        startIcon={<ObserverIcon />}
                        onClick={() => setUserRole('observer')}
                        sx={{
                          fontSize: '11px',
                          backgroundColor: userRole === 'observer' ? '#7c3aed' : 'transparent',
                        }}
                      >
                        Observer
                      </Button>
                    </Box>
                  </Box>

                  {/* Camera Angles */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                      Quick Camera Vantage Presets
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Button
                        variant={cameraMode === 'walk' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setCameraMode('walk')}
                        sx={{ fontSize: '11px', py: 0.8 }}
                      >
                        Student [1]
                      </Button>
                      <Button
                        variant={cameraMode === 'board' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setCameraMode('board')}
                        sx={{ fontSize: '11px', py: 0.8 }}
                      >
                        Board Focus [3]
                      </Button>
                      <Button
                        variant={cameraMode === 'observer' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setCameraMode('observer')}
                        sx={{ fontSize: '11px', py: 0.8 }}
                      >
                        Observer [4]
                      </Button>
                      <Button
                        variant={cameraMode === 'isometric' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setCameraMode('isometric')}
                        sx={{ fontSize: '11px', py: 0.8 }}
                      >
                        Isometric [5]
                      </Button>
                    </Box>
                  </Box>

                  {/* Class Size Capacity Slider (Min 15, Max 40) */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800 }}>
                        Classroom Seating Capacity
                      </Typography>
                      <Chip
                        label={`${classSize} Desks`}
                        size="small"
                        sx={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 800, height: 22 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '11px', display: 'block', mb: 1 }}>
                      Dynamic student seating scale: minimum 15 to maximum 40 desks.
                    </Typography>
                    <Slider
                      value={classSize}
                      min={15}
                      max={40}
                      step={1}
                      marks={[
                        { value: 15, label: '15' },
                        { value: 20, label: '20' },
                        { value: 30, label: '30' },
                        { value: 40, label: '40' },
                      ]}
                      onChange={(e, val) => setClassSize(val)}
                      sx={{
                        color: '#38bdf8',
                        '& .MuiSlider-markLabel': { color: '#94a3b8', fontSize: '10px' },
                      }}
                    />
                  </Box>

                  {/* Room Roster */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, mb: 0.5, display: 'block' }}>
                      Classroom Seating Configuration
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: '12px' }}>
                      Active Capacity: {classSize} Desks ({seats.filter((s) => s.status === 'occupied').length} Occupied, {seats.filter((s) => s.status !== 'occupied').length} Available)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                      Students observe front chalkboard diagrams, take notes in desk notebooks, and interact through non-verbal gestures.
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        )}
      </AnimatePresence>
    </>
  );
};
export default ClassroomCockpitDock;
