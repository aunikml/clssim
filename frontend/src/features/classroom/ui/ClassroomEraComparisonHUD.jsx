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
  HistoryEdu as TraditionalIcon,
  Smartphone as LowTechIcon,
  Computer as HighTechIcon,
  AttachMoney as MoneyIcon,
  WifiOff as OfflineIcon,
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

  const isHighRes = classroomEra === 'high_resource' || classroomEra === 'edtech';
  const isLowRes = classroomEra === 'low_resource';
  const isTrad = classroomEra === 'traditional';

  const getEraTheme = () => {
    if (isHighRes) {
      return {
        name: 'High-Resource 2026',
        chipBg: '#0284c7',
        border: 'rgba(56, 189, 248, 0.4)',
        glow: 'rgba(2, 132, 199, 0.5)',
        toastBg: 'rgba(2, 132, 199, 0.94)',
        icon: '🚀',
      };
    }
    if (isLowRes) {
      return {
        name: 'Low-Resource Tech',
        chipBg: '#0d9488',
        border: 'rgba(45, 212, 191, 0.4)',
        glow: 'rgba(13, 148, 136, 0.5)',
        toastBg: 'rgba(13, 148, 136, 0.94)',
        icon: '📱',
      };
    }
    return {
      name: 'Traditional 1980s',
      chipBg: '#b45309',
      border: 'rgba(245, 158, 11, 0.4)',
      glow: 'rgba(180, 83, 9, 0.5)',
      toastBg: 'rgba(120, 53, 15, 0.94)',
      icon: '📜',
    };
  };

  const theme = getEraTheme();

  const getNextEraLabel = () => {
    if (isTrad) return 'Step 2: Low-Resource Tech [T]';
    if (isLowRes) return 'Step 3: High-Resource 2026 [T]';
    return 'Reset to Traditional [T]';
  };

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
              top: 72,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 35,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2.5,
              py: 1.2,
              borderRadius: '14px',
              backgroundColor: theme.toastBg,
              color: '#ffffff',
              border: `1.5px solid ${isHighRes ? '#38bdf8' : isLowRes ? '#2dd4bf' : '#f59e0b'}`,
              boxShadow: `0 12px 36px ${theme.glow}`,
              backdropFilter: 'blur(12px)',
              pointerEvents: 'auto',
            }}
          >
            <Box sx={{ fontSize: '20px' }}>{theme.icon}</Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '13px', lineHeight: 1.2 }}>
                {isHighRes
                  ? 'High-Resource EdTech (2026) Active'
                  : isLowRes
                  ? 'Low-Resource Frugal Tech Active'
                  : 'Traditional Slate (1980s) Active'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px' }}>
                {isHighRes
                  ? '4K Digital Screen • 1-to-1 Student Tablets • Cloud Synchronous Telemetry'
                  : isLowRes
                  ? '1 Budget Projector • Plickers Paper Cards • Shared BYOD Phones (Zero Student Wi-Fi)'
                  : 'Slate Blackboard • Paper Notebooks • Physical Acoustic Drop-off'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={clearEraNotification} sx={{ color: '#ffffff', ml: 1, p: 0.4 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </AnimatePresence>

      {/* 2. Floating 3-Tier Contrast Card (Docked on Upper Left) */}
      <Box
        sx={{
          position: 'absolute',
          top: 76,
          left: 18,
          zIndex: 25,
          maxWidth: isExpanded ? 420 : 220,
          transition: 'all 0.25s ease',
          userSelect: 'none',
        }}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            border: `1.5px solid ${theme.border}`,
            borderRadius: '14px',
            p: 1.5,
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.75)',
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
                  backgroundColor: isHighRes
                    ? 'rgba(56, 189, 248, 0.2)'
                    : isLowRes
                    ? 'rgba(45, 212, 191, 0.2)'
                    : 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isHighRes ? '#38bdf8' : isLowRes ? '#2dd4bf' : '#fbbf24',
                }}
              >
                <ContrastIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '12px', color: '#f8fafc' }}>
                EdTech Spectrum
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip
                label={theme.name}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '9.5px',
                  fontWeight: 800,
                  backgroundColor: theme.chipBg,
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
            startIcon={
              isTrad ? <LowTechIcon fontSize="small" /> : isLowRes ? <HighTechIcon fontSize="small" /> : <TraditionalIcon fontSize="small" />
            }
            sx={{
              mt: 1.2,
              py: 0.55,
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'none',
              background: isTrad
                ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
                : isLowRes
                ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
              color: '#ffffff',
              boxShadow: `0 4px 12px ${theme.glow}`,
              '&:hover': {
                filter: 'brightness(1.1)',
              },
            }}
          >
            {getNextEraLabel()}
          </Button>

          {/* Expanded Pedagogical Comparison Matrix */}
          <Collapse in={isExpanded}>
            <Box sx={{ mt: 1.8, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              {/* Dimension 1: Hardware & Setup Cost */}
              <SpectrumDimension
                icon={<MoneyIcon sx={{ color: '#34d399', fontSize: 16 }} />}
                title="Equipment & Student Cost"
                traditional="~$0 (Paper & chalk)"
                lowRes="~$0 for students (Paper Plickers cards + 1 budget projector)"
                highRes="~$18,000+ (40 Individual tablets + 85-inch 4K screen)"
                currentEra={classroomEra}
              />

              {/* Dimension 2: Internet & Infrastructure */}
              <SpectrumDimension
                icon={<OfflineIcon sx={{ color: '#38bdf8', fontSize: 16 }} />}
                title="Internet & Infrastructure Need"
                traditional="None (Pure analog)"
                lowRes="100% Offline / Zero student Wi-Fi needed (Teacher smartphone only)"
                highRes="Requires high-speed gigabit Wi-Fi & school cloud servers"
                currentEra={classroomEra}
              />

              {/* Dimension 3: Formative Assessment Agency */}
              <SpectrumDimension
                icon={<InteractionIcon sx={{ color: '#f59e0b', fontSize: 16 }} />}
                title="Student Participation Agency"
                traditional="1-at-a-time hand raising (85% passive students)"
                lowRes="78% Active (Plickers card scan tallies all 20-40 desks in 3s)"
                highRes="88% Active (1-to-1 interactive touch quizzes & live feedback)"
                currentEra={classroomEra}
              />

              {/* Dimension 4: Visual Sightline Legibility */}
              <SpectrumDimension
                icon={<VisionIcon sx={{ color: '#c084fc', fontSize: 16 }} />}
                title="Visual Sightlines"
                traditional={blackboardLegibility}
                lowRes="Readable 1080p pull-down canvas screen (One-screen classroom)"
                highRes="4K Ultra-HD Smart Display mirrored onto every student tablet"
                currentEra={classroomEra}
              />

              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '9px', textAlign: 'center', mt: 0.5 }}>
                Press [T] to cycle: Traditional ➔ Low-Resource ➔ High-Resource
              </Typography>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </>
  );
};

const SpectrumDimension = ({ icon, title, traditional, lowRes, highRes, currentEra }) => {
  const isTrad = currentEra === 'traditional';
  const isLow = currentEra === 'low_resource';
  const isHigh = currentEra === 'high_resource' || currentEra === 'edtech';

  return (
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
            fontSize: '9.5px',
            color: isTrad ? '#fbbf24' : '#64748b',
            fontWeight: isTrad ? 700 : 400,
          }}
        >
          📜 <b>Trad:</b> {traditional}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: '9.5px',
            color: isLow ? '#2dd4bf' : '#64748b',
            fontWeight: isLow ? 700 : 400,
          }}
        >
          📱 <b>Low-Tech:</b> {lowRes}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: '9.5px',
            color: isHigh ? '#38bdf8' : '#64748b',
            fontWeight: isHigh ? 700 : 400,
          }}
        >
          💻 <b>High-Tech:</b> {highRes}
        </Typography>
      </Box>
    </Box>
  );
};
