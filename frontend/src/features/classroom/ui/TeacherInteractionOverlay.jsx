import React from 'react';
import { Box, Paper, Typography, Chip, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import StarIcon from '@mui/icons-material/Star';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PanToolIcon from '@mui/icons-material/PanTool';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { useClassroomStore } from '../../../store/classroomStore';
import { teacherInteractionService } from '../../../services/teacherInteractionService';

/**
 * Teacher Mode Live Interactive Overlay:
 * - Cold-Calling Student Dialogue Dialogue Bubble
 * - Real-Time Disruption Alert & Quick Redirection Action
 * - Praise & Academic Merit Award Banners
 */
export const TeacherInteractionOverlay = () => {
  const userRole = useClassroomStore((state) => state.userRole);
  const activeTeacherCall = useClassroomStore((state) => state.activeTeacherCall);
  const activeTeacherDiscipline = useClassroomStore((state) => state.activeTeacherDiscipline);
  const activeDisruptionEvent = useClassroomStore((state) => state.activeDisruptionEvent);
  const teacherPraiseScore = useClassroomStore((state) => state.teacherPraiseScore);

  // Strictly only visible when in Teacher Mode
  if (userRole !== 'teacher') return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 76,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 26,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        pointerEvents: 'none',
        maxWidth: 640,
        width: '92vw',
      }}
    >
      {/* 1. Student Cold-Call Dialog Bubble */}
      <AnimatePresence>
        {activeTeacherCall && (
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            elevation={8}
            sx={{
              p: 2,
              borderRadius: '16px',
              backgroundColor: 'rgba(15, 23, 42, 0.96)',
              backdropFilter: 'blur(16px)',
              border: '2px solid rgba(16, 185, 129, 0.6)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
              width: '100%',
              pointerEvents: 'auto',
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon sx={{ color: '#10b981', fontSize: 20 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Calling on Student · {activeTeacherCall.studentName} ({activeTeacherCall.seatId})
                </Typography>
              </Box>
              <Chip
                label={activeTeacherCall.topic}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  fontWeight: 700,
                }}
              />
            </Box>

            {/* Teacher Question Prompt */}
            <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 600, mb: 1 }}>
              <strong style={{ color: '#38bdf8' }}>Teacher John:</strong> &ldquo;{activeTeacherCall.teacherPrompt}&rdquo;
            </Typography>

            {/* Student Answer */}
            {(activeTeacherCall.status === 'student_answering' ||
              activeTeacherCall.status === 'teacher_praising' ||
              activeTeacherCall.status === 'done') && (
              <Box sx={{ pl: 1.5, borderLeft: '3px solid #10b981', mt: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                  <RecordVoiceOverIcon sx={{ color: '#fbbf24', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#fbbf24' }}>
                    {activeTeacherCall.studentName}:
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#f1f5f9', fontStyle: 'italic', lineHeight: 1.45 }}>
                  &ldquo;{activeTeacherCall.studentAnswer}&rdquo;
                </Typography>
              </Box>
            )}

            {/* Teacher Praise / Commendation */}
            {(activeTeacherCall.status === 'teacher_praising' || activeTeacherCall.status === 'done') && (
              <Box sx={{ pl: 1.5, borderLeft: '3px solid #facc15', mt: 1, backgroundColor: 'rgba(250, 204, 21, 0.08)', p: 1, borderRadius: '6px' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#facc15', display: 'block', mb: 0.3 }}>
                  Teacher Feedback:
                </Typography>
                <Typography variant="body2" sx={{ color: '#fef08a', fontWeight: 600 }}>
                  &ldquo;{activeTeacherCall.teacherFeedback}&rdquo;
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </AnimatePresence>

      {/* 2. Disruption Alert Banner (When a student triggers a disruption) */}
      <AnimatePresence>
        {activeDisruptionEvent && (
          <Paper
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -15 }}
            elevation={6}
            sx={{
              p: 1.4,
              px: 2,
              borderRadius: '12px',
              backgroundColor: 'rgba(127, 29, 29, 0.94)',
              border: '2px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              width: '100%',
              pointerEvents: 'auto',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <WarningAmberIcon sx={{ color: '#fca5a5' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#fca5a5', fontWeight: 800, textTransform: 'uppercase' }}>
                  Classroom Distraction Detected
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 700 }}>
                  Subtle distraction: {activeDisruptionEvent.replace('_', ' ')}
                </Typography>
              </Box>
            </Box>
            <Button
              size="small"
              variant="contained"
              startIcon={<TouchAppIcon />}
              onClick={() => teacherInteractionService.issueVerbalReminder()}
              sx={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '11px',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#dc2626' },
              }}
            >
              Refocus Class
            </Button>
          </Paper>
        )}
      </AnimatePresence>

      {/* 3. Discipline / Desk Tap / Praise Confirmation Toast */}
      <AnimatePresence>
        {activeTeacherDiscipline && (
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            sx={{
              p: 1.2,
              px: 2,
              borderRadius: '10px',
              backgroundColor:
                activeTeacherDiscipline.type === 'praise'
                  ? 'rgba(16, 185, 129, 0.95)'
                  : 'rgba(15, 23, 42, 0.95)',
              border:
                activeTeacherDiscipline.type === 'praise'
                  ? '1.5px solid #34d399'
                  : '1.5px solid #f59e0b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              pointerEvents: 'auto',
            }}
          >
            {activeTeacherDiscipline.type === 'praise' ? (
              <StarIcon sx={{ color: '#fde047' }} />
            ) : (
              <PanToolIcon sx={{ color: '#f59e0b' }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '12px' }}>
              {activeTeacherDiscipline.text}
            </Typography>
            {activeTeacherDiscipline.type === 'praise' && (
              <Chip
                label={`Class Merit: ${teacherPraiseScore} pts`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '10px',
                  fontWeight: 800,
                  backgroundColor: '#fef08a',
                  color: '#854d0e',
                }}
              />
            )}
          </Paper>
        )}
      </AnimatePresence>
    </Box>
  );
};
