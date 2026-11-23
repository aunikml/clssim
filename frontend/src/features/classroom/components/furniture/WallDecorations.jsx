import React, { useMemo } from 'react';
import * as THREE from 'three';

function createPosterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PERIODIC TABLE OF ELEMENTS', canvas.width / 2, 80);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 110, canvas.width - 80, canvas.height - 150);

  const colors = ['#93c5fd', '#86efac', '#fde047', '#fca5a5', '#c4b5fd', '#fed7aa'];
  const elementWidth = 84;
  const elementHeight = 60;
  let colorIdx = 0;

  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 9; c++) {
      const x = 70 + c * (elementWidth + 14);
      const y = 140 + r * (elementHeight + 14);
      ctx.fillStyle = colors[(r + c) % colors.length];
      ctx.fillRect(x, y, elementWidth, elementHeight);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`${r * 9 + c + 1}`, x + elementWidth / 2, y + 36);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const WallDecorations = () => {
  const posterTexture = useMemo(() => createPosterTexture(), []);

  return (
    <group>
      {/* 1. Classroom Analog Clock above blackboard */}
      <group position={[0, 4.15, -7.88]}>
        {/* Clock Frame */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.05, 32]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        {/* White Clock Face */}
        <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.33, 0.33, 0.01, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
        {/* Hour Hand */}
        <mesh position={[-0.04, 0.04, 0.04]} rotation={[0, 0, -0.8]}>
          <boxGeometry args={[0.02, 0.14, 0.01]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Minute Hand */}
        <mesh position={[0.05, 0.08, 0.04]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.015, 0.22, 0.01]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Red Second Center Pin */}
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* 2. Cork Noticeboard on Front Wall Right of Blackboard */}
      <group position={[5.8, 2.5, -7.88]}>
        {/* Wooden Frame */}
        <mesh>
          <boxGeometry args={[2.2, 1.8, 0.04]} />
          <meshStandardMaterial color="#8c6239" roughness={0.7} />
        </mesh>
        {/* Cork Surface */}
        <mesh position={[0, 0, 0.015]}>
          <boxGeometry args={[2.05, 1.65, 0.02]} />
          <meshStandardMaterial color="#d97706" roughness={0.9} />
        </mesh>
        {/* Pinned Note 1 (Yellow) */}
        <mesh position={[-0.5, 0.35, 0.03]} rotation={[0, 0, 0.05]}>
          <boxGeometry args={[0.42, 0.32, 0.005]} />
          <meshStandardMaterial color="#fef08a" roughness={0.8} />
        </mesh>
        {/* Pinned Note 2 (Cyan) */}
        <mesh position={[0.4, 0.4, 0.03]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[0.38, 0.42, 0.005]} />
          <meshStandardMaterial color="#bae6fd" roughness={0.8} />
        </mesh>
        {/* Pinned Note 3 (Pink) */}
        <mesh position={[-0.4, -0.32, 0.03]} rotation={[0, 0, -0.04]}>
          <boxGeometry args={[0.48, 0.35, 0.005]} />
          <meshStandardMaterial color="#fbcfe8" roughness={0.8} />
        </mesh>
        {/* Pinned Notice (White Memo) */}
        <mesh position={[0.42, -0.25, 0.03]} rotation={[0, 0, 0.03]}>
          <boxGeometry args={[0.55, 0.52, 0.005]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
      </group>

      {/* 3. Educational Periodic Table / Science Chart on Back Wall */}
      <group position={[-3.5, 2.6, 7.88]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[2.8, 1.8]} />
          <meshStandardMaterial map={posterTexture} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};
