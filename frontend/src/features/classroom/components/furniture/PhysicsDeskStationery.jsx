import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { physicsFoleyAudioService } from '../../../../services/physicsFoleyAudioService';

/**
 * Dynamic physics-enabled stationery on student desks.
 * Features rolling pencils with collision-driven Foley audio, erasers, and worksheets.
 */
export const PhysicsDeskStationery = ({
  deskPosition = [0, 0, 0],
  isInteractive = true,
  seatId = 'R1-S1',
}) => {
  const pencilRef = useRef();
  const eraserRef = useRef();
  const [pencilHovered, setPencilHovered] = useState(false);
  const [eraserHovered, setEraserHovered] = useState(false);

  // Position relative to desk center
  const [dx, dy, dz] = deskPosition;
  const initialPencilPos = [dx + 0.04, dy + 0.795, dz + 0.12];
  const initialEraserPos = [dx - 0.22, dy + 0.79, dz + 0.1];

  // Flick pencil with realistic physical impulse and torque
  const handleFlickPencil = (e) => {
    e.stopPropagation();
    if (!pencilRef.current) return;

    // Apply forward and rotational impulse
    const impulseZ = -0.008 - Math.random() * 0.008;
    const impulseX = (Math.random() - 0.5) * 0.01;
    pencilRef.current.applyImpulse({ x: impulseX, y: 0.003, z: impulseZ }, true);
    pencilRef.current.applyTorqueImpulse({ x: 0, y: 0.001, z: 0.004 }, true);
    physicsFoleyAudioService.playPencilDrop(0.8);
  };

  // Nudge eraser
  const handleNudgeEraser = (e) => {
    e.stopPropagation();
    if (!eraserRef.current) return;
    const impulseX = (Math.random() - 0.3) * 0.012;
    const impulseZ = (Math.random() - 0.5) * 0.008;
    eraserRef.current.applyImpulse({ x: impulseX, y: 0.002, z: impulseZ }, true);
    physicsFoleyAudioService.playPencilDrop(0.5);
  };

  return (
    <group>
      {/* 1. Dynamic Rolling Pencil */}
      <RigidBody
        ref={pencilRef}
        colliders="hull"
        position={initialPencilPos}
        rotation={[0, -0.15, 0]}
        mass={0.02}
        friction={0.4}
        restitution={0.3}
        onCollisionEnter={({ totalForceMagnitude }) => {
          if (totalForceMagnitude > 0.08) {
            physicsFoleyAudioService.playPencilDrop(totalForceMagnitude * 5);
          }
        }}
      >
        <group
          onClick={handleFlickPencil}
          onPointerOver={() => isInteractive && setPencilHovered(true)}
          onPointerOut={() => isInteractive && setPencilHovered(false)}
        >
          {/* Hexagonal wooden yellow body */}
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.006, 0.006, 0.2, 6]} />
            <meshStandardMaterial
              color={pencilHovered ? '#fbbf24' : '#f59e0b'}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>

          {/* Sharpened natural wood cone */}
          <mesh position={[-0.108, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.006, 0.018, 6]} />
            <meshStandardMaterial color="#fed7aa" roughness={0.7} />
          </mesh>

          {/* Graphite lead tip */}
          <mesh position={[-0.118, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.002, 0.006, 6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} />
          </mesh>

          {/* Silver metal ferrule */}
          <mesh position={[0.103, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0062, 0.0062, 0.012, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Pink rubber eraser top */}
          <mesh position={[0.113, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0058, 0.0058, 0.01, 8]} />
            <meshStandardMaterial color="#f472b6" roughness={0.8} />
          </mesh>
        </group>
      </RigidBody>

      {/* 2. Classic Gum Eraser */}
      <RigidBody
        ref={eraserRef}
        colliders="cuboid"
        position={initialEraserPos}
        rotation={[0, 0.2, 0]}
        mass={0.03}
        friction={0.9}
        restitution={0.15}
        onCollisionEnter={({ totalForceMagnitude }) => {
          if (totalForceMagnitude > 0.1) {
            physicsFoleyAudioService.playPencilDrop(totalForceMagnitude * 3);
          }
        }}
      >
        <group
          onClick={handleNudgeEraser}
          onPointerOver={() => isInteractive && setEraserHovered(true)}
          onPointerOut={() => isInteractive && setEraserHovered(false)}
        >
          {/* Main white/blue vinyl eraser block */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.045, 0.016, 0.024]} />
            <meshStandardMaterial
              color={eraserHovered ? '#60a5fa' : '#3b82f6'}
              roughness={0.7}
            />
          </mesh>
          {/* Protective paper sleeve */}
          <mesh position={[-0.005, 0.0005, 0]}>
            <boxGeometry args={[0.028, 0.017, 0.025]} />
            <meshStandardMaterial color="#ffffff" roughness={0.8} />
          </mesh>
        </group>
      </RigidBody>
    </group>
  );
};
