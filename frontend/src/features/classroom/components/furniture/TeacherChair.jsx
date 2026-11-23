import React from 'react';

export const TeacherChair = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Padded Seat Cushion */}
      <mesh castShadow receiveShadow position={[0, 0.48, 0]}>
        <boxGeometry args={[0.6, 0.08, 0.56]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* High Padded Backrest */}
      <mesh castShadow position={[0, 0.88, -0.24]}>
        <boxGeometry args={[0.56, 0.72, 0.08]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Left & Right Armrests */}
      <mesh castShadow position={[-0.32, 0.68, -0.05]}>
        <boxGeometry args={[0.06, 0.04, 0.42]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.32, 0.68, -0.05]}>
        <boxGeometry args={[0.06, 0.04, 0.42]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>

      {/* Armrest vertical supports */}
      <mesh position={[-0.32, 0.58, 0.1]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} />
      </mesh>
      <mesh position={[0.32, 0.58, 0.1]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} />
      </mesh>

      {/* Central Column */}
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.42, 12]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 5-Star Swivel Base */}
      {[0, 72, 144, 216, 288].map((angle, idx) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <mesh
            key={idx}
            position={[Math.sin(rad) * 0.18, 0.05, Math.cos(rad) * 0.18]}
            rotation={[0, rad, 0]}
            castShadow
          >
            <boxGeometry args={[0.04, 0.03, 0.36]} />
            <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};
