import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useClassroomStore } from '../../../../store/classroomStore';

/**
 * Mobile Standing Dry-Erase Whiteboard on Wheels (Casters)
 * Realistic pedagogical fixture:
 * - Magnetic porcelain dry-erase whiteboard surface with aluminum frame
 * - Tubular steel rolling stand with triangular base supports and caster wheels
 * - Marker ledge tray holding 3 dry-erase markers (Black, Blue, Red) and felt eraser
 * - Authentic hand-written marker clinical notes & cardiology equations
 * - Interactive click-to-inspect camera focus
 */
export const StandingWhiteboard = ({
  position = [3.4, 0, -5.4],
  rotation = [0, -0.45, 0], // Angled ~26 degrees inward toward student desks
}) => {
  const [hovered, setHovered] = useState(false);
  const canvasRef = useRef(document.createElement('canvas'));
  const textureRef = useRef(null);
  const setInspectTarget = useClassroomStore((state) => state.setInspectTarget);

  // Generate hand-drawn whiteboard marker notes texture
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // 1. White porcelain dry-erase board background with subtle sheen
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(0.5, '#f8fafc');
    bgGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Handwritten Marker Title (Blue Dry-Erase Marker)
    ctx.fillStyle = '#1d4ed8';
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.fillText('CLINICAL CARDIOLOGY NOTES', 60, 75);

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(60, 90);
    ctx.lineTo(540, 90);
    ctx.stroke();

    // 3. Flow Pathway Note (Black Marker)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.fillText('1. Systemic vs. Pulmonary Flow:', 60, 140);

    ctx.font = '22px "Segoe UI", sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('• RA (Tricuspid) ➔ RV ➔ Pulm. Artery ➔ Lungs', 90, 180);
    ctx.fillStyle = '#991b1b';
    ctx.fillText('• LA (Mitral) ➔ LV ➔ Aortic Valve ➔ Body Organs', 90, 220);

    // 4. Heart Valve Auscultation (Red & Blue Markers)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.fillText('2. Cardiac Cycle Phonocardiogram:', 60, 280);

    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText('• "Lub" (S₁) = Atrioventricular Valves close (Tricuspid/Mitral)', 90, 320);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillText('• "Dub" (S₂) = Semilunar Valves close (Aortic/Pulmonary)', 90, 360);

    // 5. Hemodynamic Formula (Green & Black Box)
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 410, 520, 110);

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.fillText('Cardiac Output (Q) Formula:', 80, 448);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('Q = HR × SV', 80, 495);
    ctx.font = '20px monospace';
    ctx.fillText('≈ 72 bpm × 70 mL = 5.04 L/min', 270, 495);

    // 6. Conduction Hierarchy (Black Marker)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.fillText('3. Intrinsic Conduction System:', 60, 565);

    ctx.fillStyle = '#334155';
    ctx.font = '22px "Segoe UI", sans-serif';
    ctx.fillText('• SA Node (Pacemaker): 60 - 100 bpm', 90, 605);
    ctx.fillText('• AV Node (Delay Gate): 40 - 60 bpm', 90, 645);
    ctx.fillText('• Bundle of His ➔ Purkinje Fibers (Ventricular contraction)', 90, 685);

    // 7. Small Teacher Chalk/Marker sketch of ECG waveform
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(640, 230);
    ctx.lineTo(680, 230);
    ctx.arc(695, 230, 15, Math.PI, 0); // P
    ctx.lineTo(725, 230);
    ctx.lineTo(735, 240); // Q
    ctx.lineTo(745, 150); // R
    ctx.lineTo(755, 255); // S
    ctx.lineTo(765, 230);
    ctx.lineTo(780, 230);
    ctx.arc(800, 230, 20, Math.PI, 0); // T
    ctx.lineTo(840, 230);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('P', 690, 210);
    ctx.fillText('R', 740, 140);
    ctx.fillText('T', 795, 205);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureRef.current = texture;

    return () => {
      texture.dispose();
    };
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    setInspectTarget({
      name: 'Standing Mobile Whiteboard',
      target: [position[0], position[1] + 1.2, position[2]],
      distance: 2.4,
    });
  };

  const boardW = 1.7;
  const boardH = 1.15;

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onClick={handleClick}
    >
      {/* Physical Collider for the standing whiteboard */}
      <RigidBody type="fixed" friction={0.8} restitution={0.1}>
        <CuboidCollider args={[boardW / 2 + 0.05, 0.9, 0.35]} position={[0, 0.9, 0]} />
      </RigidBody>

      {/* 1. Mobile Rolling Stand (Tubular Steel with 4 Caster Wheels) */}
      <group>
        {/* Left Vertical Pole */}
        <mesh position={[-boardW / 2 - 0.04, 1.05, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 1.7, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Right Vertical Pole */}
        <mesh position={[boardW / 2 + 0.04, 1.05, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 1.7, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Lower Crossbar Brace */}
        <mesh position={[0, 0.38, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, boardW + 0.08, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Left Foot Leg (T-bar / Triangular Base with 2 Caster Wheels) */}
        <group position={[-boardW / 2 - 0.04, 0.06, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.024, 0.024, 0.65, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Front Caster Wheel */}
          <mesh position={[0, -0.04, 0.3]} castShadow>
            <sphereGeometry args={[0.028, 10, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Back Caster Wheel */}
          <mesh position={[0, -0.04, -0.3]} castShadow>
            <sphereGeometry args={[0.028, 10, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
        </group>

        {/* Right Foot Leg (T-bar / Triangular Base with 2 Caster Wheels) */}
        <group position={[boardW / 2 + 0.04, 0.06, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.024, 0.024, 0.65, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Front Caster Wheel */}
          <mesh position={[0, -0.04, 0.3]} castShadow>
            <sphereGeometry args={[0.028, 10, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Back Caster Wheel */}
          <mesh position={[0, -0.04, -0.3]} castShadow>
            <sphereGeometry args={[0.028, 10, 10]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* 2. Whiteboard Body (Pivot Angle Knobs at 1.15m height) */}
      <group position={[0, 1.25, 0]}>
        {/* Pivot Knobs */}
        <mesh position={[-boardW / 2 - 0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[boardW / 2 + 0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>

        {/* Aluminum Outer Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[boardW + 0.06, boardH + 0.06, 0.035]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Front Dry-Erase Whiteboard Porcelain Surface */}
        <mesh position={[0, 0, 0.019]} receiveShadow>
          <planeGeometry args={[boardW, boardH]} />
          {textureRef.current ? (
            <meshStandardMaterial map={textureRef.current} roughness={0.3} metalness={0.05} />
          ) : (
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          )}
        </mesh>

        {/* Backside Surface */}
        <mesh position={[0, 0, -0.019]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[boardW, boardH]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>

        {/* 3. Marker Ledge Tray beneath board */}
        <group position={[0, -boardH / 2 - 0.03, 0.05]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[boardW * 0.7, 0.015, 0.08]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Black Dry-Erase Marker */}
          <mesh position={[-0.22, 0.014, 0]} rotation={[0, 0.1, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.009, 0.009, 0.12, 8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>

          {/* Blue Dry-Erase Marker */}
          <mesh position={[-0.08, 0.014, 0.01]} rotation={[0, -0.15, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.009, 0.009, 0.12, 8]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>

          {/* Red Dry-Erase Marker */}
          <mesh position={[0.06, 0.014, -0.005]} rotation={[0, 0.05, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.009, 0.009, 0.12, 8]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} />
          </mesh>

          {/* Magnetic Felt Whiteboard Eraser */}
          <group position={[0.26, 0.02, 0]}>
            {/* Blue plastic back */}
            <mesh position={[0, 0.01, 0]} castShadow>
              <boxGeometry args={[0.055, 0.018, 0.11]} />
              <meshStandardMaterial color="#0284c7" roughness={0.5} />
            </mesh>
            {/* Black felt bottom pad */}
            <mesh position={[0, -0.005, 0]}>
              <boxGeometry args={[0.055, 0.012, 0.11]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Hover Tooltip */}
      {hovered && (
        <Html position={[0, 2.1, 0]} center distanceFactor={14}>
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              color: '#38bdf8',
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              pointerEvents: 'none',
            }}
          >
            Mobile Standing Whiteboard · Click to Inspect Notes
          </div>
        </Html>
      )}
    </group>
  );
};
export default StandingWhiteboard;
