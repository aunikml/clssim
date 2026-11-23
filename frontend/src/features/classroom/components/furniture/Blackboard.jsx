import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useClassroomStore } from '../../../../store/classroomStore';
import { blackboardService } from '../../../../services/blackboardService';

export const Blackboard = ({
  position = [0, 2.4, -7.85],
  width = 7.2,
  height = 2.4,
}) => {
  const [hovered, setHovered] = useState(false);
  const [, setTick] = useState(0);
  const toggleBoardModal = useClassroomStore((state) => state.toggleBoardModal);
  const setCameraMode = useClassroomStore((state) => state.setCameraMode);
  const setInspectTarget = useClassroomStore((state) => state.setInspectTarget);

  // Subscribe to blackboard canvas texture updates
  useEffect(() => {
    const unsubscribe = blackboardService.onChange(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const texture = blackboardService.getTexture();

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    toggleBoardModal();
  };

  const handleClick = (e) => {
    e.stopPropagation();
    // Second Life Object Inspect: smoothly glide camera directly to blackboard
    setInspectTarget({
      name: 'Chalkboard',
      target: [0, 2.4, -7.85],
      distance: 3.6,
    });
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
      {/* Wooden Frame */}
      <mesh castShadow receiveShadow position={[0, 0, -0.04]}>
        <boxGeometry args={[width + 0.24, height + 0.24, 0.08]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>

      {/* Main Dynamic Blackboard Canvas Surface */}
      <mesh receiveShadow position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.88}
          metalness={0.05}
        />
      </mesh>

      {/* Chalk Tray beneath blackboard */}
      <group position={[0, -height / 2 - 0.06, 0.1]}>
        {/* Tray base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width + 0.1, 0.04, 0.22]} />
          <meshStandardMaterial color="#6b4c35" roughness={0.6} />
        </mesh>
        {/* Tray lip */}
        <mesh position={[0, 0.03, 0.1]} castShadow>
          <boxGeometry args={[width + 0.1, 0.03, 0.02]} />
          <meshStandardMaterial color="#6b4c35" roughness={0.6} />
        </mesh>

        {/* 3D Chalk Sticks in Tray */}
        <mesh position={[-0.6, 0.03, 0.02]} rotation={[0, 0.2, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.1, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        <mesh position={[-0.45, 0.03, 0.04]} rotation={[0, -0.1, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
          <meshStandardMaterial color="#fef08a" roughness={0.9} />
        </mesh>
        <mesh position={[-0.3, 0.03, 0.01]} rotation={[0, 0.05, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.09, 8]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.9} />
        </mesh>

        {/* Chalk Eraser on Tray */}
        <mesh position={[0.5, 0.035, 0.02]} castShadow>
          <boxGeometry args={[0.22, 0.04, 0.09]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[0.5, 0.055, 0.02]} castShadow>
          <boxGeometry args={[0.2, 0.015, 0.08]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.95} />
        </mesh>
      </group>

      {/* Floating Hover Indicator */}
      {hovered && (
        <Html position={[0, height / 2 + 0.35, 0]} center distanceFactor={14}>
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <span>✏️</span>
            <span>Double-click or press [B] to draw on Blackboard</span>
          </div>
        </Html>
      )}
    </group>
  );
};
