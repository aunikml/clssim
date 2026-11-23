import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  RecordVoiceOver as VoiceIcon,
  CheckCircle as CheckIcon,
  HelpOutline as QuestionIcon,
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassroomStore } from '../../../store/classroomStore';
import { lectureService, HEART_ANATOMY_QUIZ } from '../../../services/lectureService';

/**
 * Streamlined Pedagogical HUD
 * Designed for pure observation:
 * - Countdown banner is compact and dismissible
 * - Live lecture captions appear in an unobtrusive top pill
 * - Q&A assessment worksheet floats gracefully at bottom-right, leaving front chalkboard and student hand-raising fully in view
 */
export const TeacherLectureHUD = () => {
  const lectureState = useClassroomStore((state) => state.lectureState);
  const lectureCountdown = useClassroomStore((state) => state.lectureCountdown);
  const lectureTimer = useClassroomStore((state) => state.lectureTimer);
  const lectureTranscript = useClassroomStore((state) => state.lectureTranscript);
  const lectureTopic = useClassroomStore((state) => state.lectureTopic);
  const currentQuizQuestionIndex = useClassroomStore((state) => state.currentQuizQuestionIndex);
  const quizFeedback = useClassroomStore((state) => state.quizFeedback);
  const activeStudentAnswer = useClassroomStore((state) => state.activeStudentAnswer);
  const userRole = useClassroomStore((state) => state.userRole);
  const setCameraMode = useClassroomStore((state) => state.setCameraMode);

  const [selectedOption, setSelectedOption] = useState(null);

  if (lectureState === 'idle') return null;

  const currentQ = HEART_ANATOMY_QUIZ[currentQuizQuestionIndex];

  const handleOptionChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSelectedOption(val);
    lectureService.submitAnswer(currentQuizQuestionIndex, val);
  };

  const handleNext = () => {
    setSelectedOption(null);
    lectureService.nextQuestion();
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AnimatePresence>
      {/* 1. Pre-Lecture 20s Countdown Banner (Top Left - Non-Intrusive) */}
      {lectureState === 'countdown' && (
        <Box
          sx={{
            position: 'absolute',
            top: 72,
            left: { xs: 16, sm: 24 },
            zIndex: 30,
            width: { xs: 'calc(100% - 32px)', sm: '500px', md: '540px' },
            pointerEvents: 'none',
          }}
        >
          <Paper
            component={motion.div}
            initial={{ y: -25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -25, opacity: 0 }}
            elevation={6}
            sx={{
              p: 1.8,
              borderRadius: '14px',
              backgroundColor: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(16px)',
              border: '2px solid #f59e0b',
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              pointerEvents: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  boxShadow: '0 0 16px rgba(245, 158, 11, 0.5)',
                }}
              >
                {lectureCountdown}s
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#ffffff', lineHeight: 1.2 }}>
                  Class Starts in {lectureCountdown} Seconds...
                </Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '11px' }}>
                  Students, please take your seats! Teacher John will begin the 5-minute lecture on Cardiovascular System & Heart Anatomy.
                </Typography>
              </Box>
            </Box>

            {userRole === 'teacher' && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PlayIcon />}
                onClick={() => lectureService.startLecture()}
                sx={{
                  backgroundColor: '#f59e0b',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': { backgroundColor: '#d97706' },
                }}
              >
                Start Now
              </Button>
            )}
          </Paper>
        </Box>
      )}

      {/* 2. Live Lecture Streamlined Caption Bar (Top Left - Non-Intrusive) */}
      {lectureState === 'lecturing' && (
        <Box
          sx={{
            position: 'absolute',
            top: 72,
            left: { xs: 16, sm: 24 },
            zIndex: 30,
            width: { xs: 'calc(100% - 32px)', sm: '500px', md: '540px' },
            pointerEvents: 'none',
          }}
        >
          <Paper
            component={motion.div}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            elevation={6}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'auto',
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VoiceIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
                <Typography variant="caption" fontWeight={800} sx={{ color: '#ffffff', letterSpacing: '0.02em' }}>
                  TEACHER JOHN · HEART ANATOMY
                </Typography>
                <Chip
                  label={lectureTopic || 'Gross Anatomy'}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '10px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimeIcon sx={{ color: '#94a3b8', fontSize: 14 }} />
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 700, fontSize: '11px' }}>
                  {formatTimer(lectureTimer)} / 5:00
                </Typography>
              </Box>
            </Box>

            {/* Progress Bar */}
            <LinearProgress
              variant="determinate"
              value={Math.min((lectureTimer / 300) * 100, 100)}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                mb: 1,
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #38bdf8 0%, #34d399 100%)',
                },
              }}
            />

            {/* Captions Text */}
            <Typography variant="body2" sx={{ color: '#f8fafc', fontStyle: 'italic', fontSize: '12px', lineHeight: 1.4 }}>
              "{lectureTranscript}"
            </Typography>
          </Paper>
        </Box>
      )}

      {/* 3. Interactive Class Assessment Worksheet (Lower-Right Floating Card) */}
      {lectureState === 'qa' && currentQ && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 78,
            right: 20,
            zIndex: 30,
            width: { xs: '92%', sm: '420px' },
            pointerEvents: 'none',
          }}
        >
          <Paper
            component={motion.div}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            elevation={10}
            sx={{
              p: 2,
              borderRadius: '14px',
              backgroundColor: '#fffbeb', // Light test parchment
              color: '#1e293b',
              border: '3px solid #b45309',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65)',
              pointerEvents: 'auto',
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pb: 0.8, borderBottom: '2px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <QuestionIcon sx={{ color: '#b45309', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#78350f' }}>
                  Assessment Worksheet ({currentQuizQuestionIndex + 1}/{HEART_ANATOMY_QUIZ.length})
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ViewIcon sx={{ fontSize: 14 }} />}
                onClick={() => setCameraMode('board')}
                sx={{
                  borderColor: '#b45309',
                  color: '#92400e',
                  fontSize: '11px',
                  py: 0.2,
                  px: 0.8,
                  textTransform: 'none',
                }}
              >
                Board [3]
              </Button>
            </Box>

            {/* Student Respondent Banner */}
            {(activeStudentAnswer?.studentName || currentQ.studentName) && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  mb: 1.2,
                  p: 0.8,
                  borderRadius: '8px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                }}
              >
                <Chip
                  label="Student Respondent"
                  size="small"
                  sx={{ height: 18, fontSize: '9px', fontWeight: 800, backgroundColor: '#d97706', color: '#ffffff' }}
                />
                <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 700, fontSize: '11px' }}>
                  {activeStudentAnswer?.studentName || currentQ.studentName} ({activeStudentAnswer?.seatId || currentQ.studentSeat})
                </Typography>
              </Box>
            )}

            <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 700, mb: 1.5, fontSize: '13px' }}>
              {currentQ.question}
            </Typography>

            {/* Multiple Choice Options (Q1, Q2, Q3) */}
            {currentQ.options && (
              <RadioGroup value={selectedOption !== null ? selectedOption : ''} onChange={handleOptionChange}>
                {currentQ.options.map((opt, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={idx}
                    control={<Radio size="small" sx={{ color: '#78350f', '&.Mui-checked': { color: '#047857' }, py: 0.4 }} />}
                    label={<Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500, fontSize: '12px' }}>{opt}</Typography>}
                    sx={{
                      mb: 0.6,
                      px: 1,
                      py: 0.2,
                      borderRadius: '8px',
                      backgroundColor: selectedOption === idx ? '#dcfce7' : '#ffffff',
                      border: selectedOption === idx ? '2px solid #16a34a' : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease',
                      m: 0,
                      width: '100%',
                    }}
                  />
                ))}
              </RadioGroup>
            )}

            {/* Open-Ended Question UI (Q4) */}
            {currentQ.type === 'open_ended' && (
              <Box sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #059669',
                    mb: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block', mb: 0.4 }}>
                    Liam Patel's Clinical Reasoning Submission:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '11.5px', lineHeight: 1.4 }}>
                    "{activeStudentAnswer?.answerText || currentQ.studentAnswerText || currentQ.sampleAnswer}"
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  onClick={() => lectureService.submitAnswer(currentQuizQuestionIndex, 0, currentQ.studentAnswerText)}
                  sx={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '11px',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#047857' },
                  }}
                >
                  Confirm & Grade Liam's Clinical Answer
                </Button>
              </Box>
            )}

            {/* Graph Builder Question UI (Q5) */}
            {currentQ.type === 'graph_builder' && (
              <Box sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #0284c7',
                    mb: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700, display: 'block', mb: 0.4 }}>
                    Ethan Vance's Vascular Gradient Plot:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '11.5px', lineHeight: 1.4, mb: 0.8 }}>
                    Aorta (120/80) ➔ Arteries (115/75) ➔ <strong style={{ color: '#dc2626' }}>Arterioles (85➔35 mmHg, ★ 60% TPR Drop)</strong> ➔ Capillaries (35➔15) ➔ Veins (4 mmHg)
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  onClick={() => lectureService.submitAnswer(currentQuizQuestionIndex, 0)}
                  sx={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '11px',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#0369a1' },
                  }}
                >
                  Plot Hemodynamic Curve on Digital Board
                </Button>
              </Box>
            )}

            {/* Answer Feedback Banner */}
            {quizFeedback && (
              <Box sx={{ mt: 1.5 }}>
                <Alert
                  severity={quizFeedback.isCorrect ? 'success' : 'warning'}
                  sx={{ borderRadius: '8px', py: 0.2, fontSize: '12px' }}
                >
                  {quizFeedback.text}
                </Alert>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleNext}
                    sx={{ backgroundColor: '#10b981', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'none' }}
                  >
                    {currentQuizQuestionIndex + 1 < HEART_ANATOMY_QUIZ.length ? 'Next Question ➔' : 'Finish Practicum 🎉'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* 4. Practicum Completed Banner (Top Center) */}
      {lectureState === 'completed' && (
        <Box
          sx={{
            position: 'absolute',
            top: 75,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            width: { xs: '92%', md: '520px' },
            pointerEvents: 'none',
          }}
        >
          <Paper
            component={motion.div}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            elevation={6}
            sx={{
              p: 2.5,
              borderRadius: '14px',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '2px solid #10b981',
              textAlign: 'center',
              pointerEvents: 'auto',
            }}
          >
            <CheckIcon sx={{ color: '#10b981', fontSize: 40, mb: 0.5 }} />
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#ffffff' }}>
              Grade 8 Circulatory System Lesson Completed!
            </Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1', mt: 0.5, mb: 1.5, fontSize: '12px' }}>
              Great job! You completed the 5-minute masterclass on Cardiovascular System & Anatomy of the Human Heart and tested student understanding.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => lectureService.startCountdown()}
                sx={{ borderColor: '#10b981', color: '#34d399', fontSize: '11px' }}
              >
                Replay Lecture
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => useClassroomStore.getState().setLectureState('idle')}
                sx={{ backgroundColor: '#2563eb', fontSize: '11px' }}
              >
                Return to Classroom
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </AnimatePresence>
  );
};
export default TeacherLectureHUD;
