import { useClassroomStore } from '../store/classroomStore';
import { classroomVoiceService } from './classroomVoiceService';
import { lectureService } from './lectureService';
import { physicsFoleyAudioService } from './physicsFoleyAudioService';

/**
 * Authentic Classroom Side-Talk Dialogues
 * Cycles through realistic whispering exchanges between the student and neighboring classmates.
 */
export const CLASSROOM_SIDE_TALKS = [
  {
    studentLine: 'Psst... did you understand what he said about the mitral valve?',
    neighborName: 'Liam',
    neighborLine: "Yeah, it's the bicuspid valve on the left side! Don't let Mr. John catch us whispering.",
    topic: 'Mitral Valve',
  },
  {
    studentLine: 'Hey, what did you write down for the conduction pathway?',
    neighborName: 'Sophia',
    neighborLine: 'SA node to AV node, then Bundle of His to Purkinje fibers. I drew an arrow in my notes.',
    topic: 'Electrical Conduction',
  },
  {
    studentLine: 'Look at the digital screen, that capillary network animation is mesmerizing.',
    neighborName: 'Marcus',
    neighborLine: 'Totally, but I think the whole pulmonary loop journey is going to be on the quiz...',
    topic: 'Capillary Flow',
  },
  {
    studentLine: 'Hey, do you have a spare pencil? My lead just snapped.',
    neighborName: 'Chloe',
    neighborLine: 'Here, take my mechanical pencil. Just remember to give it back after class!',
    topic: 'Borrowing Stationery',
  },
  {
    studentLine: 'Wait, is pulmonary circulation the low-pressure or high-pressure loop?',
    neighborName: 'Liam',
    neighborLine: 'Low pressure to protect the alveoli! Systemic is high pressure to reach your toes.',
    topic: 'Pulmonary Loop',
  },
  {
    studentLine: 'Mr. John is covering a ton of cardiology terms fast today...',
    neighborName: 'Sophia',
    neighborLine: 'Shh! Check your desk device or the digital screen, it mirrors all the diagrams in real time.',
    topic: 'Lecture Pacing',
  },
  {
    studentLine: 'What happens if ventricular contraction occurs without valve closure?',
    neighborName: 'Marcus',
    neighborLine: 'Regurgitation heart murmur. That is why the lub-dub sound is so important.',
    topic: 'Heart Murmur',
  },
  {
    studentLine: 'Are you ready for the assessment questions when the lecture ends?',
    neighborName: 'Chloe',
    neighborLine: 'I think so! Just remember the left ventricle is three times thicker than the right.',
    topic: 'Quiz Prep',
  },
];

/**
 * Biology & Cardiology Student Inquiry Questions for Teacher John
 */
export const STUDENT_INQUIRY_QUESTIONS = [
  {
    studentQ:
      'Excuse me, Mr. John! Could you clarify why the left ventricle myocardium needs to be three times thicker than the right?',
    teacherA:
      'An excellent question! The left ventricle must overcome systemic vascular resistance to pump blood across sixty thousand miles to your head and toes, whereas the right ventricle only pumps low pressure to the adjacent lungs.',
    topic: 'Ventricular Thickness',
  },
  {
    studentQ:
      "Mr. John, what actually produces the audible 'lub-dub' heart sounds we hear with a stethoscope?",
    teacherA:
      'Great observation! The "lub" is the resonant closure of the atrioventricular valves—tricuspid and mitral—and the "dub" is the crisp snap of the aortic and pulmonary semilunar valves.',
    topic: 'Heart Sounds',
  },
  {
    studentQ:
      'Could you repeat which blood vessels carry oxygenated versus deoxygenated blood in the pulmonary circuit?',
    teacherA:
      'Certainly! Remember, the pulmonary artery carries deoxygenated blood away to the lungs, while the four pulmonary veins return freshly oxygenated blood back to the left atrium.',
    topic: 'Pulmonary Circuit',
  },
  {
    studentQ:
      'Mr. John, what happens physiologically if one of the heart valves fails to seal completely?',
    teacherA:
      'If a valve fails to seal, blood regurgitates backward, causing a heart murmur. The heart is forced to work substantially harder to sustain adequate cardiac output.',
    topic: 'Valve Regurgitation',
  },
  {
    studentQ:
      'Why does the SA node act as the master pacemaker rather than the AV node?',
    teacherA:
      'Because the sinoatrial node has the fastest spontaneous depolarization rate—around sixty to one hundred beats per minute—overriding and pacing the slower nodal centers downstream.',
    topic: 'Cardiac Pacemaker',
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
