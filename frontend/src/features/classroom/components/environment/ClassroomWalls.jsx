import React from 'react';

export const ClassroomWalls = ({ width = 20, length = 16, height = 5 }) => {
  const wallThickness = 0.2;
  const halfWidth = width / 2;
  const halfLength = length / 2;
  const halfHeight = height / 2;

  return (
    <group>
      {/* Front Wall (Teaching Wall at -Z) */}
      <mesh receiveShadow position={[0, halfHeight, -halfLength]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial color="#f7f3e8" roughness={0.9} />
      </mesh>
      {/* Front Wall Wainscoting (lower accent trim) */}
      <mesh receiveShadow position={[0, 0.6, -halfLength + 0.02]}>
        <boxGeometry args={[width, 1.2, 0.05]} />
        <meshStandardMaterial color="#a7b89f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.22, -halfLength + 0.03]}>
        <boxGeometry args={[width, 0.06, 0.06]} />
        <meshStandardMaterial color="#8c6239" roughness={0.7} />
      </mesh>

      {/* Back Wall (+Z) */}
      <mesh receiveShadow position={[0, halfHeight, halfLength]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial color="#f7f3e8" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, 0.6, halfLength - 0.02]}>
        <boxGeometry args={[width, 1.2, 0.05]} />
        <meshStandardMaterial color="#a7b89f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.22, halfLength - 0.03]}>
        <boxGeometry args={[width, 0.06, 0.06]} />
        <meshStandardMaterial color="#8c6239" roughness={0.7} />
      </mesh>

      {/* Right Wall (+X) with opening for door */}
      {/* Right Wall - Front Section */}
      <mesh receiveShadow position={[halfWidth, halfHeight, -2.5]}>
        <boxGeometry args={[wallThickness, height, length - 5.5]} />
        <meshStandardMaterial color="#f7f3e8" roughness={0.9} />
      </mesh>
      {/* Right Wall - Above Door Section */}
      <mesh receiveShadow position={[halfWidth, 4.0, 4.5]}>
        <boxGeometry args={[wallThickness, 2.0, 2.6]} />
        <meshStandardMaterial color="#f7f3e8" roughness={0.9} />
      </mesh>
      {/* Right Wall - Back Corner Section */}
      <mesh receiveShadow position={[halfWidth, halfHeight, 7.0]}>
        <boxGeometry args={[wallThickness, height, 2.0]} />
        <meshStandardMaterial color="#f7f3e8" roughness={0.9} />
      </mesh>

      {/* Left Wall (-X) with openings for windows */}
      {/* Left Wall Lower Base (beneath windows) */}
      <mesh receiveShadow position={[-halfWidth, 0.65, 0]}>
        <boxGeometry args={[wallThickness, 1.3, length]} />
        <meshStandardMaterial color="#a7b89f" roughness={0.8} />
      </mesh>
      {/* Left Wall Upper Header (above windows) */}
      <mesh receiveShadow position={[-halfWidth, 4.4, 0]}>
        <boxGeometry args={[wallThickness, 1.2, length]} />
        <meshStandardMaterial color="#f7f3e8" roughness={0.9} />
      </mesh>
      {/* Left Wall Pillars between windows */}
      {[-6.5, -3.0, 0.0, 3.0, 6.5].map((zPos, idx) => (
        <mesh key={idx} receiveShadow position={[-halfWidth, 2.4, zPos]}>
          <boxGeometry args={[wallThickness, 2.8, 1.0]} />
          <meshStandardMaterial color="#f7f3e8" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};
