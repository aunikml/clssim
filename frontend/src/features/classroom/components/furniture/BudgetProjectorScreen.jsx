import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useClassroomStore } from '../../../../store/classroomStore';

/**
 * Budget Projector & Pull-Down Canvas Screen for Low-Resource EdTech Classrooms
 * Features:
 * - Ceiling-mounted budget projector with mount pole and lens
 * - Semi-transparent volumetric projection beam
 * - Pull-down projector screen unrolled directly over the chalkboard
 * - High-contrast projected slide for Plickers / Mentimeter active response
 * - Teacher desk laptop with VGA/HDMI video cable
 */
export const BudgetProjectorScreen = ({
  screenPosition = [0, 2.35, -7.78],
  screenWidth = 5.6,
  screenHeight = 2.4,
  projectorPosition = [0, 4.3, -2.0],
}) => {
  const canvasRef = useRef(document.createElement('canvas'));
  const textureRef = useRef(null);
  const beamRef = useRef(null);

  const plickersCardOrientation = useClassroomStore((state) => state.plickersCardOrientation) || 'A';
  const classSize = useClassroomStore((state) => state.classSize) || 20;

  // Render high-contrast projected slide on 2D canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const renderSlide = () => {
      // 1. Projection Background (warm cream / budget slide aesthetic)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1024, 512);

      // Slide inner border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, 992, 480);

      // 2. Banner Header
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(20, 20, 984, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Inter, system-ui, sans-serif';
      ctx.fillText('📱 LOW-RESOURCE ACTIVE CLASSROOM: PLICKERS & ONE-SCREEN TECH', 40, 58);

      // 3. Question & Scenario
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 26px Inter, system-ui, sans-serif';
      ctx.fillText('Formative Check: Which valve prevents blood backflow into the Right Ventricle?', 40, 130);

      // 4. Multiple Choice Options (A, B, C, D)
      const options = [
        { key: 'A', text: 'Tricuspid Valve', count: 4 },
        { key: 'B', text: 'Pulmonary Semilunar Valve (Correct)', count: 14, isCorrect: true },
        { key: 'C', text: 'Mitral / Bicuspid Valve', count: 1 },
        { key: 'D', text: 'Aortic Semilunar Valve', count: 1 },
      ];

      options.forEach((opt, idx) => {
        const y = 175 + idx * 56;
        const isSelected = plickersCardOrientation === opt.key;

        // Option Background Card
        ctx.fillStyle = isSelected
          ? 'rgba(56, 189, 248, 0.25)'
          : idx % 2 === 0
          ? 'rgba(30, 41, 59, 0.8)'
          : 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(40, y, 944, 46);

        // Key Box
        ctx.fillStyle = isSelected ? '#38bdf8' : '#64748b';
        ctx.fillRect(48, y + 6, 34, 34);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillText(opt.key, 58, y + 30);

        // Option Text
        ctx.fillStyle = isSelected ? '#38bdf8' : '#e2e8f0';
        ctx.font = isSelected ? 'bold 20px Inter, sans-serif' : '19px Inter, sans-serif';
        ctx.fillText(opt.text, 96, y + 30);

        // Live Tally Bar
        const barWidth = (opt.count / classSize) * 220;
        ctx.fillStyle = opt.isCorrect ? '#10b981' : 'rgba(148, 163, 184, 0.4)';
        ctx.fillRect(720, y + 12, barWidth, 22);

        // Count Text
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText(`${opt.count} cards (${Math.round((opt.count / classSize) * 100)}%)`, 730 + barWidth + 10, y + 29);
      });

      // 5. Bottom Live Telemetry Footer
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, 420, 984, 72);

      // Plickers scan badge
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('✓ Teacher Smartphone Camera: 20/20 Plickers Cards Scanned in 3.2s', 40, 452);

      // Pedagogical Efficiency Note
      ctx.fillStyle = '#94a3b8';
      ctx.font = '15px Inter, sans-serif';
      ctx.fillText('Equipment: 1 Budget Projector + 20 Printed Paper Cards • Zero Student Wi-Fi / Tablets Needed', 40, 478);

      if (textureRef.current) {
        textureRef.current.needsUpdate = true;
      }
    };

    renderSlide();
  }, [plickersCardOrientation, classSize]);

  // Subtle projector lens pulse animation
  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 6) * 0.015;
    }
  });

  return (
    <group>
      {/* ========================================================
          1. PULL-DOWN PROJECTION SCREEN (Front Wall)
          ======================================================== */}
      {/* Metal Roller Canister mounted directly above chalkboard */}
      <mesh position={[screenPosition[0], screenPosition[1] + screenHeight / 2 + 0.1, screenPosition[2] + 0.02]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, screenWidth + 0.3, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Mounting brackets on left and right */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[
            screenPosition[0] + (side * (screenWidth + 0.28)) / 2,
            screenPosition[1] + screenHeight / 2 + 0.1,
            screenPosition[2],
          ]}
        >
          <boxGeometry args={[0.06, 0.16, 0.16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
      ))}

      {/* The White Vinyl Projection Canvas Screen */}
      <mesh position={screenPosition} castShadow receiveShadow>
        <planeGeometry args={[screenWidth, screenHeight]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} metalness={0.05}>
          <canvasTexture ref={textureRef} attach="map" image={canvasRef.current} />
        </meshStandardMaterial>
      </mesh>

      {/* Bottom weighted pull bar with center pull handle */}
      <mesh position={[screenPosition[0], screenPosition[1] - screenHeight / 2 - 0.03, screenPosition[2] + 0.01]}>
        <cylinderGeometry args={[0.025, 0.025, screenWidth + 0.08, 12]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#475569" metalness={0.6} />
      </mesh>
      <mesh position={[screenPosition[0], screenPosition[1] - screenHeight / 2 - 0.08, screenPosition[2] + 0.01]}>
        <ringGeometry args={[0.02, 0.03, 12]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>

      {/* ========================================================
          2. CEILING-MOUNTED BUDGET PROJECTOR UNIT
          ======================================================== */}
      <group position={projectorPosition}>
        {/* Steel Ceiling Drop Pole */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        {/* Ceiling mounting flange plate */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>

        {/* Projector Body (White/Grey matte plastic) */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.18, 0.42]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Optical Glass Lens (Facing forward towards blackboard, negative Z) */}
        <mesh position={[0.12, -0.02, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Illuminated Lens Element */}
        <mesh position={[0.12, -0.02, -0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.055, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Projector Status LED (Power & Temp lights) */}
        <mesh position={[-0.18, 0.091, 0.1]}>
          <circleGeometry args={[0.012, 8]} rotation={[-Math.PI / 2, 0, 0]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        <mesh position={[-0.14, 0.091, 0.1]}>
          <circleGeometry args={[0.012, 8]} rotation={[-Math.PI / 2, 0, 0]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* ========================================================
            3. VOLUMETRIC PROJECTION LIGHT BEAM
            ======================================================== */}
        <mesh
          ref={beamRef}
          position={[0, -1.0, -2.8]}
          rotation={[0.36, 0, 0]}
        >
          <coneGeometry args={[2.8, 5.8, 16, 1, true]} />
          <meshBasicMaterial
            color="#e0f2fe"
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ========================================================
          4. TEACHER LAPTOP & VGA/HDMI CABLE ON TEACHER DESK
          ======================================================== */}
      <group position={[-3.3, 0.772, -4.75]} rotation={[0, 0.25, 0]}>
        {/* Laptop Base */}
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.38, 0.016, 0.28]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.6} />
        </mesh>
        {/* Keyboard Area */}
        <mesh position={[0, 0.019, 0.03]}>
          <boxGeometry args={[0.32, 0.002, 0.14]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        {/* Touchpad */}
        <mesh position={[0, 0.019, 0.11]}>
          <boxGeometry args={[0.1, 0.002, 0.06]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        {/* Laptop Screen (tilted open 110 degrees) */}
        <group position={[0, 0.018, -0.14]} rotation={[-0.32, 0, 0]}>
          <mesh position={[0, 0.13, 0]} castShadow>
            <boxGeometry args={[0.38, 0.26, 0.012]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          {/* Glowing Laptop Screen mirroring projector */}
          <mesh position={[0, 0.13, 0.007]}>
            <planeGeometry args={[0.35, 0.23]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Black Video Cable (VGA/HDMI) running off the side of the desk */}
        <mesh position={[0.22, 0.005, -0.05]} rotation={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.18, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
        <mesh position={[0.28, -0.25, 0.02]}>
          <cylinderGeometry args={[0.008, 0.008, 0.52, 8]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};
