import React from 'react';
import { useClassroomStore } from '../../../../store/classroomStore';

export const ClassroomLighting = () => {
  const classroomEra = useClassroomStore((state) => state.classroomEra);
  const isEdTech = classroomEra === 'edtech';

  return (
    <group>
      {/* Era-Aware Ambient Base Lighting (Warm Vintage vs Crisp Modern Neutral) */}
      <ambientLight
        intensity={isEdTech ? 0.78 : 0.65}
        color={isEdTech ? '#f0f9ff' : '#fffbeb'}
      />

      {/* Sky & ground bounce light */}
      <hemisphereLight
        args={[isEdTech ? '#e0f2fe' : '#fef3c7', isEdTech ? '#64748b' : '#78716c', isEdTech ? 0.62 : 0.5]}
        position={[0, 10, 0]}
      />

      {/* Main Directional Sunlight pouring through windows */}
      <directionalLight
        position={[-12, 11, 3]}
        intensity={isEdTech ? 1.5 : 1.35}
        color={isEdTech ? '#ffffff' : '#fff7ed'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={35}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0002}
      />

      {/* Front Screen Digital Glow (Only active in EdTech Era) */}
      {isEdTech && (
        <pointLight
          position={[0, 2.4, -6.8]}
          intensity={0.85}
          distance={9.0}
          decay={2}
          color="#38bdf8"
        />
      )}

      {/* Subtle fill light from classroom doorway */}
      <directionalLight
        position={[9, 6, 6]}
        intensity={0.4}
        color="#bae6fd"
      />

      {/* 4 Architectural Ceiling Pendant Troffers (Warm Halogen vs Cool White LED) */}
      {[-3.5, 3.5].map((x) =>
        [-3, 2.5].map((z) => (
          <group key={`${x}-${z}`} position={[x, 4.3, z]}>
            {/* Cord */}
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {/* Matte metal lamp fixture */}
            <mesh position={[0, 0, 0]}>
              <coneGeometry args={[0.42, 0.22, 16, 1, true]} rotation={[Math.PI, 0, 0]} />
              <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Glowing Bulb */}
            <mesh position={[0, -0.04, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial
                color={isEdTech ? '#e0f2fe' : '#fef08a'}
                emissive={isEdTech ? '#38bdf8' : '#fef08a'}
                emissiveIntensity={isEdTech ? 1.4 : 1.8}
              />
            </mesh>
            {/* Physical Point Light casting onto desks */}
            <pointLight
              position={[0, -0.15, 0]}
              intensity={isEdTech ? 0.55 : 0.45}
              distance={7.5}
              decay={2}
              color={isEdTech ? '#f0f9ff' : '#fffbeb'}
            />
          </group>
        ))
      )}
    </group>
  );
};
