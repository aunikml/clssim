import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useClassroomStore } from '../../../../store/classroomStore';
import { ClassroomAvatar } from './ClassroomAvatar';

/**
 * Animated Teacher Avatar with Phase-Aware Body Language
 * Transitions positions and body language across all lecture phases:
 * - Pre-class countdown: stands at podium, beckons class to take seats
 * - Stage 1 (0-30s): steps to blackboard, points with chalk at overall equation
 * - Stage 2 (30-60s): faces chalkboard at z=-6.6, actively sketches thylakoid diagram with chalk
 * - Stage 3 (60-90s): paces teaching area explaining Calvin cycle with two-handed gestures
 * - Stage 4 (90-120s): returns to podium, summarizes limiting factors
 * - Q&A: hand on chin asking questions, praising correct answers, guiding incorrect ones
 */
export const TeacherAvatar = ({
  name = 'Teacher John',
  role = 'Teacher',
}) => {
  const lectureState = useClassroomStore((state) => state.lectureState);
  // Coarse lecture point selector (1, 2, 3, 4) avoids re-rendering every second
  const lecturePoint = useClassroomStore((state) =>
    state.lectureTimer < 100 ? 1 : state.lectureTimer < 200 ? 2 : state.lectureTimer < 300 ? 3 : 4
  );
  const isTeacherSpeaking = useClassroomStore((state) => state.isTeacherSpeaking);
  const quizFeedback = useClassroomStore((state) => state.quizFeedback);
  const currentQuizQuestionIndex = useClassroomStore((state) => state.currentQuizQuestionIndex);
  const userRole = useClassroomStore((state) => state.userRole);

  // When player is playing as Teacher, hide the duplicate NPC model so the camera is not blocked
  if (userRole === 'teacher') return null;

  const groupRef = useRef();
  const currentPos = useRef(new THREE.Vector3(0, 0, -4.5));
  const currentRotY = useRef(0);
  const questionStartTime = useRef(0);
  const lastQuizIndex = useRef(-1);

  // Compute target posture, position, and rotation based on lecture phase
  let targetPosture = 'idle';
  let targetX = 0;
  let targetY = 0;
  let targetZ = -4.5;
  let targetYaw = 0;

  if (lectureState === 'countdown') {
    targetPosture = 'teacher_waiting';
    targetX = 0;
    targetZ = -4.5;
    targetYaw = 0;
  } else if (lectureState === 'lecturing') {
    if (lecturePoint === 1) {
      // Point 1 (0-100s): What is the Circulatory System? (Pointing at display & board)
      targetPosture = 'teacher_pointing_board';
      targetX = -0.9;
      targetZ = -5.2;
      targetYaw = 0.35;
    } else if (lecturePoint === 2) {
      // Point 2 (100-200s): Parts of the Heart (Actively chalking/diagramming on board)
      targetPosture = 'teacher_writing_board';
      targetX = -0.4;
      targetZ = -6.6;
      targetYaw = Math.PI; // Facing board directly
    } else if (lecturePoint === 3) {
      // Point 3 (200-300s): The Journey of Blood (Pacing and explaining the Figure-8 pathway)
      targetPosture = 'teacher_pacing_explaining';
      targetZ = -4.8;
      // Smooth pacing position calculated inside useFrame
    } else {
      // Transition to Q&A
      targetPosture = 'teacher_explaining';
      targetX = 0;
      targetZ = -4.5;
      targetYaw = 0;
    }
  } else if (lectureState === 'qa') {
    // When question changes, teacher first writes it on the blackboard for 3.5s
    const isWritingQuestion = groupRef.current && (stateClockTime() - questionStartTime.current < 3.8);

    if (isWritingQuestion && quizFeedback === null) {
      targetPosture = 'teacher_writing_board';
      targetX = -0.4;
      targetZ = -6.6;
      targetYaw = Math.PI; // Facing blackboard directly writing question
    } else {
      targetX = 0;
      targetZ = -4.5;
      targetYaw = 0;
      if (quizFeedback === null) {
        if (currentQuizQuestionIndex === 1) {
          // Question 2: Dead Silence - teacher scans empty room waiting awkwardly
          targetPosture = 'teacher_awkward_silence';
        } else if (currentQuizQuestionIndex >= 2) {
          // Question 3: Classroom Chaos - teacher calms down shouting class
          targetPosture = 'teacher_calm_chaos';
        } else {
          // Question 1: Calling on the single student (Sophia)
          targetPosture = 'teacher_asking';
        }
      } else if (quizFeedback?.isCorrect === true) {
        targetPosture = 'teacher_praise';
      } else {
        targetPosture = 'teacher_thinking';
      }
    }
  } else {
    targetPosture = 'idle';
    targetX = 0;
    targetZ = -4.5;
    targetYaw = 0;
  }

  function stateClockTime() {
    return window.performance ? window.performance.now() / 1000 : 0;
  }

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Check if new question started
    if (lectureState === 'qa' && lastQuizIndex.current !== currentQuizQuestionIndex) {
      lastQuizIndex.current = currentQuizQuestionIndex;
      questionStartTime.current = stateClockTime();
    }

    // Special case for Point 3 pacing: oscillate X between -1.5m and +1.5m
    const currentTimer = useClassroomStore.getState().lectureTimer;
    if (lectureState === 'lecturing' && currentTimer >= 200 && currentTimer < 300) {
      targetX = Math.sin(t * 0.55) * 1.5;
      const velocityX = Math.cos(t * 0.55);
      targetYaw = velocityX > 0 ? 0.3 : -0.3;
    }

    // Smooth movement interpolation
    const moveLerp = Math.min(delta * 3.5, 1.0);
    const targetVec = new THREE.Vector3(targetX, targetY, targetZ);
    currentPos.current.lerp(targetVec, moveLerp);

    // Smooth rotation interpolation
    currentRotY.current = THREE.MathUtils.lerp(currentRotY.current, targetYaw, moveLerp);

    groupRef.current.position.copy(currentPos.current);
    groupRef.current.rotation.y = currentRotY.current;

    // Only update teacher coordinates if position changed significantly (> 0.08m)
    // to avoid triggering React subscriptions in components
    if (Math.floor(t * 10) % 3 === 0) {
      const prev = useClassroomStore.getState().teacherWorldPosition;
      if (!prev || Math.hypot(prev[0] - currentPos.current.x, prev[2] - currentPos.current.z) > 0.08) {
        useClassroomStore.getState().setTeacherWorldPosition([
          currentPos.current.x,
          currentPos.current.y,
          currentPos.current.z,
        ]);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -4.5]}>
      <ClassroomAvatar
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        name={name}
        role={role}
        posture={targetPosture}
        isSpeaking={isTeacherSpeaking}
        isFirstPerson={false}
        shirtColor="#1e3a8a" // Oxford navy teacher blazer
        pantsColor="#1e293b"
        skinTone="#f1c2a2"   // Mature natural skin tone
        hairColor="#64748b"   // Distinguished silver/grey hair
        hairStyle="parted"
        hasGlasses={true}
      />
    </group>
  );
};
