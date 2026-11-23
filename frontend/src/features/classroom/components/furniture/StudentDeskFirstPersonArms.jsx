import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useClassroomStore } from '../../../../store/classroomStore';
import { getSeatCoordinates } from '../../../../utils/classroomConfig';

/**
 * First-person visible arms resting on the desk surface
 * Renders only when the player is seated, giving visceral physical embodiment.
 */
export const StudentDeskFirstPersonArms = () => {
  const isSeated = useClassroomStore((state) => state.isSeated);
  const seatedSeatId = useClassroomStore((state) => state.seatedSeatId);
  const selectedSeatId = useClassroomStore((state) => state.selectedSeatId);
  const config = useClassroomStore((state) => state.config);
  const activeGesture = useClassroomStore((state) => state.activeGesture);
  const lectureState = useClassroomStore((state) => state.lectureState);
  // Coarse selector prevents re-rendering arms every second
  const isDiagramStage = useClassroomStore((state) =>
    state.lectureState === 'lecturing' && state.lectureTimer >= 30 && state.lectureTimer < 60
  );
  const quizFeedback = useClassroomStore((state) => state.quizFeedback);

  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const pencilRef = useRef();

  useFrame((state) => {
    if (!isSeated) return;
    const t = state.clock.getElapsedTime();

    // Natural breathing micro-motion on resting arms
    const breath = Math.sin(t * 2.2) * 0.003;

    // Gesture / Phase: Applauding or Quiz Correct Answer
    if (activeGesture === 'applauding' || quizFeedback?.isCorrect === true) {
      const clap = Math.sin(t * 12) * 0.04;
      if (leftArmRef.current) {
        leftArmRef.current.position.set(-0.12 - clap, 0.79 + breath, -0.06);
        leftArmRef.current.rotation.set(0.2, 0.45, 0.1);
      }
      if (rightArmRef.current) {
        rightArmRef.current.position.set(0.12 + clap, 0.79 + breath, -0.06);
        rightArmRef.current.rotation.set(0.2, -0.45, -0.1);
      }
      return;
    }

    // Gesture: Taking Notes (writing motion with pencil on notebook)
    // Or automatic subtle note-taking when teacher is drawing diagram on blackboard
    const isWriting = activeGesture === 'taking_notes' || (activeGesture === null && isDiagramStage);

    if (isWriting) {
      if (rightArmRef.current) {
        rightArmRef.current.position.y = 0.77 + breath;
        rightArmRef.current.position.x = 0.08 + Math.sin(t * 8) * 0.015;
        rightArmRef.current.position.z = -0.06 + Math.cos(t * 8) * 0.012;
      }
      if (pencilRef.current) {
        pencilRef.current.rotation.z = Math.PI / 4 + Math.sin(t * 8) * 0.08;
      }
      if (leftArmRef.current) {
        leftArmRef.current.position.y = 0.77 + breath;
      }
      return;
    }

    // Gesture: Hand Raising (Right arm lifts up into view frustum)
    if (activeGesture === 'hand_raising') {
      if (rightArmRef.current) {
        rightArmRef.current.position.set(0.24, 1.35 + Math.sin(t * 3) * 0.01, -0.08);
        rightArmRef.current.rotation.set(-1.8, 0.2, -0.4);
      }
      if (leftArmRef.current) {
        leftArmRef.current.position.set(-0.22, 0.77 + breath, -0.02);
        leftArmRef.current.rotation.set(0.1, 0.35, -0.05);
      }
      return;
    }

    // Normal Idle Seated Posture: Arms resting calmly on desk
    if (leftArmRef.current) {
      leftArmRef.current.position.set(-0.22, 0.77 + breath, -0.02);
      leftArmRef.current.rotation.set(0.1, 0.35, -0.05);
    }
    if (rightArmRef.current) {
      rightArmRef.current.position.set(0.18, 0.77 + breath, -0.02);
      rightArmRef.current.rotation.set(0.1, -0.32, 0.05);
    }
    if (pencilRef.current) {
      pencilRef.current.rotation.set(0, 0, Math.PI / 4);
    }
  });

  if (!isSeated) return null;

  const activeSeatId = seatedSeatId || selectedSeatId || 'R3-S3';
  const [deskX, , deskZ] = getSeatCoordinates(activeSeatId, config.seating);

  return (
    <group position={[deskX, 0, deskZ]}>
      {/* Left Forearm & Hand resting on desk (holding down paper) */}
      <group ref={leftArmRef} position={[-0.22, 0.77, -0.02]}>
        {/* Navy Blazer Sleeve */}
        <mesh position={[-0.08, 0.03, 0.18]} rotation={[-Math.PI / 2.2, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.052, 0.062, 0.36, 12]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
        </mesh>
        {/* White Shirt Cuff */}
        <mesh position={[-0.04, 0.015, 0.05]} rotation={[-Math.PI / 2.2, 0.25, 0]}>
          <cylinderGeometry args={[0.046, 0.05, 0.04, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Left Hand */}
        <mesh position={[0, 0, 0]} rotation={[0.1, 0.2, 0]} castShadow>
          <boxGeometry args={[0.07, 0.025, 0.1]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.6} />
        </mesh>
        {/* Fingers */}
        <mesh position={[0.01, -0.005, -0.06]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.065, 0.02, 0.04]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.6} />
        </mesh>
      </group>

      {/* Right Forearm & Hand resting on desk (holding pencil) */}
      <group ref={rightArmRef} position={[0.18, 0.77, -0.02]}>
        {/* Navy Blazer Sleeve */}
        <mesh position={[0.08, 0.03, 0.18]} rotation={[-Math.PI / 2.2, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.052, 0.062, 0.36, 12]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
        </mesh>
        {/* White Shirt Cuff */}
        <mesh position={[0.04, 0.015, 0.05]} rotation={[-Math.PI / 2.2, -0.25, 0]}>
          <cylinderGeometry args={[0.046, 0.05, 0.04, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Right Hand */}
        <mesh position={[0, 0, 0]} rotation={[0.1, -0.2, 0]} castShadow>
          <boxGeometry args={[0.07, 0.025, 0.1]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.6} />
        </mesh>
        {/* Fingers curled holding pencil */}
        <mesh position={[-0.01, -0.005, -0.05]} rotation={[0.2, -0.1, 0]}>
          <boxGeometry args={[0.065, 0.02, 0.04]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.6} />
        </mesh>

        {/* Yellow Wooden Pencil */}
        <group ref={pencilRef} position={[-0.02, 0.02, -0.04]}>
          {/* Hexagonal Pencil Body */}
          <mesh rotation={[Math.PI / 2, 0, 0.4]} castShadow>
            <cylinderGeometry args={[0.007, 0.007, 0.22, 6]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.5} />
          </mesh>
          {/* Metal Ferrule */}
          <mesh position={[0.035, 0.01, 0.1]} rotation={[Math.PI / 2, 0, 0.4]}>
            <cylinderGeometry args={[0.0075, 0.0075, 0.02, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Pink Eraser Tip */}
          <mesh position={[0.042, 0.012, 0.12]} rotation={[Math.PI / 2, 0, 0.4]}>
            <cylinderGeometry args={[0.007, 0.007, 0.022, 8]} />
            <meshStandardMaterial color="#f472b6" roughness={0.8} />
          </mesh>
          {/* Sharpened Wood Cone & Graphite Lead Tip */}
          <mesh position={[-0.04, -0.01, -0.11]} rotation={[-Math.PI / 2, 0, -0.4]}>
            <coneGeometry args={[0.007, 0.025, 6]} />
            <meshStandardMaterial color="#fde68a" roughness={0.7} />
          </mesh>
          <mesh position={[-0.045, -0.012, -0.125]} rotation={[-Math.PI / 2, 0, -0.4]}>
            <coneGeometry args={[0.003, 0.008, 6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
