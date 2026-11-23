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
    question: "Which chamber of the human heart has the thickest, strongest muscular wall to pump fresh, oxygen-rich blood all the way through your body?",
    options: [
      "A. Left Ventricle (strongest chamber because it pumps blood all the way to your brain and toes!)",
      "B. Right Atrium (receives used oxygen-poor blood from the body)",
      "C. Right Ventricle (only pumps a short distance over to the lungs)",
      "D. Left Atrium (receives fresh blood from the lungs)",
    ],
    correctIndex: 0,
    studentAnswerText: "Option A: Left Ventricle (strongest chamber because it pumps blood all the way to your brain and toes!)",
    explanation: "The left ventricle has the thickest muscle wall because it must pump blood through the aorta to your entire body, whereas the right ventricle only pumps a short distance to your lungs.",
  },
  {
    id: 2,
    type: 'multiple_choice',
    studentName: 'Ethan Vance',
    studentSeat: 'Row 3, Seat 5',
    question: "What is the main job of the one-way valves inside your heart?",
    options: [
      "A. To keep blood flowing forward in one direction and stop it from leaking backwards",
      "B. To clean germs and bacteria out of the bloodstream",
      "C. To add oxygen gas directly into your blood cells",
      "D. To make your heart beat faster when you run",
    ],
    correctIndex: 0,
    studentAnswerText: "Option A: To keep blood flowing forward in one direction and stop it from leaking backwards",
    explanation: "Heart valves act like one-way trapdoors. When ventricles squeeze, the valves snap shut to make sure blood only travels forward and cannot flow backward.",
  },
  {
    id: 3,
    type: 'multiple_choice',
    studentName: 'Classroom Collective',
    studentSeat: 'Whole Class Desks',
    question: "When a doctor or nurse listens to your heart with a stethoscope, what creates the familiar 'lub-dub' sound?",
    options: [
      "A. The heart valves snapping shut as the chambers squeeze and relax",
      "B. Blood splashing against the ribs and lungs",
      "C. Air rushing in and out of the windpipe",
      "D. Muscle cramps inside the chest",
    ],
    correctIndex: 0,
    studentAnswerText: "Option A: The heart valves snapping shut as the chambers squeeze and relax",
    explanation: "The 'lub' sound happens when the valves between atria and ventricles snap shut, and the 'dub' sound happens when the exit valves snap shut right after!",
  },
  {
    id: 4,
    type: 'open_ended',
    studentName: 'Liam Patel',
    studentSeat: 'Row 1, Seat 3',
    question: "Science Inquiry: Why do your heart rate and breathing rate increase when you are sprinting in gym class?",
    sampleAnswer: "When you run, your working muscle cells need more oxygen and energy (glucose) to keep contracting. Your heart beats faster to pump more oxygen-rich blood, and your lungs breathe faster to take in oxygen and exhale carbon dioxide waste!",
    studentAnswerText: "When we sprint, our leg muscle cells burn more energy and need extra oxygen. Our heart beats faster to deliver oxygen-rich blood and remove carbon dioxide waste!",
    explanation: "During exercise, cellular respiration in muscle cells ramps up. The heart accelerates to supply oxygen and glucose while removing CO2 and metabolic heat.",
  },
  {
    id: 5,
    type: 'graph_builder',
    studentName: 'Ethan Vance',
    studentSeat: 'Row 3, Seat 1',
    question: "Vascular Highway Order: Trace the correct order of blood vessels blood travels through after leaving the heart: Arteries, Capillaries, or Veins?",
    sampleAnswer: "Heart ➔ Arteries (thick, elastic walls carrying blood Away under high pressure) ➔ Capillaries (microscopic 1-cell thick tubes for oxygen delivery) ➔ Veins (lower pressure tubes with one-way valves returning to the heart)!",
    studentAnswerText: "Heart ➔ Arteries (carry blood Away) ➔ Capillaries (tiny exchange tubes) ➔ Veins (valves return blood back to the heart)!",
    explanation: "Arteries carry blood Away from the heart under high pressure; capillaries allow oxygen and nutrients to diffuse into cells; veins bring blood back to the heart!",
  },
];

// Backward compatibility alias
export const PHOTOSYNTHESIS_QUIZ = HEART_ANATOMY_QUIZ;

export const LECTURE_SECTIONS = [
  {
    id: 'point1_intro',
    point: 1,
    pointLabel: 'Point 1: Circulatory System',
    title: '1A. The 24/7 Delivery Highway',
    subtext: 'The Pump (Heart), The Pipes (Vessels) & Fluid (Blood)',
    startSec: 0,
    endSec: 50,
    timeLabel: '0:00',
    stage: 1,
  },
  {
    id: 'point1_capillary',
    point: 1,
    pointLabel: 'Point 1: Circulatory System',
    title: '1B. Capillary Delivery Stops',
    subtext: 'Dropping off Oxygen (O₂) & Picking up Carbon Dioxide (CO₂)',
    startSec: 50,
    endSec: 100,
    timeLabel: '0:50',
    stage: 1,
  },
  {
    id: 'point2_chambers',
    point: 2,
    pointLabel: 'Point 2: Parts of the Heart',
    title: '2A. The 4 Heart Chambers',
    subtext: '2 Atria (Receivers) & 2 Ventricles (Pumps)',
    startSec: 100,
    endSec: 125,
    timeLabel: '1:40',
    stage: 2,
  },
  {
    id: 'point2_myocardium',
    point: 2,
    pointLabel: 'Point 2: Parts of the Heart',
    title: '2B. Left Ventricle: Powerful Body Pump',
    subtext: 'Pumping blood all the way from your head to your toes!',
    startSec: 125,
    endSec: 150,
    timeLabel: '2:05',
    stage: 2,
  },
  {
    id: 'point2_valves',
    point: 2,
    pointLabel: 'Point 2: Parts of the Heart',
    title: '2C. One-Way Trapdoor Valves',
    subtext: 'Tricuspid & Bicuspid Valves stop blood flowing backward',
    startSec: 150,
    endSec: 175,
    timeLabel: '2:30',
    stage: 2,
  },
  {
    id: 'point2_acoustics',
    point: 2,
    pointLabel: 'Point 2: Parts of the Heart',
    title: '2D. The "Lub-Dub" Heartbeat',
    subtext: 'What you hear in a stethoscope when valves snap shut',
    startSec: 175,
    endSec: 200,
    timeLabel: '2:55',
    stage: 2,
  },
  {
    id: 'point3_pulmonary',
    point: 3,
    pointLabel: 'Point 3: Double Loop Journey',
    title: '3A. Loop 1: Heart to Lungs (O₂ Pickup)',
    subtext: 'Right side of the heart sends blue blood to get fresh oxygen',
    startSec: 200,
    endSec: 250,
    timeLabel: '3:20',
    stage: 3,
  },
  {
    id: 'point3_systemic',
    point: 3,
    pointLabel: 'Point 3: Double Loop Journey',
    title: '3B. Loop 2: Heart to Body (Oxygen Delivery)',
    subtext: 'Left side of the heart propels red blood through the Aorta',
    startSec: 250,
    endSec: 300,
    timeLabel: '4:10',
    stage: 3,
  },
  {
    id: 'qa_assessment',
    point: 4,
    pointLabel: 'Assessment & Pop Quiz',
    title: '4. Grade 8 Science Pop Quiz',
    subtext: '5 Interactive Worksheet & Card Check Questions',
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
    transcript: 'Point 1: The Circulatory System is our body’s delivery network consisting of the Pump (Heart), the Pipes (Arteries, Veins, Capillaries), and the Fluid (Blood) delivering oxygen and nutrients to all 37 trillion cells.',
    voice: 'Good morning, class! Today we are learning how our human heart and circulatory system work together like a 24/7 delivery service for all 37 trillion cells in your body. Our first big question is: What is the circulatory system? Imagine a vast highway inside you. Your cells need fresh oxygen and food to stay alive, and they produce waste like carbon dioxide that must be carried away. The circulatory system relies on three main parts: first, the muscular pump—our heart; second, the pipes—thick arteries carrying blood away from the heart, veins bringing it back, and tiny capillaries where deliveries happen; and third, the delivery trucks—our blood cells!',
  },
  {
    startSec: 50,
    stage: 1,
    topic: '1. Circulatory System: Capillary Delivery Stops',
    transcript: 'Capillaries: Microscopic blood vessels so narrow that red blood cells must travel in single file, dropping off oxygen and nutrients while picking up carbon dioxide waste from your cells.',
    voice: 'Take a look at the capillary diagram on the screen. Capillaries are microscopic vessels so tiny that red blood cells have to line up in single file! This is where the magic happens: oxygen and sugar pass through the thin walls into your body cells, and carbon dioxide waste is collected to be carried away.',
  },
  {
    startSec: 100,
    stage: 2,
    topic: '2. The 4 Chambers of the Human Heart',
    transcript: 'Point 2: Parts of the Heart. Your heart has 4 hollow rooms: 2 Atria on top that receive blood, and 2 Ventricles on the bottom that pump blood out. The right side handles oxygen-poor blue blood, and the left side handles oxygen-rich red blood!',
    voice: 'Moving to our second point: What does the inside of your heart look like? Your heart is about the size of your clenched fist, sitting right in the middle of your chest. Internally, it has four rooms: two upper receiving rooms called atria, and two lower pumping rooms called ventricles. The right side—colored blue on our screen—handles used blood coming back from your body, while the left side—colored red—handles fresh, oxygen-rich blood coming from your lungs.',
  },
  {
    startSec: 125,
    stage: 2,
    topic: '2. Left Ventricle: Powerful Body Pump',
    transcript: 'The Left Ventricle has the thickest, strongest muscle wall because while the right side only pumps blood a short distance to the lungs, the left ventricle must pump blood all the way to your brain and toes!',
    voice: 'Look closely at the bottom two chambers. Notice how the wall of the left ventricle is much thicker and stronger than the right ventricle! Why? Because the right ventricle only has to push blood a couple of inches over to your lungs, but the left ventricle has to pump blood all the way up to your brain and all the way down to your toes!',
  },
  {
    startSec: 150,
    stage: 2,
    topic: '2. Heart Valves: One-Way Trapdoors',
    transcript: 'Four one-way valves act like trapdoors: they open to let blood pass forward and snap shut immediately so blood cannot leak backwards.',
    voice: 'Now look at the four one-way valves. These act like trapdoors inside your heart. When the chambers squeeze, the valves swing open to let blood move forward, and then they snap shut so blood cannot slosh backwards.',
  },
  {
    startSec: 175,
    stage: 2,
    topic: '2. The "Lub-Dub" Heartbeat Sound',
    transcript: 'The "lub-dub" sound you hear through a stethoscope is the sound of your heart valves snapping shut: "Lub" is the top valves closing, and "Dub" is the exit valves closing right after!',
    voice: 'Whenever you hear a heartbeat through a stethoscope—lub-dub, lub-dub—you are actually hearing those trapdoor valves snapping shut! The "lub" is the first set of valves closing, and the "dub" is the exit valves snapping shut right after.',
  },
  {
    startSec: 200,
    stage: 3,
    topic: '3. Loop 1: Heart to Lungs (The Pulmonary Circuit)',
    transcript: 'Point 3: The Double Loop. Loop 1 sends used blood from the right side of the heart to the lungs, where you exhale CO2 and breathe in fresh O2!',
    voice: 'Now for our third topic: The Double Loop journey! Humans have a figure-eight circulatory system. In Loop One, oxygen-poor blood returns from your body into the right atrium, passes into the right ventricle, and is pumped to your lungs. In your lungs, the blood drops off carbon dioxide so you can breathe it out, and picks up fresh oxygen that you breathe in!',
  },
  {
    startSec: 250,
    stage: 3,
    topic: '3. Loop 2: Heart to Entire Body (The Systemic Circuit)',
    transcript: 'In Loop 2, oxygen-rich blood returns from the lungs into the left atrium, moves into the left ventricle, and is pumped through the giant Aorta to your brain, muscles, and every organ!',
    voice: 'In Loop Two, that bright red, oxygen-rich blood returns to the left atrium, drops into the powerful left ventricle, and whoosh—it gets pumped through the giant Aorta artery out to your brain, your stomach, and your leg muscles! After delivering oxygen, the blood returns back to the right side of the heart to start all over again. That completes our five-minute lesson! Now, students, look at your worksheets and screens for our Grade 8 science pop quiz!',
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
      'Class, for our assessment, Question One is on the board, on your desk worksheets, and on your screens. Which chamber of the human heart has the thickest, strongest muscular wall to pump fresh blood through your entire body? ... Ah, I see one hand raised. Yes, Sophia in row two, go ahead!',
      () => {
        // Sophia speaks up in a natural student voice
        store.setLectureTranscript('🗣️ Sophia Garcia (R2-S2): "Um, it\'s Option A, Mr. John! The Left Ventricle has the thickest muscle wall because it pumps blood all the way to our brain and our toes!"');
        classroomVoiceService.speakStudent(
          'Sophia',
          "Um, it's Option A, Mr. John! The Left Ventricle has the thickest muscle wall because it pumps blood all the way to our brain and our toes!",
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
        answerText: 'Option A: Left Ventricle (strongest chamber pumping blood to brain and toes)',
        isCorrect,
        questionIndex: 0,
      });
      if (isCorrect) {
        store.setQuizFeedback({
          isCorrect: true,
          text: `✅ Correct! Sophia Garcia and you got it right: ${q.explanation}`,
        });
        this.speak(`Spot on, Sophia! The left ventricle wall is the thickest because it pumps blood all the way to your brain and toes. Exactly right!`);
      } else {
        store.setQuizFeedback({
          isCorrect: false,
          text: `❌ Not quite. Remember: ${q.explanation}`,
        });
        this.speak(`Not quite. Look at the diagram: the left ventricle requires the strongest muscle to supply your whole body.`);
      }
    } else if (questionIndex === 1) {
      store.setActiveStudentAnswer({
        studentName: 'Ethan Vance',
        seatId: 'Row 3, Seat 5',
        answerText: 'Option A: To keep blood flowing forward in one direction and stop backflow',
        isCorrect,
        questionIndex: 1,
      });
      if (isCorrect) {
        store.setQuizFeedback({
          isCorrect: true,
          text: `✅ Correct! Ethan Vance and the class identified: ${q.explanation}`,
        });
        this.speak(`Yes, Ethan! The heart valves act like one-way trapdoors to keep blood moving forward and prevent backflow.`);
      } else {
        store.setQuizFeedback({
          isCorrect: false,
          text: `❌ Heart valves prevent backflow! ${q.explanation}`,
        });
        this.speak(`Remember, the main job of heart valves is to act like one-way doors to prevent backward leakage.`);
      }
    } else if (questionIndex === 2) {
      store.setActiveStudentAnswer({
        studentName: 'Classroom Collective',
        seatId: 'Whole Class',
        answerText: 'Option A: The heart valves snapping shut as the chambers squeeze and relax',
        isCorrect,
        questionIndex: 2,
      });
      if (isCorrect) {
        store.setQuizFeedback({
          isCorrect: true,
          text: `✅ Correct! The Lub-Dub sound is heart valves snapping shut! ${q.explanation}`,
        });
        this.speak(`Yes, yes! The lub-dub sound is caused by your heart valves snapping shut! Great energy class, but remember to wait to be called on!`);
      } else {
        store.setQuizFeedback({
          isCorrect: false,
          text: `❌ The sound comes from valves snapping shut! ${q.explanation}`,
        });
        this.speak(`Remember, that lub-dub sound in a stethoscope is made by the heart valves snapping shut.`);
      }
    } else if (questionIndex === 3) {
      // Question 4: Open-ended Gym Class Inquiry
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
        text: `✅ Outstanding Science Reasoning! Liam Patel explained muscle oxygen demand: ${q.explanation}`,
      });
      this.speak(`Brilliant deduction, Liam! When your leg muscles sprint, they need more oxygen and energy to keep working, so your heart pumps faster and your lungs breathe faster!`);
    } else if (questionIndex === 4) {
      // Question 5: Blood Flow Order
      store.setActiveStudentAnswer({
        studentName: 'Ethan Vance',
        seatId: 'Row 3, Seat 1',
        answerText: 'Vascular Path: Heart ➔ Arteries (Away) ➔ Capillaries (Exchange) ➔ Veins (Back to Heart)',
        isCorrect: true,
        questionIndex: 4,
      });
      store.setQuizFeedback({
        isCorrect: true,
        text: `✅ Highway Order Traced! Ethan Vance identified the correct vessel path: ${q.explanation}`,
      });
      this.speak(`Superb work, Ethan! Arteries carry blood away from the heart, capillaries deliver oxygen to cells, and veins carry blood back!`);
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
          answerText: 'Option A: To keep blood flowing forward in one direction and stop backflow',
          isCorrect: true,
          questionIndex: 1,
        });
        store.setLectureTranscript('📝 Question 2: What is the main job of heart valves? (Dead silence... Not a single student raises their hand!)');
        this.speak(
          'Now for Question Two on the board: What is the main job of the one-way valves inside your heart? ... Anyone? Nobody? Not a single hand raised? Dead silence from the entire room?',
          () => {
            // Ethan mutters timidly after awkward silence
            setTimeout(() => {
              store.setLectureTranscript('🗣️ Ethan Vance (R3-S5, muttering nervously): "...is it... Option A, Mr. John? To stop blood from leaking backwards...?"');
              classroomVoiceService.speakStudent('Ethan', '...is it... Option A, Mr. John? To stop blood from leaking backwards...?', {
                onEnd: () => {
                  store.setLectureTranscript('📝 Ethan Vance answered Option A! Confirm your choice.');
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
          answerText: 'Option A: The heart valves snapping shut as the chambers squeeze and relax',
          isCorrect: true,
          questionIndex: 2,
        });
        store.setLectureTranscript('📝 Question 3: What creates the "lub-dub" heartbeat sound? (Total Chaos! All students waving hands and shouting together!)');
        this.speak(
          'Alright, Question Three! When a doctor listens to your heart with a stethoscope, what creates the familiar lub-dub sound?',
          () => {
            // Students shout simultaneously!
            classroomAtmosphereAudioService.playClassroomMurmur(3400);
            store.setLectureTranscript('🗣️ Class (Chaos Shouting): "Option A! The valves snapping shut! Lub-dub!"');
            classroomVoiceService.speakClassChaos(
              [
                { name: 'Sophia', gender: 'female', text: 'Option A! The valves snapping shut!' },
                { name: 'Ethan', gender: 'male', text: 'It is the valves! Lub-dub!' },
                { name: 'Liam', gender: 'male', text: "The heart valves closing, Mr. John!" },
              ],
              () => {
                // Teacher calms down the room
                store.setLectureTranscript('👨‍🏫 Teacher John: "Whoa, whoa, everyone at once! Great energy, now mark Option A on your worksheets!"');
                this.speak('Whoa, whoa! Everyone at once! Calm down, class! One at a time! Everyone is shouting over each other! Great energy, yes, the valves snapping shut create the lub-dub sound! Now verify your answer on your worksheet!');
              }
            );
          }
        );
      } else if (nextIdx === 3) {
        // Question 4: Open-Ended Gym Class Inquiry - Liam Patel answers
        store.setActiveStudentAnswer({
          studentName: 'Liam Patel',
          seatId: 'Row 1, Seat 3',
          answerText: HEART_ANATOMY_QUIZ[3].studentAnswerText,
          isCorrect: true,
          questionIndex: 3,
        });
        store.setLectureTranscript('📝 Question 4 (Science Inquiry): Liam Patel (Row 1, Seat 3) raises his hand to explain heart rate and breathing in gym class...');
        this.speak(
          'Now Question Four is a science inquiry: Why do your heart rate and breathing rate increase when you are sprinting in gym class? ... Liam in row one, go ahead!',
          () => {
            store.setLectureTranscript('🗣️ Liam Patel (R1-S3): "When we sprint, our leg muscle cells burn more energy and need extra oxygen. Our heart beats faster to pump fresh oxygen-rich blood, and our lungs breathe faster to take in oxygen and get rid of carbon dioxide waste!"');
            classroomVoiceService.speakStudent(
              'Liam',
              "When we sprint, our leg muscle cells burn more energy and need extra oxygen. Our heart beats faster to pump fresh oxygen-rich blood, and our lungs breathe faster to take in oxygen and get rid of carbon dioxide waste!",
              {
                onEnd: () => {
                  store.setLectureTranscript('👨‍🏫 Teacher John: "Spot-on scientific reasoning, Liam! Review Liam\'s explanation on the board and submit your notes."');
                },
              }
            );
          }
        );
      } else if (nextIdx === 4) {
        // Question 5: Vascular Highway Flow Path - Ethan Vance answers
        store.setActiveStudentAnswer({
          studentName: 'Ethan Vance',
          seatId: 'Row 3, Seat 1',
          answerText: HEART_ANATOMY_QUIZ[4].studentAnswerText,
          isCorrect: true,
          questionIndex: 4,
        });
        store.setLectureTranscript('📝 Question 5 (Vascular Highway Flow Path): Ethan Vance traces the order of blood vessels on the screen...');
        this.speak(
          'For Question Five, we are tracing the path of blood after leaving the heart through the three types of blood vessels. Ethan in row three, what is the correct order?',
          () => {
            store.setLectureTranscript('🗣️ Ethan Vance (R3-S1): "Blood leaves the heart into Arteries that carry blood Away, flows into tiny Capillaries that deliver oxygen to cells, and returns through Veins back to the heart!"');
            classroomVoiceService.speakStudent(
              'Ethan',
              'Blood leaves the heart into Arteries that carry blood Away, flows into tiny Capillaries that deliver oxygen to cells, and returns through Veins back to the heart!',
              {
                onEnd: () => {
                  store.setLectureTranscript('👨‍🏫 Teacher John: "Outstanding job, Ethan! Look at the vessel order diagram rendered on the board!"');
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
        text: '🎉 Congratulations! You have completed the Grade 8 Circulatory System & Heart Science Lesson with Teacher John!',
      });
      this.speak('Congratulations to everyone! You have successfully completed today\'s Grade 8 lesson on the Human Heart and the Circulatory System. Fantastic participation across all five questions!');
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
