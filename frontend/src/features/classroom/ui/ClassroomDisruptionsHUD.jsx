import React, { useState } from 'react';
import { Box, Button, Typography, IconButton, Tooltip, Collapse, Chip } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import GestureIcon from '@mui/icons-material/Gesture';
import { useClassroomStore } from '../../../store/classroomStore';

/**
 * Floating HUD widget for triggering and observing traditional classroom physics disruptions:
 * - Aerodynamic paper airplanes
 * - Secret paper note passing
 * - Spilled pencil tins
 * - Interactive desk stationery flicking
 */
export const ClassroomDisruptionsHUD = () => {
  const [open, setOpen] = useState(false);
  const activeDisruptionEvent = useClassroomStore((state) => state.activeDisruptionEvent);
  const setActiveDisruptionEvent = useClassroomStore((state) => state.setActiveDisruptionEvent);

  const handleTrigger = (eventKey) => {
    setActiveDisruptionEvent(eventKey);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 64,
        right: 18,
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1,
        pointerEvents: 'auto',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Toggle Pill Button */}
      <Button
        variant="contained"
        size="small"
        onClick={() => setOpen(!open)}
        startIcon={<AutoFixHighIcon sx={{ fontSize: 16 }} />}
        sx={{
          backgroundColor: open ? '#1e293b' : 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          color: '#f8fafc',
          textTransform: 'none',
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '20px',
          padding: '6px 14px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          '&:hover': {
            backgroundColor: '#334155',
            borderColor: '#38bdf8',
          },
        }}
      >
        Classroom Dynamics (Rapier Physics)
      </Button>

      {/* Expanded Control Card */}
      <Collapse in={open} timeout={200}>
        <Box
          sx={{
            width: 280,
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '12px',
            p: 2,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <GestureIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '13px' }}>
                Traditional Micro-Events
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#94a3b8', p: 0.5 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Chip
            label="Autonomous Dynamics: Running (25-55s)"
            size="small"
            sx={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '10px',
              height: '20px',
              fontWeight: 600,
              border: '1px solid rgba(52, 211, 153, 0.3)',
              alignSelf: 'flex-start',
            }}
          />

          <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '11px', lineHeight: 1.4 }}>
            Paper airplanes, tossed notes, and desk bumps occur naturally at random intervals. You can also test or trigger them manually below.
          </Typography>

          {/* Action Trigger Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* 1. Paper Airplane */}
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleTrigger('airplane')}
              startIcon={<FlightIcon sx={{ fontSize: 16, color: '#38bdf8' }} />}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                borderColor: 'rgba(56, 189, 248, 0.3)',
                color: '#e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
                '&:hover': {
                  borderColor: '#38bdf8',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                },
              }}
            >
              Throw Paper Airplane
            </Button>

            {/* 2. Toss Secret Note */}
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleTrigger('note_toss')}
              startIcon={<MarkChatUnreadIcon sx={{ fontSize: 16, color: '#fbbf24' }} />}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                borderColor: 'rgba(251, 191, 36, 0.3)',
                color: '#e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                backgroundColor: 'rgba(251, 191, 36, 0.05)',
                '&:hover': {
                  borderColor: '#fbbf24',
                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                },
              }}
            >
              Toss Secret Note Across Aisle
            </Button>

            {/* 3. Spill Pencil Canister */}
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleTrigger('spill_tin')}
              startIcon={<AutoFixHighIcon sx={{ fontSize: 16, color: '#f43f5e' }} />}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                borderColor: 'rgba(244, 63, 94, 0.3)',
                color: '#e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                backgroundColor: 'rgba(244, 63, 94, 0.05)',
                '&:hover': {
                  borderColor: '#f43f5e',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                },
              }}
            >
              Spill Aisle Pencil Canister
            </Button>

            {/* 4. Reset Objects */}
            <Button
              variant="contained"
              size="small"
              onClick={() => handleTrigger('reset')}
              startIcon={<DeleteSweepIcon sx={{ fontSize: 16 }} />}
              sx={{
                justifyContent: 'center',
                textTransform: 'none',
                backgroundColor: '#334155',
                color: '#cbd5e1',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#475569',
                  color: '#ffffff',
                },
              }}
            >
              Reset Classroom Props
            </Button>
          </Box>

          {/* Interactive Physics Tips */}
          <Box
            sx={{
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '8px',
              p: 1.2,
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, display: 'block', mb: 0.4 }}>
              Interactive Physics:
            </Typography>
            <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', fontSize: '10.5px' }}>
              • Click any desk pencil to flick and roll it.
            </Typography>
            <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', fontSize: '10.5px' }}>
              • Click chalk sticks on chalkboard ledge to drop them.
            </Typography>
            <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', fontSize: '10.5px' }}>
              • Walking into desks slides smoothly along aisles.
            </Typography>
            <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', fontSize: '10.5px' }}>
              • Foley collision sounds scale with impact force.
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};
