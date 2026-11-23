import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

function createParquetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base warm wood tone
  ctx.fillStyle = '#b6834d';
  ctx.fillRect(0, 0, 1024, 1024);

  const plankW = 128;
  const plankH = 48;
  const rows = Math.ceil(1024 / plankH);
  const cols = Math.ceil(1024 / plankW) + 1;

  const woodTones = [
    '#c49258',
    '#b8824a',
    '#caa068',
    '#af773f',
    '#d2a772',
    '#a8723b',
  ];

  for (let r = 0; r < rows; r++) {
    const offsetX = (r % 2) * (plankW / 2);
    for (let c = -1; c < cols; c++) {
      const x = c * plankW + offsetX;
      const y = r * plankH;

      // Select randomized natural wood variation
      const tone = woodTones[Math.abs(Math.sin(r * 37 + c * 83)) % woodTones.length | 0];
      ctx.fillStyle = tone;
      ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

      // Fine wood grain fibers
      ctx.fillStyle = 'rgba(70, 40, 15, 0.08)';
      for (let g = 0; g < 6; g++) {
        const grainY = y + 4 + g * 7 + Math.random() * 3;
        ctx.fillRect(x + 2, grainY, plankW - 4, 1.5);
      }

      // Plank bevel seam borders
      ctx.strokeStyle = '#5a3818';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, plankW, plankH);

      // Subtle top highlight for varnish shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(x + 2, y + 2, plankW - 4, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 6);
  texture.anisotropy = 16;
  return texture;
}

export const ClassroomFloor = ({ width = 20, length = 16 }) => {
  const parquetTexture = useMemo(() => createParquetTexture(), []);

  return (
    <group position={[0, 0, 0]}>
      {/* Main floor slab with high-res PBR parquet wood & physics collider */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.8} restitution={0.2}>
        <mesh receiveShadow position={[0, -0.05, 0]}>
          <boxGeometry args={[width, 0.1, length]} />
          <meshStandardMaterial
            map={parquetTexture}
            roughness={0.42}
            metalness={0.08}
            envMapIntensity={0.6}
          />
        </mesh>
      </RigidBody>

      {/* Static perimeter room wall colliders for realistic ballistics/bounces */}
      <RigidBody type="fixed">
        {/* Front wall (blackboard side) */}
        <CuboidCollider args={[width / 2, 2.5, 0.1]} position={[0, 2.5, -length / 2]} />
        {/* Back wall */}
        <CuboidCollider args={[width / 2, 2.5, 0.1]} position={[0, 2.5, length / 2]} />
        {/* Left window wall */}
        <CuboidCollider args={[0.1, 2.5, length / 2]} position={[-width / 2, 2.5, 0]} />
        {/* Right door wall */}
        <CuboidCollider args={[0.1, 2.5, length / 2]} position={[width / 2, 2.5, 0]} />
      </RigidBody>

      {/* Decorative perimeter walnut baseboards / skirting */}
      <mesh position={[0, 0.1, -length / 2 + 0.04]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.2, 0.08]} />
        <meshStandardMaterial color="#5c381c" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, length / 2 - 0.04]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.2, 0.08]} />
        <meshStandardMaterial color="#5c381c" roughness={0.5} />
      </mesh>
      <mesh position={[-width / 2 + 0.04, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.2, length]} />
        <meshStandardMaterial color="#5c381c" roughness={0.5} />
      </mesh>
      <mesh position={[width / 2 - 0.04, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.2, length]} />
        <meshStandardMaterial color="#5c381c" roughness={0.5} />
      </mesh>
    </group>
  );
};
