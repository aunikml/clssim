import React from 'react';

export const ClassroomWindows = ({
  x = -9.9,
  zPositions = [-4.75, -1.5, 1.5, 4.75],
  windowWidth = 2.0,
  windowHeight = 2.4,
  yPos = 2.5,
}) => {
  return (
    <group>
      {zPositions.map((z, idx) => (
        <group key={idx} position={[x, yPos, z]}>
          {/* Window Wooden Frame */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.22, windowHeight + 0.1, windowWidth + 0.1]} />
            <meshStandardMaterial color="#ffffff" roughness={0.6} />
          </mesh>

          {/* Window Glass Pane */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.04, windowHeight - 0.1, windowWidth - 0.1]} />
            <meshStandardMaterial
              color="#dbeafe"
              transparent
              opacity={0.35}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>

          {/* Window Cross Mullions / Grids */}
          <mesh position={[0.02, 0, 0]}>
            <boxGeometry args={[0.03, windowHeight, 0.05]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
          <mesh position={[0.02, 0, 0]}>
            <boxGeometry args={[0.03, 0.05, windowWidth]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>

          {/* Window Sill */}
          <mesh position={[0.1, -windowHeight / 2 - 0.05, 0]}>
            <boxGeometry args={[0.3, 0.08, windowWidth + 0.3]} />
            <meshStandardMaterial color="#8c6239" roughness={0.6} />
          </mesh>

          {/* Subtle Stylized Curtains on sides */}
          <mesh position={[0.1, 0, -windowWidth / 2 - 0.05]}>
            <boxGeometry args={[0.08, windowHeight - 0.1, 0.18]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.8} />
          </mesh>
          <mesh position={[0.1, 0, windowWidth / 2 + 0.05]}>
            <boxGeometry args={[0.08, windowHeight - 0.1, 0.18]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
