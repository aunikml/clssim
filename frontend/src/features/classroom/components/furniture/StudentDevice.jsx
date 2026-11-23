import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useClassroomStore } from '../../../../store/classroomStore';
import { digitalScreenService } from '../../../../services/digitalScreenService';

// Deterministic seed hash so desk device assignment is consistent
const hashSeed = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(h);
};

/**
 * High-Fidelity 3D Student Device (Laptops & Tablets)
 * Distributed randomly across student desks when digital teaching display is active.
 * Mirrors whatever is being displayed on the 4K digital screen in real-time,
 * and automatically displays interactive assessment questions during the Q&A phase!
 */
export const StudentDevice = ({
  seatId = 'R1-S1',
  isMySeat = false,
  position = [0, 0.775, 0.04],
}) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  const lectureState = useClassroomStore((state) => state.lectureState);
  const currentQuizQuestionIndex = useClassroomStore((state) => state.currentQuizQuestionIndex);
  const setInspectTarget = useClassroomStore((state) => state.setInspectTarget);
  const setBoardModalOpen = useClassroomStore((state) => state.setBoardModalOpen);
  const openDeviceInspection = useClassroomStore((state) => state.openDeviceInspection);

  // Deterministically assign laptop or tablet based on seat ID (50/50 realistic distribution)
  const isTablet = hashSeed(seatId) % 2 === 0;
  const deviceType = isTablet ? 'tablet' : 'laptop';

  const isSeated = useClassroomStore((state) => state.isSeated);
  const seatedSeatId = useClassroomStore((state) => state.seatedSeatId);
  const isUserDesk = isMySeat || (isSeated && seatedSeatId === seatId);

  // Live real-time canvas texture mirroring from the 4K smart screen
  const screenTexture = digitalScreenService.getTexture();

  const handleDeviceClick = (e) => {
    e.stopPropagation();
    // Open the high-definition student device inspection modal
    openDeviceInspection();
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onClick={handleDeviceClick}
    >
      {/* LAPTOP MODEL */}
      {deviceType === 'laptop' && (
        <group position={[0, 0, 0]} rotation={[0, 0.03, 0]}>
          {/* Base Chassis (Aluminum unibody) */}
          <mesh position={[0, 0.006, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.29, 0.012, 0.20]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Recessed Keyboard Well & Clean Key Bed */}
          <mesh position={[0, 0.013, -0.025]}>
            <boxGeometry args={[0.25, 0.003, 0.11]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} />
          </mesh>

          {/* Key Rows Block Representation */}
          <mesh position={[0, 0.0145, -0.025]}>
            <boxGeometry args={[0.24, 0.002, 0.10]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>

          {/* Glass Trackpad */}
          <mesh position={[0, 0.0125, 0.06]}>
            <boxGeometry args={[0.085, 0.002, 0.055]} />
            <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.2} />
          </mesh>

          {/* Hinged Display Lid (Open at ergonomic angle for desk viewing) */}
          <group position={[0, 0.012, -0.10]} rotation={[-0.38, 0, 0]}>
            {/* Outer Lid Shell */}
            <mesh position={[0, 0.095, -0.004]}>
              <boxGeometry args={[0.29, 0.19, 0.008]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
            </mesh>

            {/* Inner Bezel */}
            <mesh position={[0, 0.095, 0.001]}>
              <boxGeometry args={[0.28, 0.18, 0.002]} />
              <meshStandardMaterial color="#020617" roughness={0.9} />
            </mesh>

            {/* Live 16:10 Mirrored Presentation Screen Surface */}
            <mesh position={[0, 0.095, 0.0025]}>
              <planeGeometry args={[0.265, 0.165]} />
              <meshBasicMaterial map={screenTexture} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>

            {/* Webcam Indicator */}
            <mesh position={[0, 0.183, 0.002]}>
              <sphereGeometry args={[0.0015, 8, 8]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        </group>
      )}

      {/* TABLET MODEL */}
      {deviceType === 'tablet' && (
        <group position={[0, 0, 0]} rotation={[0, -0.04, 0]}>
          {/* Angled Kickstand / Wedge propping up tablet at 26 degrees */}
          <mesh position={[0, 0.03, -0.06]} rotation={[-0.45, 0, 0]}>
            <boxGeometry args={[0.22, 0.01, 0.12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>

          {/* Tablet Body (Tilted back for clear sightlines) */}
          <group position={[0, 0.035, 0]} rotation={[-0.45, 0, 0]}>
            {/* Aluminum Outer Shell */}
            <mesh position={[0, 0, -0.004]}>
              <boxGeometry args={[0.25, 0.18, 0.008]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Front Bezel */}
            <mesh position={[0, 0, 0.001]}>
              <boxGeometry args={[0.245, 0.175, 0.002]} />
              <meshStandardMaterial color="#020617" roughness={0.9} />
            </mesh>

            {/* Live Mirrored Screen Glass */}
            <mesh position={[0, 0, 0.0025]}>
              <planeGeometry args={[0.23, 0.16]} />
              <meshBasicMaterial map={screenTexture} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>

            {/* Front Camera Dot */}
            <mesh position={[0, 0.083, 0.002]}>
              <sphereGeometry args={[0.0015, 8, 8]} />
              <meshBasicMaterial color="#4ade80" />
            </mesh>
          </group>

          {/* Precision Digital Stylus resting on desk beside tablet */}
          <group position={[0.145, 0.005, 0]} rotation={[0, 0.05, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.004, 0.004, 0.16, 12]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.3} />
            </mesh>
            {/* Stylus Tip */}
            <mesh position={[0, -0.083, 0]}>
              <coneGeometry args={[0.004, 0.01, 12]} />
              <meshStandardMaterial color="#475569" roughness={0.6} />
            </mesh>
          </group>
        </group>
      )}

      {/* Floating Hover Badge & Assessment Prompt */}
      {hovered && (
        <Html position={[0, 0.32, 0]} center distanceFactor={10}>
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              color: '#38bdf8',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <div>
              {isMySeat ? 'Your ' : `${seatId} `}
              {deviceType === 'tablet' ? '📱 Tablet' : '💻 Laptop'}
            </div>
            <div style={{ fontSize: '9px', color: '#cbd5e1', fontWeight: 600 }}>
              {lectureState === 'qa'
                ? `● Pop Quiz: Question ${currentQuizQuestionIndex + 1} Active!`
                : '● Mirroring 4K Smart Screen Live'}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
