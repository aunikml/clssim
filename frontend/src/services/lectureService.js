import { blackboardService } from './blackboardService';
import { useClassroomStore } from '../store/classroomStore';
import { classroomAtmosphereAudioService } from './classroomAtmosphereAudioService';
import { classroomVoiceService } from './classroomVoiceService';

export const HEART_ANATOMY_QUIZ = [
  {
    id: 1,
    type: 'multiple_choice',
    studentName: 'Sophia Garcia',
    studentSeat: 'Row 2, Seat 2',
    question: "Which chamber of the human heart possesses the thickest muscular wall to pump oxygenated blood to the entire systemic circulation?",
    options: [
      "A. Left Ventricle (thick myocardium to overcome high systemic vascular resistance)",
      "B. Right Atrium (receives deoxygenated blood from the vena cavae)",
      "C. Right Ventricle (pumps blood to the low-pressure pulmonary circuit)",
      "D. Left Atrium (receives oxygenated blood from pulmonary veins)",
    ],
    correctIndex: 0,
    studentAnswerText: "Option A: Left Ventricle (thick myocardium to overcome high systemic vascular resistance)",
    explanation: "The left ventricle myocardium is three times thicker than the right ventricle because it must generate high systolic arterial pressure (~120 mmHg) to pump blood through the aorta to the entire systemic body.",
  },
  {
    id: 2,
    type: 'multiple_choice',
    studentName: 'Ethan Vance',
    studentSeat: 'Row 3, Seat 5',
    question: "Which anatomical valve prevents the backflow of blood from the left ventricle into the left atrium during ventricular systole?",
    options: [
      "A. Bicuspid (Mitral) Valve (anchored by chordae tendineae)",
      "B. Tricuspid Valve (located between right atrium and ventricle)",
      "C. Aortic Semilunar Valve (guards exit to aorta)",
      "D. Pulmonary Semilunar Valve (guards exit to pulmonary trunk)",
    ],
    correctIndex: 0,
    studentAnswerText: "Option A: Bicuspid (Mitral) Valve (anchored by chordae tendineae)",
    explanation: "The bicuspid (mitral) valve is located between the left atrium and left ventricle. Its cusps close tightly during ventricular contraction to prevent systolic regurgitation into the atrium.",
  },
  {
    id: 3,
    type: 'multiple_choice',
    studentName: 'Classroom Collective',
    studentSeat: 'Whole Class Desks',
    question: "Which specialized intrinsic cardiac cluster is known as the natural primary pacemaker of the heart, initiating the electrical action potential?",
    options: [
      "A. Sinoatrial (SA) Node (located in the superior right atrium)",
      "B. Atrioventricular (AV) Node (provides the critical 0.1s conduction delay)",
      "C. Atrioventricular Bundle of His (conducts down interventricular septum)",
      "D. Purkinje Fibers (distributes impulse upward through myocardium)",
    ],
    correctIndex: 0,
    studentAnswerText: "Option A: Sinoatrial (SA) Node (spontaneously sets 60-100 bpm rhythm)",
    explanation: "The Sinoatrial (SA) node acts as the heart's natural pacemaker, spontaneously generating rhythmic action potentials at 60 to 100 beats per minute to set the primary sinus rhythm.",
  },
  {
    id: 4,
    type: 'open_ended',
    studentName: 'Liam Patel',
    studentSeat: 'Row 1, Seat 3',
    question: "Clinical Physiology Inquiry: Why does chronic systemic arterial hypertension cause Left Ventricular Hypertrophy (LVH) rather than Right Ventricular Hypertrophy? Explain the hemodynamic afterload mechanism.",
    sampleAnswer: "Chronic systemic hypertension drastically elevates Left Ventricular afterload (~140-180 mmHg). By Laplace's Law (Wall Stress = P·r / 2h), myocytes hypertrophy concentrically to normalize wall tension. The pulmonary circuit remains low resistance (~25 mmHg), sparing the Right Ventricle.",
    studentAnswerText: "Chronic hypertension elevates LV afterload (140-180 mmHg). Via Laplace's Law (Wall Stress = P·r / 2h), myocytes hypertrophy to normalize wall stress, while the pulmonary circuit RV is spared (~25 mmHg).",
    explanation: "Elevated systemic vascular resistance dramatically increases LV afterload. Following Laplace's Law (σ = P·r / 2h), the LV myocardium undergoes concentric hypertrophy to maintain normal systolic wall stress, whereas pulmonary pressures remain low (~25 mmHg), sparing the right ventricle.",
  },
  {
    id: 5,
    type: 'graph_builder',
    studentName: 'Ethan Vance',
    studentSeat: 'Row 3, Seat 1',
    question: "Cardiovascular Hemodynamics Plotter: Plot the dynamic blood pressure gradient across the vascular highway (Aorta ➔ Large Arteries ➔ Arterioles ➔ Capillaries ➔ Venules ➔ Vena Cava). Where is the steepest resistance drop?",
    sampleAnswer: "The steepest pressure gradient drop occurs across Arterioles (~85 down to ~35 mmHg, accounting for ~60% of Total Peripheral Resistance) due to vascular smooth muscle resistance, protecting delicate capillaries.",
    studentAnswerText: "The steepest pressure gradient drop occurs across the Arterioles (from ~85 down to ~35 mmHg, accounting for ~60% of Total Peripheral Resistance) due to vascular smooth muscle resistance.",
    explanation: "The arterioles are the primary resistance vessels of the systemic circulation, contributing ~60% of Total Peripheral Resistance (TPR). Pressure falls precipitously from ~85 mmHg to ~35 mmHg before entering thin-walled capillaries.",
  },
];

// Backward compatibility alias
export const PHOTOSYNTHESIS_QUIZ = HEART_ANATOMY_QUIZ;

export const LECTURE_SECTIONS = [
  {
    id: 'point1_intro',
    point: 1,
    pointLabel: 'Point 1: Circulatory System',
    title: '1A. Vascular Highway & 3 Pillars',
    subtext: 'The Pump (Heart), The Highway & Fluid (Blood)',
    startSec: 0,
    endSec: 50,
    timeLabel: '0:00',
    stage: 1,
  },
  {
    id: 'point1_capillary',
    point: 1,
    pointLabel: 'Point 1: Circulatory System',
    title: '1B. Capillary Diffusion',
    subtext: 'Endothelial O₂/CO₂ Gas Exchange (<1mm/s)',
    startSec: 50,
    endSec: 100,
    timeLabel: '0:50',
    stage: 1,
  },
  {
    id: 'point2_chambers',
    point: 2,
    pointLabel: 'Point 2: Parts of the Heart',
    title: '2A. The 4 Cardiac Chambers',
    subtext: 'Right & Left Atria & Ventricles Segregation',
    startSec: 100,
    endSec: 125,
    timeLabel: '1:40',
    stage: 2,
  },
  {
    id: 'point2_myocardium',
    point: 2,
    pointLabel: 'Point 2: Parts of the Heart',
    title: '2B. LV 3× Myocardium Wall',
    subtext: '12-15mm Muscle vs 3-5mm RV · 120 mmHg Force',
    startSec: 125,
    endSec: 150,
    timeLabel: '2:05',
    stage: 2,
  },
  {
    id: 'point2_valves',
    point: 2,
    pointLabel: 'Point 2: Parts of the Heart',
    title: '2C. The 4 One-Way Valves',
    subtext: 'Tricuspid, Mitral, Chordae Tendineae Strings',
    startSec: 150,
    endSec: 175,
    timeLabel: '2:30',
    stage: 2,
  },
  {
    id: 'point2_acoustics',
    point: 2,
    pointLabel: 'Point 2: Parts of the Heart',
    title: '2D. Great Vessels & "Lub-Dub"',
    subtext: 'Aorta, Vena Cava & S1/S2 Acoustic Closures',
    startSec: 175,
    endSec: 200,
    timeLabel: '2:55',
    stage: 2,
  },
  {
    id: 'point3_pulmonary',
    point: 3,
    pointLabel: 'Point 3: Journey of Blood',
    title: '3A. Pulmonary Loop (Steps 1–4)',
    subtext: 'Vena Cava ➔ RA ➔ RV ➔ Lungs O₂ Pickup',
    startSec: 200,
    endSec: 250,
    timeLabel: '3:20',
    stage: 3,
  },
  {
    id: 'point3_systemic',
    point: 3,
    pointLabel: 'Point 3: Journey of Blood',
    title: '3B. Systemic Loop (Steps 5–8)',
    subtext: 'Pulm. Veins ➔ LA ➔ LV ➔ Aorta ➔ Body Organs',
    startSec: 250,
    endSec: 300,
    timeLabel: '4:10',
    stage: 3,
  },
  {
    id: 'qa_assessment',
    point: 4,
    pointLabel: 'Assessment & Pop Quiz',
    title: '4. Cardiology Q&A Quiz',
    subtext: '3 Interactive Desk Worksheet Questions',
    startSec: 300,
    endSec: 300,
    timeLabel: '5:00',
    stage: 4,
  },
];

export const LECTURE_SCRIPT_PARTS = [
  {
    startSec: 0,
    stage: 1,
    topic: '1. What is the Circulatory System?',
    transcript: 'Point 1: The Circulatory System is our body’s 60,000-mile vascular network comprising the Pump (Heart), the Highway (Arteries, Veins, Capillaries), and the Fluid (Blood) delivering oxygen and nutrients to every cell.',
    voice: 'Good morning, class! Today we begin our five-minute masterclass on the human circulatory system and the anatomy of the heart. Our first foundational point is: What is the circulatory system? Imagine a vast sixty-thousand-mile superhighway within you. The circulatory system is the master distribution network responsible for transporting oxygen, glucose, hormones, and immune cells to all forty trillion cells in your body, while carrying away carbon dioxide and metabolic waste. It relies on three primary pillars: first, the muscular pump—our heart; second, the vascular highways consisting of thick muscular arteries carrying blood under high pressure away from the heart, elastic veins equipped with one-way valves guiding blood back, and microscopic capillaries where nutrient exchange occurs; and third, the fluid itself—blood. Look at the display: notice how the capillary matrix enables oxygen to diffuse seamlessly into active tissues.',
  },
  {
    startSec: 50,
    stage: 1,
    topic: '1. Circulatory System: Capillary Diffusion & Microcirculation',
    transcript: 'Capillary beds: Microscopic vessels (5-8 µm) where oxygen and nutrients diffuse across thin endothelial walls into tissue cells, collecting CO2 and metabolic wastes into venules.',
    voice: 'Take a close look at the capillary exchange schematic on your display. Blood flow slows down dramatically here to less than one millimeter per second. This critical slowdown allows red blood cells to pass through in single file, unloading oxygen through the delicate endothelial membrane while absorbing metabolic carbon dioxide. Without this continuous microvascular transport, our cells would perish within minutes.',
  },
  {
    startSec: 100,
    stage: 2,
    topic: '2. Anatomical Parts of the Human Heart',
    transcript: 'Point 2: Parts of the Heart. A four-chambered double pump: Right Atrium & Ventricle (pulmonary side), Left Atrium & Ventricle (systemic side). The Left Ventricle has a 3× thicker myocardium (12-15mm) to generate 120 mmHg systolic pressure!',
    voice: 'Now, moving to our second point: The anatomical parts of the human heart. Your heart is a muscular organ roughly the size of your clenched fist, located in the thoracic cavity behind the sternum. Internally, it is divided into four distinct hollow chambers: two upper receiving chambers called atria, and two lower muscular pumping chambers called ventricles. Look at the anatomical cross-section on your screen: the right side—colored blue—handles deoxygenated blood, while the left side—colored red—handles oxygen-rich blood. Notice the critical difference in wall thickness: the left ventricle myocardium is three times thicker than the right ventricle! Why? Because while the right ventricle only needs to pump blood a few inches into the low-pressure lungs, the left ventricle must generate enough hydraulic force—around one hundred and twenty millimeters of mercury—to shoot blood all the way from the top of your head to the tips of your toes.',
  },
  {
    startSec: 125,
    stage: 2,
    topic: '2. Left Ventricle: 3× Myocardium Wall Thickness',
    transcript: 'Left Ventricle wall (12-15mm) is 3× thicker than RV (3-5mm) because it must generate ~120 mmHg to overcome massive systemic vascular resistance across 60,000 miles of vessels.',
    voice: 'Notice this crucial anatomical distinction on your screen: the left ventricle myocardium is three times thicker than the right. While the right ventricle only pumps a few inches into low-pressure lungs, the left ventricle must generate enough hydraulic force to shoot blood to the top of your head and tips of your toes.',
  },
  {
    startSec: 150,
    stage: 2,
    topic: '2. Parts of the Heart: The 4 Valves & Chordae Tendineae',
    transcript: 'Four cardiac valves enforce unidirectional flow: Tricuspid & Bicuspid (Mitral) AV valves anchored by chordae tendineae, and Pulmonary & Aortic semilunar valves producing the classic Lub-Dub heart sounds.',
    voice: 'Now observe the four one-way valves that prevent dangerous regurgitation. Between the atria and ventricles lie the atrioventricular valves: the Tricuspid on the right, and the Bicuspid—or Mitral valve—on the left, anchored by fibrous chordae tendineae and papillary muscles. Guarding the arterial exits are the semilunar valves: the Pulmonary and Aortic valves. When you listen to a stethoscope, the heartbeat sounds lub-dub: "lub" is the resonant closure of the A-V valves during ventricular contraction, and "dub" is the crisp snap of the semilunar valves as the ventricles relax.',
  },
  {
    startSec: 175,
    stage: 2,
    topic: '2. Cardiac Valves: S₁/S₂ Heart Sounds (Lub-Dub)',
    transcript: 'Heart sounds: S₁ "LUB" is caused by AV valve closure at the onset of ventricular systole; S₂ "DUB" is caused by semilunar valve closure at the onset of ventricular diastole.',
    voice: 'When a physician listens with a stethoscope, the characteristic lub-dub sounds are actually valve closures: lub is the closure of the A-V valves, and dub is the closure of the semilunar valves.',
  },
  {
    startSec: 200,
    stage: 3,
    topic: '3. The Journey of Blood in the Circulatory System',
    transcript: 'Point 3: The Journey of Blood. Tracing the 8-step Dual Circulation Figure-8 circuit: Vena Cavae ➔ Right Atrium ➔ Tricuspid ➔ Right Ventricle ➔ Pulmonary Trunk ➔ Lungs (O2 pickup) ➔ Pulmonary Veins ➔ Left Atrium ➔ Mitral Valve ➔ Left Ventricle ➔ Aorta ➔ Systemic Body!',
    voice: 'Now, let us examine our third and culminating topic: The complete journey of blood in the circulatory system. Humans possess a dual circulation system organized like a figure-eight: the pulmonary loop on top, and the systemic loop below. Let us trace a single red blood cell along its eight-step journey. First, deoxygenated blood depleted of oxygen returns from your tissues through the superior and inferior vena cavae into the right atrium. Second, it passes through the tricuspid valve into the right ventricle. Third, the right ventricle contracts, pumping blood through the pulmonary semilunar valve into the pulmonary artery toward both lungs. In the alveolar capillaries, blood releases carbon dioxide and becomes saturated with fresh oxygen. Step four: this vibrant oxygenated blood returns through the four pulmonary veins into the left atrium.',
  },
  {
    startSec: 250,
    stage: 3,
    topic: '3. Blood Journey: Systemic Propulsion via Aorta',
    transcript: 'Oxygen-saturated blood surges through the Mitral valve into the Left Ventricle, ejecting through the Aortic valve into the Aorta Arch at 120 mmHg, delivering life-sustaining O2 across systemic arteries before returning to repeat the cycle!',
    voice: 'Continuing our journey at step five: blood flows from the left atrium through the mitral valve into the powerful left ventricle. Step six: with immense force, the left ventricle contracts in systole, propelling blood through the aortic valve into the ascending aorta and aortic arch. Step seven: systemic arteries branch out, channeling oxygen-rich blood into millions of capillary networks across your brain, kidneys, liver, and skeletal muscles. And step eight: after unloading oxygen and absorbing cellular wastes, the deoxygenated blood converges into systemic venules and veins, returning to the vena cava to repeat this miraculous journey every sixty seconds! That completes our five-minute lecture. Students, please turn your attention to your desk worksheets for our cardiology assessment!',
  },
];

class LectureService {
  constructor() {
    this.countdownTimer = null;
    this.lectureTimer = null;
    this.speechUtterance = null;
    this.currentScriptIndex = -1;
    this.subscribers = new Set();
  }

  speak(text, onEnd) {
    const store = useClassroomStore.getState();
    classroomVoiceService.speakTeacher(text, {
      onStart: () => store.setIsTeacherSpeaking(true),
      onEnd: () => {
        store.setIsTeacherSpeaking(false);
        if (onEnd) onEnd();
      },
    });
  }

  stopSpeech() {
    classroomVoiceService.stop();
    useClassroomStore.getState().setIsTeacherSpeaking(false);
  }

  // Start the 20-second countdown before the lecture
  startCountdown() {
    this.stopAll();
    const store = useClassroomStore.getState();
    store.setLectureState('countdown');
    store.setLectureCountdown(20);
    store.setLectureTranscript('🔔 Classroom session initialized. Lecture on Anatomy of the Human Heart begins in 20 seconds. Please take your seats!');

    this.speak('Class will begin in twenty seconds. Students, please find your desks and take your seats for today\'s lecture on the Anatomy of the Human Heart.');

    this.countdownTimer = setInterval(() => {
      const current = useClassroomStore.getState().lectureCountdown;
      if (current <= 1) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.startLecture();
      } else {
        useClassroomStore.getState().setLectureCountdown(current - 1);
        if (current === 11) {
          this.speak('Ten seconds remaining. Everyone please be seated.');
        } else if (current === 4) {
          this.speak('Starting in three, two, one.');
        }
      }
    }, 1000);
  }

  // 5-minute (300-second) Masterclass on the Human Circulatory System & Anatomy of the Heart
  startLecture() {
    this.stopAll();
    const store = useClassroomStore.getState();
    store.setLectureState('lecturing');
    store.setIsLecturePaused(false);
    store.setLectureTimer(0);

    // Initial Stage 1 on blackboard
    classroomAtmosphereAudioService.playEraserWipe();
    setTimeout(() => classroomAtmosphereAudioService.playChalkScratch(1200), 300);
    blackboardService.loadHeartAnatomyStage(1);

    this.currentScriptIndex = 0;
    const initialPart = LECTURE_SCRIPT_PARTS[0];
    store.setLectureTopic(initialPart.topic);
    store.setLectureTranscript(initialPart.transcript);
    this.speak(initialPart.voice);

    this.lectureTimer = setInterval(() => {
      const elapsed = useClassroomStore.getState().lectureTimer + 1;
      useClassroomStore.getState().setLectureTimer(elapsed);
      this.checkLectureProgress(elapsed);
    }, 1000);
  }

  checkLectureProgress(elapsed) {
    const store = useClassroomStore.getState();

    // Check if entering a new script section
    for (let i = LECTURE_SCRIPT_PARTS.length - 1; i >= 0; i--) {
      if (elapsed >= LECTURE_SCRIPT_PARTS[i].startSec) {
        if (this.currentScriptIndex !== i) {
          this.currentScriptIndex = i;
          const item = LECTURE_SCRIPT_PARTS[i];
          store.setLectureTopic(item.topic);
          store.setLectureTranscript(item.transcript);
          classroomAtmosphereAudioService.playChalkScratch(1400);
          blackboardService.loadHeartAnatomyStage(item.stage);
          this.speak(item.voice);
        }
        break;
      }
    }

    // Check 5-minute mark (300 seconds)
    if (elapsed >= 300) {
      if (this.lectureTimer) {
        clearInterval(this.lectureTimer);
        this.lectureTimer = null;
      }
      this.startQA();
    }
  }

  // --- Interactive Lecture Navigation / Scrubber Controls ---

  /**
   * Seek directly to a timestamp (in seconds, 0 to 300)
   */
  seekTo(targetSeconds, autoSpeak = true) {
    const store = useClassroomStore.getState();
    const clamped = Math.max(0, Math.min(300, Math.floor(targetSeconds)));

    if (clamped >= 300) {
      if (this.lectureTimer) {
        clearInterval(this.lectureTimer);
        this.lectureTimer = null;
      }
      this.startQA();
      return;
    }

    // Stop current speech to sync with new section
    this.stopSpeech();

    // If lecture is not currently lecturing, switch state
    if (store.lectureState !== 'lecturing') {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
      store.setLectureState('lecturing');
    }

    store.setIsLecturePaused(false);
    store.setLectureTimer(clamped);

    // Ensure lecture timer interval is running
    if (!this.lectureTimer) {
      this.lectureTimer = setInterval(() => {
        const elapsed = useClassroomStore.getState().lectureTimer + 1;
        useClassroomStore.getState().setLectureTimer(elapsed);
        this.checkLectureProgress(elapsed);
      }, 1000);
    }

    // Apply matching script part for target timestamp
    let foundIndex = 0;
    for (let i = LECTURE_SCRIPT_PARTS.length - 1; i >= 0; i--) {
      if (clamped >= LECTURE_SCRIPT_PARTS[i].startSec) {
        foundIndex = i;
        break;
      }
    }

    this.currentScriptIndex = foundIndex;
    const item = LECTURE_SCRIPT_PARTS[foundIndex];
    store.setLectureTopic(item.topic);
    store.setLectureTranscript(item.transcript);
    classroomAtmosphereAudioService.playChalkScratch(1200);
    blackboardService.loadHeartAnatomyStage(item.stage);

    if (autoSpeak) {
      this.speak(item.voice);
    }
  }

  /**
   * Jump to a named section (e.g., 'point1_intro', 'point2_valves', 'qa_assessment')
   */
  jumpToSection(sectionId) {
    const section = LECTURE_SECTIONS.find((s) => s.id === sectionId);
    if (!section) return;
    this.seekTo(section.startSec, true);
  }

  /**
   * Jump to next section
   */
  nextSection() {
    const store = useClassroomStore.getState();
    const currentT = store.lectureTimer;

    // If not lecturing yet, start lecture
    if (store.lectureState === 'idle' || store.lectureState === 'countdown') {
      this.startLecture();
      return;
    }

    // Find next section that starts after current time + 1.5s
    const next = LECTURE_SECTIONS.find((s) => s.startSec > currentT + 1.5);
    if (next) {
      this.seekTo(next.startSec, true);
    } else {
      this.startQA();
    }
  }

  /**
   * Jump to previous section (or beginning of current if > 3s into it)
   */
  previousSection() {
    const store = useClassroomStore.getState();
    const currentT = store.lectureTimer;

    // Find current active section index
    let activeIdx = 0;
    for (let i = LECTURE_SECTIONS.length - 1; i >= 0; i--) {
      if (currentT >= LECTURE_SECTIONS[i].startSec) {
        activeIdx = i;
        break;
      }
    }

    const currentSec = LECTURE_SECTIONS[activeIdx];
    // If more than 3 seconds into current section, rewind to its start
    if (currentT - currentSec.startSec > 3.0) {
      this.seekTo(currentSec.startSec, true);
    } else if (activeIdx > 0) {
      // Otherwise jump to previous section
      this.seekTo(LECTURE_SECTIONS[activeIdx - 1].startSec, true);
    } else {
      this.seekTo(0, true);
    }
  }

  /**
   * Skip forward or backward by delta seconds
   */
  skipSeconds(deltaSec) {
    const store = useClassroomStore.getState();
    this.seekTo(store.lectureTimer + deltaSec, true);
  }

  /**
   * Pause or resume the active lecture
   */
  togglePause() {
    const store = useClassroomStore.getState();
    if (store.isLecturePaused) {
      this.resumeLecture();
    } else {
      this.pauseLecture();
    }
  }

  pauseLecture() {
    if (this.lectureTimer) {
      clearInterval(this.lectureTimer);
      this.lectureTimer = null;
    }
    this.stopSpeech();
    useClassroomStore.getState().setIsLecturePaused(true);
  }

  resumeLecture() {
    const store = useClassroomStore.getState();
    store.setIsLecturePaused(false);

    if (store.lectureState !== 'lecturing') {
      this.startLecture();
      return;
    }

    if (!this.lectureTimer) {
      this.lectureTimer = setInterval(() => {
        const elapsed = useClassroomStore.getState().lectureTimer + 1;
        useClassroomStore.getState().setLectureTimer(elapsed);
        this.checkLectureProgress(elapsed);
      }, 1000);
    }

    // Resume speech for current part
    const part = LECTURE_SCRIPT_PARTS[this.currentScriptIndex] || LECTURE_SCRIPT_PARTS[0];
    if (part) {
      this.speak(part.voice);
    }
  }

  // Phase 3: Interactive Q&A / Assessment
  startQA() {
    this.stopSpeech();
    const store = useClassroomStore.getState();
    store.setLectureState('qa');
    store.setCurrentQuizQuestionIndex(0);
    store.setQuizFeedback(null);
    store.setActiveStudentAnswer({
      studentName: 'Sophia Garcia',
      seatId: 'Row 2, Seat 2',
      answerText: 'Option A: Left Ventricle (thickest 12-15mm myocardium to overcome systemic resistance)',
      isCorrect: true,
      questionIndex: 0,
    });
    store.setLectureTranscript('📝 Question 1: Which chamber has the thickest muscular wall? (Sophia Garcia raises her hand...)');

    // Write question 1 on chalkboard with chalk audio
    classroomAtmosphereAudioService.playEraserWipe();
    setTimeout(() => {
      classroomAtmosphereAudioService.playChalkScratch(1800);
      blackboardService.loadAssessmentQuestion(0, HEART_ANATOMY_QUIZ[0], null, null);
    }, 400);

    // Question 1: One student (Sophia) raises hand to answer
    this.speak(
      'Class, for our assessment, Question One is on the board and on your desk worksheets. Which chamber of the human heart has the thickest muscular wall? ... Ah, I see one hand raised. Yes, Sophia in row two, go ahead!',
      () => {
        // Sophia speaks up in a natural student voice
        store.setLectureTranscript('🗣️ Sophia Garcia (R2-S2): "Um, it\'s Option A, Mr. John! The Left Ventricle has the thickest myocardium because it pumps blood through the aorta to the entire systemic body!"');
        classroomVoiceService.speakStudent(
          'Sophia',
          "Um, it's Option A, Mr. John! The Left Ventricle has the thickest myocardium because it pumps blood through the aorta to the entire systemic body!",
          {
            onEnd: () => {
              store.setLectureTranscript('📝 Sophia Garcia answered Option A! Confirm on your desk worksheet or click Submit!');
            },
          }
        );
      }
    );
  }

  submitAnswer(questionIndex, selectedOptionIndex, customAnswerText) {
    const q = HEART_ANATOMY_QUIZ[questionIndex];
    if (!q) return;

    const store = useClassroomStore.getState();
    const isCorrect = q.type === 'multiple_choice' ? selectedOptionIndex === q.correctIndex : true;

    // Update chalkboard with feedback
    blackboardService.loadAssessmentQuestion(
      questionIndex,
      q,
      selectedOptionIndex,
      { isCorrect, explanation: q.explanation }
    );

    if (questionIndex === 0) {
      store.setActiveStudentAnswer({
        studentName: 'Sophia Garcia',
        seatId: 'Row 2, Seat 2',
        answerText: 'Option A: Left Ventricle (thick myocardium to overcome high systemic vascular resistance)',
        isCorrect,
        questionIndex: 0,
      });
      if (isCorrect) {
        store.setQuizFeedback({
          isCorrect: true,
          text: `✅ Correct! Sophia Garcia and you got it right: ${q.explanation}`,
        });
        this.speak(`Spot on, Sophia! The left ventricle wall is three times thicker than the right to overcome systemic vascular resistance. Exactly right!`);
      } else {
        store.setQuizFeedback({
          isCorrect: false,
          text: `❌ Not quite. Remember: ${q.explanation}`,
        });
        this.speak(`Not quite. Look at the board diagram: the left ventricle requires the thickest myocardium to supply the entire body.`);
      }
    } else if (questionIndex === 1) {
      store.setActiveStudentAnswer({
        studentName: 'Ethan Vance',
        seatId: 'Row 3, Seat 5',
        answerText: 'Option A: Bicuspid (Mitral) Valve (anchored by chordae tendineae)',
        isCorrect,
        questionIndex: 1,
      });
      if (isCorrect) {
        store.setQuizFeedback({
          isCorrect: true,
          text: `✅ Correct! Ethan Vance and the class identified: ${q.explanation}`,
        });
        this.speak(`Yes! The Mitral, or Bicuspid, valve prevents regurgitation back into the left atrium during ventricular systole.`);
      } else {
        store.setQuizFeedback({
          isCorrect: false,
          text: `❌ It's the Bicuspid (Mitral) Valve! ${q.explanation}`,
        });
        this.speak(`The valve guarding the left atrium is the Mitral or Bicuspid valve. Let us make sure that is written down clearly.`);
      }
    } else if (questionIndex === 2) {
      store.setActiveStudentAnswer({
        studentName: 'Classroom Collective',
        seatId: 'Whole Class',
        answerText: 'Option A: Sinoatrial (SA) Node (Natural Pacemaker setting 60-100 bpm)',
        isCorrect,
        questionIndex: 2,
      });
      if (isCorrect) {
        store.setQuizFeedback({
          isCorrect: true,
          text: `✅ Correct! Sinoatrial (SA) Node! The whole class shouted it: ${q.explanation}`,
        });
        this.speak(`Yes, yes! The Sinoatrial Node, the S-A node, is the primary pacemaker! Great energy class, but remember to wait to be called on!`);
      } else {
        store.setQuizFeedback({
          isCorrect: false,
          text: `❌ The pacemaker is the Sinoatrial (SA) Node! ${q.explanation}`,
        });
        this.speak(`Remember, the natural primary pacemaker is the Sinoatrial Node in the right atrium.`);
      }
    } else if (questionIndex === 3) {
      // Question 4: Open-ended Clinical Physiology
      const answer = customAnswerText || q.studentAnswerText;
      store.setActiveStudentAnswer({
        studentName: 'Liam Patel',
        seatId: 'Row 1, Seat 3',
        answerText: answer,
        isCorrect: true,
        questionIndex: 3,
      });
      store.setQuizFeedback({
        isCorrect: true,
        text: `✅ Outstanding Clinical Reasoning! Liam Patel correctly applied Laplace's Law and afterload mechanics: ${q.explanation}`,
      });
      this.speak(`Brilliant clinical deduction, Liam! Laplace's Law states wall stress equals pressure times radius divided by two times wall thickness. Chronic systemic hypertension increases LV afterload, forcing myocytes to thicken concentrically to normalize tension, while the low-pressure pulmonary circuit spares the right ventricle.`);
    } else if (questionIndex === 4) {
      // Question 5: Graph Builder
      store.setActiveStudentAnswer({
        studentName: 'Ethan Vance',
        seatId: 'Row 3, Seat 1',
        answerText: 'Steepest Pressure Drop: Arterioles (plunging from ~85 down to ~35 mmHg, accounting for ~60% of TPR)',
        isCorrect: true,
        questionIndex: 4,
      });
      store.setQuizFeedback({
        isCorrect: true,
        text: `✅ Hemodynamic Graph Plotted! Ethan Vance identified the arteriolar resistance drop: ${q.explanation}`,
      });
      this.speak(`Superb graphing, Ethan! Look at the digital board: the steep pressure drop from 85 down to 35 millimeters of mercury occurs right across the arterioles, which produce 60 percent of systemic peripheral resistance to protect delicate capillaries!`);
    }
  }

  nextQuestion() {
    const store = useClassroomStore.getState();
    const nextIdx = store.currentQuizQuestionIndex + 1;
    if (nextIdx < HEART_ANATOMY_QUIZ.length) {
      store.setCurrentQuizQuestionIndex(nextIdx);
      store.setQuizFeedback(null);

      // Write next question on the board with chalk foley
      classroomAtmosphereAudioService.playChalkScratch(1600);
      blackboardService.loadAssessmentQuestion(nextIdx, HEART_ANATOMY_QUIZ[nextIdx], null, null);

      if (nextIdx === 1) {
        // Question 2: DEAD SILENCE - No one raises hand!
        store.setActiveStudentAnswer({
          studentName: 'Ethan Vance',
          seatId: 'Row 3, Seat 5',
          answerText: 'Option A: Bicuspid (Mitral) Valve (anchored by chordae tendineae)',
          isCorrect: true,
          questionIndex: 1,
        });
        store.setLectureTranscript('📝 Question 2: Which valve prevents backflow into the left atrium? (Dead silence... Not a single student raises their hand!)');
        this.speak(
          'Now for Question Two on the board: Which anatomical valve prevents the backflow of blood from the left ventricle into the left atrium during ventricular systole? ... Anyone? Nobody? Not a single hand raised? Dead silence from the entire room?',
          () => {
            // Ethan mutters timidly after awkward silence
            setTimeout(() => {
              store.setLectureTranscript('🗣️ Ethan Vance (R3-S5, muttering nervously): "...is it... the bicuspid mitral valve, Mr. John...?"');
              classroomVoiceService.speakStudent('Ethan', '...is it... the bicuspid mitral valve, Mr. John...?', {
                onEnd: () => {
                  store.setLectureTranscript('📝 Ethan Vance answered Bicuspid (Mitral) Valve! Confirm your choice.');
                },
              });
            }, 800);
          }
        );
      } else if (nextIdx === 2) {
        // Question 3: TOTAL CHAOS - All students answer together!
        store.setActiveStudentAnswer({
          studentName: 'Classroom Collective',
          seatId: 'Whole Class Desks',
          answerText: 'Option A: Sinoatrial (SA) Node (Primary Cardiac Pacemaker)',
          isCorrect: true,
          questionIndex: 2,
        });
        store.setLectureTranscript('📝 Question 3: Which cardiac cluster is the natural primary pacemaker? (Total Chaos! All students waving hands and answering simultaneously!)');
        this.speak(
          'Alright, Question Three! Which specialized cardiac cluster acts as the natural primary pacemaker of the heart, initiating electrical impulses?',
          () => {
            // Students shout simultaneously!
            classroomAtmosphereAudioService.playClassroomMurmur(3400);
            store.setLectureTranscript('🗣️ Class (Chaos Shouting): "Option A! SA Node! The Sinoatrial Node!"');
            classroomVoiceService.speakClassChaos(
              [
                { name: 'Sophia', gender: 'female', text: 'Option A! The SA Node!' },
                { name: 'Ethan', gender: 'male', text: 'SA Node! Option A!' },
                { name: 'Liam', gender: 'male', text: "It's the Sinoatrial Node, Mr. John!" },
              ],
              () => {
                // Teacher calms down the room
                store.setLectureTranscript('👨‍🏫 Teacher John: "Whoa, whoa, everyone at once! Calm down, class! Great energy, now mark Option A on your worksheets!"');
                this.speak('Whoa, whoa! Everyone at once! Calm down, class! One at a time! Everyone is shouting over each other! Great energy, yes, the Sinoatrial Node is correct! Now verify your answer on your worksheet!');
              }
            );
          }
        );
      } else if (nextIdx === 3) {
        // Question 4: Open-Ended Clinical Inquiry - Liam Patel answers
        store.setActiveStudentAnswer({
          studentName: 'Liam Patel',
          seatId: 'Row 1, Seat 3',
          answerText: HEART_ANATOMY_QUIZ[3].studentAnswerText,
          isCorrect: true,
          questionIndex: 3,
        });
        store.setLectureTranscript('📝 Question 4 (Open-Ended Clinical Inquiry): Liam Patel (Row 1, Seat 3) raises his hand to explain afterload and Laplace mechanics...');
        this.speak(
          'Now Question Four is an open-ended clinical inquiry: Why does chronic systemic arterial hypertension cause Left Ventricular Hypertrophy rather than Right Ventricular Hypertrophy? Explain the hemodynamic afterload mechanism. ... Liam in row one, go ahead!',
          () => {
            store.setLectureTranscript('🗣️ Liam Patel (R1-S3): "In chronic hypertension, systemic vascular resistance creates extreme afterload on the Left Ventricle. By Laplace\'s Law, myocytes hypertrophy to normalize wall stress. The pulmonary circuit is low resistance, sparing the RV!"');
            classroomVoiceService.speakStudent(
              'Liam',
              "In chronic hypertension, systemic vascular resistance creates extreme afterload on the Left Ventricle. By Laplace's Law, myocytes hypertrophy to normalize wall stress. The pulmonary circuit is low resistance, sparing the RV!",
              {
                onEnd: () => {
                  store.setLectureTranscript('👨‍🏫 Teacher John: "Textbook clinical application, Liam! Review Liam\'s explanation on the board and submit your clinical notes."');
                },
              }
            );
          }
        );
      } else if (nextIdx === 4) {
        // Question 5: Graph Builder - Ethan Vance plots pressure gradient curve
        store.setActiveStudentAnswer({
          studentName: 'Ethan Vance',
          seatId: 'Row 3, Seat 1',
          answerText: HEART_ANATOMY_QUIZ[4].studentAnswerText,
          isCorrect: true,
          questionIndex: 4,
        });
        store.setLectureTranscript('📝 Question 5 (Hemodynamics Graph Builder): Ethan Vance plots the dynamic vascular pressure gradient on the smart screen...');
        this.speak(
          'For Question Five, we are plotting the cardiovascular pressure gradient across the vascular highway from the Aorta to the Vena Cava. Ethan in row three, where does your graph show the steepest pressure drop?',
          () => {
            store.setLectureTranscript('🗣️ Ethan Vance (R3-S1): "The graph plots the steepest drop across the Arterioles—falling from 85 down to 35 millimeters of mercury because of high vascular smooth muscle resistance, producing 60 percent of Total Peripheral Resistance!"');
            classroomVoiceService.speakStudent(
              'Ethan',
              'The graph plots the steepest drop across the Arterioles—falling from 85 down to 35 millimeters of mercury because of high vascular smooth muscle resistance, producing 60 percent of Total Peripheral Resistance!',
              {
                onEnd: () => {
                  store.setLectureTranscript('👨‍🏫 Teacher John: "Outstanding graph plotting, Ethan! Look at the dynamic pressure drop curve rendered on the smart screen!"');
                }
              }
            );
          }
        );
      }
    } else {
      store.setLectureState('completed');
      store.setQuizFeedback({
        isCorrect: true,
        text: '🎉 Congratulations! You have completed the Anatomy of the Human Heart & Hemodynamics Practicum with Teacher John!',
      });
      this.speak('Congratulations to everyone! You have successfully completed today\'s lesson on the Anatomy of the Human Heart and Cardiovascular Hemodynamics. Outstanding participation across all five questions!');
    }
  }

  stopAll() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.lectureTimer) {
      clearInterval(this.lectureTimer);
      this.lectureTimer = null;
    }
    this.stopSpeech();
  }
}

export const lectureService = new LectureService();
