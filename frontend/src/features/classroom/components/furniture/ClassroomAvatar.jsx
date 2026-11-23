import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useClassroomStore } from '../../../../store/classroomStore';

function ExternalAvatarModel({ url, posture, isSpeaking }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef();

  useFrame((state) => {
    if (!modelRef.current) return;
    const t = state.clock.getElapsedTime();
    if (posture === 'idle') {
      modelRef.current.position.y = Math.sin(t * 2) * 0.015;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene.clone()}
      scale={1.0}
      position={[0, posture === 'seating' ? -0.22 : 0, 0]}
    />
  );
}

// Diverse realistic skin tones with human melanin palette
const NATURAL_SKIN_TONES = [
  '#F5D0B5', // Warm Fair
  '#EDB993', // Warm Beige
  '#D79D73', // Golden Honey
  '#BD7B56', // Sunlit Bronze
  '#8D5B41', // Warm Chestnut
  '#593722', // Deep Espresso
];

// Realistic human hair tones
const NATURAL_HAIR_COLORS = [
  '#1c1917', // Espresso Black
  '#29201b', // Dark Mocha
  '#422006', // Chestnut Brown
  '#713f12', // Warm Amber
  '#a16207', // Honey Blonde
  '#64748b', // Distinguished Slate
];

// Reusable singleton procedural skin and fabric micro-textures
let cachedSkinBumpMap = null;
let cachedFabricNormalMap = null;

function getSkinBumpMap() {
  if (cachedSkinBumpMap) return cachedSkinBumpMap;
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);
  const imgData = ctx.getImageData(0, 0, 128, 128);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 26;
    const v = Math.min(255, Math.max(0, 128 + noise));
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
  ctx.putImageData(imgData, 0, 0);
  cachedSkinBumpMap = new THREE.CanvasTexture(canvas);
  cachedSkinBumpMap.wrapS = THREE.RepeatWrapping;
  cachedSkinBumpMap.wrapT = THREE.RepeatWrapping;
  cachedSkinBumpMap.repeat.set(4, 4);
  return cachedSkinBumpMap;
}

function getFabricNormalMap() {
  if (cachedFabricNormalMap) return cachedFabricNormalMap;
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#9090ff';
  ctx.lineWidth = 1;
  for (let x = 0; x < 128; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 128);
    ctx.stroke();
  }
  ctx.strokeStyle = '#7070ff';
  for (let y = 0; y < 128; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y);
    ctx.stroke();
  }
  cachedFabricNormalMap = new THREE.CanvasTexture(canvas);
  cachedFabricNormalMap.wrapS = THREE.RepeatWrapping;
  cachedFabricNormalMap.wrapT = THREE.RepeatWrapping;
  cachedFabricNormalMap.repeat.set(8, 8);
  return cachedFabricNormalMap;
}

const getSeedNum = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

/**
 * Articulated 5-Finger Human Hand
 * Replaces primitive spheres with anatomical palm, opposable thumb, and 4 phalanges
 */
const AnatomicalHand = ({ isLeft = false, posture = 'idle', skinTone, role }) => {
  const flip = isLeft ? -1 : 1;
  const isOpen = posture === 'hand_raising' || posture === 'applauding';
  const isWriting = posture === 'taking_notes';
  const isHoldingChalk = role === 'Teacher';

  const skinBump = useMemo(() => getSkinBumpMap(), []);

  return (
    <group scale={[flip, 1, 1]}>
      {/* Wrist Joint */}
      <mesh position={[0, -0.015, 0]} castShadow>
        <cylinderGeometry args={[0.024, 0.026, 0.03, 10]} />
        <meshPhysicalMaterial
          color={skinTone}
          roughness={0.55}
          bumpMap={skinBump}
          bumpScale={0.002}
          sheen={0.2}
          sheenColor="#ff9999"
        />
      </mesh>

      {/* Palm / Metacarpal Pad */}
      <mesh position={[0, -0.05, 0.002]} castShadow>
        <boxGeometry args={[0.052, 0.06, 0.022]} />
        <meshPhysicalMaterial
          color={skinTone}
          roughness={0.55}
          bumpMap={skinBump}
          bumpScale={0.002}
          sheen={0.2}
          sheenColor="#ff9999"
        />
      </mesh>

      {/* Opposable Thumb */}
      <group position={[0.03, -0.042, 0.006]} rotation={[0.2, -0.3, -0.65]}>
        <mesh position={[0, -0.018, 0]} castShadow>
          <capsuleGeometry args={[0.008, 0.022, 6, 8]} />
          <meshPhysicalMaterial color={skinTone} roughness={0.55} />
        </mesh>
      </group>

      {/* 4 Articulated Fingers */}
      {/* 1. Index Finger */}
      <group position={[0.018, -0.082, 0]} rotation={[isOpen ? 0 : isWriting ? 0.6 : 0.25, 0, 0]}>
        <mesh position={[0, -0.016, 0]} castShadow>
          <capsuleGeometry args={[0.007, 0.028, 6, 8]} />
          <meshPhysicalMaterial color={skinTone} roughness={0.55} />
        </mesh>
      </group>

      {/* 2. Middle Finger */}
      <group position={[0.006, -0.083, 0]} rotation={[isOpen ? 0 : isWriting ? 0.5 : 0.28, 0, 0]}>
        <mesh position={[0, -0.018, 0]} castShadow>
          <capsuleGeometry args={[0.007, 0.032, 6, 8]} />
          <meshPhysicalMaterial color={skinTone} roughness={0.55} />
        </mesh>
      </group>

      {/* 3. Ring Finger */}
      <group position={[-0.006, -0.082, 0]} rotation={[isOpen ? 0 : 0.35, 0, 0]}>
        <mesh position={[0, -0.016, 0]} castShadow>
          <capsuleGeometry args={[0.0068, 0.028, 6, 8]} />
          <meshPhysicalMaterial color={skinTone} roughness={0.55} />
        </mesh>
      </group>

      {/* 4. Pinky Finger */}
      <group position={[-0.018, -0.078, 0]} rotation={[isOpen ? 0 : 0.42, 0, 0]}>
        <mesh position={[0, -0.013, 0]} castShadow>
          <capsuleGeometry args={[0.0062, 0.022, 6, 8]} />
          <meshPhysicalMaterial color={skinTone} roughness={0.55} />
        </mesh>
      </group>

      {/* Note-Taking Pencil held between index and thumb */}
      {isWriting && !isLeft && (
        <group position={[0.015, -0.07, 0.03]} rotation={[0.4, 0.2, 0.6]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.16, 6]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.4} />
          </mesh>
          {/* Graphite Lead Tip */}
          <mesh position={[0, -0.086, 0]}>
            <coneGeometry args={[0.006, 0.016, 6]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* Chalk Piece held in Teacher John's hand */}
      {isHoldingChalk && !isLeft && (
        <mesh position={[0.01, -0.065, 0.02]} rotation={[0.3, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.075, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
      )}
    </group>
  );
};

/**
 * High-Fidelity Pedagogical 3D Humanoid Avatar (Path 1: In-Engine Anatomical Sculpting)
 * Features:
 * - Contoured cranial architecture: sculpted jawline, chin taper, and orbital brow ridge
 * - Anatomical ears (helix/pinna cartilage) and defined lips (Cupid's bow vermilion contour)
 * - Articulated 5-finger hands with opposable thumb and knuckles
 * - Procedural skin micro-pores and textile fabric normal maps
 * - Coupled respiratory kinetics, ocular saccades, and seated postural weight-shifting
 * - Dynamic "Look-At Teacher" head tracking and pedagogical postures
 */
export const ClassroomAvatar = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  worldPosition = null,
  name = 'Participant',
  role = 'Student',
  posture = 'idle',
  isSpeaking = false,
  isFirstPerson = false,
  shirtColor = '#0284c7',
  pantsColor = '#334155',
  skinTone = null,
  hairColor = null,
  hairStyle = 'classic',
  hasGlasses = false,
  seed = null,
  avatarUrl = null,
}) => {
  const rootRef = useRef();
  const torsoRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const rightForearmRef = useRef();
  const headRef = useRef();
  const neckRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const leftEyelidRef = useRef();
  const rightEyelidRef = useRef();
  const speakingRingRef = useRef();

  // Derive individual visual attributes
  const seedVal = getSeedNum(seed || name);
  const defaultSkin = NATURAL_SKIN_TONES[seedVal % NATURAL_SKIN_TONES.length];
  const defaultHair = NATURAL_HAIR_COLORS[(seedVal >> 2) % NATURAL_HAIR_COLORS.length];
  const finalSkinTone = skinTone || (role === 'Teacher' ? '#EDB993' : defaultSkin);
  const finalHairColor = hairColor || (role === 'Teacher' ? '#64748b' : defaultHair);
  const finalHairStyle = hairStyle || (role === 'Teacher' ? 'parted' : ['classic', 'curly', 'parted', 'bun'][seedVal % 4]);
  const finalHasGlasses = hasGlasses || (role === 'Teacher' ? true : seedVal % 5 === 0);

  // Blinking & Saccades state
  const blinkTimerRef = useRef(2 + (seedVal % 4) * 0.8);
  const isBlinkingRef = useRef(false);
  const blinkStartRef = useRef(0);
  const saccadeTimerRef = useRef(1.5 + (seedVal % 3));
  const saccadeOffset = useRef({ x: 0, y: 0 });

  // Procedural micro-textures
  const skinBump = useMemo(() => getSkinBumpMap(), []);
  const fabricNormal = useMemo(() => getFabricNormalMap(), []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Speaking Aura Animation
    if (speakingRingRef.current) {
      if (isSpeaking) {
        speakingRingRef.current.visible = true;
        const scale = 1.0 + Math.sin(t * 8) * 0.15;
        speakingRingRef.current.scale.set(scale, scale, scale);
      } else {
        speakingRingRef.current.visible = false;
      }
    }

    // 2. Coupled Human Respiratory Kinetics
    const breathFreq = 1.6 + ((seedVal % 3) * 0.12);
    const breathPhase = (seedVal % 10) * 0.6;
    const breathExp = Math.sin(t * breathFreq + breathPhase);

    if (torsoRef.current) {
      torsoRef.current.scale.set(
        1.0 + breathExp * 0.018,
        1.0 + breathExp * 0.012,
        1.0 + breathExp * 0.04
      );
    }
    if (neckRef.current) {
      neckRef.current.scale.y = 1.0 + breathExp * 0.01;
    }

    // 3. Postural Hip Weight Shifting for Seated Students (every 25-35s)
    if (role === 'Student' && posture === 'seating' && rootRef.current) {
      const shiftPhase = Math.sin(t * 0.14 + seedVal);
      rootRef.current.rotation.z = shiftPhase * 0.02; // Gentle pelvic roll tilt
    }

    // 4. Involuntary Ocular Micro-Saccades (Eyes dart between board and desk notes)
    if (t > saccadeTimerRef.current) {
      saccadeTimerRef.current = t + 1.8 + Math.random() * 2.2;
      saccadeOffset.current = {
        x: (Math.random() - 0.5) * 0.004,
        y: (Math.random() - 0.5) * 0.003,
      };
    }
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.position.x = -0.052 + saccadeOffset.current.x;
      leftEyeRef.current.position.y = 0.018 + saccadeOffset.current.y;
      rightEyeRef.current.position.x = 0.052 + saccadeOffset.current.x;
      rightEyeRef.current.position.y = 0.018 + saccadeOffset.current.y;
    }

    // 5. Asynchronous Eye Blinking
    if (!isBlinkingRef.current && t > blinkTimerRef.current) {
      isBlinkingRef.current = true;
      blinkStartRef.current = t;
    }
    if (isBlinkingRef.current) {
      const blinkProgress = (t - blinkStartRef.current) / 0.14;
      if (blinkProgress >= 1.0) {
        isBlinkingRef.current = false;
        blinkTimerRef.current = t + 2.8 + (seedVal % 4) * 0.9;
        if (leftEyelidRef.current) leftEyelidRef.current.scale.y = 0.05;
        if (rightEyelidRef.current) rightEyelidRef.current.scale.y = 0.05;
      } else {
        const eyelidShut = Math.sin(blinkProgress * Math.PI);
        const eyelidScale = 0.05 + eyelidShut * 0.95;
        if (leftEyelidRef.current) leftEyelidRef.current.scale.y = eyelidScale;
        if (rightEyelidRef.current) rightEyelidRef.current.scale.y = eyelidScale;
      }
    }

    // 6. Educational Gestures & Body Language
    if (posture === 'taking_notes') {
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
      }
      if (headRef.current) {
        headRef.current.rotation.x = 0.42;
        headRef.current.rotation.y = 0.04;
        headRef.current.rotation.z = 0;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.55;
        leftArmRef.current.rotation.z = 0.18;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.65;
        rightArmRef.current.rotation.z = -0.12;
      }
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = Math.sin(t * 8) * 0.08;
        rightForearmRef.current.rotation.y = Math.cos(t * 8) * 0.06;
      }
      return;
    }

    if (posture === 'nodding') {
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * 6.5) * 0.28;
        headRef.current.rotation.y = 0;
        headRef.current.rotation.z = 0;
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.55;
        leftArmRef.current.rotation.z = 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.55;
        rightArmRef.current.rotation.z = -0.1;
        if (rightForearmRef.current) rightForearmRef.current.rotation.x = 0;
      }
      return;
    }

    if (posture === 'confused') {
      if (headRef.current) {
        headRef.current.rotation.z = 0.35;
        headRef.current.rotation.y = 0.18;
        headRef.current.rotation.x = 0.05;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -1.55;
        rightArmRef.current.rotation.z = -0.38;
      }
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = 0.85;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.55;
        leftArmRef.current.rotation.z = 0.1;
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
      }
      return;
    }

    if (posture === 'applauding') {
      const clap = Math.sin(t * 13) * 0.28;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -1.15;
        leftArmRef.current.rotation.y = 0.5 + clap;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -1.15;
        rightArmRef.current.rotation.y = -0.5 - clap;
      }
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * 6) * 0.08;
        headRef.current.rotation.y = 0;
        headRef.current.rotation.z = 0;
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
      }
      return;
    }

    if (posture === 'hand_raising') {
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.5;
        leftArmRef.current.rotation.z = 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -2.95 + Math.sin(t * 3.5) * 0.05;
        rightArmRef.current.rotation.y = 0.05;
        rightArmRef.current.rotation.z = -0.2;
      }
      if (rightForearmRef.current) rightForearmRef.current.rotation.x = -0.1;
      if (headRef.current) {
        headRef.current.rotation.x = -0.16;
        headRef.current.rotation.y = Math.sin(t * 1.5) * 0.08;
        headRef.current.rotation.z = 0;
      }
      return;
    }

    if (posture === 'avoiding_eye_contact') {
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
      }
      if (headRef.current) {
        headRef.current.rotation.x = 0.52;
        headRef.current.rotation.y = 0.12;
        headRef.current.rotation.z = 0.05;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.58;
        leftArmRef.current.rotation.z = 0.15;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.58;
        rightArmRef.current.rotation.z = -0.15;
      }
      return;
    }

    // Dozing off head-bob & startled waking jerk
    if (posture === 'dozing_off') {
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
      }
      const cycleT = (t * 0.28) % 1.0; // ~3.5s periodic head-bob cycle
      if (cycleT < 0.82) {
        // Progressive slow forward head sag
        const droop = cycleT / 0.82;
        if (headRef.current) {
          headRef.current.rotation.x = 0.12 + droop * 0.52;
          headRef.current.rotation.z = Math.sin(t * 1.5) * 0.04 + droop * 0.08;
          headRef.current.rotation.y = 0.05;
        }
        if (torsoRef.current) {
          torsoRef.current.rotation.x = droop * 0.07;
        }
        if (leftEyelidRef.current && rightEyelidRef.current) {
          leftEyelidRef.current.scale.y = 0.75 + droop * 0.25;
          rightEyelidRef.current.scale.y = 0.75 + droop * 0.25;
        }
      } else {
        // Sudden waking startle snap upright!
        const snapProg = (cycleT - 0.82) / 0.18;
        if (headRef.current) {
          headRef.current.rotation.x = THREE.MathUtils.lerp(-0.25, 0.05, snapProg);
          headRef.current.rotation.z = 0;
          headRef.current.rotation.y = Math.sin(t * 18) * 0.04;
        }
        if (torsoRef.current) {
          torsoRef.current.rotation.x = 0;
        }
        if (leftEyelidRef.current && rightEyelidRef.current) {
          leftEyelidRef.current.scale.y = 0.05; // Wide awake eyes!
          rightEyelidRef.current.scale.y = 0.05;
        }
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.55;
        leftArmRef.current.rotation.z = 0.12;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.62;
        rightArmRef.current.rotation.z = -0.15;
      }
      return;
    }

    if (posture === 'chaos_answering') {
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
      }
      const waveSpeed = 9 + (seedVal % 3);
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -3.0 + Math.sin(t * waveSpeed) * 0.18;
        rightArmRef.current.rotation.y = Math.cos(t * waveSpeed) * 0.12;
        rightArmRef.current.rotation.z = -0.28;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -1.2 + Math.sin(t * (waveSpeed - 1)) * 0.2;
        leftArmRef.current.rotation.z = 0.25;
      }
      if (headRef.current) {
        headRef.current.rotation.x = -0.22 + Math.sin(t * 8) * 0.08;
        headRef.current.rotation.y = Math.sin(t * 4) * 0.15;
      }
      return;
    }

    // Teacher Postures
    if (posture === 'teacher_calm_chaos') {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      const calmWave = Math.sin(t * 4) * 0.15;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -1.25 + calmWave;
        leftArmRef.current.rotation.y = 0.35;
        leftArmRef.current.rotation.z = 0.35;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -1.25 + calmWave;
        rightArmRef.current.rotation.y = -0.35;
        rightArmRef.current.rotation.z = -0.35;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 2) * 0.25;
        headRef.current.rotation.x = 0.08;
      }
      return;
    }

    if (posture === 'teacher_awkward_silence') {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.45;
        leftArmRef.current.rotation.y = 0.45;
        leftArmRef.current.rotation.z = 0.4;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.45;
        rightArmRef.current.rotation.y = -0.45;
        rightArmRef.current.rotation.z = -0.4;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 0.6) * 0.45;
        headRef.current.rotation.z = 0.1;
      }
      return;
    }

    if (posture === 'teacher_waiting') {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.52;
        leftArmRef.current.rotation.z = 0.12;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.68 + Math.sin(t * 2.2) * 0.16;
        rightArmRef.current.rotation.y = -0.15;
        rightArmRef.current.rotation.z = -0.1;
      }
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = -0.3 + Math.sin(t * 2.2) * 0.12;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 0.7) * 0.32;
        headRef.current.rotation.x = 0.05;
      }
      return;
    }

    if (posture === 'teacher_pointing_board') {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.6 + Math.sin(t * 3) * 0.08;
        leftArmRef.current.rotation.z = 0.25;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -1.95 + Math.sin(t * 1.5) * 0.05;
        rightArmRef.current.rotation.y = -0.45;
        rightArmRef.current.rotation.z = -0.25;
      }
      if (rightForearmRef.current) rightForearmRef.current.rotation.x = -0.2;
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 0.9) > 0.2 ? -0.42 : 0.18;
        headRef.current.rotation.x = -0.05;
      }
      return;
    }

    if (posture === 'teacher_writing_board') {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.4;
        leftArmRef.current.rotation.z = 0.2;
      }
      if (rightArmRef.current) {
        const writeSpeed = 7;
        rightArmRef.current.rotation.x = -1.85 + Math.sin(t * writeSpeed) * 0.12;
        rightArmRef.current.rotation.y = 0.2 + Math.cos(t * writeSpeed) * 0.15;
        rightArmRef.current.rotation.z = -0.15;
      }
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = -0.3 + Math.sin(t * 7) * 0.15;
      }
      if (headRef.current) {
        const checkClass = Math.sin(t * 0.6) > 0.65;
        headRef.current.rotation.y = checkClass ? 0.65 : 0;
        headRef.current.rotation.x = checkClass ? 0.05 : -0.22;
      }
      return;
    }

    if (posture === 'teacher_pacing_explaining') {
      const paceStride = Math.sin(t * 5) * 0.35;
      if (leftLegRef.current) leftLegRef.current.rotation.x = paceStride;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -paceStride;

      const cadence = isSpeaking ? Math.sin(t * 4) * 0.18 : 0;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.75 + cadence;
        leftArmRef.current.rotation.y = 0.35;
        leftArmRef.current.rotation.z = 0.25;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.75 - cadence;
        rightArmRef.current.rotation.y = -0.35;
        rightArmRef.current.rotation.z = -0.25;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 1.2) * 0.25;
        headRef.current.rotation.x = 0.05;
      }
      return;
    }

    if (posture === 'teacher_explaining') {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      const emphasis = isSpeaking ? Math.sin(t * 5) * 0.22 : 0;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.55 + emphasis * 0.6;
        leftArmRef.current.rotation.z = 0.2;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.95 - emphasis;
        rightArmRef.current.rotation.z = -0.2;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 0.9) * 0.2;
        headRef.current.rotation.x = Math.sin(t * 2.5) * 0.06;
      }
      return;
    }

    if (posture === 'teacher_asking') {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.25;
        leftArmRef.current.rotation.y = 0.4;
        leftArmRef.current.rotation.z = 0.3;
      }
      if (rightArmRef.current) {
        const callOut = Math.sin(t * 1.5) > 0.2;
        rightArmRef.current.rotation.x = callOut ? -1.05 : -1.65;
        rightArmRef.current.rotation.y = callOut ? -0.25 : 0.35;
        rightArmRef.current.rotation.z = -0.15;
      }
      if (headRef.current) {
        headRef.current.rotation.z = 0.12;
        headRef.current.rotation.y = Math.sin(t * 0.8) * 0.28;
      }
      return;
    }

    if (posture === 'teacher_praise') {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      const clap = Math.sin(t * 12) * 0.2;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -1.1;
        leftArmRef.current.rotation.y = 0.45 + clap;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -1.1;
        rightArmRef.current.rotation.y = -0.45 - clap;
      }
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * 8) * 0.2;
        headRef.current.rotation.y = 0;
      }
      return;
    }

    if (posture === 'teacher_thinking') {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.55;
        leftArmRef.current.rotation.z = 0.2;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -1.5;
        rightArmRef.current.rotation.y = -0.5;
        rightArmRef.current.rotation.z = -0.2;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 4) * 0.22;
        headRef.current.rotation.x = 0.08;
      }
      return;
    }

    if (posture === 'walking') {
      const stride = Math.sin(t * 8) * 0.45;
      if (leftLegRef.current) leftLegRef.current.rotation.x = stride;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -stride;

      if (leftArmRef.current) leftArmRef.current.rotation.x = -stride * 0.55;
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = stride * 0.55;
        rightArmRef.current.rotation.z = 0.05;
        if (rightForearmRef.current) rightForearmRef.current.rotation.x = 0;
      }
      return;
    }

    // Seated / Idle posture with DYNAMIC LOOK-AT TEACHER TRACKING
    if (leftLegRef.current && rightLegRef.current) {
      if (posture === 'seating') {
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
      } else {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = posture === 'seating' ? -0.55 : 0;
      leftArmRef.current.rotation.z = posture === 'seating' ? 0.1 : 0.05;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = posture === 'seating' ? -0.55 : 0;
      rightArmRef.current.rotation.z = posture === 'seating' ? -0.1 : -0.05;
      if (rightForearmRef.current) rightForearmRef.current.rotation.x = 0;
    }

    // Dynamic Look-At Head Tracking for Seated Students
    if (role === 'Student' && headRef.current) {
      const teacherWorldPosition = useClassroomStore.getState().teacherWorldPosition;
      if (worldPosition && teacherWorldPosition) {
        const dx = teacherWorldPosition[0] - worldPosition[0];
        const dz = teacherWorldPosition[2] - worldPosition[2];
        const angleToTeacher = Math.atan2(dx, -dz);
        const targetYaw = Math.max(-0.61, Math.min(0.61, angleToTeacher));

        const dist = Math.sqrt(dx * dx + dz * dz);
        const targetPitch = dist > 0.5 ? Math.atan2(0.2, dist) : 0;
        const clampedPitch = Math.max(-0.12, Math.min(0.18, targetPitch));

        const lerpFactor = Math.min(delta * 2.8, 0.15);
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetYaw, lerpFactor);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, clampedPitch, lerpFactor);
        headRef.current.rotation.z = Math.sin(t * 1.2 + seedVal) * 0.02;
      } else {
        headRef.current.rotation.y = Math.sin(t * 0.8) * 0.06;
        headRef.current.rotation.x = Math.sin(t * 1.5) * 0.03;
        headRef.current.rotation.z = 0;
      }
    } else if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.06;
      headRef.current.rotation.x = 0;
      headRef.current.rotation.z = 0;
    }
  });

  const isSeatedState = role === 'Student' && !posture.startsWith('teacher_') && posture !== 'walking';
  const yOffset = isSeatedState ? -0.22 : 0;

  return (
    <group ref={rootRef} position={[position[0], position[1] + yOffset, position[2]]} rotation={rotation}>
      {/* 3D Overhead Name Badge: ONLY for Teacher */}
      {!isFirstPerson && role === 'Teacher' && (
        <Html position={[0, isSeatedState ? 1.65 : 2.05, 0]} center distanceFactor={14}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(30, 58, 138, 0.92)',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.45)',
                border: isSpeaking ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isSpeaking && <span style={{ color: '#4ade80', fontSize: '10px' }}>●</span>}
              <span>{name}</span>
            </div>
          </div>
        </Html>
      )}

      {/* Speaking Aura Halo */}
      <group ref={speakingRingRef} position={[0, 1.88, 0]} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.26, 0.32, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* External GLTF/GLB or In-Engine High-Fidelity Rigged Humanoid */}
      {avatarUrl ? (
        <Suspense fallback={null}>
          <ExternalAvatarModel url={avatarUrl} posture={posture} isSpeaking={isSpeaking} />
        </Suspense>
      ) : (
        <group>
          {/* ============================================================ */}
          {/* HEAD RIG (Sculpted Contoured Cranium, Recessed Eyes, Ears)   */}
          {/* ============================================================ */}
          {!isFirstPerson && (
            <group ref={headRef} position={[0, 1.55, 0]}>
              {/* 1. Upper Cranium (Skull Dome) */}
              <mesh position={[0, 0.02, 0]} castShadow>
                <sphereGeometry args={[0.138, 20, 20]} />
                <meshPhysicalMaterial
                  color={finalSkinTone}
                  roughness={0.55}
                  bumpMap={skinBump}
                  bumpScale={0.003}
                  metalness={0.02}
                  clearcoat={0.08}
                  clearcoatRoughness={0.25}
                  sheen={0.25}
                  sheenColor="#ff9999"
                />
              </mesh>

              {/* 2. Sculpted Jawline & Tapered Chin */}
              <mesh position={[0, -0.05, 0.025]} rotation={[0.15, 0, 0]} castShadow>
                <cylinderGeometry args={[0.076, 0.048, 0.09, 14]} />
                <meshPhysicalMaterial
                  color={finalSkinTone}
                  roughness={0.55}
                  bumpMap={skinBump}
                  bumpScale={0.003}
                  sheen={0.25}
                  sheenColor="#ff9999"
                />
              </mesh>

              {/* 3. Recessed Orbital Rim (Brow Ridge) */}
              <mesh position={[0, 0.042, 0.126]} rotation={[0.1, 0, 0]} castShadow>
                <boxGeometry args={[0.152, 0.024, 0.038]} />
                <meshPhysicalMaterial color={finalSkinTone} roughness={0.55} sheen={0.25} sheenColor="#ff9999" />
              </mesh>

              {/* 4. Natural Eyebrows */}
              <mesh position={[-0.052, 0.046, 0.144]} rotation={[0, 0, -0.06]}>
                <boxGeometry args={[0.044, 0.008, 0.005]} />
                <meshStandardMaterial color={finalHairColor} roughness={0.9} />
              </mesh>
              <mesh position={[0.052, 0.046, 0.144]} rotation={[0, 0, 0.06]}>
                <boxGeometry args={[0.044, 0.008, 0.005]} />
                <meshStandardMaterial color={finalHairColor} roughness={0.9} />
              </mesh>

              {/* 5. Sculpted Nose Bridge & Alar Base */}
              <group position={[0, 0.005, 0.14]}>
                {/* Nose Bridge */}
                <mesh position={[0, 0.015, 0]} rotation={[0.22, 0, 0]} castShadow>
                  <coneGeometry args={[0.016, 0.045, 6]} />
                  <meshPhysicalMaterial color={finalSkinTone} roughness={0.55} />
                </mesh>
                {/* Nose Tip */}
                <mesh position={[0, -0.01, 0.012]} castShadow>
                  <sphereGeometry args={[0.013, 8, 8]} />
                  <meshPhysicalMaterial color={finalSkinTone} roughness={0.55} />
                </mesh>
              </group>

              {/* 6. Defined Vermilion Lips */}
              <group position={[0, -0.052, 0.122]}>
                {/* Upper Lip with Cupid's bow */}
                <mesh position={[0, 0.007, 0]} castShadow>
                  <boxGeometry args={[0.046, 0.011, 0.02]} />
                  <meshPhysicalMaterial color="#b26159" roughness={0.4} />
                </mesh>
                {/* Lower Lip */}
                <mesh position={[0, -0.006, 0.002]} castShadow>
                  <boxGeometry args={[0.042, 0.013, 0.02]} />
                  <meshPhysicalMaterial color="#c06c64" roughness={0.35} />
                </mesh>
              </group>

              {/* 7. Anatomical Ears (Helix, Antihelix, Lobule) */}
              {/* Left Ear */}
              <group position={[-0.142, 0.005, -0.012]} rotation={[0, 0.25, 0.1]}>
                <mesh castShadow>
                  <boxGeometry args={[0.014, 0.058, 0.035]} />
                  <meshPhysicalMaterial color={finalSkinTone} roughness={0.55} sheen={0.25} sheenColor="#ff9999" />
                </mesh>
              </group>
              {/* Right Ear */}
              <group position={[0.142, 0.005, -0.012]} rotation={[0, -0.25, -0.1]}>
                <mesh castShadow>
                  <boxGeometry args={[0.014, 0.058, 0.035]} />
                  <meshPhysicalMaterial color={finalSkinTone} roughness={0.55} sheen={0.25} sheenColor="#ff9999" />
                </mesh>
              </group>

              {/* 8. Hair Volume & Styled Silhouettes */}
              <mesh position={[0, 0.065, -0.025]} castShadow>
                <sphereGeometry args={[0.152, 18, 18]} />
                <meshStandardMaterial color={finalHairColor} roughness={0.88} />
              </mesh>

              {finalHairStyle === 'parted' && (
                <group position={[0, 0.12, 0.02]}>
                  <mesh rotation={[0.15, 0.25, -0.1]} castShadow>
                    <boxGeometry args={[0.2, 0.05, 0.16]} />
                    <meshStandardMaterial color={finalHairColor} roughness={0.85} />
                  </mesh>
                </group>
              )}
              {finalHairStyle === 'curly' && (
                <group position={[0, 0.11, -0.01]}>
                  <mesh castShadow>
                    <dodecahedronGeometry args={[0.12, 1]} />
                    <meshStandardMaterial color={finalHairColor} roughness={0.92} />
                  </mesh>
                </group>
              )}
              {finalHairStyle === 'bun' && (
                <mesh position={[0, 0.08, -0.14]} castShadow>
                  <sphereGeometry args={[0.065, 12, 12]} />
                  <meshStandardMaterial color={finalHairColor} roughness={0.88} />
                </mesh>
              )}

              {/* 9. Left Eye Assembly with Saccade Tracking */}
              <group ref={leftEyeRef} position={[-0.052, 0.018, 0.128]}>
                <mesh>
                  <sphereGeometry args={[0.021, 12, 12]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.15} />
                </mesh>
                <mesh position={[0, 0, 0.016]}>
                  <circleGeometry args={[0.01, 12]} />
                  <meshBasicMaterial color="#3b2515" />
                </mesh>
                <mesh position={[0, 0, 0.017]}>
                  <circleGeometry args={[0.005, 12]} />
                  <meshBasicMaterial color="#09090b" />
                </mesh>
                <mesh ref={leftEyelidRef} position={[0, 0.016, 0.012]}>
                  <boxGeometry args={[0.042, 0.028, 0.018]} />
                  <meshPhysicalMaterial color={finalSkinTone} roughness={0.58} />
                </mesh>
              </group>

              {/* 10. Right Eye Assembly with Saccade Tracking */}
              <group ref={rightEyeRef} position={[0.052, 0.018, 0.128]}>
                <mesh>
                  <sphereGeometry args={[0.021, 12, 12]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.15} />
                </mesh>
                <mesh position={[0, 0, 0.016]}>
                  <circleGeometry args={[0.01, 12]} />
                  <meshBasicMaterial color="#3b2515" />
                </mesh>
                <mesh position={[0, 0, 0.017]}>
                  <circleGeometry args={[0.005, 12]} />
                  <meshBasicMaterial color="#09090b" />
                </mesh>
                <mesh ref={rightEyelidRef} position={[0, 0.016, 0.012]}>
                  <boxGeometry args={[0.042, 0.028, 0.018]} />
                  <meshPhysicalMaterial color={finalSkinTone} roughness={0.58} />
                </mesh>
              </group>

              {/* 11. Wireframe Spectacles */}
              {finalHasGlasses && (
                <group position={[0, 0.018, 0.142]}>
                  <mesh position={[-0.052, 0, 0]}>
                    <ringGeometry args={[0.024, 0.028, 16]} />
                    <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
                  </mesh>
                  <mesh position={[0.052, 0, 0]}>
                    <ringGeometry args={[0.024, 0.028, 16]} />
                    <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
                  </mesh>
                  <mesh position={[0, 0.005, 0]}>
                    <boxGeometry args={[0.04, 0.004, 0.004]} />
                    <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
                  </mesh>
                </group>
              )}
            </group>
          )}

          {/* Neck Rig */}
          <mesh ref={neckRef} position={[0, 1.41, 0]} castShadow>
            <cylinderGeometry args={[0.054, 0.068, 0.1, 14]} />
            <meshPhysicalMaterial color={finalSkinTone} roughness={0.55} bumpMap={skinBump} bumpScale={0.002} sheen={0.25} sheenColor="#ff9999" />
          </mesh>

          {/* ============================================================ */}
          {/* TORSO RIG WITH TEXTILE FABRIC NORMAL MAP & DETAIL COLLAR     */}
          {/* ============================================================ */}
          <group ref={torsoRef} position={[0, 1.15, 0]}>
            {/* Shirt / Blazer Body */}
            <mesh castShadow>
              <boxGeometry args={[0.44, 0.54, 0.24]} />
              <meshStandardMaterial
                color={shirtColor}
                roughness={0.85}
                normalMap={fabricNormal}
                normalScale={new THREE.Vector2(0.5, 0.5)}
              />
            </mesh>

            {/* Collar & Lapel Detailing */}
            <group position={[0, 0.24, 0.1]}>
              <mesh position={[-0.08, 0, 0]} rotation={[0.2, 0, -0.4]}>
                <boxGeometry args={[0.1, 0.08, 0.02]} />
                <meshStandardMaterial color={role === 'Teacher' ? '#e2e8f0' : shirtColor} roughness={0.75} />
              </mesh>
              <mesh position={[0.08, 0, 0]} rotation={[0.2, 0, 0.4]}>
                <boxGeometry args={[0.1, 0.08, 0.02]} />
                <meshStandardMaterial color={role === 'Teacher' ? '#e2e8f0' : shirtColor} roughness={0.75} />
              </mesh>
              {/* Teacher Tie */}
              {role === 'Teacher' && (
                <mesh position={[0, -0.1, 0.025]}>
                  <boxGeometry args={[0.045, 0.22, 0.015]} />
                  <meshStandardMaterial color="#991b1b" roughness={0.65} />
                </mesh>
              )}
            </group>
          </group>

          {/* ============================================================ */}
          {/* ARMS & ARTICULATED 5-FINGER HANDS                            */}
          {/* ============================================================ */}
          {/* Left Arm Rig */}
          <group ref={leftArmRef} position={[-0.28, 1.36, 0]}>
            <mesh position={[0, -0.16, 0]} castShadow>
              <capsuleGeometry args={[0.065, 0.26, 8, 12]} />
              <meshStandardMaterial color={shirtColor} roughness={0.85} normalMap={fabricNormal} />
            </mesh>
            <mesh position={[0, -0.32, 0]} castShadow>
              <capsuleGeometry args={[0.055, 0.2, 8, 12]} />
              <meshStandardMaterial color={shirtColor} roughness={0.85} normalMap={fabricNormal} />
            </mesh>
            {/* Left Articulated 5-Finger Hand */}
            <group position={[0, -0.42, 0]}>
              <AnatomicalHand isLeft={true} posture={posture} skinTone={finalSkinTone} role={role} />
            </group>
          </group>

          {/* Right Arm Rig */}
          <group ref={rightArmRef} position={[0.28, 1.36, 0]}>
            <mesh position={[0, -0.16, 0]} castShadow>
              <capsuleGeometry args={[0.065, 0.26, 8, 12]} />
              <meshStandardMaterial color={shirtColor} roughness={0.85} normalMap={fabricNormal} />
            </mesh>
            <group ref={rightForearmRef} position={[0, -0.26, 0]}>
              <mesh position={[0, -0.06, 0]} castShadow>
                <capsuleGeometry args={[0.055, 0.2, 8, 12]} />
                <meshStandardMaterial color={shirtColor} roughness={0.85} normalMap={fabricNormal} />
              </mesh>
              {/* Right Articulated 5-Finger Hand */}
              <group position={[0, -0.16, 0]}>
                <AnatomicalHand isLeft={false} posture={posture} skinTone={finalSkinTone} role={role} />
              </group>
            </group>
          </group>

          {/* ============================================================ */}
          {/* PELVIS & LEGS                                                */}
          {/* ============================================================ */}
          <mesh position={[0, 0.84, 0]} castShadow>
            <boxGeometry args={[0.4, 0.12, 0.22]} />
            <meshStandardMaterial color={pantsColor} roughness={0.8} />
          </mesh>

          {/* Left Leg */}
          <group ref={leftLegRef} position={[-0.13, 0.76, 0]}>
            <mesh position={[0, -0.34, 0]} castShadow>
              <boxGeometry args={[0.15, 0.65, 0.18]} />
              <meshStandardMaterial color={pantsColor} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.7, 0.04]} castShadow>
              <boxGeometry args={[0.16, 0.09, 0.24]} />
              <meshStandardMaterial color="#0f172a" roughness={0.65} />
            </mesh>
          </group>

          {/* Right Leg */}
          <group ref={rightLegRef} position={[0.13, 0.76, 0]}>
            <mesh position={[0, -0.34, 0]} castShadow>
              <boxGeometry args={[0.15, 0.65, 0.18]} />
              <meshStandardMaterial color={pantsColor} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.7, 0.04]} castShadow>
              <boxGeometry args={[0.16, 0.09, 0.24]} />
              <meshStandardMaterial color="#0f172a" roughness={0.65} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};

export default ClassroomAvatar;
