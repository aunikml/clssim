import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { classroomAtmosphereAudioService } from '../../../services/classroomAtmosphereAudioService';

export const DeskNotebookModal = ({ open, onClose }) => {
  const [notes, setNotes] = useState(
    "Biology Class Notes — Anatomy of the Human Heart:\n• 4 Chambers: Right/Left Atria (receiving), Right/Left Ventricles (pumping).\n• Dual Circulation: Pulmonary (low pressure to lungs) & Systemic (high pressure to body).\n• Left Ventricle has the thickest myocardium (3× thicker than right) to supply the systemic circulation.\n• Valves: Tricuspid & Mitral (AV valves, 'Lub' sound); Pulmonary & Aortic (Semilunar valves, 'Dub' sound).\n• Conduction: SA Node (Pacemaker) ➔ AV Node (0.1s delay) ➔ Bundle of His ➔ Purkinje Fibers.\n\nPersonal Observations:\n"
  );

  useEffect(() => {
    if (open) {
      classroomAtmosphereAudioService.playPaperRustle();
    }
  }, [open]);

  const handleInsertEquation = () => {
    setNotes((prev) => prev + "\n[Blood Flow] Vena Cava ➔ RA ➔ Tricuspid ➔ RV ➔ Pulm. Artery ➔ Lungs ➔ Pulm. Veins ➔ LA ➔ Mitral ➔ LV ➔ Aorta\n");
    classroomAtmosphereAudioService.playPaperRustle();
  };

  const handleInsertLightReaction = () => {
    setNotes((prev) => prev + "\n[Conduction Highway] SA Node (Pacemaker) ➔ AV Node (0.1s delay) ➔ Bundle of His ➔ Bundle Branches ➔ Purkinje Fibers.\n");
    classroomAtmosphereAudioService.playPaperRustle();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#fefce8', // Cream notebook paper
          color: '#1e293b',
          borderRadius: 3,
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
          border: '8px solid #92400e', // Leather binder edge
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: '2px solid #cbd5e1',
          backgroundColor: '#fef9c3',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditNoteIcon sx={{ color: '#b45309' }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#78350f' }}>
            Student Desk Notebook · Spiral Bound
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#78350f' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, backgroundColor: '#fefce8' }}>
        {/* Quick Template Insert Buttons */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Tooltip title="Insert overall chemical equation into your notes">
            <Button
              size="small"
              variant="outlined"
              startIcon={<AutoFixHighIcon />}
              onClick={handleInsertEquation}
              sx={{ borderColor: '#d97706', color: '#92400e', fontSize: '0.72rem' }}
            >
              + Chemical Equation
            </Button>
          </Tooltip>
          <Tooltip title="Insert light-dependent reaction notes">
            <Button
              size="small"
              variant="outlined"
              onClick={handleInsertLightReaction}
              sx={{ borderColor: '#d97706', color: '#92400e', fontSize: '0.72rem' }}
            >
              + Light Reactions
            </Button>
          </Tooltip>
          <Button
            size="small"
            variant="text"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setNotes('')}
            sx={{ fontSize: '0.72rem', ml: 'auto' }}
          >
            Clear
          </Button>
        </Box>

        {/* Lined Paper Text Area */}
        <Box
          sx={{
            position: 'relative',
            p: 2,
            backgroundColor: '#fffbeb',
            borderRadius: 2,
            border: '1px solid #fde68a',
            borderLeft: '4px solid #ef4444', // Red notebook margin line!
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <TextField
            multiline
            rows={10}
            fullWidth
            variant="standard"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            InputProps={{
              disableUnderline: true,
              style: {
                fontFamily: '"Caveat", "Comic Sans MS", "Segoe UI", cursive, sans-serif',
                fontSize: '1.05rem',
                lineHeight: '2.0rem',
                color: '#1e3a8a', // Blue ink
              },
            }}
            placeholder="Type your classroom notes here..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0, backgroundColor: '#fef9c3', borderTop: '1px solid #cbd5e1' }}>
        <Typography variant="caption" sx={{ color: '#78350f', mr: 'auto' }}>
          * Notes are saved to your student profile during the session.
        </Typography>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ backgroundColor: '#b45309', color: '#ffffff', '&:hover': { backgroundColor: '#92400e' } }}
        >
          Close Notebook
        </Button>
      </DialogActions>
    </Dialog>
  );
};
