import React from 'react';
import { useClassroomStore } from '../../../../store/classroomStore';

export const ClassroomLighting = () => {
  const classroomEra = useClassroomStore((state) => state.classroomEra);
  const isHighRes = classroomEra === 'high_resource' || classroomEra === 'edtech';
  const isLowRes = classroomEra === 'low_resource';

  // In Low-Resource projector mode, the front of the room is slightly dimmed so the projector beam stands out
  const ambientIntensity = isHighRes ? 0.8 : isLowRes ? 0.58 : 0.65;
  const ambientColor = isHighRes ? '#f0f9ff' : isLowRes ? '#f8fafc' : '#fffbeb';

  return (
    <group>
      {/* Era-Aware Ambient Base Lighting */}
      <ambientLight
        intensity={ambientIntensity}
        color={ambientColor}
      />

      {/* Sky & ground bounce light */}
      <hemisphereLight
        args={[
          isHighRes ? '#e0f2fe' : isLowRes ? '#f1f5f9' : '#fef3c7',
          isHighRes ? '#64748b' : isLowRes ? '#475569' : '#78716c',
          isHighRes ? 0.62 : isLowRes ? 0.48 : 0.5,
        ]}
        position={[0, 10, 0]}
      />

      {/* Main Directional Sunlight pouring through windows */}
      <directionalLight
        position={[-12, 11, 3]}
        intensity={isHighRes ? 1.5 : isLowRes ? 1.1 : 1.35}
        color={isHighRes ? '#ffffff' : isLowRes ? '#f8fafc' : '#fff7ed'}
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

      {/* High-Resource 4K Screen Digital Cyan Glow */}
      {isHighRes && (
        <pointLight
          position={[0, 2.4, -6.8]}
          intensity={0.85}
          distance={9.0}
          decay={2}
          color="#38bdf8"
        />
      )}

      {/* Low-Resource Projector Beam Light (Spotlight from ceiling projector onto wall screen) */}
      {isLowRes && (
        <group position={[0, 4.2, -1.8]}>
          <spotLight
            intensity={2.8}
            color="#ffffff"
            angle={0.42}
            penumbra={0.35}
            distance={10.0}
            decay={1.2}
            position={[0, 0, 0]}
            target-position={[0, 2.3, -7.8]}
          />
          {/* Subtle warm wash around front projection screen */}
          <pointLight
            position={[0, -1.8, -5.5]}
            intensity={0.45}
            distance={5.0}
            color="#e0f2fe"
          />
        </group>
      )}

      {/* Subtle fill light from classroom doorway */}
      <directionalLight
        position={[9, 6, 6]}
        intensity={0.4}
        color="#bae6fd"
      />

      {/* 4 Architectural Ceiling Pendant Troffers (Warm Halogen vs Cool Fluorescent vs Modern LED) */}
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
                color={isHighRes ? '#e0f2fe' : isLowRes ? '#f8fafc' : '#fef08a'}
                emissive={isHighRes ? '#38bdf8' : isLowRes ? '#cbd5e1' : '#fef08a'}
                emissiveIntensity={isHighRes ? 1.4 : isLowRes ? 0.9 : 1.8}
              />
            </mesh>
            {/* Physical Point Light casting onto desks */}
            <pointLight
              position={[0, -0.15, 0]}
              intensity={isHighRes ? 0.55 : isLowRes ? 0.38 : 0.45}
              distance={7.5}
              decay={2}
              color={isHighRes ? '#f0f9ff' : isLowRes ? '#f8fafc' : '#fffbeb'}
            />
          </group>
        ))
      )}
    </group>
  );
};
