import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useClassroomStore } from '../../../../store/classroomStore';

/**
 * LowResourceDeskProps
 * Renders frugal EdTech tools on student desks:
 * 1. Printed Plickers QR Code Cards (held or placed on desk)
 * 2. Shared BYOD Smartphone (on paired desks for group polling)
 */
export const LowResourceDeskProps = ({ seatId, isMySeat }) => {
  const plickersCanvasRef = useRef(document.createElement('canvas'));
  const plickersTextureRef = useRef(null);
  const openPlickersModal = useClassroomStore((state) => state.openPlickersModal);
  const plickersCardOrientation = useClassroomStore((state) => state.plickersCardOrientation) || 'A';

  // Has shared smartphone if seat column is even or it is the player's seat
  const seatCol = parseInt(seatId.split('-')[1]?.replace('S', '') || '1', 10);
  const hasSharedPhone = seatCol % 2 === 0 || isMySeat;

  // Generate real Plickers card matrix texture
  useEffect(() => {
    const canvas = plickersCanvasRef.current;
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Stiff white card background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    // Card border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 244, 244);

    // 4 Corner Labels: Top=A, Right=B, Bottom=C, Left=D
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 22px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText('A', 128, 22);   // Top
    ctx.fillText('B', 236, 128);  // Right
    ctx.fillText('C', 128, 236);  // Bottom
    ctx.fillText('D', 20, 128);   // Left

    // Unique Algorithmic QR Glyph / High-contrast Matrix
    ctx.fillStyle = '#000000';
    // Center square
    ctx.fillRect(56, 56, 144, 144);
    // Inner white cuts creating recognizable asymmetric Plickers marker
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(80, 80, 48, 48);
    ctx.fillRect(140, 140, 36, 36);
    ctx.fillStyle = '#000000';
    ctx.fillRect(92, 92, 24, 24);

    // Student ID badge on card
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`#${seatId}`, 128, 128);

    if (plickersTextureRef.current) {
      plickersTextureRef.current.needsUpdate = true;
    }
  }, [seatId]);

  // Determine card rotation based on selected orientation
  let cardRotationY = 0;
  if (isMySeat) {
    if (plickersCardOrientation === 'B') cardRotationY = -Math.PI / 2;
    else if (plickersCardOrientation === 'C') cardRotationY = Math.PI;
    else if (plickersCardOrientation === 'D') cardRotationY = Math.PI / 2;
  }

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        openPlickersModal(seatId);
      }}
    >
      {/* 1. Printed Plickers Assessment Card (Stiff Cardboard) */}
      <group
        position={[0.15, 0.776, 0.04]}
        rotation={[-Math.PI / 2, 0, cardRotationY + (isMySeat ? 0 : 0.05)]}
      >
        <mesh receiveShadow castShadow>
          <planeGeometry args={[0.18, 0.18]} />
          <meshStandardMaterial roughness={0.9} metalness={0.05}>
            <canvasTexture ref={plickersTextureRef} attach="map" image={plickersCanvasRef.current} />
          </meshStandardMaterial>
        </mesh>
        {/* Card paper thickness backing */}
        <mesh position={[0, 0, -0.002]}>
          <boxGeometry args={[0.18, 0.18, 0.002]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
        </mesh>
      </group>

      {/* 2. Shared BYOD Mobile Smartphone (on paired desks) */}
      {hasSharedPhone && (
        <group position={[-0.14, 0.775, 0.04]} rotation={[0, 0.12, 0]}>
          {/* Phone body (Budget black smartphone) */}
          <mesh castShadow receiveShadow position={[0, 0.005, 0]}>
            <boxGeometry args={[0.11, 0.009, 0.2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Glass screen */}
          <mesh position={[0, 0.01, 0]}>
            <planeGeometry args={[0.096, 0.18]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          {/* Team poll UI bar on phone screen */}
          <mesh position={[0, 0.0102, -0.05]}>
            <planeGeometry args={[0.08, 0.02]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      )}

      {/* Small desk paper notebook underneath */}
      <mesh position={[-0.14, 0.772, 0.02]} rotation={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.22, 0.012, 0.28]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.6} />
      </mesh>
    </group>
  );
};
