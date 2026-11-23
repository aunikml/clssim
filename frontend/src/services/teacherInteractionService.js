import { useClassroomStore } from '../store/classroomStore';
import { classroomVoiceService } from './classroomVoiceService';
import { lectureService, HEART_ANATOMY_QUIZ } from './lectureService';
import { physicsFoleyAudioService } from './physicsFoleyAudioService';

/**
 * Roster of Grade 8 Science Students Available for Cold Calling & Inquiry
 */
export const TEACHER_STUDENT_ROSTER = [
  {
    id: 'sophia',
    name: 'Sophia Garcia',
    seatId: 'Row 2, Seat 2',
    avatarKey: 'sophia',
    topic: 'Left Ventricle Power',
    teacherPrompt:
      'Sophia, why is the muscle wall of the Left Ventricle so much thicker than the Right Ventricle?',
    studentAnswer:
      'Because the left ventricle has to pump oxygen-rich blood all the way across the entire body to our brain and toes, while the right ventricle only has to push blood a short distance to our lungs!',
    teacherFeedback:
      'Exactly right, Sophia! Pumping blood through miles of body vessels requires a much stronger, thicker muscle wall.',
  },
  {
    id: 'ethan',
    name: 'Ethan Vance',
    seatId: 'Row 3, Seat 1',
    avatarKey: 'ethan',
    topic: 'Capillary Exchange',
    teacherPrompt:
      'Ethan, why are capillary blood vessels so microscopic that red blood cells have to squeeze through in single file?',
    studentAnswer:
      'Because their walls are only one cell thick, Mr. John! That lets oxygen and nutrients easily pass right through into our body cells and pick up carbon dioxide waste!',
    teacherFeedback:
      'Spot on, Ethan! That ultra-thin barrier allows fast, life-saving diffusion between blood and our body cells.',
  },
  {
    id: 'liam',
    name: 'Liam Patel',
    seatId: 'Row 1, Seat 3',
    avatarKey: 'liam',
    topic: 'Heart Rate & Exercise',
    teacherPrompt:
      'Liam, why does your heart beat so much faster when you sprint during gym class?',
    studentAnswer:
      'When our leg muscles work hard, they burn energy fast and demand lots more oxygen! So the heart pumps faster and harder to deliver fresh oxygenated blood!',
    teacherFeedback:
      'Great explanation, Liam! Working muscle cells need a faster delivery of oxygen and fuel to keep running.',
  },
  {
    id: 'maya',
    name: 'Maya Lin',
    seatId: 'Row 2, Seat 4',
    avatarKey: 'maya',
    topic: 'One-Way Heart Valves',
    teacherPrompt:
      'Maya, what is the main job of the heart valves, and what sound do they make when they snap shut?',
    studentAnswer:
      'They act like one-way trapdoors so blood can only flow forward! When they snap shut, they make the classic "Lub-Dub" heartbeat sound we hear through a stethoscope!',
    teacherFeedback:
      'Correct, Maya! Valves stop blood from flowing backwards, keeping the delivery loop moving forward.',
  },
  {
    id: 'marcus',
    name: 'Marcus Brody',
    seatId: 'Row 1, Seat 5',
    avatarKey: 'marcus',
    topic: 'Arteries vs. Veins',
    teacherPrompt:
      'Marcus, what is the key difference between an artery and a vein?',
    studentAnswer:
      'Arteries carry blood away from the heart under high pressure with thick elastic walls, while veins carry blood back to the heart at lower pressure and use valves to prevent backflow!',
    teacherFeedback:
      'Outstanding, Marcus! Remember the rule: A for Artery means Away from the heart!',
  },
];

/**
 * Teacher Pacing Stations throughout the Classroom
 */
export const TEACHER_PACING_STATIONS = [
  { id: 'podium', label: 'Teacher Podium', pos: [0, 0, -4.5], desc: 'Front center lecturing station' },
  { id: 'board_left', label: 'Vascular Board (Left)', pos: [-2.4, 0, -6.4], desc: 'Standing beside 4K circulatory tree' },
  { id: 'board_right', label: 'ECG Telemetry (Right)', pos: [2.4, 0, -6.4], desc: 'Standing beside live cardiac monitors' },
  { id: 'aisle_front', label: 'Front Aisle', pos: [0, 0, -2.4], desc: 'Close engagement with Rows 1 & 2' },
  { id: 'aisle_center', label: 'Center Aisle Walk', pos: [0, 0, 0.4], desc: 'Pacing between student desk rows' },
];

class TeacherInteractionService {
  constructor() {
    this.isCallingStudent = false;
    this.callTimeout = null;
  }

  // =========================================================================
  // FEATURE 1: CLASSROOM NAVIGATION & CALLING ON STUDENTS (COLD CALLING)
  // =========================================================================

  /**
   * Prompt a specific student from the roster to answer a Grade 8 science question
   */
  callOnStudent(studentId) {
    if (this.isCallingStudent) return;
    this.isCallingStudent = true;

    const student = TEACHER_STUDENT_ROSTER.find((s) => s.id === studentId) || TEACHER_STUDENT_ROSTER[0];
    const store = useClassroomStore.getState();

    // 1. Pause ongoing lecture if running
    const wasLecturing = store.lectureState === 'lecturing';
    if (wasLecturing) {
      lectureService.pauseLecture();
    }

    // 2. Set active call in store
    store.setActiveTeacherCall({
      studentName: student.name,
      seatId: student.seatId,
      topic: student.topic,
      teacherPrompt: student.teacherPrompt,
      studentAnswer: student.studentAnswer,
      teacherFeedback: student.teacherFeedback,
      status: 'calling', // 'calling' -> 'student_answering' -> 'teacher_praising' -> 'done'
    });

    // 3. Teacher John speaks prompt
    classroomVoiceService.speakTeacher(student.teacherPrompt, {
      onStart: () => store.setIsTeacherSpeaking(true),
      onEnd: () => {
        store.setIsTeacherSpeaking(false);
        store.setActiveTeacherCall({
          studentName: student.name,
          seatId: student.seatId,
          topic: student.topic,
          teacherPrompt: student.teacherPrompt,
          studentAnswer: student.studentAnswer,
          teacherFeedback: student.teacherFeedback,
          status: 'student_answering',
        });

        // 4. Student stands/raises hand and speaks
        setTimeout(() => {
          classroomVoiceService.fallbackSpeakStudent(student.avatarKey, student.studentAnswer, {
            onEnd: () => {
              store.setActiveTeacherCall({
                studentName: student.name,
                seatId: student.seatId,
                topic: student.topic,
                teacherPrompt: student.teacherPrompt,
                studentAnswer: student.studentAnswer,
                teacherFeedback: student.teacherFeedback,
                status: 'teacher_praising',
              });

              // 5. Teacher John speaks commendation
              setTimeout(() => {
                classroomVoiceService.speakTeacher(student.teacherFeedback, {
                  onStart: () => store.setIsTeacherSpeaking(true),
                  onEnd: () => {
                    store.setIsTeacherSpeaking(false);
                    store.setActiveTeacherCall({
                      studentName: student.name,
                      seatId: student.seatId,
                      topic: student.topic,
                      teacherPrompt: student.teacherPrompt,
                      studentAnswer: student.studentAnswer,
                      teacherFeedback: student.teacherFeedback,
                      status: 'done',
                    });

                    // 6. Dismiss and resume lecture if applicable
                    setTimeout(() => {
                      store.setActiveTeacherCall(null);
                      this.isCallingStudent = false;
                      if (wasLecturing) {
                        lectureService.resumeLecture();
                      }
                    }, 2800);
                  },
                });
              }, 400);
            },
          });
        }, 500);
      },
    });
  }

  /**
   * Pacing Station Teleport: Instantly or smoothly pace teacher avatar to key classroom vantage point
   */
  paceToStation(stationId) {
    const station = TEACHER_PACING_STATIONS.find((s) => s.id === stationId);
    if (!station) return;
    const store = useClassroomStore.getState();
    store.setTeacherWorldPosition(station.pos);
  }

  // =========================================================================
  // FEATURE 2: TEACHING DISPLAY & PRESENTATION AUTHORITY
  // =========================================================================

  toggleLaserPointer() {
    const store = useClassroomStore.getState();
    store.toggleLaserPointer();
  }

  jumpToMilestone(pointIndex) {
    const targetSeconds = pointIndex === 1 ? 0 : pointIndex === 2 ? 100 : pointIndex === 3 ? 200 : 300;
    lectureService.seekTo(targetSeconds);
  }

  toggleLecturePlayPause() {
    const store = useClassroomStore.getState();
    if (store.isLecturePaused) {
      lectureService.resumeLecture();
    } else {
      lectureService.pauseLecture();
    }
  }

  toggleBroadcastLock() {
    const store = useClassroomStore.getState();
    store.toggleDeviceBroadcastLock();
  }

  // =========================================================================
  // FEATURE 3: CLASSROOM MANAGEMENT & DISCIPLINE
  // =========================================================================

  issueVerbalReminder() {
    const store = useClassroomStore.getState();
    const reminderText =
      'Class, let us bring our full focus back to the circulatory diagrams on the board. We have vital medical concepts to master.';

    store.setActiveTeacherDiscipline({
      type: 'verbal_reminder',
      text: reminderText,
      timestamp: Date.now(),
    });

    classroomVoiceService.speakTeacher(reminderText, {
      onStart: () => store.setIsTeacherSpeaking(true),
      onEnd: () => {
        store.setIsTeacherSpeaking(false);
        setTimeout(() => store.setActiveTeacherDiscipline(null), 3000);
      },
    });
  }

  tapDeskToRefocus(studentName = 'Liam Patel', seatId = 'R1-S3') {
    const store = useClassroomStore.getState();
    physicsFoleyAudioService.playDeskTap();

    const text = `${studentName}, please set aside side notes and focus on the lecture.`;
    store.setActiveTeacherDiscipline({
      type: 'desk_tap',
      studentName,
      seatId,
      text,
      timestamp: Date.now(),
    });

    setTimeout(() => {
      classroomVoiceService.speakTeacher(text, {
        onStart: () => store.setIsTeacherSpeaking(true),
        onEnd: () => {
          store.setIsTeacherSpeaking(false);
          setTimeout(() => store.setActiveTeacherDiscipline(null), 2500);
        },
      });
    }, 200);
  }

  awardPraise(studentName = 'Sophia Garcia') {
    const store = useClassroomStore.getState();
    physicsFoleyAudioService.playPraiseChime();
    store.addTeacherPraiseScore(5);

    const text = `Outstanding clinical insight, ${studentName}! Awarding 5 participation points.`;
    store.setActiveTeacherDiscipline({
      type: 'praise',
      studentName,
      text,
      timestamp: Date.now(),
    });

    classroomVoiceService.speakTeacher(text, {
      onStart: () => store.setIsTeacherSpeaking(true),
      onEnd: () => {
        store.setIsTeacherSpeaking(false);
        setTimeout(() => store.setActiveTeacherDiscipline(null), 2500);
      },
    });
  }

  // =========================================================================
  // FEATURE 4: LIVE ASSESSMENT DISPATCHER & TELEMETRY
  // =========================================================================

  dispatchAssessmentQuestion(questionIndex) {
    const store = useClassroomStore.getState();
    store.setLectureState('qa');
    store.setCurrentQuizQuestionIndex(questionIndex);
    store.setQuizFeedback(null);

    const q = HEART_ANATOMY_QUIZ[questionIndex] || HEART_ANATOMY_QUIZ[0];
    const dispatchNotice = `Students, Question ${questionIndex + 1} has been dispatched to all 20 desk terminals. Please submit your answers.`;

    store.setLectureTranscript(dispatchNotice);
    classroomVoiceService.speakTeacher(dispatchNotice, {
      onStart: () => store.setIsTeacherSpeaking(true),
      onEnd: () => store.setIsTeacherSpeaking(false),
    });
  }

  revealAssessmentAnswer() {
    const store = useClassroomStore.getState();
    const currentIdx = store.currentQuizQuestionIndex;
    const q = HEART_ANATOMY_QUIZ[currentIdx];

    if (!q) return;

    if (q.type === 'open_ended') {
      lectureService.submitAnswer(currentIdx, 0, q.studentAnswerText);
    } else if (q.type === 'graph_builder') {
      lectureService.submitAnswer(currentIdx, 0);
    } else {
      lectureService.submitAnswer(currentIdx, q.correctIndex);
    }
  }

  getTelemetryStats() {
    const store = useClassroomStore.getState();
    const qIndex = store.currentQuizQuestionIndex;
    return {
      connectedDevices: 20,
      totalDevices: 20,
      submissions: Math.min(20, 18 + (qIndex % 3)),
      classAccuracy: '94.2%',
    };
  }
}

export const teacherInteractionService = new TeacherInteractionService();
