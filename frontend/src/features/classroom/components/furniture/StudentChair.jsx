import React from 'react';

export const StudentChair = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Chair Seat */}
      <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.52, 0.05, 0.5]} />
        <meshStandardMaterial color="#cca06b" roughness={0.6} />
      </mesh>

      {/* Chair Backrest */}
      <mesh castShadow position={[0, 0.82, 0.22]}>
        <boxGeometry args={[0.48, 0.32, 0.04]} />
        <meshStandardMaterial color="#cca06b" roughness={0.6} />
      </mesh>

      {/* Chair Back Support Bars */}
      <mesh position={[-0.18, 0.65, 0.22]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.18, 0.65, 0.22]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Chair 4 Legs */}
      {[
        [-0.2, 0.22, -0.18],
        [0.2, 0.22, -0.18],
        [-0.2, 0.22, 0.18],
        [0.2, 0.22, 0.18],
      ].map((legPos, idx) => (
        <mesh key={idx} position={legPos} castShadow>
          <cylinderGeometry args={[0.018, 0.014, 0.44, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
};
