import { create } from 'zustand';
import { defaultClassroomConfig, getSeatCoordinates, computeClassroomSeatingLayout } from '../utils/classroomConfig';
import { classroomService } from '../services/classroomService';
import { websocketService } from '../services/websocketService';
import { lectureService } from '../services/lectureService';
import { classroomAtmosphereAudioService } from '../services/classroomAtmosphereAudioService';
import { useSessionStore } from './sessionStore';

export const useClassroomStore = create((set, get) => ({
  classroom: null,
  config: defaultClassroomConfig,
  isLoading: false,
  error: null,
  showCeiling: false,
  cameraMode: 'walk', // 'walk' | 'board' | 'teacher' | 'observer' | 'isometric' | 'topdown'
  selectedSeatId: null,
  hoveredSeatId: null,

  // Classroom Seating Capacity / Class Size Control (Min 15, Max 40)
  classSize: 20,
  setClassSize: (size) => {
    const targetSize = Math.max(15, Math.min(40, parseInt(size, 10) || 20));
    const layout = computeClassroomSeatingLayout(targetSize);
    const newConfig = {
      ...get().config,
      seating: {
        ...get().config.seating,
        rows: layout.rows,
        columns: layout.columns,
        spacing_x: layout.spacing_x,
        spacing_z: layout.spacing_z,
        start_x: layout.start_x,
        start_z: layout.start_z,
      },
    };

    set({
      classSize: targetSize,
      config: newConfig,
    });

    // Automatically synchronize seats in sessionStore
    useSessionStore.getState().updateClassSize(targetSize);
  },

  // User Role: 'student' | 'teacher' | 'observer'
  userRole: 'student',

  // Student Mode Interactive Telemetry
  activeSideTalk: null,
  setActiveSideTalk: (talk) => set({ activeSideTalk: talk }),
  activeStudentInquiry: null,
  setActiveStudentInquiry: (inquiry) => set({ activeStudentInquiry: inquiry }),

  // Teacher Mode Interactive Telemetry
  isLaserPointerActive: false,
  toggleLaserPointer: () => set((state) => ({ isLaserPointerActive: !state.isLaserPointerActive })),
  setLaserPointer: (active) => set({ isLaserPointerActive: active }),
  activeTeacherCall: null, // { studentName, seatId, question, studentAnswer, teacherFeedback, status }
  setActiveTeacherCall: (call) => set({ activeTeacherCall: call }),
  activeTeacherDiscipline: null, // { type, text, studentName, timestamp }
  setActiveTeacherDiscipline: (disc) => set({ activeTeacherDiscipline: disc }),
  teacherPraiseScore: 0,
  addTeacherPraiseScore: (points = 5) => set((state) => ({ teacherPraiseScore: state.teacherPraiseScore + points })),
  isDeviceBroadcastLocked: true,
  toggleDeviceBroadcastLock: () => set((state) => ({ isDeviceBroadcastLocked: !state.isDeviceBroadcastLocked })),

  // Plickers Paper Card & Low-Resource Scan Modal
  isPlickersModalOpen: false,
  plickersActiveSeatId: null,
  plickersCardOrientation: 'A', // 'A' | 'B' | 'C' | 'D'
  plickersScannedCount: 20,
  openPlickersModal: (seatId) => set({ isPlickersModalOpen: true, plickersActiveSeatId: seatId }),
  closePlickersModal: () => set({ isPlickersModalOpen: false, plickersActiveSeatId: null }),
  rotatePlickersCard: () => {
    const order = ['A', 'B', 'C', 'D'];
    const cur = get().plickersCardOrientation || 'A';
    const next = order[(order.indexOf(cur) + 1) % 4];
    set({ plickersCardOrientation: next });
  },
  setPlickersCardOrientation: (opt) => set({ plickersCardOrientation: opt }),

  // Student Connected Device Inspection Modal
  isDeviceInspected: false,
  openDeviceInspection: () => set({ isDeviceInspected: true }),
  closeDeviceInspection: () => set({ isDeviceInspected: false }),

  // Session Agenda & Report Card Flow
  isAgendaOpen: false,
  hasSeenAgenda: false,
  isReportCardOpen: false,
  sessionStats: {
    notesCount: 0,
    quizScore: 0,
    totalQuestions: 5,
    teacherPraiseScore: 0,
    disruptionsHandled: 0,
    startTime: Date.now(),
  },
  openAgenda: () => set({ isAgendaOpen: true, hasSeenAgenda: true }),
  closeAgenda: () => set({ isAgendaOpen: false }),
  toggleAgenda: () => set((state) => ({ isAgendaOpen: !state.isAgendaOpen, hasSeenAgenda: true })),
  openReportCard: () => set({ isReportCardOpen: true }),
  closeReportCard: () => set({ isReportCardOpen: false }),
  toggleReportCard: () => set((state) => ({ isReportCardOpen: !state.isReportCardOpen })),
  incrementNoteCount: () =>
    set((state) => ({
      sessionStats: { ...state.sessionStats, notesCount: state.sessionStats.notesCount + 1 },
    })),
  recordQuizScore: (score) =>
    set((state) => ({
      sessionStats: { ...state.sessionStats, quizScore: score },
    })),

  // Focused in-world targeted student for Action Wheel
  targetedStudent: null, // { seatId, studentName, position, posture }
  setTargetedStudent: (student) => set({ targetedStudent: student }),
  clearTargetedStudent: () => set({ targetedStudent: null }),

  // Second Life Style Camera & Object Inspection
  cameraDistanceTier: 1, // 0 = Intimate/Close, 1 = Third-Person Follow, 2 = Wide Overview
  inspectTarget: null,   // { name, position: [x,y,z], target: [x,y,z] } for click-to-inspect objects

  // Second Life Non-Verbal Expressive Gestures:
  // 'idle' | 'hand_raising' | 'taking_notes' | 'nodding' | 'confused' | 'applauding'
  activeGesture: null,

  // ============================================================
  // Classroom Era 3-Tier Spectrum: 'traditional' | 'low_resource' | 'high_resource'
  // ============================================================
  classroomEra: 'traditional', // 'traditional' | 'low_resource' | 'high_resource'
  eraNotification: null,
  showEraComparisonHUD: true,
  setEraNotification: (msg) => set({ eraNotification: msg }),
  clearEraNotification: () => set({ eraNotification: null }),
  toggleEraComparisonHUD: () => set((state) => ({ showEraComparisonHUD: !state.showEraComparisonHUD })),

  toggleClassroomEra: () => {
    const cur = get().classroomEra;
    const nextEra =
      cur === 'traditional'
        ? 'low_resource'
        : cur === 'low_resource'
        ? 'high_resource'
        : 'traditional';
    get().setClassroomEra(nextEra);
  },

  setClassroomEra: (era) => {
    const normalizedEra = era === 'edtech' ? 'high_resource' : era;
    let notifMsg = '';
    let displayMode = 'chalkboard';
    let showDevices = false;

    if (normalizedEra === 'high_resource') {
      notifMsg = 'Classroom Metamorphosis: High-Resource EdTech (2026) — 4K Interactive Display & 1-to-1 Student Tablets';
      displayMode = 'digital_screen';
      showDevices = true;
    } else if (normalizedEra === 'low_resource') {
      notifMsg = 'Classroom Metamorphosis: Low-Resource Tech — 1 Budget Projector, Plickers Paper Cards & Shared BYOD Mobiles';
      displayMode = 'projector_screen';
      showDevices = false;
    } else {
      notifMsg = 'Classroom Metamorphosis: Traditional Slate (1980s) — Chalkboard, Paper Notebooks & Distance Drop-off';
      displayMode = 'chalkboard';
      showDevices = false;
    }

    set({
      classroomEra: normalizedEra,
      teachingDisplayMode: displayMode,
      showStudentDevices: showDevices,
      eraNotification: notifMsg,
    });

    // Play Metamorphosis Audio Chime / Projector Hum / Slate Latch
    classroomAtmosphereAudioService.playEraTransitionSound(normalizedEra);

    // Auto-clear notification toast after 4s
    setTimeout(() => {
      if (get().eraNotification === notifMsg) {
        set({ eraNotification: null });
      }
    }, 4500);

    // Re-evaluate pedagogical metrics under new era
    const dist = get().teacherAudioDistance || 5.0;
    get().updatePedagogicalMetrics(dist);
  },

  // Teaching Display Mode: 'chalkboard' | 'projector_screen' | 'digital_screen'
  teachingDisplayMode: 'chalkboard',
  toggleTeachingDisplayMode: () => {
    get().toggleClassroomEra();
  },
  setTeachingDisplayMode: (mode) => {
    let era = 'traditional';
    if (mode === 'digital_screen') era = 'high_resource';
    else if (mode === 'projector_screen') era = 'low_resource';

    set({
      teachingDisplayMode: mode,
      classroomEra: era,
      showStudentDevices: mode === 'digital_screen',
    });
  },

  // Student Devices on Desks (Laptops / Tablets mirroring screen)
  showStudentDevices: false, // Default false in traditional era
  toggleStudentDevices: () => set((state) => ({ showStudentDevices: !state.showStudentDevices })),
  setShowStudentDevices: (show) => set({ showStudentDevices: show }),

  // Traditional Classroom Pedagogical Indices (Acoustic Drop-off & Visual Legibility)
  teacherAudioDistance: 0,
  acousticAudibilityPercent: 100,
  blackboardLegibility: 'High',
  teacherWorldPosition: [0, 0, -4.5],
  setTeacherWorldPosition: (pos) => set({ teacherWorldPosition: pos }),

  // Teacher Lecture Protocol: 'idle' | 'countdown' | 'lecturing' | 'qa' | 'completed'
  lectureState: 'idle',
  lectureCountdown: 20,
  lectureTimer: 0,
  lectureTranscript: '',
  lectureTopic: '',
  currentQuizQuestionIndex: 0,
  quizFeedback: null,
  isLecturePaused: false,
  activeStudentAnswer: null,

  // Student Player Position & Orientation (spawns safely inside door facing blackboard)
  isSeated: false,
  seatedSeatId: null,
  playerPosition: [6.8, 0, 4.2],   // At entrance door in open walkway
  playerYaw: -2.62,               // Facing northwest toward blackboard & teacher
  playerPitch: 0.0,
  playerRotation: -2.62,
  targetWalkPosition: null,       // Auto-walk destination
  isWalking: false,
  promptNearSeatId: null,         // Active desk for quick [E] Sit Down prompt

  // Hand raising boolean (backward compatible with gesture)
  isHandRaised: false,

  // Interactive Typeable Desk Notebook
  isNotebookOpen: false,

  // Interactive Teaching Surface (Chalkboard modal)
  isBoardModalOpen: false,

  // Physics Disruptions & Traditional Classroom Micro-events: null | 'airplane' | 'note_toss' | 'spill_tin' | 'reset'
  activeDisruptionEvent: null,
  setActiveDisruptionEvent: (event) => set({ activeDisruptionEvent: event }),

  // Audio & Communication
  isMicMuted: true,
  spatialAudioEnabled: true,
  isTeacherSpeaking: false,
  speakingUsers: new Set(),

  // Second Life Gesture Actions
  setActiveGesture: (gesture) => {
    const current = get().activeGesture;
    const nextGesture = current === gesture ? null : gesture;
    set({
      activeGesture: nextGesture,
      isHandRaised: nextGesture === 'hand_raising',
      ...(nextGesture === 'taking_notes' ? { isNotebookOpen: true } : {}),
    });
    // Broadcast emote across session
    websocketService.send({
      action: 'participant.gesture',
      payload: { gesture: nextGesture },
    });
  },

  // Desk Notebook actions
  openNotebook: () => set({ isNotebookOpen: true, activeGesture: 'taking_notes' }),
  closeNotebook: () => set({ isNotebookOpen: false, activeGesture: null }),

  // Toggle Hand Raising shortcut
  toggleHandRaise: () => {
    get().setActiveGesture('hand_raising');
  },

  // Second Life Object Inspection (Alt-click / Click on any prop)
  setInspectTarget: (target) => set({ inspectTarget: target }),
  clearInspectTarget: () => set({ inspectTarget: null }),

  // Camera Distance Tiers
  cycleCameraTier: () => set((state) => ({ cameraDistanceTier: (state.cameraDistanceTier + 1) % 3 })),

  // User Role Switcher: 'student' | 'teacher' | 'observer'
  setUserRole: (role) => {
    set({ userRole: role });
    if (role === 'teacher') {
      set({ cameraMode: 'teacher', isSeated: false, inspectTarget: null });
    } else if (role === 'observer') {
      set({ cameraMode: 'observer', isSeated: false, inspectTarget: null });
    } else {
      // student mode
      set({
        cameraMode: get().isSeated ? 'board' : 'walk',
        inspectTarget: null,
      });
    }
  },

  // Lecture Protocol Setters
  setLectureState: (lectureState) => set({ lectureState }),
  setLectureCountdown: (lectureCountdown) => set({ lectureCountdown }),
  setLectureTimer: (lectureTimer) => set({ lectureTimer }),
  setLectureTranscript: (lectureTranscript) => set({ lectureTranscript }),
  setLectureTopic: (lectureTopic) => set({ lectureTopic }),
  setCurrentQuizQuestionIndex: (currentQuizQuestionIndex) => set({ currentQuizQuestionIndex }),
  setQuizFeedback: (quizFeedback) => set({ quizFeedback }),
  setIsLecturePaused: (isLecturePaused) => set({ isLecturePaused }),
  setActiveStudentAnswer: (activeStudentAnswer) => set({ activeStudentAnswer }),

  setShowCeiling: (show) => set({ showCeiling: show }),
  setCameraMode: (mode) => set({ cameraMode: mode, inspectTarget: null }),
  setSelectedSeatId: (seatId) => set({ selectedSeatId: seatId }),
  setHoveredSeatId: (seatId) => set({ hoveredSeatId: seatId }),

  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setPlayerRotation: (rot) => set({ playerRotation: rot }),
  setPlayerLook: (yaw, pitch) => set({ playerYaw: yaw, playerPitch: pitch, playerRotation: yaw }),
  setIsWalking: (walking) => set({ isWalking: walking }),
  setTargetWalkPosition: (target) => set({ targetWalkPosition: target }),
  setPromptNearSeatId: (seatId) => set({ promptNearSeatId: seatId }),

  // Toggle Blackboard modal
  setBoardModalOpen: (open) => set({ isBoardModalOpen: open }),
  toggleBoardModal: () => set((state) => ({ isBoardModalOpen: !state.isBoardModalOpen })),

  // Audio & Acoustics Setters
  setMicMuted: (muted) => set({ isMicMuted: muted }),
  toggleMic: () => set((state) => ({ isMicMuted: !state.isMicMuted })),
  toggleSpatialAudio: () => set((state) => ({ spatialAudioEnabled: !state.spatialAudioEnabled })),
  setIsTeacherSpeaking: (speaking) => set({ isTeacherSpeaking: speaking }),

  // Update pedagogical metrics based on distance & active classroom era
  updatePedagogicalMetrics: (dist) => {
    const d = parseFloat(dist) || 0;
    const era = get().classroomEra;
    const isHighRes = era === 'high_resource' || era === 'edtech';
    const isLowRes = era === 'low_resource';

    // Acoustic Clarity
    let audibility = 100;
    if (isHighRes) {
      audibility = 100; // Digital broadcast feed gives 100% clarity
    } else if (isLowRes) {
      audibility = 88; // Budget front speaker amplification provides uniform ~88% clarity
    } else {
      audibility = Math.max(25, Math.min(100, Math.round(100 - (d - 3) * 7.5))); // Physical inverse-square falloff
    }

    // Visual Legibility
    let legibility = 'High (Clear view)';
    if (isHighRes) {
      legibility = 'Ultra 4K (Mirrored to Student Tablet)';
    } else if (isLowRes) {
      legibility = d > 8.0 ? 'Moderate (Projector Keystone & Ambient Wash)' : 'High (1080p Screen Projection)';
    } else {
      if (d > 7.5) {
        legibility = 'Low (Distance blur; chalk squinting required)';
      } else if (d > 5.0) {
        legibility = 'Moderate (Readable with slight optical strain)';
      } else {
        legibility = 'High (Clear view of blackboard)';
      }
    }

    set({
      teacherAudioDistance: d.toFixed(1),
      acousticAudibilityPercent: audibility,
      blackboardLegibility: legibility,
    });
  },

  // Sit down at specified seat (faces the front blackboard directly)
  sitDown: (seatId) => {
    const config = get().config;
    const targetSeat = seatId || get().selectedSeatId || 'R3-S3';
    const [deskX, , deskZ] = getSeatCoordinates(targetSeat, config.seating);

    // Seated chair position behind desk
    const chairPos = [deskX, 0, deskZ + 0.55];

    // Compute subtle eye angle toward center of blackboard at [0, 2.4, -7.85]
    const dx = 0 - deskX;
    const dz = -7.85 - (deskZ + 0.55);
    const targetYaw = Math.atan2(-dx, -dz);

    set({
      isSeated: true,
      seatedSeatId: targetSeat,
      selectedSeatId: targetSeat,
      playerPosition: chairPos,
      playerRotation: Math.PI, // Facing blackboard (straight forward into negative Z)
      playerYaw: targetYaw,
      playerPitch: 0.04,
      targetWalkPosition: null,
      isWalking: false,
      cameraMode: 'board', // Switch immediately to the seated board view
      inspectTarget: null,
    });
  },

  // Stand up from chair and step into open aisle
  standUp: () => {
    const currentPos = get().playerPosition;
    const standPos = [currentPos[0] + 0.65, 0, currentPos[2]];
    set({
      isSeated: false,
      seatedSeatId: null,
      playerPosition: standPos,
      playerYaw: -Math.PI / 2, // Facing aisle
      playerPitch: 0.0,
      cameraMode: 'walk',
      inspectTarget: null,
    });
  },

  fetchClassroom: async (classroomId) => {
    set({ isLoading: true, error: null });
    try {
      let data = null;
      if (classroomId) {
        data = await classroomService.getClassroom(classroomId);
      } else {
        const classrooms = await classroomService.getClassrooms();
        if (classrooms.length > 0) {
          data = classrooms[0];
        }
      }

      if (data) {
        set({
          classroom: data,
          config: {
            ...defaultClassroomConfig,
            ...data.layout_config,
            dimensions: {
              ...defaultClassroomConfig.dimensions,
              ...(data.layout_config?.dimensions || {}),
            },
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.warn('Could not load classroom from backend, keeping default config:', err);
      set({ isLoading: false, error: null });
    }
  },
}));
