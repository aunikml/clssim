import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import {
  Close as CloseIcon,
  RotateRight as RotateIcon,
  QrCode2 as QrIcon,
  CameraAlt as CameraIcon,
  CheckCircle as CheckIcon,
  School as SchoolIcon,
  AttachMoney as MoneyIcon,
  WifiOff as OfflineIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useClassroomStore } from '../../../store/classroomStore';

export const PlickersScanModal = () => {
  const isOpen = useClassroomStore((state) => state.isPlickersModalOpen);
  const onClose = useClassroomStore((state) => state.closePlickersModal);
  const activeSeatId = useClassroomStore((state) => state.plickersActiveSeatId) || 'R1-S1';
  const cardOrientation = useClassroomStore((state) => state.plickersCardOrientation) || 'A';
  const rotateCard = useClassroomStore((state) => state.rotateCard || state.rotatePlickersCard);
  const setOrientation = useClassroomStore((state) => state.setPlickersCardOrientation);
  const classSize = useClassroomStore((state) => state.classSize) || 20;

  if (!isOpen) return null;

  const orientationDegrees = {
    A: 0,
    B: 90,
    C: 180,
    D: 270,
  };

  const currentDeg = orientationDegrees[cardOrientation] || 0;

  const choices = [
    { key: 'A', text: 'Left Ventricle (Pumps to head & toes)', count: 14, isCorrect: true },
    { key: 'B', text: 'Right Atrium (Receives used blood from body)', count: 3 },
    { key: 'C', text: 'Right Ventricle (Pumps short distance to lungs)', count: 2 },
    { key: 'D', text: 'Left Atrium (Receives fresh blood from lungs)', count: 1 },
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          borderRadius: '18px',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 1.5,
          pt: 2,
          px: 3,
          background: 'linear-gradient(90deg, rgba(2, 132, 199, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
            }}
          >
            <QrIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
              Plickers & Low-Resource Paper Scanner
            </Typography>
            <Typography variant="caption" sx={{ color: '#38bdf8', fontSize: '0.74rem' }}>
              Desk {activeSeatId} • Frugal Digital Assessment Bridge
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Core Pedagogical Benefits Banner */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 3,
            p: 1.5,
            borderRadius: '12px',
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Chip
            icon={<OfflineIcon sx={{ fontSize: 16 }} />}
            label="Zero Student Wi-Fi / Data Needed"
            size="small"
            sx={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}
          />
          <Chip
            icon={<MoneyIcon sx={{ fontSize: 16 }} />}
            label="Hardware Cost: ~$0 for Students"
            size="small"
            sx={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}
          />
          <Chip
            icon={<CameraIcon sx={{ fontSize: 16 }} />}
            label="1 Smartphone Scans Whole Class in 3 Seconds"
            size="small"
            sx={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontWeight: 700 }}
          />
        </Box>

        <Grid container spacing={3}>
          {/* ======================================================
              LEFT COLUMN: Interactive Student Plickers Card
              ====================================================== */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2.5,
                borderRadius: '14px',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc', mb: 0.5 }}>
                Student Optical Card (#{activeSeatId})
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center', mb: 2, fontSize: '0.74rem' }}>
                Students rotate the paper so their desired choice (A, B, C, or D) is facing <strong>UP</strong>.
              </Typography>

              {/* The Rotating Physical Card */}
              <Box
                sx={{
                  position: 'relative',
                  width: 190,
                  height: 190,
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
                  border: '4px solid #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  my: 1,
                  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: `rotate(${currentDeg}deg)`,
                }}
              >
                {/* 4 Orientation Labels */}
                <Typography sx={{ position: 'absolute', top: 6, fontWeight: 900, color: '#000', fontSize: '18px' }}>
                  A
                </Typography>
                <Typography sx={{ position: 'absolute', right: 8, fontWeight: 900, color: '#000', fontSize: '18px' }}>
                  B
                </Typography>
                <Typography sx={{ position: 'absolute', bottom: 6, fontWeight: 900, color: '#000', fontSize: '18px' }}>
                  C
                </Typography>
                <Typography sx={{ position: 'absolute', left: 8, fontWeight: 900, color: '#000', fontSize: '18px' }}>
                  D
                </Typography>

                {/* Central Optical QR Barcode Matrix */}
                <Box
                  sx={{
                    width: 110,
                    height: 110,
                    backgroundColor: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Box sx={{ width: 40, height: 40, backgroundColor: '#ffffff', position: 'absolute', top: 12, left: 12 }} />
                  <Box sx={{ width: 30, height: 30, backgroundColor: '#ffffff', position: 'absolute', bottom: 12, right: 12 }} />
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#000000', position: 'absolute', top: 24, left: 24 }} />
                </Box>
              </Box>

              {/* Active Answer Status Pill */}
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  Selected Choice:
                </Typography>
                <Chip
                  label={`Choice ${cardOrientation}`}
                  color="primary"
                  sx={{ fontWeight: 800, fontSize: '0.85rem' }}
                />
              </Box>

              {/* Rotate Button */}
              <Button
                variant="contained"
                onClick={rotateCard}
                startIcon={<RotateIcon />}
                fullWidth
                sx={{
                  mt: 2,
                  backgroundColor: '#0284c7',
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: '10px',
                  py: 1,
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  '&:hover': { backgroundColor: '#0369a1' },
                }}
              >
                Rotate Card 90° (Change Choice)
              </Button>
            </Box>
          </Grid>

          {/* ======================================================
              RIGHT COLUMN: Teacher Scanner Viewfinder & Live Tally
              ====================================================== */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '14px',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                  Live Teacher Smartphone Scanner Viewfinder
                </Typography>
                <Chip
                  icon={<CameraIcon sx={{ fontSize: 14 }} />}
                  label="Camera Active"
                  size="small"
                  sx={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 800 }}
                />
              </Box>

              {/* Mock Camera Viewfinder Overlay */}
              <Box
                sx={{
                  position: 'relative',
                  backgroundColor: '#020617',
                  borderRadius: '10px',
                  p: 2,
                  mb: 2,
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  overflow: 'hidden',
                }}
              >
                {/* Simulated AR Detection Bounding Boxes */}
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, display: 'block', mb: 1 }}>
                  ✓ Scanning classroom: 20 cards detected in camera feed
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                  {['R1-S1', 'R1-S2', 'R2-S2', 'R2-S3', 'R3-S1', 'R3-S5'].map((id) => (
                    <Box
                      key={id}
                      sx={{
                        px: 0.8,
                        py: 0.2,
                        borderRadius: '4px',
                        border: '1px solid #10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        fontSize: '10px',
                        color: '#34d399',
                        fontWeight: 700,
                      }}
                    >
                      {id}: Scanned ✓
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Live Tally Breakdown for Current Question */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc', mb: 1 }}>
                Question 1 Live Response Distribution:
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
                {choices.map((c) => {
                  const pct = Math.round((c.count / classSize) * 100);
                  const isSelected = cardOrientation === c.key;
                  return (
                    <Box
                      key={c.key}
                      onClick={() => setOrientation(c.key)}
                      sx={{
                        p: 1.2,
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                        border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={c.key}
                            size="small"
                            sx={{
                              height: 20,
                              fontWeight: 800,
                              backgroundColor: c.isCorrect ? '#10b981' : '#64748b',
                              color: '#ffffff',
                            }}
                          />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                            {c.text}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: c.isCorrect ? '#34d399' : '#94a3b8' }}>
                          {c.count} ({pct}%)
                        </Typography>
                      </Box>
                      {/* Progress Bar */}
                      <Box
                        sx={{
                          height: 6,
                          width: '100%',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${pct}%`,
                            backgroundColor: c.isCorrect ? '#10b981' : '#38bdf8',
                            borderRadius: '3px',
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Workshop Facilitation Note */}
              <Box sx={{ mt: 2, p: 1.2, borderRadius: '8px', backgroundColor: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
                <Typography variant="caption" sx={{ color: '#bae6fd', fontSize: '0.74rem', display: 'block' }}>
                  💡 <strong>Workshop Note:</strong> Notice how zero devices were handed to students, yet every student in the room actively participated with instant diagnostic feedback for the teacher.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
