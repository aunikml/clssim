import React from 'react';

export const ClassroomCeiling = ({ width = 20, length = 16, height = 5, visible = false }) => {
  if (!visible) return null;

  return (
    <group position={[0, height, 0]}>
      {/* Ceiling Plane */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} side={2} />
      </mesh>

      {/* Recessed Ceiling Fixtures */}
      {[-4, 0, 4].map((x) =>
        [-4, 0, 4].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.02, z]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 0.6]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#fff8e7"
              emissiveIntensity={0.6}
            />
          </mesh>
        ))
      )}
    </group>
  );
};
