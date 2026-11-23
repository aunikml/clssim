import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  ButtonGroup,
  Box,
  Typography,
  Slider,
  Tooltip,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BrushIcon from '@mui/icons-material/Brush';
import GridOnIcon from '@mui/icons-material/GridOn';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import TvIcon from '@mui/icons-material/Tv';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SpeedIcon from '@mui/icons-material/Speed';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useClassroomStore } from '../../../../store/classroomStore';
import { blackboardService } from '../../../../services/blackboardService';
import { digitalScreenService } from '../../../../services/digitalScreenService';

const CHALK_COLORS = [
  { name: 'Classic White', value: '#ffffff' },
  { name: 'Canary Yellow', value: '#fef08a' },
  { name: 'Sky Cyan', value: '#38bdf8' },
  { name: 'Mint Green', value: '#86efac' },
  { name: 'Coral Pink', value: '#f472b6' },
];

const DIGITAL_PEN_COLORS = [
  { name: 'Neon Sky Cyan', value: '#38bdf8' },
  { name: 'Laser Lime Green', value: '#4ade80' },
  { name: 'Arterial Blood Red', value: '#ef4444' },
  { name: 'Amber Highlighter', value: '#fbbf24' },
  { name: 'Electric Purple', value: '#c084fc' },
  { name: 'Pure White Marker', value: '#ffffff' },
];

/**
 * Unified Board & Display Tool Modal
 * Intelligently switches based on the classroom's active display mode:
 * - When Digital Screen is active: Mirrors the live 4K digital screen in real time
 *   (live ECG oscilloscope sweep, pulsating heart chambers, hemodynamic vitals,
 *    heart rate controls, and digital stylus annotation tool).
 * - When Chalkboard is active: Displays traditional slate chalkboard drawing surface.
 */
export const BlackboardDrawingModal = () => {
  const isOpen = useClassroomStore((state) => state.isBoardModalOpen);
  const setBoardModalOpen = useClassroomStore((state) => state.setBoardModalOpen);
  const teachingDisplayMode = useClassroomStore((state) => state.teachingDisplayMode);

  // Active view inside the modal: 'digital_screen' or 'chalkboard'
  const [modalView, setModalView] = useState(teachingDisplayMode);

  // --- Chalkboard Canvas Refs & State ---
  const chalkCanvasRef = useRef(null);
  const isChalkDrawing = useRef(false);
  const currentChalkStroke = useRef([]);
  const [chalkColor, setChalkColor] = useState('#ffffff');
  const [chalkLineWidth, setChalkLineWidth] = useState(8);
  const [isChalkEraser, setIsChalkEraser] = useState(false);

  // --- Digital Smart Screen Canvas Refs & State ---
  const digitalCanvasRef = useRef(null);
  const isDigitalDrawing = useRef(false);
  const currentDigitalStroke = useRef([]);
  const [digitalColor, setDigitalColor] = useState('#38bdf8');
  const [digitalLineWidth, setDigitalLineWidth] = useState(6);
  const [isDigitalEraser, setIsDigitalEraser] = useState(false);

  // Sync modal view whenever modal opens or classroom hardware toggles
  useEffect(() => {
    if (isOpen) {
      setModalView(teachingDisplayMode);
    }
  }, [isOpen, teachingDisplayMode]);

  // 1. Sync Chalkboard canvas
  const syncChalkFromService = useCallback(() => {
    const canvas = chalkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const sourceCanvas = blackboardService.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (isOpen && modalView === 'chalkboard') {
      setTimeout(syncChalkFromService, 50);
      const unsubscribe = blackboardService.onChange(syncChalkFromService);
      return unsubscribe;
    }
  }, [isOpen, modalView, syncChalkFromService]);

  // 2. Real-time 60fps mirror loop for the Digital Smart Screen
  useEffect(() => {
    if (!isOpen || modalView !== 'digital_screen') return;

    let animId;
    const loop = () => {
      const canvas = digitalCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const src = digitalScreenService.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, modalView]);

  // --- Chalkboard Interaction Handlers ---
  const getChalkCoords = (e) => {
    const canvas = chalkCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = blackboardService.canvas.width / rect.width;
    const scaleY = blackboardService.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleChalkDown = (e) => {
    e.preventDefault();
    isChalkDrawing.current = true;
    const pt = getChalkCoords(e);
    currentChalkStroke.current = [pt];
  };

  const handleChalkMove = (e) => {
    if (!isChalkDrawing.current) return;
    e.preventDefault();
    const pt = getChalkCoords(e);
    currentChalkStroke.current.push(pt);
    if (currentChalkStroke.current.length >= 2) {
      const strokeSlice = {
        points: currentChalkStroke.current.slice(-2),
        color: chalkColor,
        width: isChalkEraser ? chalkLineWidth * 3.5 : chalkLineWidth,
        isEraser: isChalkEraser,
      };
      blackboardService.renderStrokeLocally(strokeSlice);
      syncChalkFromService();
    }
  };

  const handleChalkUp = (e) => {
    if (!isChalkDrawing.current) return;
    isChalkDrawing.current = false;
    e.preventDefault();
    if (currentChalkStroke.current.length >= 2) {
      const fullStroke = {
        points: [...currentChalkStroke.current],
        color: chalkColor,
        width: isChalkEraser ? chalkLineWidth * 3.5 : chalkLineWidth,
        isEraser: isChalkEraser,
      };
      blackboardService.drawStroke(fullStroke);
    }
    currentChalkStroke.current = [];
    syncChalkFromService();
  };

  // --- Digital Smart Screen Interaction Handlers ---
  const getDigitalCoords = (e) => {
    const canvas = digitalCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = digitalScreenService.canvas.width / rect.width;
    const scaleY = digitalScreenService.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleDigitalDown = (e) => {
    e.preventDefault();
    isDigitalDrawing.current = true;
    const pt = getDigitalCoords(e);
    currentDigitalStroke.current = [pt];
  };

  const handleDigitalMove = (e) => {
    if (!isDigitalDrawing.current) return;
    e.preventDefault();
    const pt = getDigitalCoords(e);
    currentDigitalStroke.current.push(pt);

    if (currentDigitalStroke.current.length >= 2) {
      digitalScreenService.addAnnotationStroke({
        points: [...currentDigitalStroke.current],
        color: digitalColor,
        width: isDigitalEraser ? digitalLineWidth * 3 : digitalLineWidth,
        isEraser: isDigitalEraser,
      });
    }
  };

  const handleDigitalUp = (e) => {
    if (!isDigitalDrawing.current) return;
    isDigitalDrawing.current = false;
    e.preventDefault();
    currentDigitalStroke.current = [];
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => setBoardModalOpen(false)}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#0b1329',
          color: '#ffffff',
          borderRadius: 3,
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Dialog Header with Display Mode Switcher */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.6) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {modalView === 'digital_screen' ? (
            <TvIcon sx={{ color: '#38bdf8', fontSize: 26 }} />
          ) : (
            <BrushIcon sx={{ color: '#34d399', fontSize: 26 }} />
          )}

          <Typography variant="h6" fontWeight="bold">
            {modalView === 'digital_screen'
              ? 'Interactive 4K Digital Presentation Smartboard'
              : 'Interactive Classroom Chalkboard'}
          </Typography>

          <Chip
            label={modalView === 'digital_screen' ? 'Live 3D Screen Mirror' : 'Live 3D Chalk Sync'}
            size="small"
            sx={{
              height: 22,
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: modalView === 'digital_screen' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: modalView === 'digital_screen' ? '#38bdf8' : '#34d399',
              border: `1px solid ${modalView === 'digital_screen' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
            }}
          />
        </Box>

        {/* View Switcher Tabs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ButtonGroup size="small" sx={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: 2 }}>
            <Button
              variant={modalView === 'digital_screen' ? 'contained' : 'outlined'}
              startIcon={<TvIcon sx={{ fontSize: 16 }} />}
              onClick={() => setModalView('digital_screen')}
              sx={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'none',
                backgroundColor: modalView === 'digital_screen' ? '#0284c7' : 'transparent',
              }}
            >
              Digital Screen View
            </Button>
            <Button
              variant={modalView === 'chalkboard' ? 'contained' : 'outlined'}
              startIcon={<BrushIcon sx={{ fontSize: 16 }} />}
              onClick={() => setModalView('chalkboard')}
              sx={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'none',
                backgroundColor: modalView === 'chalkboard' ? '#059669' : 'transparent',
              }}
            >
              Chalkboard View
            </Button>
          </ButtonGroup>

          <IconButton onClick={() => setBoardModalOpen(false)} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* ============================================================ */}
        {/* VIEW A: DIGITAL SMART SCREEN (Live Screen Mirror & Tools)     */}
        {/* ============================================================ */}
        {modalView === 'digital_screen' && (
          <>
            {/* Digital Toolbar Controls */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                p: 1.5,
                backgroundColor: 'rgba(30, 41, 59, 0.85)',
                borderRadius: 2,
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              {/* Digital Stylus Pen Colors */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                  Digital Stylus:
                </Typography>
                {DIGITAL_PEN_COLORS.map((c) => (
                  <Tooltip key={c.value} title={c.name}>
                    <Box
                      onClick={() => {
                        setDigitalColor(c.value);
                        setIsDigitalEraser(false);
                      }}
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        backgroundColor: c.value,
                        cursor: 'pointer',
                        border: !isDigitalEraser && digitalColor === c.value ? '3px solid #ffffff' : '2px solid transparent',
                        boxShadow: !isDigitalEraser && digitalColor === c.value ? `0 0 12px ${c.value}` : 'none',
                        transition: 'all 0.15s ease',
                        '&:hover': { transform: 'scale(1.2)' },
                      }}
                    />
                  </Tooltip>
                ))}

                {/* Digital Eraser */}
                <Button
                  variant={isDigitalEraser ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setIsDigitalEraser(true)}
                  startIcon={<AutoFixNormalIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    ml: 1,
                    fontSize: '11px',
                    backgroundColor: isDigitalEraser ? '#475569' : 'transparent',
                    color: '#ffffff',
                    borderColor: '#64748b',
                  }}
                >
                  Eraser
                </Button>

                {/* Stroke Width Slider */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1.5, width: 140 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {digitalLineWidth}px
                  </Typography>
                  <Slider
                    value={digitalLineWidth}
                    min={2}
                    max={20}
                    onChange={(_, val) => setDigitalLineWidth(val)}
                    size="small"
                    sx={{ color: '#38bdf8' }}
                  />
                </Box>
              </Box>

              {/* Interactive Cardiac Telemetry Simulator Buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 0.5 }}>
                  <FavoriteIcon sx={{ color: '#f43f5e', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ color: '#fda4af', fontWeight: 700 }}>
                    Pacing:
                  </Typography>
                </Box>
                <ButtonGroup size="small">
                  <Button
                    onClick={() => digitalScreenService.setHeartRate(48)}
                    sx={{ fontSize: '11px', py: 0.3, px: 1, borderColor: '#64748b', color: '#cbd5e1' }}
                  >
                    Brady (48)
                  </Button>
                  <Button
                    onClick={() => digitalScreenService.setHeartRate(72)}
                    sx={{ fontSize: '11px', py: 0.3, px: 1, borderColor: '#64748b', color: '#34d399', fontWeight: 700 }}
                  >
                    Normal (72)
                  </Button>
                  <Button
                    onClick={() => digitalScreenService.setHeartRate(115)}
                    sx={{ fontSize: '11px', py: 0.3, px: 1, borderColor: '#64748b', color: '#fb7185' }}
                  >
                    Tachy (115)
                  </Button>
                </ButtonGroup>

                {/* Clear Annotations */}
                <Tooltip title="Clear all digital ink annotations">
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                    onClick={() => digitalScreenService.clearAnnotations()}
                    sx={{ fontSize: '11px', ml: 1 }}
                  >
                    Clear Ink
                  </Button>
                </Tooltip>
              </Box>
            </Box>

            {/* Live 4K Digital Presentation Screen Canvas Surface */}
            <Box
              sx={{
                width: '100%',
                height: 520,
                borderRadius: 2,
                border: '4px solid #1e293b',
                overflow: 'hidden',
                backgroundColor: '#040914',
                boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                cursor: isDigitalEraser ? 'cell' : 'crosshair',
                touchAction: 'none',
              }}
            >
              <canvas
                ref={digitalCanvasRef}
                width={1920}
                height={800}
                style={{ width: '100%', height: '100%', display: 'block' }}
                onMouseDown={handleDigitalDown}
                onMouseMove={handleDigitalMove}
                onMouseUp={handleDigitalUp}
                onTouchStart={handleDigitalDown}
                onTouchMove={handleDigitalMove}
                onTouchEnd={handleDigitalUp}
              />
            </Box>
          </>
        )}

        {/* ============================================================ */}
        {/* VIEW B: CLASSIC CHALKBOARD (Traditional Chalk Drawing Surface)*/}
        {/* ============================================================ */}
        {modalView === 'chalkboard' && (
          <>
            {/* Chalkboard Toolbar */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                p: 1.5,
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                borderRadius: 2,
              }}
            >
              {/* Chalk Colors */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#94a3b8', mr: 0.5 }}>
                  Chalk:
                </Typography>
                {CHALK_COLORS.map((c) => (
                  <Tooltip key={c.value} title={c.name}>
                    <Box
                      onClick={() => {
                        setChalkColor(c.value);
                        setIsChalkEraser(false);
                      }}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: c.value,
                        cursor: 'pointer',
                        border: !isChalkEraser && chalkColor === c.value ? '3px solid #38bdf8' : '2px solid transparent',
                        boxShadow: !isChalkEraser && chalkColor === c.value ? '0 0 10px rgba(56, 189, 248, 0.8)' : 'none',
                        transition: 'all 0.15s ease',
                        '&:hover': { transform: 'scale(1.15)' },
                      }}
                    />
                  </Tooltip>
                ))}

                {/* Eraser Tool */}
                <Tooltip title="Chalk Eraser">
                  <Button
                    variant={isChalkEraser ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setIsChalkEraser(true)}
                    startIcon={<AutoFixNormalIcon />}
                    sx={{
                      ml: 1,
                      backgroundColor: isChalkEraser ? '#475569' : 'transparent',
                      color: '#ffffff',
                      borderColor: '#64748b',
                    }}
                  >
                    Eraser
                  </Button>
                </Tooltip>
              </Box>

              {/* Stroke Width Slider */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: 200 }}>
                <Typography variant="body2" sx={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  Size: {chalkLineWidth}px
                </Typography>
                <Slider
                  value={chalkLineWidth}
                  min={4}
                  max={32}
                  onChange={(_, val) => setChalkLineWidth(val)}
                  size="small"
                  sx={{ color: '#38bdf8' }}
                />
              </Box>

              {/* Template Presets & Clear */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Load Lesson Agenda Template">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FormatListBulletedIcon />}
                    onClick={() => blackboardService.loadTemplate('agenda')}
                    sx={{ borderColor: '#475569', color: '#e2e8f0' }}
                  >
                    Agenda
                  </Button>
                </Tooltip>

                <Tooltip title="Load Cartesian Math Grid">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<GridOnIcon />}
                    onClick={() => blackboardService.loadTemplate('math')}
                    sx={{ borderColor: '#475569', color: '#e2e8f0' }}
                  >
                    Math Grid
                  </Button>
                </Tooltip>

                <Tooltip title="Clear Entire Blackboard">
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => blackboardService.clearBoard()}
                  >
                    Clear
                  </Button>
                </Tooltip>
              </Box>
            </Box>

            {/* 2D Interactive Blackboard Surface */}
            <Box
              sx={{
                width: '100%',
                height: 520,
                borderRadius: 2,
                border: '4px solid #8b5a2b',
                overflow: 'hidden',
                backgroundColor: '#183a26',
                boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.6)',
                cursor: isChalkEraser ? 'cell' : 'crosshair',
                touchAction: 'none',
              }}
            >
              <canvas
                ref={chalkCanvasRef}
                width={2048}
                height={1024}
                style={{ width: '100%', height: '100%', display: 'block' }}
                onMouseDown={handleChalkDown}
                onMouseMove={handleChalkMove}
                onMouseUp={handleChalkUp}
                onTouchStart={handleChalkDown}
                onTouchMove={handleChalkMove}
                onTouchEnd={handleChalkUp}
              />
            </Box>
          </>
        )}
      </DialogContent>

      {/* Footer Info & Actions */}
      <DialogActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
          {modalView === 'digital_screen'
            ? '💡 Live Digital Mirror: Changes made with the digital stylus or pacing simulator project instantly onto the 3D smart screen in the classroom.'
            : '💡 Traditional Chalkboard: Strokes drawn here project live onto the 3D blackboard wall mesh.'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => setBoardModalOpen(false)}
          sx={{ backgroundColor: '#2563eb', fontWeight: 700 }}
        >
          Return to Classroom
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default BlackboardDrawingModal;
