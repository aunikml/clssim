import React from 'react';

export const ClassroomDoor = ({ position = [9.9, 0, 4.5] }) => {
  return (
    <group position={position}>
      {/* Outer Door Frame */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.24, 3.05, 1.8]} />
        <meshStandardMaterial color="#6b4c35" roughness={0.7} />
      </mesh>

      {/* Door Leaf (stylized slightly ajar or flush) */}
      <mesh position={[-0.05, 1.48, 0]} castShadow>
        <boxGeometry args={[0.08, 2.9, 1.6]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.6} />
      </mesh>

      {/* Upper Glass Window Pane in Door */}
      <mesh position={[-0.05, 2.1, 0]}>
        <boxGeometry args={[0.09, 0.75, 0.6]} />
        <meshStandardMaterial
          color="#c8e6c9"
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Brass Door Handle */}
      <group position={[-0.12, 1.25, -0.6]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.16, 12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Room sign above door */}
      <mesh position={[-0.14, 3.2, 0]}>
        <boxGeometry args={[0.02, 0.25, 0.8]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>
    </group>
  );
};
