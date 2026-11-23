import React, { useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DevicesIcon from '@mui/icons-material/Devices';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useClassroomStore } from '../../../store/classroomStore';
import { digitalScreenService } from '../../../services/digitalScreenService';
import { HEART_ANATOMY_QUIZ, lectureService } from '../../../services/lectureService';

/**
 * High-Definition Student Device Inspection Modal
 * Displays the student's connected tablet or laptop screen mirroring the
 * live 4K digital screen with pulsating heart anatomy, real-time ECG,
 * dynamic stage notes, and live assessment questions!
 */
export const StudentDeviceModal = () => {
  const isOpen = useClassroomStore((state) => state.isDeviceInspected);
  const onClose = useClassroomStore((state) => state.closeDeviceInspection);
  const seatedSeatId = useClassroomStore((state) => state.seatedSeatId);
  const lectureState = useClassroomStore((state) => state.lectureState);
  const lectureTopic = useClassroomStore((state) => state.lectureTopic);
  const currentQuizQuestionIndex = useClassroomStore((state) => state.currentQuizQuestionIndex);
  const quizFeedback = useClassroomStore((state) => state.quizFeedback);
  const activeStudentAnswer = useClassroomStore((state) => state.activeStudentAnswer);

  const canvasRef = useRef(null);

  // Mount live screen canvas
  useEffect(() => {
    if (!isOpen) return;

    let animFrame = null;
    const renderLoop = () => {
      const canvas = canvasRef.current;
      const src = digitalScreenService.canvas;
      if (canvas && src) {
        // Actively drive render on digitalScreenService to keep both digital board and device in 100% sync
        const store = useClassroomStore.getState();
        digitalScreenService.render(
          null,
          store.lectureTimer,
          store.lectureTranscript,
          store.lectureState,
          store.currentQuizQuestionIndex,
          store.quizFeedback
        );

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
      }
      animFrame = requestAnimationFrame(renderLoop);
    };

    animFrame = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isOpen]);

  const currentQ = HEART_ANATOMY_QUIZ[currentQuizQuestionIndex];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#090d16',
          color: '#f8fafc',
          borderRadius: 4,
          border: '2px solid rgba(56, 189, 248, 0.4)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
          py: 1.2,
          px: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <DevicesIcon sx={{ color: '#38bdf8' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc' }}>
            Desk Device Inspection · {seatedSeatId ? `Seat ${seatedSeatId}` : 'Student Device'}
          </Typography>
          <Chip
            label="Digital Sync: Live 4K Mirror"
            size="small"
            sx={{
              height: 22,
              fontSize: '11px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
            }}
          />
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, backgroundColor: '#090d16' }}>
        {/* Device Bezel Container */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: '16px',
            backgroundColor: '#1e293b',
            border: '8px solid #0f172a',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)',
          }}
        >
          {/* Mirrored Digital Screen Viewport */}
          <Box
            sx={{
              width: '100%',
              height: 380,
              backgroundColor: '#020617',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <canvas
              ref={canvasRef}
              width={1920}
              height={800}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                borderRadius: '8px',
              }}
            />
          </Box>

          {/* Interactive Question Overlay if in Q&A State */}
          {lectureState === 'qa' && currentQ && (
            <Box
              sx={{
                mt: 1.5,
                p: 2,
                borderRadius: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                  Assessment Question {currentQuizQuestionIndex + 1} of {HEART_ANATOMY_QUIZ.length}
                </Typography>
                {(activeStudentAnswer?.studentName || currentQ.studentName) && (
                  <Chip
                    label={`Respondent: ${activeStudentAnswer?.studentName || currentQ.studentName} (${activeStudentAnswer?.seatId || currentQ.studentSeat})`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '11px',
                      backgroundColor: 'rgba(250, 204, 21, 0.15)',
                      color: '#facc15',
                      border: '1px solid rgba(250, 204, 21, 0.35)',
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>

              <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 700, mt: 0.5, mb: 1.5 }}>
                {currentQ.question}
              </Typography>

              {/* Multiple Choice Options (Q1, Q2, Q3) */}
              {currentQ.options && currentQ.options.length > 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {currentQ.options.map((opt, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      size="small"
                      onClick={() => lectureService.submitAnswer(currentQuizQuestionIndex, idx)}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        borderColor: 'rgba(56, 189, 248, 0.25)',
                        color: '#e2e8f0',
                        fontSize: '11px',
                        textTransform: 'none',
                        py: 0.8,
                        '&:hover': {
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          borderColor: '#38bdf8',
                        },
                      }}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </Button>
                  ))}
                </Box>
              )}

              {/* Open-Ended Clinical Inquiry (Q4) */}
              {currentQ.type === 'open_ended' && (
                <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: 'rgba(6, 78, 59, 0.3)', border: '1px solid #10b981' }}>
                  <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800 }}>
                    CLINICAL REASONING SUBMISSION:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#f8fafc', fontStyle: 'italic', mt: 0.5 }}>
                    &ldquo;{activeStudentAnswer?.answerText || currentQ.studentAnswerText || currentQ.sampleAnswer}&rdquo;
                  </Typography>
                </Box>
              )}

              {/* Dynamic Hemodynamics Graph Builder (Q5) */}
              {currentQ.type === 'graph_builder' && (
                <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: 'rgba(2, 132, 199, 0.2)', border: '1px solid #38bdf8' }}>
                  <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800 }}>
                    DYNAMIC HEMODYNAMICS PLOTTER:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#f8fafc', fontStyle: 'italic', mt: 0.5 }}>
                    &ldquo;{activeStudentAnswer?.answerText || currentQ.studentAnswerText || currentQ.sampleAnswer}&rdquo;
                  </Typography>
                </Box>
              )}

              {quizFeedback && (
                <Box sx={{ mt: 1.2, p: 1, borderRadius: '8px', backgroundColor: quizFeedback.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
                  <Typography variant="caption" sx={{ color: quizFeedback.isCorrect ? '#34d399' : '#f87171', fontWeight: 700 }}>
                    {quizFeedback.explanation}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Footer device info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, px: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Current Topic: <strong style={{ color: '#38bdf8' }}>{lectureTopic || 'Cardiology Masterclass'}</strong>
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Press <strong style={{ color: '#cbd5e1' }}>Esc</strong> to exit device inspection
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
