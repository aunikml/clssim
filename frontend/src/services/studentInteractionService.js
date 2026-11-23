import { useClassroomStore } from '../store/classroomStore';
import { classroomVoiceService } from './classroomVoiceService';
import { lectureService } from './lectureService';
import { physicsFoleyAudioService } from './physicsFoleyAudioService';

/**
 * Authentic Grade 8 Classroom Side-Talk Dialogues
 * Realistic whispering exchanges between middle school classmates during the science lesson.
 */
export const CLASSROOM_SIDE_TALKS = [
  {
    studentLine: 'Psst... did you understand why the left ventricle is so thick?',
    neighborName: 'Liam',
    neighborLine: "Yeah! Because it has to pump blood all the way down to your toes, while the right side only pushes to the lungs.",
    topic: 'Left Ventricle',
  },
  {
    studentLine: 'Hey, what did you write down for the 3 types of blood vessels?',
    neighborName: 'Sophia',
    neighborLine: 'Arteries carry blood Away, veins bring it back, and capillaries are tiny delivery tubes!',
    topic: 'Blood Vessels',
  },
  {
    studentLine: 'Look at the diagram, the red and blue loop is really cool.',
    neighborName: 'Marcus',
    neighborLine: 'Totally! Blue is used blood going to the lungs for oxygen, and red is fresh blood going to the body.',
    topic: 'Double Loop',
  },
  {
    studentLine: 'Hey, do you have a spare pencil? My lead just snapped.',
    neighborName: 'Chloe',
    neighborLine: 'Here, take my spare pencil. Just make sure you give it back after class!',
    topic: 'Borrowing Stationery',
  },
  {
    studentLine: 'Wait, what makes the "lub-dub" heartbeat sound again?',
    neighborName: 'Liam',
    neighborLine: 'The one-way valves snapping shut! Like trapdoors inside your heart.',
    topic: 'Lub-Dub Sound',
  },
  {
    studentLine: 'Mr. John is moving pretty fast through the double loop today...',
    neighborName: 'Sophia',
    neighborLine: 'Check the board or screen! It shows the 4 chambers: Atria on top, Ventricles on the bottom.',
    topic: 'Lecture Pacing',
  },
  {
    studentLine: 'Why do veins need valves if arteries don’t have them?',
    neighborName: 'Marcus',
    neighborLine: 'Because blood in veins is at low pressure, so valves stop blood from falling backward!',
    topic: 'Vein Valves',
  },
  {
    studentLine: 'Are you ready for the pop quiz when the teacher finishes?',
    neighborName: 'Chloe',
    neighborLine: 'I think so! Just remember: Left Ventricle is the strongest chamber in the whole heart.',
    topic: 'Quiz Prep',
  },
];

/**
 * Grade 8 Science Student Inquiry Questions for Teacher John
 */
export const STUDENT_INQUIRY_QUESTIONS = [
  {
    studentQ:
      'Excuse me, Mr. John! Why is the left ventricle so much stronger and thicker than the right ventricle?',
    teacherA:
      'A fantastic question! The left ventricle must pump blood through the aorta all the way across your body to your brain and toes, whereas the right ventricle only pushes blood a short distance to the nearby lungs.',
    topic: 'Ventricular Thickness',
  },
  {
    studentQ:
      "Mr. John, what actually creates the 'lub-dub' heart sound we hear with a stethoscope?",
    teacherA:
      'Great curiosity! That "lub-dub" sound is made by your heart valves snapping shut like trapdoors! The "lub" is the atria-ventricle valves closing, and the "dub" is the exit valves snapping shut right after.',
    topic: 'Heart Sounds',
  },
  {
    studentQ:
      'Why is blood drawn in blue on our science diagrams if all human blood is actually red?',
    teacherA:
      'Excellent observation! Real human blood is always red, but diagrams use blue to represent oxygen-poor blood on its way to the lungs, and bright red for blood carrying fresh oxygen to your body!',
    topic: 'Blue vs Red Blood',
  },
  {
    studentQ:
      'Mr. John, why can we feel a pulse on our wrist or neck, but not in our veins?',
    teacherA:
      'Great scientific inquiry! Arteries stretch and pulse with every heartbeat because blood is pushed into them under high pressure. By the time blood reaches veins, the pressure is gentle and smooth.',
    topic: 'Pulse & Arteries',
  },
  {
    studentQ:
      'What happens if one of the heart valves does not close all the way?',
    teacherA:
      'If a valve doesn’t seal tightly, a tiny bit of blood leaks backward. Doctors can hear this with a stethoscope as a gentle swishing sound called a heart murmur.',
    topic: 'Heart Valves & Murmurs',
  },
];

class StudentInteractionService {
  constructor() {
    this.sideTalkIndex = 0;
    this.inquiryIndex = 0;
    this.isSideTalking = false;
    this.isInquiryActive = false;
    this.sideTalkTimeout = null;
    this.inquiryTimeout = null;
  }

  /**
   * 1. Trigger Side Talk: Whispers with a neighboring student.
   * Cycles through dialogues so each trigger is guaranteed to be different.
   */
  triggerSideTalk() {
    if (this.isSideTalking) return;
    this.isSideTalking = true;

    const store = useClassroomStore.getState();
    const dialogue = CLASSROOM_SIDE_TALKS[this.sideTalkIndex];
    this.sideTalkIndex = (this.sideTalkIndex + 1) % CLASSROOM_SIDE_TALKS.length;

    // Set active side talk in store for UI speech bubble
    store.setActiveSideTalk({
      studentLine: dialogue.studentLine,
      neighborName: dialogue.neighborName,
      neighborLine: dialogue.neighborLine,
      topic: dialogue.topic,
      stage: 'student', // 'student' -> 'neighbor' -> 'done'
    });

    // Student whispers
    classroomVoiceService.fallbackSpeakStudent('student', dialogue.studentLine, {
      onEnd: () => {
        // Update stage to neighbor responding
        store.setActiveSideTalk({
          studentLine: dialogue.studentLine,
          neighborName: dialogue.neighborName,
          neighborLine: dialogue.neighborLine,
          topic: dialogue.topic,
          stage: 'neighbor',
        });

        // Neighbor student replies softly
        setTimeout(() => {
          classroomVoiceService.fallbackSpeakStudent(
            dialogue.neighborName.toLowerCase(),
            dialogue.neighborLine,
            {
              onEnd: () => {
                store.setActiveSideTalk({
                  studentLine: dialogue.studentLine,
                  neighborName: dialogue.neighborName,
                  neighborLine: dialogue.neighborLine,
                  topic: dialogue.topic,
                  stage: 'done',
                });
                this.isSideTalking = false;
                setTimeout(() => {
                  store.setActiveSideTalk(null);
                }, 3500);
              },
            }
          );
        }, 400);
      },
    });
  }

  /**
   * 2. Ask Question: When lecture is going on, the lecturer immediately stops,
   * student asks question with raised hand, teacher answers, then lecture resumes.
   */
  askQuestionDuringLecture() {
    if (this.isInquiryActive) return;
    this.isInquiryActive = true;

    const store = useClassroomStore.getState();
    const inquiry = STUDENT_INQUIRY_QUESTIONS[this.inquiryIndex];
    this.inquiryIndex = (this.inquiryIndex + 1) % STUDENT_INQUIRY_QUESTIONS.length;

    // 1. Immediately pause the ongoing lecture & stop teacher speech
    const wasLecturing = store.lectureState === 'lecturing';
    lectureService.pauseLecture();

    // 2. Raise student hand
    store.setActiveGesture('hand_raising');

    store.setActiveStudentInquiry({
      status: 'asking',
      question: inquiry.studentQ,
      answer: inquiry.teacherA,
      topic: inquiry.topic,
    });

    // 3. Student speaks inquiry question
    classroomVoiceService.fallbackSpeakStudent('student', inquiry.studentQ, {
      onEnd: () => {
        store.setActiveStudentInquiry({
          status: 'answering',
          question: inquiry.studentQ,
          answer: inquiry.teacherA,
          topic: inquiry.topic,
        });

        // 4. Teacher John acknowledges and answers
        setTimeout(() => {
          classroomVoiceService.speakTeacher(inquiry.teacherA, {
            onStart: () => store.setIsTeacherSpeaking(true),
            onEnd: () => {
              store.setIsTeacherSpeaking(false);
              store.setActiveGesture(null); // Lower student hand
              store.setActiveStudentInquiry({
                status: 'done',
                question: inquiry.studentQ,
                answer: inquiry.teacherA,
                topic: inquiry.topic,
              });

              // 5. Resume lecture if it was in progress
              setTimeout(() => {
                store.setActiveStudentInquiry(null);
                this.isInquiryActive = false;
                if (wasLecturing) {
                  lectureService.resumeLecture();
                }
              }, 2500);
            },
          });
        }, 500);
      },
    });
  }

  /**
   * 3. Trigger Classroom Disruption
   */
  triggerDisruption(type) {
    const store = useClassroomStore.getState();
    store.setActiveDisruptionEvent(type);
  }
}

export const studentInteractionService = new StudentInteractionService();
