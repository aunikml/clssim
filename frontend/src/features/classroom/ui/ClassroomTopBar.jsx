import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Popover,
  Slider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  School as SchoolIcon,
  RecordVoiceOver as TeacherIcon,
  Person as StudentIcon,
  CenterFocusStrong as BoardIcon,
  Visibility as ObserverIcon,
  ViewInAr as IsoIcon,
  GridOn as TopDownIcon,
  Roofing as CeilingIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  AccountCircle as AccountIcon,
  Brush as BrushIcon,
  SpatialAudio as SpatialAudioIcon,
  PanTool as HandIcon,
  Tv as TvIcon,
  Assignment as AgendaIcon,
  EmojiEvents as ReportCardIcon,
  Logout as LogoutIcon,
  HistoryEdu as TraditionalIcon,
  Computer as EdTechIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Videocam as CameraIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useClassroomStore } from '../../../store/classroomStore';
import { useSessionStore } from '../../../store/sessionStore';
import { useAuthStore } from '../../../store/authStore';
import { spatialAudioService } from '../../../services/spatialAudioService';
import { lectureService } from '../../../services/lectureService';

export const ClassroomTopBar = ({ onOpenAuth, onOpenControls }) => {
  const cameraMode = useClassroomStore((state) => state.cameraMode);
  const setCameraMode = useClassroomStore((state) => state.setCameraMode);
  const isSeated = useClassroomStore((state) => state.isSeated);
  const standUp = useClassroomStore((state) => state.standUp);
  const showCeiling = useClassroomStore((state) => state.showCeiling);
  const setShowCeiling = useClassroomStore((state) => state.setShowCeiling);
  const classroom = useClassroomStore((state) => state.classroom);
  const isHandRaised = useClassroomStore((state) => state.isHandRaised);
  const toggleBoardModal = useClassroomStore((state) => state.toggleBoardModal);
  const teacherAudioDistance = useClassroomStore((state) => state.teacherAudioDistance);
  const userRole = useClassroomStore((state) => state.userRole);
  const setUserRole = useClassroomStore((state) => state.setUserRole);
  const lectureState = useClassroomStore((state) => state.lectureState);
  const teachingDisplayMode = useClassroomStore((state) => state.teachingDisplayMode);
  const toggleAgenda = useClassroomStore((state) => state.toggleAgenda);
  const toggleReportCard = useClassroomStore((state) => state.toggleReportCard);
  const hasSeenAgenda = useClassroomStore((state) => state.hasSeenAgenda);
  const classroomEra = useClassroomStore((state) => state.classroomEra);
  const setClassroomEra = useClassroomStore((state) => state.setClassroomEra);
  const classSize = useClassroomStore((state) => state.classSize) || 20;
  const setClassSize = useClassroomStore((state) => state.setClassSize);

  const [isTestVoiceOn, setIsTestVoiceOn] = useState(false);
  const [classSizeAnchorEl, setClassSizeAnchorEl] = useState(null);
  const [cameraAnchorEl, setCameraAnchorEl] = useState(null);

  const wsConnected = useSessionStore((state) => state.wsConnected);
  const session = useSessionStore((state) => state.session);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleToggleSpatialVoice = () => {
    const active = spatialAudioService.toggleAcousticTestVoice();
    setIsTestVoiceOn(active);
  };

  const getActiveCameraLabel = () => {
    switch (cameraMode) {
      case 'walk':
        return isSeated ? 'Seated' : 'Walk [1]';
      case 'teacher':
        return 'Podium [2]';
      case 'board':
        return 'Board [3]';
      case 'observer':
        return 'Observer [4]';
      case 'isometric':
        return 'Isometric [5]';
      case 'topdown':
        return 'Top-Down [6]';
      default:
        return 'Camera';
    }
  };

  const getActiveCameraIcon = () => {
    switch (cameraMode) {
      case 'walk':
        return <StudentIcon sx={{ fontSize: 16 }} />;
      case 'teacher':
        return <TeacherIcon sx={{ fontSize: 16 }} />;
      case 'board':
        return <BoardIcon sx={{ fontSize: 16 }} />;
      case 'observer':
        return <ObserverIcon sx={{ fontSize: 16 }} />;
      case 'isometric':
        return <IsoIcon sx={{ fontSize: 16 }} />;
      case 'topdown':
        return <TopDownIcon sx={{ fontSize: 16 }} />;
      default:
        return <CameraIcon sx={{ fontSize: 16 }} />;
    }
  };

  const selectCamera = (mode) => {
    if (mode === 'walk' && isSeated) {
      standUp();
    }
    setCameraMode(mode);
    setCameraAnchorEl(null);
  };

  return (
    <AppBar
      position="absolute"
      color="transparent"
      elevation={0}
      component={motion.div}
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '100vw',
        background: 'linear-gradient(180deg, rgba(11, 17, 32, 0.96) 0%, rgba(11, 17, 32, 0.65) 85%, transparent 100%)',
        backdropFilter: 'blur(10px)',
        zIndex: 20,
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 1.5, md: 2.5 },
          py: 0.8,
          minHeight: '52px !important',
          width: '100%',
          boxSizing: 'border-box',
          gap: 1.5,
        }}
      >
        {/* ========================================================
            LEFT CLUSTER: Brand + Room Name + Compact Role Switcher
            ======================================================== */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
          {/* Brand Icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(59, 130, 246, 0.4)',
              flexShrink: 0,
            }}
          >
            <SchoolIcon sx={{ fontSize: 18 }} />
          </Box>

          {/* Title & Classroom Chip */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="subtitle2" sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
              Classroom Sim
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 600, display: 'block' }}>
              {classroom?.name || 'A101'}
            </Typography>
          </Box>

          {/* Compact Role Switcher Pill */}
          <ButtonGroup
            size="small"
            sx={{
              backgroundColor: 'rgba(30, 41, 59, 0.85)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              p: '2px',
            }}
          >
            <Tooltip title="Student Perspective (Walk / Desk sit)">
              <Button
                variant={userRole === 'student' ? 'contained' : 'text'}
                onClick={() => setUserRole('student')}
                startIcon={<StudentIcon sx={{ fontSize: 15 }} />}
                sx={{
                  fontSize: '0.72rem',
                  px: 1,
                  py: 0.3,
                  textTransform: 'none',
                  backgroundColor: userRole === 'student' ? '#0284c7' : 'transparent',
                  fontWeight: userRole === 'student' ? 800 : 500,
                  color: userRole === 'student' ? '#ffffff' : '#94a3b8',
                }}
              >
                Student
              </Button>
            </Tooltip>
            <Tooltip title="Teacher Perspective (Podium / Lecture controls)">
              <Button
                variant={userRole === 'teacher' ? 'contained' : 'text'}
                onClick={() => setUserRole('teacher')}
                startIcon={<TeacherIcon sx={{ fontSize: 15 }} />}
                sx={{
                  fontSize: '0.72rem',
                  px: 1,
                  py: 0.3,
                  textTransform: 'none',
                  backgroundColor: userRole === 'teacher' ? '#059669' : 'transparent',
                  fontWeight: userRole === 'teacher' ? 800 : 500,
                  color: userRole === 'teacher' ? '#ffffff' : '#94a3b8',
                }}
              >
                Teacher
              </Button>
            </Tooltip>
            <Tooltip title="Observer Perspective (Supervisor view)">
              <Button
                variant={userRole === 'observer' ? 'contained' : 'text'}
                onClick={() => setUserRole('observer')}
                startIcon={<ObserverIcon sx={{ fontSize: 15 }} />}
                sx={{
                  fontSize: '0.72rem',
                  px: 1,
                  py: 0.3,
                  textTransform: 'none',
                  backgroundColor: userRole === 'observer' ? '#7c3aed' : 'transparent',
                  fontWeight: userRole === 'observer' ? 800 : 500,
                  color: userRole === 'observer' ? '#ffffff' : '#94a3b8',
                }}
              >
                Observer
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>

        {/* ========================================================
            CENTER CLUSTER: Pedagogical Contrast + Core Quick Tools
            ======================================================== */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {/* Master Classroom Era A/B Contrast Segmented Toggle */}
          <Tooltip title="Instant Pedagogical Transformation: Traditional Slate (1980s) vs Smart EdTech (2026) [Hot-key: T]">
            <ButtonGroup
              size="small"
              sx={{
                borderRadius: '8px',
                p: '2px',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Button
                variant={classroomEra === 'traditional' ? 'contained' : 'text'}
                onClick={() => setClassroomEra('traditional')}
                startIcon={<TraditionalIcon sx={{ fontSize: 15 }} />}
                sx={{
                  borderRadius: '6px !important',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 1.1,
                  py: 0.3,
                  backgroundColor: classroomEra === 'traditional' ? '#b45309' : 'transparent',
                  color: classroomEra === 'traditional' ? '#ffffff' : '#94a3b8',
                  '&:hover': {
                    backgroundColor: classroomEra === 'traditional' ? '#92400e' : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                📜 Trad (1980s)
              </Button>
              <Button
                variant={classroomEra === 'edtech' ? 'contained' : 'text'}
                onClick={() => setClassroomEra('edtech')}
                startIcon={<EdTechIcon sx={{ fontSize: 15 }} />}
                sx={{
                  borderRadius: '6px !important',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 1.1,
                  py: 0.3,
                  backgroundColor: classroomEra === 'edtech' ? '#0284c7' : 'transparent',
                  color: classroomEra === 'edtech' ? '#ffffff' : '#94a3b8',
                  '&:hover': {
                    backgroundColor: classroomEra === 'edtech' ? '#0369a1' : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                💻 EdTech (2026)
              </Button>
            </ButtonGroup>
          </Tooltip>

          {/* Dynamic Class Size Control (Min 15, Max 40) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              px: 0.5,
              py: '2px',
              gap: 0.3,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Tooltip title="Decrease Class Size (-5, Minimum 15 Desks)">
              <span>
                <IconButton
                  size="small"
                  disabled={classSize <= 15}
                  onClick={() => setClassSize(classSize - 5)}
                  sx={{
                    color: classSize <= 15 ? 'rgba(255,255,255,0.2)' : '#38bdf8',
                    p: 0.3,
                    '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.15)' },
                  }}
                >
                  <RemoveIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={`Class Size: ${classSize} Desks (Min 15, Max 40). Click to open slider.`}>
              <Box
                onClick={(e) => setClassSizeAnchorEl(e.currentTarget)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  px: 0.6,
                  py: 0.2,
                  borderRadius: '5px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                }}
              >
                <PeopleIcon sx={{ fontSize: 14, color: '#38bdf8' }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                  {classSize}
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title="Increase Class Size (+5, Maximum 40 Desks)">
              <span>
                <IconButton
                  size="small"
                  disabled={classSize >= 40}
                  onClick={() => setClassSize(classSize + 5)}
                  sx={{
                    color: classSize >= 40 ? 'rgba(255,255,255,0.2)' : '#38bdf8',
                    p: 0.3,
                    '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.15)' },
                  }}
                >
                  <AddIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {/* Class Size Popover Slider */}
          <Popover
            open={Boolean(classSizeAnchorEl)}
            anchorEl={classSizeAnchorEl}
            onClose={() => setClassSizeAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            PaperProps={{
              sx: {
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                p: 2,
                width: 250,
                boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                Class Size Capacity
              </Typography>
              <Chip label={`${classSize} Desks`} size="small" sx={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 800 }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1.5, fontSize: '11px' }}>
              Scale physical seating from 15 (compact seminar) up to 40 (high-density lecture).
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
          </Popover>

          {/* Consolidated Camera Mode Dropdown Menu */}
          <Tooltip title="Switch Camera Viewport Angle [Keys 1-6]">
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => setCameraAnchorEl(e.currentTarget)}
              startIcon={getActiveCameraIcon()}
              endIcon={<ArrowDropDownIcon sx={{ fontSize: 16 }} />}
              sx={{
                fontSize: '0.72rem',
                textTransform: 'none',
                fontWeight: 700,
                color: '#93c5fd',
                borderColor: 'rgba(147, 197, 253, 0.3)',
                backgroundColor: 'rgba(30, 41, 59, 0.75)',
                borderRadius: '8px',
                px: 1.1,
                py: 0.35,
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  borderColor: '#3b82f6',
                },
              }}
            >
              {getActiveCameraLabel()}
            </Button>
          </Tooltip>

          {/* Camera Angles Menu */}
          <Menu
            anchorEl={cameraAnchorEl}
            open={Boolean(cameraAnchorEl)}
            onClose={() => setCameraAnchorEl(null)}
            PaperProps={{
              sx: {
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '10px',
                minWidth: 200,
                boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
              },
            }}
          >
            <MenuItem
              selected={cameraMode === 'walk'}
              onClick={() => selectCamera('walk')}
              sx={{ fontSize: '0.8rem', py: 0.8 }}
            >
              <ListItemIcon sx={{ color: '#38bdf8', minWidth: 32 }}>
                <StudentIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Student Walk [1]"
                secondary={isSeated ? 'Currently Seated' : 'Third-person avatar walk'}
                secondaryTypographyProps={{ fontSize: '0.68rem', color: '#64748b' }}
              />
            </MenuItem>
            {userRole === 'teacher' && (
              <MenuItem
                selected={cameraMode === 'teacher'}
                onClick={() => selectCamera('teacher')}
                sx={{ fontSize: '0.8rem', py: 0.8 }}
              >
                <ListItemIcon sx={{ color: '#10b981', minWidth: 32 }}>
                  <TeacherIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Teacher Podium [2]"
                  secondary="Front podium overlooking students"
                  secondaryTypographyProps={{ fontSize: '0.68rem', color: '#64748b' }}
                />
              </MenuItem>
            )}
            <MenuItem
              selected={cameraMode === 'board'}
              onClick={() => selectCamera('board')}
              sx={{ fontSize: '0.8rem', py: 0.8 }}
            >
              <ListItemIcon sx={{ color: '#0284c7', minWidth: 32 }}>
                <BoardIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Board Focus [3]"
                secondary="Direct view on chalkboard/screen"
                secondaryTypographyProps={{ fontSize: '0.68rem', color: '#64748b' }}
              />
            </MenuItem>
            <MenuItem
              selected={cameraMode === 'observer'}
              onClick={() => selectCamera('observer')}
              sx={{ fontSize: '0.8rem', py: 0.8 }}
            >
              <ListItemIcon sx={{ color: '#a855f7', minWidth: 32 }}>
                <ObserverIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Observer Corner [4]"
                secondary="Elevated corner room supervisor"
                secondaryTypographyProps={{ fontSize: '0.68rem', color: '#64748b' }}
              />
            </MenuItem>
            <MenuItem
              selected={cameraMode === 'isometric'}
              onClick={() => selectCamera('isometric')}
              sx={{ fontSize: '0.8rem', py: 0.8 }}
            >
              <ListItemIcon sx={{ color: '#14b8a6', minWidth: 32 }}>
                <IsoIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Isometric [5]"
                secondary="Stylized architectural overview"
                secondaryTypographyProps={{ fontSize: '0.68rem', color: '#64748b' }}
              />
            </MenuItem>
            <MenuItem
              selected={cameraMode === 'topdown'}
              onClick={() => selectCamera('topdown')}
              sx={{ fontSize: '0.8rem', py: 0.8 }}
            >
              <ListItemIcon sx={{ color: '#f59e0b', minWidth: 32 }}>
                <TopDownIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Top-Down [6]"
                secondary="Architectural 2D floorplan view"
                secondaryTypographyProps={{ fontSize: '0.68rem', color: '#64748b' }}
              />
            </MenuItem>
          </Menu>

          {/* Ceiling Toggle */}
          <Tooltip title={showCeiling ? 'Hide Ceiling' : 'Show Full Ceiling'}>
            <IconButton
              size="small"
              onClick={() => setShowCeiling(!showCeiling)}
              sx={{
                backgroundColor: showCeiling ? '#3b82f6' : 'rgba(30, 41, 59, 0.8)',
                color: showCeiling ? '#ffffff' : '#94a3b8',
                borderRadius: '8px',
                p: 0.6,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.3)' },
              }}
            >
              <CeilingIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {/* Board Tools / Screen Tools Shortcut Button */}
          <Tooltip title={teachingDisplayMode === 'digital_screen' ? 'Open Interactive 4K Digital Screen Tools [B]' : 'Open Interactive Blackboard [B]'}>
            <Button
              size="small"
              variant="outlined"
              startIcon={teachingDisplayMode === 'digital_screen' ? <TvIcon sx={{ fontSize: 15 }} /> : <BrushIcon sx={{ fontSize: 15 }} />}
              onClick={toggleBoardModal}
              sx={{
                borderRadius: '8px',
                fontSize: '0.72rem',
                textTransform: 'none',
                color: '#38bdf8',
                borderColor: 'rgba(56, 189, 248, 0.3)',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                px: 1,
                py: 0.35,
                '&:hover': {
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                },
              }}
            >
              {teachingDisplayMode === 'digital_screen' ? 'Screen [B]' : 'Board [B]'}
            </Button>
          </Tooltip>

          {/* Teacher Mode Action: Lecture Trigger */}
          {userRole === 'teacher' && (
            <Tooltip title="Start 20s Countdown & 5-Minute Cardiovascular & Heart Anatomy Lecture">
              <Button
                size="small"
                variant="contained"
                startIcon={<TeacherIcon sx={{ fontSize: 15 }} />}
                onClick={() => lectureService.startCountdown()}
                sx={{
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  backgroundColor: '#e11d48',
                  color: '#ffffff',
                  fontWeight: 700,
                  px: 1,
                  py: 0.35,
                  '&:hover': { backgroundColor: '#be123c' },
                }}
              >
                {lectureState === 'idle' ? 'Start Lecture' : 'Restart'}
              </Button>
            </Tooltip>
          )}

          {/* 3D Spatial Audio Test Chime */}
          <Tooltip title={isTestVoiceOn ? `Spatial Audio Active (${teacherAudioDistance}m)` : 'Test 3D Spatial Audio Beacon'}>
            <IconButton
              size="small"
              onClick={handleToggleSpatialVoice}
              sx={{
                backgroundColor: isTestVoiceOn ? '#059669' : 'rgba(30, 41, 59, 0.8)',
                color: isTestVoiceOn ? '#ffffff' : '#34d399',
                borderRadius: '8px',
                p: 0.6,
                border: '1px solid rgba(52, 211, 153, 0.3)',
                '&:hover': {
                  backgroundColor: isTestVoiceOn ? '#047857' : 'rgba(52, 211, 153, 0.2)',
                },
              }}
            >
              <SpatialAudioIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {/* Session Agenda & Objectives Button */}
          <Tooltip title="View Session Agenda & Learning Objectives [O]">
            <Button
              size="small"
              variant={!hasSeenAgenda ? 'contained' : 'outlined'}
              startIcon={<AgendaIcon sx={{ fontSize: 15 }} />}
              onClick={toggleAgenda}
              sx={{
                borderRadius: '8px',
                fontSize: '0.72rem',
                textTransform: 'none',
                backgroundColor: !hasSeenAgenda ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
                color: !hasSeenAgenda ? '#ffffff' : '#38bdf8',
                borderColor: 'rgba(56, 189, 248, 0.35)',
                fontWeight: 700,
                px: 1,
                py: 0.35,
                boxShadow: !hasSeenAgenda ? '0 0 10px rgba(2, 132, 199, 0.5)' : 'none',
                '&:hover': {
                  backgroundColor: 'rgba(56, 189, 248, 0.2)',
                },
              }}
            >
              Agenda [O]
            </Button>
          </Tooltip>

          {/* Academic Report Card Button */}
          <Tooltip title="View Academic Report Card & Exit Assessment [R]">
            <Button
              size="small"
              variant="outlined"
              startIcon={<ReportCardIcon sx={{ fontSize: 15 }} />}
              onClick={toggleReportCard}
              sx={{
                borderRadius: '8px',
                fontSize: '0.72rem',
                textTransform: 'none',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                color: '#10b981',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                fontWeight: 700,
                px: 1,
                py: 0.35,
                '&:hover': {
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                },
              }}
            >
              Report [R]
            </Button>
          </Tooltip>
        </Box>

        {/* ========================================================
            RIGHT CLUSTER: Status + Profile Chip + Log Out
            (CRITICAL: Always Anchored & Fully Visible on all screens)
            ======================================================== */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
            ml: 'auto',
          }}
        >
          {/* Hand Raised indicator badge */}
          {isHandRaised && (
            <Chip
              icon={<HandIcon sx={{ color: '#ffffff !important', fontSize: '14px !important' }} />}
              label="Hand"
              size="small"
              sx={{
                height: 24,
                fontSize: '0.72rem',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                fontWeight: 700,
              }}
            />
          )}

          {/* WebSocket / Live Status Indicator */}
          <Tooltip title={wsConnected ? 'Connected to Django Channels WebSocket' : 'Running in local state'}>
            <Chip
              icon={wsConnected ? <WifiIcon sx={{ fontSize: '13px !important' }} /> : <WifiOffIcon sx={{ fontSize: '13px !important' }} />}
              label={wsConnected ? 'Live' : 'Local'}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                backgroundColor: wsConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                color: wsConnected ? '#34d399' : '#94a3b8',
                border: `1px solid ${wsConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`,
              }}
            />
          </Tooltip>

          {/* Cockpit Dock Toggle Button */}
          <Button
            variant="outlined"
            size="small"
            onClick={onOpenControls}
            sx={{
              borderColor: 'rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              px: 1,
              py: 0.35,
              '&:hover': {
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                borderColor: '#38bdf8',
              },
            }}
          >
            Cockpit
          </Button>

          {/* User Profile Pill (Always visible when authenticated) */}
          {isAuthenticated && (
            <Tooltip title="View User Account Profile">
              <Chip
                avatar={<AccountIcon sx={{ color: '#38bdf8 !important' }} />}
                label={user?.profile?.display_name || user?.username || (userRole === 'teacher' ? 'Prof. Teacher' : 'Student Player')}
                variant="outlined"
                size="small"
                onClick={onOpenAuth}
                sx={{
                  color: '#f8fafc',
                  borderColor: 'rgba(56, 189, 248, 0.45)',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  height: 28,
                  '&:hover': {
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    borderColor: '#38bdf8',
                  },
                }}
              />
            </Tooltip>
          )}

          {/* Prominent Red Log Out Button (Always anchored to top-right) */}
          {isAuthenticated ? (
            <Tooltip title="Sign Out and Return to Login Home">
              <Button
                variant="contained"
                size="small"
                onClick={() => useAuthStore.getState().logout()}
                startIcon={<LogoutIcon sx={{ fontSize: 15 }} />}
                sx={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 1.2,
                  py: 0.38,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 10px rgba(220, 38, 38, 0.4)',
                  '&:hover': {
                    backgroundColor: '#b91c1c',
                  },
                }}
              >
                Log Out
              </Button>
            </Tooltip>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={onOpenAuth}
              sx={{
                fontSize: '0.74rem',
                backgroundColor: '#3b82f6',
                borderRadius: '8px',
                px: 1.2,
                py: 0.38,
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
