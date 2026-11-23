import React from 'react';

export const Bookshelf = ({ position = [-9.2, 0, 0], rotation = [0, Math.PI / 2, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Bookshelf Frame */}
      {/* Outer Shell */}
      <mesh castShadow receiveShadow position={[0, 1.4, 0]}>
        <boxGeometry args={[1.6, 2.8, 0.45]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Inner Cavity */}
      <mesh position={[0, 1.4, 0.04]}>
        <boxGeometry args={[1.44, 2.64, 0.4]} />
        <meshStandardMaterial color="#6f421d" roughness={0.8} />
      </mesh>

      {/* 4 Shelves */}
      {[0.4, 1.0, 1.6, 2.2].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0.05]} castShadow>
          <boxGeometry args={[1.44, 0.04, 0.38]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
        </mesh>
      ))}

      {/* Row of Books on Shelf 1 (y = 1.0) */}
      {[
        { x: -0.55, h: 0.38, w: 0.08, c: '#ef4444' },
        { x: -0.46, h: 0.35, w: 0.09, c: '#3b82f6' },
        { x: -0.36, h: 0.42, w: 0.07, c: '#10b981' },
        { x: -0.28, h: 0.36, w: 0.08, c: '#f59e0b' },
        { x: -0.19, h: 0.4, w: 0.07, c: '#8b5cf6' },
        { x: -0.11, h: 0.34, w: 0.09, c: '#06b6d4' },
        { x: 0.1, h: 0.38, w: 0.1, c: '#f43f5e' },
        { x: 0.22, h: 0.41, w: 0.08, c: '#14b8a6' },
        { x: 0.32, h: 0.36, w: 0.08, c: '#6366f1' },
        { x: 0.42, h: 0.39, w: 0.09, c: '#eab308' },
        { x: 0.53, h: 0.35, w: 0.08, c: '#64748b' },
      ].map((b, idx) => (
        <mesh key={idx} position={[b.x, 1.02 + b.h / 2, 0.06]} castShadow>
          <boxGeometry args={[b.w, b.h, 0.26]} />
          <meshStandardMaterial color={b.c} roughness={0.6} />
        </mesh>
      ))}

      {/* Row of Binders & Storage on Shelf 2 (y = 1.6) */}
      {[
        { x: -0.5, c: '#1e3a8a' },
        { x: -0.38, c: '#1e3a8a' },
        { x: -0.26, c: '#1e3a8a' },
        { x: 0.25, c: '#065f46' },
        { x: 0.38, c: '#065f46' },
        { x: 0.51, c: '#065f46' },
      ].map((binder, idx) => (
        <mesh key={idx} position={[binder.x, 1.84, 0.05]} castShadow>
          <boxGeometry args={[0.1, 0.44, 0.28]} />
          <meshStandardMaterial color={binder.c} roughness={0.5} />
        </mesh>
      ))}

      {/* Globe on Top of Bookshelf */}
      <group position={[0.3, 2.95, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.03, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.14, 0]} castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};
