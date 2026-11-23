import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Chip,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import GridOnIcon from '@mui/icons-material/GridOn';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useClassroomStore } from '../../../store/classroomStore';

/**
 * Observer / Evaluator Classroom HUD
 * Only rendered when userRole === 'observer'
 */
export const ObserverClassroomHUD = () => {
  const userRole = useClassroomStore((state) => state.userRole);
  const cameraMode = useClassroomStore((state) => state.cameraMode);
  const setCameraMode = useClassroomStore((state) => state.setCameraMode);
  const acousticAudibilityPercent = useClassroomStore((state) => state.acousticAudibilityPercent);
  const teacherAudioDistance = useClassroomStore((state) => state.teacherAudioDistance);
  const blackboardLegibility = useClassroomStore((state) => state.blackboardLegibility);
  const lectureState = useClassroomStore((state) => state.lectureState);
  const lectureTopic = useClassroomStore((state) => state.lectureTopic);
  const activeDisruptionEvent = useClassroomStore((state) => state.activeDisruptionEvent);

  if (userRole !== 'observer') return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 76,
        left: 20,
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.2,
        maxWidth: 380,
      }}
    >
      {/* Evaluator Badge */}
      <Paper
        elevation={6}
        sx={{
          p: 1.8,
          borderRadius: '16px',
          backgroundColor: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityIcon sx={{ color: '#a78bfa' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
              Observer & Evaluator View
            </Typography>
          </Box>
          <Chip
            label="Live Analytics"
            size="small"
            sx={{
              height: 20,
              fontSize: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              color: '#c4b5fd',
              border: '1px solid rgba(139, 92, 246, 0.4)',
            }}
          />
        </Box>

        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1.5, lineHeight: 1.4 }}>
          Elevated non-intrusive observation vantage overlooking student engagement, lecture progression, and acoustics.
        </Typography>

        {/* Camera Vantages */}
        <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 700, display: 'block', mb: 0.6 }}>
          Evaluator Vantage Angles:
        </Typography>
        <ButtonGroup size="small" sx={{ width: '100%', mb: 1.5 }}>
          <Button
            variant={cameraMode === 'observer' ? 'contained' : 'outlined'}
            onClick={() => setCameraMode('observer')}
            startIcon={<VisibilityIcon />}
            sx={{
              flex: 1,
              fontSize: '10px',
              backgroundColor: cameraMode === 'observer' ? '#7c3aed' : 'transparent',
              borderColor: 'rgba(139, 92, 246, 0.4)',
              color: '#f8fafc',
            }}
          >
            Corner [4]
          </Button>
          <Button
            variant={cameraMode === 'isometric' ? 'contained' : 'outlined'}
            onClick={() => setCameraMode('isometric')}
            startIcon={<ViewInArIcon />}
            sx={{
              flex: 1,
              fontSize: '10px',
              backgroundColor: cameraMode === 'isometric' ? '#7c3aed' : 'transparent',
              borderColor: 'rgba(139, 92, 246, 0.4)',
              color: '#f8fafc',
            }}
          >
            Iso [5]
          </Button>
          <Button
            variant={cameraMode === 'topdown' ? 'contained' : 'outlined'}
            onClick={() => setCameraMode('topdown')}
            startIcon={<GridOnIcon />}
            sx={{
              flex: 1,
              fontSize: '10px',
              backgroundColor: cameraMode === 'topdown' ? '#7c3aed' : 'transparent',
              borderColor: 'rgba(139, 92, 246, 0.4)',
              color: '#f8fafc',
            }}
          >
            Plan [6]
          </Button>
        </ButtonGroup>

        {/* Live Pedagogical Telemetry */}
        <Box sx={{ p: 1.2, borderRadius: '10px', backgroundColor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <GraphicEqIcon sx={{ color: '#34d399', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Room Audibility:</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800 }}>{acousticAudibilityPercent}%</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <AssessmentIcon sx={{ color: '#38bdf8', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Board Legibility:</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700 }}>
              {blackboardLegibility.split(' ')[0]}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Class Status:</Typography>
            <Typography variant="caption" sx={{ color: activeDisruptionEvent ? '#fbbf24' : '#a78bfa', fontWeight: 700 }}>
              {activeDisruptionEvent ? `Disruption (${activeDisruptionEvent})` : lectureState === 'lecturing' ? 'Lecture Active' : 'Class Seated'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
