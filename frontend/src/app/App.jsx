import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { ClassroomViewport } from '../features/classroom/canvas/ClassroomViewport';
import { ClassroomTopBar } from '../features/classroom/ui/ClassroomTopBar';
import { ClassroomEraComparisonHUD } from '../features/classroom/ui/ClassroomEraComparisonHUD';
import { ClassroomBottomBar } from '../features/classroom/ui/ClassroomBottomBar';
import { AuthModal } from '../features/classroom/ui/AuthModal';
import { BlackboardDrawingModal } from '../features/classroom/components/furniture/BlackboardDrawingModal';
import { DeskNotebookModal } from '../features/classroom/ui/DeskNotebookModal';
import { TeacherLectureHUD } from '../features/classroom/ui/TeacherLectureHUD';
import { ClassroomCockpitDock } from '../features/classroom/ui/ClassroomCockpitDock';
import { StudentInteractionOverlay } from '../features/classroom/ui/StudentInteractionOverlay';
import { TeacherInteractionOverlay } from '../features/classroom/ui/TeacherInteractionOverlay';
import { StudentDeviceModal } from '../features/classroom/ui/StudentDeviceModal';
import { SessionAgendaModal } from '../features/classroom/ui/SessionAgendaModal';
import { SessionReportCardModal } from '../features/classroom/ui/SessionReportCardModal';
import { ClassroomHomePage } from '../features/classroom/ui/ClassroomHomePage';
import { ObserverClassroomHUD } from '../features/classroom/ui/ObserverClassroomHUD';
import { useAuthStore } from '../store/authStore';
import { useClassroomStore } from '../store/classroomStore';
import { useSessionStore } from '../store/sessionStore';
import { classroomAtmosphereAudioService } from '../services/classroomAtmosphereAudioService';

export const App = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);

  const initAuth = useAuthStore((state) => state.initAuth);
  const fetchClassroom = useClassroomStore((state) => state.fetchClassroom);
  const isNotebookOpen = useClassroomStore((state) => state.isNotebookOpen);
  const closeNotebook = useClassroomStore((state) => state.closeNotebook);
  const fetchSessionAndSeats = useSessionStore((state) => state.fetchSessionAndSeats);
  const lectureState = useClassroomStore((state) => state.lectureState);
  const isTeacherSpeaking = useClassroomStore((state) => state.isTeacherSpeaking);
  const isLecturePaused = useClassroomStore((state) => state.isLecturePaused);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // 1. Initialize auth from localStorage
    initAuth();
    // 2. Fetch classroom configuration from backend (or fallback to defaults)
    fetchClassroom();
    // 3. Fetch active session and seat reservations
    fetchSessionAndSeats();

    // 4. Start ambient classroom chatter on first user gesture (respecting browser audio policy)
    const handleFirstGesture = () => {
      classroomAtmosphereAudioService.updateChatterDucking({
        isLectureRunning: useClassroomStore.getState().lectureState === 'lecturing',
        isTeacherSpeaking: useClassroomStore.getState().isTeacherSpeaking,
        isPaused: useClassroomStore.getState().isLecturePaused,
      });
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);
    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  // 5. Automatically duck / restore ambient chatter as lecture state shifts
  useEffect(() => {
    classroomAtmosphereAudioService.updateChatterDucking({
      isLectureRunning: lectureState === 'lecturing',
      isTeacherSpeaking,
      isPaused: isLecturePaused,
    });
  }, [lectureState, isTeacherSpeaking, isLecturePaused]);

  // 6. When unauthenticated, render the Academy Home / Login Landing Page
  if (!isAuthenticated) {
    return <ClassroomHomePage />;
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0b1120',
      }}
    >
      {/* Small Top Navigation Bar */}
      <ClassroomTopBar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenControls={() => setControlsOpen(true)}
      />

      {/* Real-Time Pedagogical A/B Contrast HUD & Metamorphosis Banner */}
      <ClassroomEraComparisonHUD />

      {/* Main 3D Classroom Viewport */}
      <ClassroomViewport />

      {/* Teacher 20s Countdown, Heart Anatomy Lecture Captions & Interactive Q&A HUD */}
      <TeacherLectureHUD />

      {/* Student Mode Live Whispering Side-Talk & Lecture Question Bubbles */}
      <StudentInteractionOverlay />

      {/* Teacher Mode Live Cold-Calling, Discipline & Praise Dialog Overlay */}
      <TeacherInteractionOverlay />

      {/* Observer & Evaluator Mode Real-Time Analytics HUD */}
      <ObserverClassroomHUD />

      {/* Unified Classroom Simulation Cockpit Dock */}
      <ClassroomCockpitDock open={controlsOpen} onToggle={() => setControlsOpen(!controlsOpen)} />

      {/* Bottom Information and Seating Action Area */}
      <ClassroomBottomBar />

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Interactive Chalkboard Drawing Modal (Phase 2) */}
      <BlackboardDrawingModal />

      {/* Interactive Student Desk Notebook */}
      <DeskNotebookModal open={isNotebookOpen} onClose={closeNotebook} />

      {/* Interactive Student Connected Device Inspection (Mirroring 4K Screen) */}
      <StudentDeviceModal />

      {/* Session Agenda & Learning Objectives Modal */}
      <SessionAgendaModal />

      {/* End-of-Class Academic Report Card Modal */}
      <SessionReportCardModal />
    </Box>
  );
};

export default App;
