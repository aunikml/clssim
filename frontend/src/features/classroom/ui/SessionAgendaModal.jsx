import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  School as CourseIcon,
  CheckCircle as ObjectiveIcon,
  Timer as TimerIcon,
  PlayArrow as StartIcon,
  AssignmentTurnedIn as PassIcon,
} from '@mui/icons-material';
import { useClassroomStore } from '../../../store/classroomStore';

export const SessionAgendaModal = () => {
  const isAgendaOpen = useClassroomStore((state) => state.isAgendaOpen);
  const closeAgenda = useClassroomStore((state) => state.closeAgenda);
  const userRole = useClassroomStore((state) => state.userRole);

  if (!isAgendaOpen) return null;

  return (
    <Dialog
      open={isAgendaOpen}
      onClose={closeAgenda}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
          backgroundImage: 'radial-gradient(ellipse at top, rgba(30, 58, 138, 0.3), transparent 70%)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <CourseIcon />
            </Box>
            <Box>
              <Typography variant="overline" sx={{ color: '#38bdf8', letterSpacing: 1.2, fontWeight: 700 }}>
                Course Session Agenda
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                Grade 8 Life Science: Human Circulatory System
              </Typography>
            </Box>
          </Box>
          <Chip
            label={userRole === 'teacher' ? 'Teacher Mode' : 'Student Mode'}
            size="small"
            sx={{
              backgroundColor: userRole === 'teacher' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
              color: userRole === 'teacher' ? '#fbbf24' : '#38bdf8',
              border: `1px solid ${userRole === 'teacher' ? '#f59e0b' : '#38bdf8'}`,
              fontWeight: 700,
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1.5 }}>
        {/* Topic Box */}
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            mb: 2.5,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>
            Grade 8 Science Module (5 Minutes Synchronized)
          </Typography>
          <Typography variant="body1" sx={{ color: '#f1f5f9', fontWeight: 700, mt: 0.5 }}>
            The 4 Heart Chambers, Valves & Double-Loop Circulation
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#38bdf8', fontSize: '12px' }}>
              <TimerIcon sx={{ fontSize: 16 }} />
              <span>4 Interactive Milestones</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981', fontSize: '12px' }}>
              <PassIcon sx={{ fontSize: 16 }} />
              <span>5-Question Exit Pop Quiz</span>
            </Box>
          </Box>
        </Box>

        {/* Role-Specific Mission Objectives */}
        <Typography variant="subtitle2" sx={{ color: '#cbd5e1', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ObjectiveIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
          <span>{userRole === 'teacher' ? 'Instructor Directives' : 'Student Learning Objectives'}</span>
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          {userRole === 'teacher' ? (
            <>
              <ObjectiveRow
                num="1"
                title="Deliver 4 Course Milestones"
                desc="Step through the vascular highway, 4 chambers, blood journey, and clinical assessment."
              />
              <ObjectiveRow
                num="2"
                title="Maintain Active Classroom Engagement"
                desc="Spot drowsy students, tap desks to refocus, and award academic praise (+5 pts) to enthusiastic respondents."
              />
              <ObjectiveRow
                num="3"
                title="Synchronize Pop Quiz Assessment"
                desc="Dispatch questions to student terminals and reveal clinical reasoning explanations."
              />
            </>
          ) : (
            <>
              <ObjectiveRow
                num="1"
                title="Claim Desk with Clear Sightlines"
                desc="Walk to an open desk and press [E] to sit. Aim for high chalkboard legibility (Rows 1-3)."
              />
              <ObjectiveRow
                num="2"
                title="Capture Key Clinical Notes"
                desc="Press [N] to open your binder during milestones. Record at least 3 clinical terms for your exit grade."
              />
              <ObjectiveRow
                num="3"
                title="Pass the 5-Question Exit Assessment"
                desc="Answer the synchronized pop quiz on your desk terminal with >= 80% accuracy to earn an 'A'."
              />
            </>
          )}
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          Shortcut: Press <kbd style={kbdStyle}>O</kbd> at any time to review agenda
        </Typography>
        <Button
          variant="contained"
          onClick={closeAgenda}
          startIcon={<StartIcon />}
          sx={{
            backgroundColor: '#0284c7',
            color: '#ffffff',
            fontWeight: 800,
            borderRadius: '10px',
            px: 2.5,
            py: 0.8,
            '&:hover': { backgroundColor: '#0369a1' },
          }}
        >
          Enter Class & Begin
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ObjectiveRow = ({ num, title, desc }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5,
      p: 1.2,
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
    }}
  >
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        color: '#38bdf8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 800,
        flexShrink: 0,
        mt: 0.2,
      }}
    >
      {num}
    </Box>
    <Box>
      <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '13px' }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>
        {desc}
      </Typography>
    </Box>
  </Box>
);

const kbdStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  padding: '1px 5px',
  borderRadius: '4px',
  color: '#94a3b8',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};
