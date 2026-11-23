import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Collapse,
  Divider,
} from '@mui/material';
import {
  CompareArrows as ContrastIcon,
  Hearing as AudioIcon,
  Visibility as VisionIcon,
  TouchApp as InteractionIcon,
  BarChart as AnalyticsIcon,
  Close as CloseIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Bolt as SparkIcon,
  HistoryEdu as TraditionalIcon,
  Computer as EdTechIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassroomStore } from '../../../store/classroomStore';

export const ClassroomEraComparisonHUD = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const classroomEra = useClassroomStore((state) => state.classroomEra);
  const toggleClassroomEra = useClassroomStore((state) => state.toggleClassroomEra);
  const eraNotification = useClassroomStore((state) => state.eraNotification);
  const clearEraNotification = useClassroomStore((state) => state.clearEraNotification);
  const teacherAudioDistance = useClassroomStore((state) => state.teacherAudioDistance);
  const acousticAudibilityPercent = useClassroomStore((state) => state.acousticAudibilityPercent);
  const blackboardLegibility = useClassroomStore((state) => state.blackboardLegibility);

  const isEdTech = classroomEra === 'edtech';

  return (
    <>
      {/* 1. Cinematic Metamorphosis Toast Banner */}
      <AnimatePresence>
        {eraNotification && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: -50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            sx={{
              position: 'absolute',
              top: 76,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 35,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2.5,
              py: 1.2,
              borderRadius: '14px',
              backgroundColor: isEdTech ? 'rgba(2, 132, 199, 0.92)' : 'rgba(120, 53, 15, 0.92)',
              color: '#ffffff',
              border: `1.5px solid ${isEdTech ? '#38bdf8' : '#f59e0b'}`,
              boxShadow: `0 12px 36px ${isEdTech ? 'rgba(2, 132, 199, 0.5)' : 'rgba(180, 83, 9, 0.5)'}`,
              backdropFilter: 'blur(12px)',
              pointerEvents: 'auto',
            }}
          >
            <Box sx={{ fontSize: '20px' }}>
              {isEdTech ? '🚀' : '📜'}
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '13px', lineHeight: 1.2 }}>
                {isEdTech ? 'Smart EdTech Classroom (2026) Activated' : 'Traditional Slate Classroom (1980s) Activated'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '11px' }}>
                {isEdTech
                  ? '4K Digital Screen • Connected Student Tablets • 100% Broadcast Audio'
                  : 'Slate Blackboard • Paper Notebooks • Distance Acoustic Drop-off'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={clearEraNotification} sx={{ color: '#ffffff', ml: 1, p: 0.4 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </AnimatePresence>

      {/* 2. Floating A/B Contrast Card (Docked on Upper Left) */}
      <Box
        sx={{
          position: 'absolute',
          top: 80,
          left: 20,
          zIndex: 25,
          maxWidth: isExpanded ? 380 : 210,
          transition: 'all 0.25s ease',
          userSelect: 'none',
        }}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            border: `1.5px solid ${isEdTech ? 'rgba(56, 189, 248, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            borderRadius: '14px',
            p: 1.5,
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Header Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '7px',
                  backgroundColor: isEdTech ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isEdTech ? '#38bdf8' : '#fbbf24',
                }}
              >
                <ContrastIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '12px', color: '#f8fafc' }}>
                A/B Contrast
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip
                label={isEdTech ? 'EdTech' : 'Traditional'}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '10px',
                  fontWeight: 800,
                  backgroundColor: isEdTech ? '#0284c7' : '#b45309',
                  color: '#ffffff',
                }}
              />
              <IconButton size="small" onClick={() => setIsExpanded(!isExpanded)} sx={{ color: '#94a3b8', p: 0.3 }}>
                {isExpanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Box>

          {/* Quick Toggle Action Button */}
          <Button
            fullWidth
            size="small"
            variant="contained"
            onClick={toggleClassroomEra}
            startIcon={isEdTech ? <TraditionalIcon fontSize="small" /> : <EdTechIcon fontSize="small" />}
            sx={{
              mt: 1.2,
              py: 0.6,
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'none',
              background: isEdTech
                ? 'linear-gradient(135deg, #b45309 0%, #78350f 100%)'
                : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              boxShadow: isEdTech ? '0 4px 12px rgba(180, 83, 9, 0.3)' : '0 4px 12px rgba(2, 132, 199, 0.4)',
              '&:hover': {
                background: isEdTech ? '#92400e' : '#0369a1',
              },
            }}
          >
            {isEdTech ? 'Revert to Traditional [T]' : 'Upgrade to EdTech [T]'}
          </Button>

          {/* Expanded Pedagogical Comparison Matrix */}
          <Collapse in={isExpanded}>
            <Box sx={{ mt: 1.8, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              {/* Dimension 1: Audio Acoustics */}
              <ComparisonDimension
                icon={<AudioIcon sx={{ color: '#38bdf8', fontSize: 16 }} />}
                title="Acoustic Transmission"
                traditional={`${acousticAudibilityPercent}% clarity (decay at ${teacherAudioDistance}m)`}
                edtech="100% uniform digital broadcast stream"
                active={isEdTech}
              />

              {/* Dimension 2: Visual Legibility */}
              <ComparisonDimension
                icon={<VisionIcon sx={{ color: '#34d399', fontSize: 16 }} />}
                title="Sightline Legibility"
                traditional={blackboardLegibility}
                edtech="4K Smart Screen mirrored to desk tablets"
                active={isEdTech}
              />

              {/* Dimension 3: Formative Assessment */}
              <ComparisonDimension
                icon={<InteractionIcon sx={{ color: '#f59e0b', fontSize: 16 }} />}
                title="Participation Agency"
                traditional="1-at-a-time hand raising (85% passive)"
                edtech="100% synchronous anonymous polls (Mentimeter)"
                active={isEdTech}
              />

              {/* Dimension 4: Learning Analytics */}
              <ComparisonDimension
                icon={<AnalyticsIcon sx={{ color: '#c084fc', fontSize: 16 }} />}
                title="Learning Analytics"
                traditional="Delayed post-exam grading"
                edtech="Real-time desk attention & quiz telemetry"
                active={isEdTech}
              />

              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '9px', textAlign: 'center', mt: 0.5 }}>
                Press [T] to instantaneously toggle classroom era
              </Typography>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </>
  );
};

const ComparisonDimension = ({ icon, title, traditional, edtech, active }) => (
  <Box
    sx={{
      p: 1,
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.4 }}>
      {icon}
      <Typography variant="caption" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '11px' }}>
        {title}
      </Typography>
    </Box>

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, pl: 0.5 }}>
      <Typography
        variant="caption"
        sx={{
          fontSize: '10px',
          color: !active ? '#fbbf24' : '#64748b',
          fontWeight: !active ? 700 : 400,
        }}
      >
        📜 <b>Trad:</b> {traditional}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontSize: '10px',
          color: active ? '#38bdf8' : '#64748b',
          fontWeight: active ? 700 : 400,
        }}
      >
        💻 <b>EdTech:</b> {edtech}
      </Typography>
    </Box>
  </Box>
);
