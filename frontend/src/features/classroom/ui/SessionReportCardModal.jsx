import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as GradeIcon,
  MenuBook as NotesIcon,
  Quiz as QuizIcon,
  Hearing as AudioIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useClassroomStore } from '../../../store/classroomStore';

export const SessionReportCardModal = () => {
  const isReportCardOpen = useClassroomStore((state) => state.isReportCardOpen);
  const closeReportCard = useClassroomStore((state) => state.closeReportCard);
  const userRole = useClassroomStore((state) => state.userRole);
  const isSeated = useClassroomStore((state) => state.isSeated);
  const seatedSeatId = useClassroomStore((state) => state.seatedSeatId);
  const acousticAudibilityPercent = useClassroomStore((state) => state.acousticAudibilityPercent);
  const teacherPraiseScore = useClassroomStore((state) => state.teacherPraiseScore);
  const sessionStats = useClassroomStore((state) => state.sessionStats);

  if (!isReportCardOpen) return null;

  // Compute calculated grade
  const quizPct = Math.round((sessionStats.quizScore / Math.max(1, sessionStats.totalQuestions)) * 100);
  const notesCount = Math.max(1, sessionStats.notesCount);
  const seatScore = isSeated ? 100 : 50;
  const overallAvg = Math.round((quizPct * 0.5) + (Math.min(100, notesCount * 33) * 0.25) + (seatScore * 0.25));

  const letterGrade =
    overallAvg >= 92 ? 'A' :
    overallAvg >= 84 ? 'A-' :
    overallAvg >= 75 ? 'B+' :
    overallAvg >= 65 ? 'B' : 'C+';

  const gradeColor =
    letterGrade.startsWith('A') ? '#10b981' :
    letterGrade.startsWith('B') ? '#38bdf8' : '#f59e0b';

  const handleDownloadNotes = () => {
    const text = `BIOL-301: Cardiovascular Physiology - Session Notes\n\nGrade: ${letterGrade} (${overallAvg}%)\nSeat: ${seatedSeatId || 'Front Row'}\nAcoustic Audibility: ${acousticAudibilityPercent}%\nQuiz Score: ${sessionStats.quizScore}/${sessionStats.totalQuestions}\n\nKey Concepts:\n1. 4 Chambers: Left/Right Atria, Left/Right Ventricles\n2. Dual Circulation: Pulmonary Loop (Lungs) & Systemic Loop (Body)\n3. Heart Valves: Tricuspid, Mitral/Bicuspid, Aortic, Pulmonary Semilunar\n4. Myocardium: Cardiac muscle tissue ensuring rhythmic contraction.`;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'Cardiovascular_Physiology_Study_Notes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Dialog
      open={isReportCardOpen}
      onClose={closeReportCard}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#0b1120',
          color: '#f8fafc',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
          backgroundImage: 'radial-gradient(ellipse at top right, rgba(16, 185, 129, 0.15), transparent 70%)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <GradeIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="overline" sx={{ color: '#10b981', letterSpacing: 1.2, fontWeight: 700 }}>
                Pedagogical Assessment
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                Academic Report Card
              </Typography>
            </Box>
          </Box>

          {/* Letter Grade Stamp */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 54,
              height: 54,
              borderRadius: '12px',
              backgroundColor: `${gradeColor}20`,
              border: `2px solid ${gradeColor}`,
              boxShadow: `0 0 16px ${gradeColor}40`,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, color: gradeColor, lineHeight: 1 }}>
              {letterGrade}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8' }}>
              {overallAvg}%
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1.5 }}>
        {/* Course Banner */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: '10px',
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            mb: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Subject: BIOL-301 Cardiovascular Physiology
            </Typography>
            <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 700 }}>
              Module: Four Chambers, Heart Valves & Circulation
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700 }}>
            {userRole === 'teacher' ? 'Instructor Debrief' : 'Student Report'}
          </Typography>
        </Box>

        {/* 4 Metric Cards */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          <Grid item xs={6}>
            <MetricCard
              icon={<QuizIcon sx={{ color: '#38bdf8', fontSize: 18 }} />}
              label="Quiz Assessment"
              val={`${sessionStats.quizScore} / ${sessionStats.totalQuestions} Correct`}
              sub={`${quizPct}% accuracy`}
            />
          </Grid>
          <Grid item xs={6}>
            <MetricCard
              icon={<NotesIcon sx={{ color: '#34d399', fontSize: 18 }} />}
              label="Clinical Notes"
              val={`${notesCount} Key Terms`}
              sub="Saved in student binder"
            />
          </Grid>
          <Grid item xs={6}>
            <MetricCard
              icon={<AudioIcon sx={{ color: '#fde047', fontSize: 18 }} />}
              label="Acoustic Clarity"
              val={`${acousticAudibilityPercent}%`}
              sub={isSeated ? `Desk ${seatedSeatId || 'Front Row'}` : 'Standing in aisle'}
            />
          </Grid>
          <Grid item xs={6}>
            <MetricCard
              icon={<CheckIcon sx={{ color: '#c084fc', fontSize: 18 }} />}
              label={userRole === 'teacher' ? 'Classroom Praise' : 'Teacher Commendations'}
              val={`+${teacherPraiseScore} Points`}
              sub="Clinical engagement score"
            />
          </Grid>
        </Grid>

        {/* Qualitative Feedback */}
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
            Instructor Feedback & Pedagogical Summary
          </Typography>
          <Typography variant="body2" sx={{ color: '#cbd5e1', mt: 0.8, lineHeight: 1.5 }}>
            {letterGrade.startsWith('A')
              ? 'Exemplary performance! Demonstrated thorough mastery of the cardiovascular loop, active note-taking during diagram sketching, and confident engagement during the clinical pop quiz.'
              : 'Commendable effort. Solid grasp of four-chamber anatomy. Suggest reviewing the valve mechanics (tricuspid and bicuspid) and maintaining front-row sightlines for optimal acoustic clarity.'}
          </Typography>
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleDownloadNotes}
          startIcon={<DownloadIcon />}
          sx={{
            borderColor: 'rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            fontWeight: 700,
            borderRadius: '10px',
            '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.1)' },
          }}
        >
          Download Notes
        </Button>
        <Button
          variant="contained"
          onClick={closeReportCard}
          sx={{
            backgroundColor: '#10b981',
            color: '#ffffff',
            fontWeight: 800,
            borderRadius: '10px',
            px: 2.5,
            '&:hover': { backgroundColor: '#059669' },
          }}
        >
          Close Report Card
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MetricCard = ({ icon, label, val, sub }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.07)',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      {icon}
      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ color: '#f8fafc', fontWeight: 800 }}>
      {val}
    </Typography>
    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '10px', display: 'block' }}>
      {sub}
    </Typography>
  </Box>
);
