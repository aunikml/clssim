import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useClassroomStore } from '../../../../store/classroomStore';
import { digitalScreenService } from '../../../../services/digitalScreenService';
import { lectureService } from '../../../../services/lectureService';

/**
 * Modern High-Tech Digital Smart Screen (Interactive 4K Presentation Display)
 * Backed by digitalScreenService for unified live sync with the Board Tool Modal
 */
export const DigitalSmartScreen = ({
  position = [0, 2.4, -7.85],
  width = 7.2,
  height = 2.4,
}) => {
  const meshRef = useRef();
  const laserRef = useRef();
  const [hovered, setHovered] = useState(false);

  const setBoardModalOpen = useClassroomStore((state) => state.setBoardModalOpen);
  const setInspectTarget = useClassroomStore((state) => state.setInspectTarget);
  const isLaserPointerActive = useClassroomStore((state) => state.isLaserPointerActive);
  const lectureState = useClassroomStore((state) => state.lectureState);

  const texture = digitalScreenService.getTexture();

  // Render unified animation frame (ECG sweep, heart pulse, telemetry, Q&A assessment)
  // Direct store read inside useFrame avoids re-rendering the 3D component on timer ticks
  useFrame((state) => {
    const store = useClassroomStore.getState();
    digitalScreenService.render(
      null,
      store.lectureTimer,
      store.lectureTranscript,
      store.lectureState,
      store.currentQuizQuestionIndex,
      store.quizFeedback
    );

    if (laserRef.current) {
      if (store.isLaserPointerActive) {
        laserRef.current.visible = true;
        const t = state.clock.getElapsedTime();
        const lx = Math.sin(t * 1.6) * 2.2 + Math.cos(t * 3.8) * 0.4;
        const ly = Math.cos(t * 1.3) * 0.7 + Math.sin(t * 2.5) * 0.2;
        laserRef.current.position.set(lx, ly, 0.025);
      } else {
        laserRef.current.visible = false;
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    const store = useClassroomStore.getState();
    if (store.lectureState === 'idle') {
      lectureService.startLecture();
    } else {
      setInspectTarget({
        name: 'Digital Smart Screen (Cardiology)',
        target: [0, 2.4, -7.85],
        distance: 3.8,
      });
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    const store = useClassroomStore.getState();
    if (store.lectureState === 'idle') {
      lectureService.startLecture();
    } else {
      // Open the Board Tool modal showing the digital screen!
      setBoardModalOpen(true);
    }
  };

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Outer Sleek Metallic Chassis & Wall Mounting Brackets */}
      <mesh castShadow receiveShadow position={[0, 0, -0.05]}>
        <boxGeometry args={[width + 0.16, height + 0.16, 0.08]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Slim Inner Chamfered Bezel */}
      <mesh position={[0, 0, -0.01]} castShadow>
        <boxGeometry args={[width + 0.04, height + 0.04, 0.02]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Main 4K Digital Presentation Glass Surface */}
      <mesh ref={meshRef} position={[0, 0, 0.01]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* Teacher Interactive Laser Pointer Dot Projection */}
      <group ref={laserRef} position={[0, 0, 0.025]} visible={isLaserPointerActive}>
        <mesh>
          <circleGeometry args={[0.04, 16]} />
          <meshBasicMaterial color="#ef4444" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <circleGeometry args={[0.016, 16]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <pointLight color="#ef4444" intensity={2.5} distance={1.2} decay={2} />
      </group>

      {/* Power LED Indicator (Green) */}
      <mesh position={[width / 2 - 0.08, -height / 2 + 0.04, 0.02]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>

      {/* Screen Ambient Cyan Bloom Illuminating the Front Teaching Zone */}
      <pointLight position={[0, 0, 0.5]} color="#38bdf8" intensity={1.2} distance={7} decay={2} />

      {/* Hover Info Tooltip */}
      {hovered && (
        <Html position={[0, height / 2 + 0.3, 0]} center distanceFactor={14}>
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              color: '#38bdf8',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              pointerEvents: 'none',
            }}
          >
            {lectureState === 'idle'
              ? '▶ Click Screen to Start PowerPoint Presentation'
              : 'Digital 4K Smart Screen · Double-Click or Press [B] to Open Screen Tool'}
          </div>
        </Html>
      )}
    </group>
  );
};
export default DigitalSmartScreen;
