import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SchoolIcon from '@mui/icons-material/School';
import { useClassroomStore } from '../../../store/classroomStore';

/**
 * Floating Live Dialogue Overlay for Student Side-Talk and Classroom Inquiries
 */
export const StudentInteractionOverlay = () => {
  const activeSideTalk = useClassroomStore((state) => state.activeSideTalk);
  const activeStudentInquiry = useClassroomStore((state) => state.activeStudentInquiry);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 76,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        pointerEvents: 'none',
        maxWidth: 620,
        width: '90vw',
      }}
    >
      {/* 1. Student Side-Talk Dialogue Bubble */}
      <AnimatePresence>
        {activeSideTalk && (
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            elevation={6}
            sx={{
              p: 2,
              borderRadius: '16px',
              backgroundColor: 'rgba(15, 23, 42, 0.96)',
              backdropFilter: 'blur(12px)',
              border: '2px solid rgba(245, 158, 11, 0.5)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatBubbleOutlineIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#f59e0b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Classroom Side Talk · Whispering with {activeSideTalk.neighborName}
                </Typography>
              </Box>
              <Chip
                label={activeSideTalk.topic}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              />
            </Box>

            {/* Student whispered line */}
            <Typography variant="body2" sx={{ color: '#f8fafc', fontStyle: 'italic', mb: 0.8 }}>
              <strong style={{ color: '#38bdf8' }}>You:</strong> &ldquo;{activeSideTalk.studentLine}&rdquo;
            </Typography>

            {/* Neighbor whispered response */}
            {(activeSideTalk.stage === 'neighbor' || activeSideTalk.stage === 'done') && (
              <Box sx={{ pl: 1.5, borderLeft: '2px solid #f59e0b', mt: 0.8 }}>
                <Typography variant="body2" sx={{ color: '#cbd5e1', fontStyle: 'italic' }}>
                  <strong style={{ color: '#fbbf24' }}>{activeSideTalk.neighborName}:</strong> &ldquo;{activeSideTalk.neighborLine}&rdquo;
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </AnimatePresence>

      {/* 2. Student Question / Teacher Response Inquiry Bubble */}
      <AnimatePresence>
        {activeStudentInquiry && (
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            elevation={6}
            sx={{
              p: 2,
              borderRadius: '16px',
              backgroundColor: 'rgba(15, 23, 42, 0.96)',
              backdropFilter: 'blur(12px)',
              border: '2px solid rgba(56, 189, 248, 0.6)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HelpOutlineIcon sx={{ color: '#38bdf8', fontSize: 20 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Student Question to Teacher John · Lecture Interrupted
                </Typography>
              </Box>
              <Chip
                label={activeStudentInquiry.topic}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '10px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              />
            </Box>

            {/* Student asked question */}
            <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 600, mb: 1 }}>
              <strong style={{ color: '#fbbf24' }}>You asked:</strong> &ldquo;{activeStudentInquiry.question}&rdquo;
            </Typography>

            {/* Teacher John Answer */}
            {(activeStudentInquiry.status === 'answering' || activeStudentInquiry.status === 'done') && (
              <Box sx={{ pl: 1.5, borderLeft: '3px solid #38bdf8', mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                  <SchoolIcon sx={{ color: '#38bdf8', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                    Teacher John:
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#e2e8f0', lineHeight: 1.45 }}>
                  &ldquo;{activeStudentInquiry.answer}&rdquo;
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </AnimatePresence>
    </Box>
  );
};
