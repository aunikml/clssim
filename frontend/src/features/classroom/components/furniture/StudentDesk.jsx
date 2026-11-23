import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { StudentChair } from './StudentChair';
import { ClassroomAvatar } from './ClassroomAvatar';
import { PhysicsDeskStationery } from './PhysicsDeskStationery';
import { StudentDevice } from './StudentDevice';
import { LowResourceDeskProps } from './LowResourceDeskProps';
import { StudentActionWheel } from './StudentActionWheel';
import { useClassroomStore } from '../../../../store/classroomStore';

export const StudentDesk = ({
  seatIdentifier = 'R1-S1',
  position = [0, 0, 0],
  status = 'available',
  occupiedBy = null,
  isMySeat = false,
  isSelected = false,
  onSelect,
}) => {
  const [hovered, setHovered] = useState(false);
  const setTargetWalkPosition = useClassroomStore((state) => state.setTargetWalkPosition);
  const setInspectTarget = useClassroomStore((state) => state.setInspectTarget);
  const openNotebook = useClassroomStore((state) => state.openNotebook);
  const openDeviceInspection = useClassroomStore((state) => state.openDeviceInspection);
  const openPlickersModal = useClassroomStore((state) => state.openPlickersModal);
  const classroomEra = useClassroomStore((state) => state.classroomEra);
  const sitDown = useClassroomStore((state) => state.sitDown);

  const lectureState = useClassroomStore((state) => state.lectureState);
  // Coarse lecture stage selector avoids re-rendering all 20 desks every second
  const lectureStage = useClassroomStore((state) =>
    state.lectureTimer < 30 ? 1 : state.lectureTimer < 60 ? 2 : state.lectureTimer < 90 ? 3 : 4
  );
  const quizFeedback = useClassroomStore((state) => state.quizFeedback);
  const currentQuizQuestionIndex = useClassroomStore((state) => state.currentQuizQuestionIndex);
  const showStudentDevices = useClassroomStore((state) => state.showStudentDevices);
  const teachingDisplayMode = useClassroomStore((state) => state.teachingDisplayMode);
  const activeDisruptionEvent = useClassroomStore((state) => state.activeDisruptionEvent);

  const isLowRes = classroomEra === 'low_resource';
  const hasDevice = teachingDisplayMode === 'digital_screen' && showStudentDevices;

  // Dynamic student body language based on personality style and lecture phase
  const studentStyle = occupiedBy?.style || 'attentive_nodder';
  let studentPosture = 'seating';

  if (lectureState === 'countdown') {
    if (studentStyle === 'eager_participant' && seatIdentifier === 'R2-S2') {
      studentPosture = 'nodding';
    } else {
      studentPosture = 'seating';
    }
  } else if (lectureState === 'lecturing') {
    if (lectureStage === 1) {
      // Stage 1: Intro & Equation
      if (studentStyle === 'attentive_notetaker' || studentStyle === 'diligent_notetaker') {
        studentPosture = 'taking_notes';
      } else if (studentStyle === 'attentive_nodder') {
        studentPosture = 'nodding';
      } else {
        studentPosture = 'seating';
      }
    } else if (lectureStage === 2) {
      // Stage 2: Light Reactions (Teacher actively sketching thylakoid diagram on blackboard)
      if (studentStyle === 'inquisitive_confused') {
        studentPosture = 'confused';
      } else if (
        studentStyle === 'attentive_notetaker' ||
        studentStyle === 'diligent_notetaker' ||
        studentStyle === 'eager_participant' ||
        studentStyle === 'calm_observer'
      ) {
        studentPosture = 'taking_notes';
      } else if (studentStyle === 'attentive_nodder') {
        studentPosture = 'nodding';
      } else {
        studentPosture = 'taking_notes';
      }
    } else if (lectureStage === 3) {
      // Stage 3: Calvin Cycle Pacing
      if (studentStyle === 'attentive_nodder' || studentStyle === 'eager_participant') {
        studentPosture = 'nodding';
      } else if (studentStyle === 'calm_observer' || studentStyle === 'diligent_notetaker') {
        studentPosture = 'taking_notes';
      } else {
        studentPosture = 'seating';
      }
    } else {
      // Stage 4: Limiting Factors & Summary
      studentPosture = 'seating';
    }
  } else if (lectureState === 'qa') {
    // -------------------------------------------------------------
    // QUESTION 1 (currentQuizQuestionIndex === 0):
    // Only ONE student answers (Sophia Garcia in R2-S2)!
    // All others remain seated quietly.
    // -------------------------------------------------------------
    if (currentQuizQuestionIndex === 0) {
      if (quizFeedback === null) {
        if (seatIdentifier === 'R2-S2') {
          studentPosture = 'hand_raising'; // Only Sophia raises her hand!
        } else {
          studentPosture = 'seating'; // Everyone else stays quiet/attentive
        }
      } else if (quizFeedback?.isCorrect === true) {
        studentPosture = seatIdentifier === 'R2-S2' ? 'nodding' : 'seating';
      } else {
        studentPosture = 'seating';
      }
    }
    // -------------------------------------------------------------
    // QUESTION 2 (currentQuizQuestionIndex === 1):
    // DEAD SILENCE - NO ONE raises hand!
    // Students avoid eye contact, look down at desk, or look puzzled.
    // -------------------------------------------------------------
    else if (currentQuizQuestionIndex === 1) {
      if (quizFeedback === null) {
        if (seatIdentifier === 'R3-S5') {
          studentPosture = 'confused'; // Ethan scratching his head in confusion
        } else if (seatIdentifier === 'R1-S2' || seatIdentifier === 'R2-S4') {
          studentPosture = 'avoiding_eye_contact'; // Looking down at desk paper
        } else {
          studentPosture = 'seating'; // Quiet, avoid eye contact
        }
      } else {
        studentPosture = 'seating';
      }
    }
    // -------------------------------------------------------------
    // QUESTION 3 (currentQuizQuestionIndex >= 2):
    // CLASSROOM CHAOS - ALL students answer together!
    // Frantic arm waving, clamoring, calling out answers!
    // -------------------------------------------------------------
    else if (currentQuizQuestionIndex >= 2) {
      if (quizFeedback === null) {
        studentPosture = 'chaos_answering'; // All students waving hands and clamoring together!
      } else if (quizFeedback?.isCorrect === true) {
        studentPosture = 'applauding'; // Entire room bursts into applause and laughter!
      } else {
        studentPosture = 'seating';
      }
    }
  }

  // Override student posture during subtle micro-events
  if (activeDisruptionEvent === 'doze_startle' && seatIdentifier === 'R3-S5') {
    studentPosture = 'dozing_off';
  } else if (activeDisruptionEvent === 'phone_vibrate' && seatIdentifier === 'R1-S3') {
    studentPosture = 'avoiding_eye_contact';
  }

  const studentShirtColor = occupiedBy?.shirt_color || occupiedBy?.shirtColor || '#38bdf8';

  // Status color badge
  let badgeColor = '#10b981'; // Green for available
  let badgeText = seatIdentifier;
  if (isMySeat) {
    badgeColor = '#06b6d4'; // Cyan for current user
    badgeText = `${seatIdentifier} (You)`;
  } else if (status === 'occupied') {
    badgeColor = '#f59e0b'; // Amber for occupied
    badgeText = `${seatIdentifier} (${occupiedBy?.display_name || 'Occupied'})`;
  }

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(seatIdentifier);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(seatIdentifier);
    }
    // Auto-walk to this desk and sit down
    const target = [position[0], position[2] + 0.55];
    target.seatId = seatIdentifier;
    setTargetWalkPosition(target);
  };

  return (
    <group position={position}>
      {/* Desk Assembly Group */}
      <group
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Desk Top Slab with Solid Physics Collider */}
        <RigidBody type="fixed" colliders="cuboid" friction={0.6} restitution={0.2}>
          <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
            <boxGeometry args={[0.9, 0.05, 0.6]} />
            <meshStandardMaterial
              color={isSelected ? '#93c5fd' : hovered ? '#fde68a' : '#dfb882'}
              roughness={0.5}
            />
          </mesh>
        </RigidBody>

        {/* Desk Book Shelf / Tray underneath */}
        <mesh position={[0, 0.62, 0]} castShadow>
          <boxGeometry args={[0.82, 0.03, 0.52]} />
          <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.3} />
        </mesh>

        {/* Desk 4 Legs */}
        {[
          [-0.38, 0.36, -0.24],
          [0.38, 0.36, -0.24],
          [-0.38, 0.36, 0.24],
          [0.38, 0.36, 0.24],
        ].map((legPos, idx) => (
          <mesh key={idx} position={legPos} castShadow>
            <cylinderGeometry args={[0.02, 0.016, 0.72, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.4} />
          </mesh>
        ))}

        {/* Student Connected Device (Laptop or Tablet distributed randomly) */}
        {hasDevice && (
          <StudentDevice
            seatId={seatIdentifier}
            isMySeat={isMySeat}
            position={[0, 0.772, 0.04]}
          />
        )}

        {/* Low-Resource EdTech: Plickers Paper Card & Shared Mobile Device */}
        {isLowRes && (
          <LowResourceDeskProps seatId={seatIdentifier} isMySeat={isMySeat} />
        )}

        {/* Written Notes & Physical Worksheet: ONLY present in traditional era */}
        {!hasDevice && !isLowRes && (
          <>
            {/* Stationery on Desk: Small Spiral Notebook */}
            <mesh position={[-0.15, 0.78, 0.02]} rotation={[0, 0.1, 0]} castShadow>
              <boxGeometry args={[0.24, 0.015, 0.30]} />
              <meshStandardMaterial color="#3b82f6" roughness={0.6} />
            </mesh>
            <mesh position={[-0.15, 0.79, 0.02]} rotation={[0, 0.1, 0]}>
              <boxGeometry args={[0.22, 0.005, 0.28]} />
              <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>

            {/* Physical Assessment Worksheet handed out by teacher */}
            <group position={[0.16, 0.776, 0.02]} rotation={[0, -0.05, 0]}>
              {/* Cream Printed Worksheet Paper */}
              <mesh receiveShadow castShadow>
                <boxGeometry args={[0.22, 0.002, 0.3]} />
                <meshStandardMaterial color="#fefce8" roughness={0.8} />
              </mesh>
              {/* Printed Exam Header Line */}
              <mesh position={[0, 0.0015, -0.11]}>
                <boxGeometry args={[0.18, 0.001, 0.012]} />
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
              </mesh>
              {/* Question 1 instruction bar */}
              <mesh position={[-0.02, 0.0015, -0.07]}>
                <boxGeometry args={[0.14, 0.001, 0.006]} />
                <meshStandardMaterial color="#475569" roughness={0.6} />
              </mesh>
              {/* 4 Answer Choice Rows & Check Bubbles */}
              {[-0.035, -0.005, 0.025, 0.055].map((bubbleZ, bIdx) => (
                <group key={bIdx} position={[-0.065, 0.0015, bubbleZ]}>
                  {/* Bubble ring */}
                  <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.005, 0.0075, 10]} />
                    <meshBasicMaterial color="#334155" />
                  </mesh>
                  {/* Option text line */}
                  <mesh position={[0.07, 0, 0]}>
                    <boxGeometry args={[0.11, 0.001, 0.005]} />
                    <meshStandardMaterial color="#64748b" roughness={0.6} />
                  </mesh>
                </group>
              ))}
              {/* Teacher Grading Box / Student Name line */}
              <mesh position={[0.05, 0.0015, 0.1]}>
                <boxGeometry args={[0.08, 0.001, 0.03]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
              </mesh>
            </group>
          </>
        )}

        {/* Dynamic Interactive Physics Stationery (Pencil & Eraser) */}
        <PhysicsDeskStationery deskPosition={[0, 0, 0]} isInteractive={true} seatId={seatIdentifier} />

        {/* 1. Floating In-World Context Prompt for Unoccupied Desks */}
        {status !== 'occupied' && !isMySeat && (hovered || isSelected) && (
          <Html position={[0, 1.15, 0]} center distanceFactor={12}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
                pointerEvents: 'auto',
                userSelect: 'none',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              <div
                style={{
                  backgroundColor: badgeColor,
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{badgeText}</span>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sitDown(seatIdentifier);
                  }}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.4)',
                    padding: '4px 9px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <span style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '4px', fontSize: '9px' }}>E</span>
                  <span>Sit Down</span>
                </button>
                {hasDevice && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeviceInspection();
                    }}
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.4)',
                      padding: '4px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
                    }}
                  >
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '4px', fontSize: '9px' }}>F</span>
                    <span>Device</span>
                  </button>
                )}
                {isLowRes && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPlickersModal(seatIdentifier);
                    }}
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.4)',
                      padding: '4px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
                    }}
                  >
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '4px', fontSize: '9px' }}>F</span>
                    <span>Plickers Card</span>
                  </button>
                )}
              </div>
            </div>
          </Html>
        )}

        {/* 2. Floating In-World Action Pill for Player's Own Desk (when seated) */}
        {isMySeat && (
          <Html position={[0, 0.88, 0.15]} center distanceFactor={14}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                padding: '4px 8px',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                userSelect: 'none',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useClassroomStore.getState().standUp();
                }}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '2px 7px',
                  borderRadius: '5px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: '1px 3px', borderRadius: '3px', fontSize: '8px' }}>E</span>
                <span>Stand Up</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openNotebook();
                }}
                style={{
                  backgroundColor: 'rgba(52, 211, 153, 0.2)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  padding: '2px 7px',
                  borderRadius: '5px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: '1px 3px', borderRadius: '3px', fontSize: '8px' }}>N</span>
                <span>Notebook</span>
              </button>
              {hasDevice && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeviceInspection();
                  }}
                  style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: '1px 3px', borderRadius: '3px', fontSize: '8px' }}>F</span>
                  <span>Terminal</span>
                </button>
              )}
              {isLowRes && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openPlickersModal(seatIdentifier);
                  }}
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: '1px 3px', borderRadius: '3px', fontSize: '8px' }}>F</span>
                  <span>Plickers Card</span>
                </button>
              )}
            </div>
          </Html>
        )}
      </group>

      {/* Accompanying Student Chair positioned behind desk */}
      <StudentChair position={[0, 0, 0.62]} rotation={[0, 0, 0]} />

      {/* 3. Occupied Student Avatar & Floating In-World Action Wheel */}
      {status === 'occupied' && !isMySeat && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(seatIdentifier);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          {/* Seated Classroom Avatar */}
          <ClassroomAvatar
            position={[0, 0, 0.55]}
            rotation={[0, Math.PI, 0]}
            worldPosition={[position[0], position[1], position[2] + 0.55]}
            name={occupiedBy?.display_name || occupiedBy?.username || 'Student'}
            role="Student"
            posture={studentPosture}
            shirtColor={studentShirtColor}
            pantsColor="#334155"
            seed={seatIdentifier}
          />

          {/* Hover indicator hint when not selected */}
          {hovered && !isSelected && (
            <Html position={[0, 1.82, 0.55]} center distanceFactor={14}>
              <div
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  color: '#38bdf8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  pointerEvents: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                }}
              >
                {occupiedBy?.display_name || occupiedBy?.username || 'Student'} • Click to interact
              </div>
            </Html>
          )}

          {/* Full Interactive Action Wheel when clicked/selected */}
          {isSelected && (
            <StudentActionWheel
              seatId={seatIdentifier}
              studentName={occupiedBy?.display_name || occupiedBy?.username || 'Student'}
              posture={studentPosture}
              onClose={() => onSelect?.(null)}
            />
          )}
        </group>
      )}
    </group>
  );
};
