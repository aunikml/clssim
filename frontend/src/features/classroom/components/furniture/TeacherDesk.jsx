import React from 'react';
import { TeacherChair } from './TeacherChair';

export const TeacherDesk = ({ position = [-3.5, 0, -4.8], rotation = [0, 0.2, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Teacher Desk Surface */}
      <mesh castShadow receiveShadow position={[0, 0.78, 0]}>
        <boxGeometry args={[1.8, 0.06, 0.9]} />
        <meshStandardMaterial color="#a77044" roughness={0.5} />
      </mesh>

      {/* Desk Frame & Modesty Panel */}
      <mesh castShadow position={[0, 0.45, -0.4]}>
        <boxGeometry args={[1.7, 0.6, 0.04]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.6} />
      </mesh>

      {/* Left Drawer Pedestal */}
      <mesh castShadow position={[-0.65, 0.4, 0]}>
        <boxGeometry args={[0.42, 0.72, 0.8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.6} />
      </mesh>
      {/* Drawer Handles */}
      {[-0.65].map((x) =>
        [0.6, 0.4, 0.2].map((y, idx) => (
          <mesh key={idx} position={[x, y, 0.42]}>
            <boxGeometry args={[0.15, 0.02, 0.02]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
          </mesh>
        ))
      )}

      {/* Right Legs */}
      {[
        [0.75, 0.38, -0.38],
        [0.75, 0.38, 0.38],
      ].map((legPos, idx) => (
        <mesh key={idx} position={legPos} castShadow>
          <boxGeometry args={[0.06, 0.74, 0.06]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.6} />
        </mesh>
      ))}

      {/* Props on Teacher Desk: Open Laptop */}
      <group position={[0.15, 0.81, 0]} rotation={[0, -0.15, 0]}>
        {/* Laptop Base */}
        <mesh castShadow position={[0, 0.01, 0]}>
          <boxGeometry args={[0.36, 0.015, 0.26]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Laptop Screen */}
        <mesh position={[0, 0.12, -0.12]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.36, 0.24, 0.012]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Glowing Screen Content */}
        <mesh position={[0, 0.12, -0.11]} rotation={[-0.3, 0, 0]}>
          <planeGeometry args={[0.32, 0.2]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Stack of Grading Books */}
      <group position={[-0.6, 0.81, -0.15]} rotation={[0, 0.1, 0]}>
        <mesh castShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[0.26, 0.04, 0.34]} />
          <meshStandardMaterial color="#dc2626" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0.02, 0.055, 0.01]} rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.25, 0.035, 0.32]} />
          <meshStandardMaterial color="#2563eb" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[-0.01, 0.085, -0.01]} rotation={[0, -0.05, 0]}>
          <boxGeometry args={[0.24, 0.03, 0.3]} />
          <meshStandardMaterial color="#16a34a" roughness={0.7} />
        </mesh>
      </group>

      {/* Pen Holder Cup */}
      <group position={[0.65, 0.81, 0.2]}>
        <mesh castShadow position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.05, 0.045, 0.12, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Pens */}
        <mesh position={[0.01, 0.12, 0]} rotation={[0.2, 0, 0.1]}>
          <cylinderGeometry args={[0.008, 0.008, 0.16, 6]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[-0.01, 0.12, 0.01]} rotation={[-0.15, 0, -0.1]}>
          <cylinderGeometry args={[0.008, 0.008, 0.16, 6]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      </group>

      {/* Teacher Chair behind desk */}
      <TeacherChair position={[0, 0, -0.65]} rotation={[0, 0, 0]} />
    </group>
  );
};
