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
    "Grade 8 Life Science Notes — Human Heart & Blood Vessels:\n• 4 Chambers: Left/Right Atria (top receiving rooms), Left/Right Ventricles (bottom pumping rooms).\n• Left Ventricle: Thickest muscle wall because it pumps oxygen-rich blood all the way across the body!\n• 3 Types of Blood Vessels: Arteries (Away from heart), Capillaries (microscopic 1-cell exchange), Veins (return blood with valves).\n• Valves: One-way trapdoors that prevent backflow and make the \"Lub-Dub\" heartbeat sound.\n• Exercise Connection: Heart rate increases during exercise to rush oxygen to active muscle cells.\n\nPersonal Observations:\n"
  );

  useEffect(() => {
    if (open) {
      classroomAtmosphereAudioService.playPaperRustle();
    }
  }, [open]);

  const handleInsertBloodFlow = () => {
    setNotes((prev) => prev + "\n[Blood Flow Pathway] Heart ➔ Arteries ➔ Capillaries (Oxygen Delivery) ➔ Veins ➔ Heart\n");
    classroomAtmosphereAudioService.playPaperRustle();
  };

  const handleInsertChambers = () => {
    setNotes((prev) => prev + "\n[The 4 Chambers] Right Side = Oxygen-poor blood to lungs | Left Side = Oxygen-rich blood to body.\n");
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
          <Tooltip title="Insert blood flow pathway into your notes">
            <Button
              size="small"
              variant="outlined"
              startIcon={<AutoFixHighIcon />}
              onClick={handleInsertBloodFlow}
              sx={{ borderColor: '#d97706', color: '#92400e', fontSize: '0.72rem' }}
            >
              + Blood Flow Path
            </Button>
          </Tooltip>
          <Tooltip title="Insert the 4 heart chambers summary into notes">
            <Button
              size="small"
              variant="outlined"
              onClick={handleInsertChambers}
              sx={{ borderColor: '#d97706', color: '#92400e', fontSize: '0.72rem' }}
            >
              + 4 Chambers & Loop
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
