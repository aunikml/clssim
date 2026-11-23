import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { physicsFoleyAudioService } from '../../../../services/physicsFoleyAudioService';
import { useClassroomStore } from '../../../../store/classroomStore';

/**
 * Controller for classroom micro-events:
 * 1. Paper Airplane flight gliding across the classroom
 * 2. Ballistic paper note toss across the aisle
 * 3. Spilled pencil tin scattering stationery on the floor
 * 4. Metal Hydroflask bottle topple and roll down the center aisle
 * 5. Smartphone vibration with haptic wooden resonance on student desk
 * 6. Head-bob doze-off and sudden waking startle twitch
 */

export const ClassroomDisruptionsController = ({ activeEvent, onEventComplete }) => {
  const airplaneBodyRef = useRef();
  const noteBallBodyRef = useRef();
  const tinBodyRef = useRef();
  const spilledPencilRefs = useRef([]);
  const bottleBodyRef = useRef();
  const phoneRef = useRef();

  // Active state flags
  const [airplaneActive, setAirplaneActive] = useState(false);
  const [noteBallActive, setNoteBallActive] = useState(false);
  const [tinSpilled, setTinSpilled] = useState(false);
  const [bottleToppled, setBottleToppled] = useState(false);
  const [phoneVibrating, setPhoneVibrating] = useState(false);
  const [dozingActive, setDozingActive] = useState(false);

  // Store setter to coordinate avatar postures during autonomous triggers
  const setActiveDisruptionEvent = useClassroomStore((state) => state.setActiveDisruptionEvent);

  // Airplane flight aerodynamics
  const airplaneFlightTime = useRef(0);

  // Trigger events when activeEvent prop changes
  useEffect(() => {
    if (!activeEvent) return;

    if (activeEvent === 'airplane') {
      launchAirplane();
    } else if (activeEvent === 'note_toss') {
      tossNote();
    } else if (activeEvent === 'spill_tin') {
      spillTin();
    } else if (activeEvent === 'water_bottle') {
      toppleWaterBottle();
    } else if (activeEvent === 'phone_vibrate') {
      vibratePhone();
    } else if (activeEvent === 'doze_startle') {
      triggerDozeStartle();
    } else if (activeEvent === 'reset') {
      resetAll();
    }
  }, [activeEvent]);

  // Autonomous random micro-event loop (fires every 25 to 55 seconds naturally)
  useEffect(() => {
    let timeoutId = null;

    const scheduleNext = () => {
      // 25 - 55 second random intervals
      const nextDelay = 25000 + Math.random() * 30000;
      timeoutId = setTimeout(() => {
        const rand = Math.random();
        if (rand < 0.20) {
          setActiveDisruptionEvent('airplane');
        } else if (rand < 0.38) {
          setActiveDisruptionEvent('note_toss');
        } else if (rand < 0.54) {
          setActiveDisruptionEvent('spill_tin');
        } else if (rand < 0.70) {
          setActiveDisruptionEvent('water_bottle');
        } else if (rand < 0.85) {
          setActiveDisruptionEvent('phone_vibrate');
        } else {
          setActiveDisruptionEvent('doze_startle');
        }

        // Automatically clean up after 15 seconds to prepare for subsequent disruptions
        setTimeout(() => {
          resetAll();
        }, 15000);

        scheduleNext();
      }, nextDelay);
    };

    scheduleNext();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // 1. Launch Paper Airplane from Row 3 to front
  const launchAirplane = () => {
    setAirplaneActive(true);
    airplaneFlightTime.current = 0;
    physicsFoleyAudioService.playPaperGlide();

    setTimeout(() => {
      if (airplaneBodyRef.current) {
        airplaneBodyRef.current.setTranslation({ x: 1.2, y: 1.35, z: 2.5 }, true);
        airplaneBodyRef.current.setLinvel({ x: -0.6, y: 1.2, z: -5.2 }, true);
        airplaneBodyRef.current.setAngvel({ x: 0.2, y: -0.4, z: 0.8 }, true);
      }
    }, 50);
  };

  // 2. Ballistic Crumpled Note Toss across aisle (R3-S1 -> R3-S3)
  const tossNote = () => {
    setNoteBallActive(true);
    physicsFoleyAudioService.playPencilDrop(0.4);

    setTimeout(() => {
      if (noteBallBodyRef.current) {
        noteBallBodyRef.current.setTranslation({ x: -3.5, y: 1.1, z: 1.3 }, true);
        // Throw arc across to x: 0.0, z: 1.3
        noteBallBodyRef.current.setLinvel({ x: 3.4, y: 3.2, z: -0.2 }, true);
        noteBallBodyRef.current.setAngvel({ x: 4, y: 2, z: 1 }, true);
      }
    }, 50);
  };

  // 3. Topple Pencil Tin on Aisle Desk
  const spillTin = () => {
    setTinSpilled(true);
    physicsFoleyAudioService.playCanisterSpill();

    setTimeout(() => {
      if (tinBodyRef.current) {
        // Tipping impulse sideways off desk
        tinBodyRef.current.applyImpulse({ x: 0.08, y: 0.04, z: 0.05 }, true);
        tinBodyRef.current.applyTorqueImpulse({ x: 0.02, y: 0.01, z: -0.04 }, true);
      }
      spilledPencilRefs.current.forEach((ref) => {
        if (ref) {
          ref.applyImpulse(
            {
              x: 0.02 + Math.random() * 0.03,
              y: 0.02 + Math.random() * 0.03,
              z: (Math.random() - 0.5) * 0.04,
            },
            true
          );
        }
      });
    }, 50);
  };

  // 4. Metal Hydroflask Bottle Topple & Roll down aisle (Desk R2-S3)
  const toppleWaterBottle = () => {
    setBottleToppled(true);
    physicsFoleyAudioService.playMetalBottleDrop(1.5);

    setTimeout(() => {
      if (bottleBodyRef.current) {
        // Lateral nudge off desk edge into the center aisle + spin
        bottleBodyRef.current.applyImpulse({ x: 0.22, y: 0.06, z: 0.12 }, true);
        bottleBodyRef.current.applyTorqueImpulse({ x: 0.06, y: 0.02, z: -0.14 }, true);
      }
    }, 40);
  };

  // 5. Smartphone vibration on desk (Desk R1-S3 Liam Patel)
  const vibratePhone = () => {
    setPhoneVibrating(true);
    physicsFoleyAudioService.playPhoneVibration();

    // Stops vibrating after dual-burst buzz sequence (~1.6s)
    setTimeout(() => {
      setPhoneVibrating(false);
    }, 1600);
  };

  // 6. Head-bob doze-off and sudden waking startle (Student Ethan Vance R3-S5)
  const triggerDozeStartle = () => {
    setDozingActive(true);

    // After ~2.8s of slow forward sagging, Ethan wakes with a sudden gasp
    setTimeout(() => {
      physicsFoleyAudioService.playSleepStartleGasp();
    }, 2850);

    // Return to normal posture after 5.5s
    setTimeout(() => {
      setDozingActive(false);
      if (onEventComplete) onEventComplete();
    }, 5500);
  };

  // Reset all disruptions back to clean classroom state
  const resetAll = () => {
    setAirplaneActive(false);
    setNoteBallActive(false);
    setTinSpilled(false);
    setBottleToppled(false);
    setPhoneVibrating(false);
    setDozingActive(false);

    // Reset bottle rigid body back to upright on desk
    if (bottleBodyRef.current) {
      bottleBodyRef.current.setTranslation({ x: 0.24, y: 0.88, z: -0.9 }, true);
      bottleBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      bottleBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      bottleBodyRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    }

    if (onEventComplete) onEventComplete();
  };

  // Aerodynamic glide simulation for paper airplane & phone micro-jitter
  useFrame((state, delta) => {
    if (airplaneActive && airplaneBodyRef.current && airplaneFlightTime.current < 2.0) {
      const safeDelta = Math.min(delta, 0.05);
      airplaneFlightTime.current += safeDelta;
      // Subtle aerodynamic lift force countering full gravity (guarded values to prevent NaN)
      airplaneBodyRef.current.applyImpulse({ x: 0, y: 0.0018, z: 0 }, true);
    }

    // High-frequency physical micro-jitter for vibrating phone
    if (phoneVibrating && phoneRef.current) {
      const t = state.clock.getElapsedTime();
      phoneRef.current.position.x = 0.24 + Math.sin(t * 110) * 0.0016;
      phoneRef.current.position.z = -3.1 + Math.cos(t * 130) * 0.0016;
      phoneRef.current.rotation.y = Math.sin(t * 90) * 0.03;
    }
  });

  return (
    <group>
      {/* 1. Paper Airplane */}
      {airplaneActive && (
        <RigidBody
          ref={airplaneBodyRef}
          colliders={false}
          position={[1.2, 1.35, 2.5]}
          mass={0.01}
          linearDamping={0.4}
          angularDamping={0.6}
          restitution={0.2}
          onCollisionEnter={({ totalForceMagnitude }) => {
            if (totalForceMagnitude > 0.05) {
              physicsFoleyAudioService.playPencilDrop(0.3);
            }
          }}
        >
          {/* Explicit Box Collider avoids Rapier Quickhull NaN crash on 2D coplanar triangles */}
          <CuboidCollider args={[0.12, 0.02, 0.12]} />

          {/* Folded Paper Airplane Mesh (Delta wing with folded center keel) */}
          <group rotation={[0, Math.PI, 0]}>
            {/* Left wing */}
            <mesh castShadow>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={3}
                  array={new Float32Array([
                    0, 0, 0.14,      // Nose
                    -0.14, 0.01, -0.14, // Left wing tip
                    0, -0.02, -0.12    // Center fold bottom
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <meshStandardMaterial color="#f8fafc" roughness={0.7} side={THREE.DoubleSide} />
            </mesh>

            {/* Right wing */}
            <mesh castShadow>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={3}
                  array={new Float32Array([
                    0, 0, 0.14,      // Nose
                    0.14, 0.01, -0.14,  // Right wing tip
                    0, -0.02, -0.12    // Center fold bottom
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <meshStandardMaterial color="#f1f5f9" roughness={0.7} side={THREE.DoubleSide} />
            </mesh>

            {/* Wing fold creases / pencil doodle */}
            <mesh position={[0, 0.005, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.08, 0.003]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
          </group>
        </RigidBody>
      )}

      {/* 2. Tossed Crumpled Note Ball */}
      {noteBallActive && (
        <RigidBody
          ref={noteBallBodyRef}
          colliders="ball"
          position={[-3.5, 1.1, 1.3]}
          mass={0.015}
          restitution={0.4}
          friction={0.6}
          onCollisionEnter={({ totalForceMagnitude }) => {
            if (totalForceMagnitude > 0.05) {
              physicsFoleyAudioService.playPencilDrop(totalForceMagnitude * 2);
            }
          }}
        >
          <mesh castShadow>
            <dodecahedronGeometry args={[0.028, 1]} />
            <meshStandardMaterial color="#fef9c3" roughness={0.9} />
          </mesh>
        </RigidBody>
      )}

      {/* 3. Spilled Desktop Pencil Tin (on Aisle Desk R2-S3: position [0.0, 0.78, -1.1]) */}
      <group position={[0.22, 0, -1.1]}>
        {/* Metal Tin Canister */}
        <RigidBody
          ref={tinBodyRef}
          colliders="cuboid"
          position={[0, 0.85, 0]}
          mass={0.08}
          friction={0.7}
          restitution={0.25}
          onCollisionEnter={({ totalForceMagnitude }) => {
            if (totalForceMagnitude > 0.1) {
              physicsFoleyAudioService.playBookThud(totalForceMagnitude * 1.2);
            }
          }}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.038, 0.035, 0.11, 12]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
          </mesh>
        </RigidBody>

        {/* 5 Dynamic Pencils that scatter on spill */}
        {[-0.015, -0.007, 0, 0.007, 0.015].map((offX, idx) => (
          <RigidBody
            key={idx}
            ref={(el) => (spilledPencilRefs.current[idx] = el)}
            colliders="cuboid"
            position={[offX, 0.86 + idx * 0.01, (idx - 2) * 0.008]}
            rotation={[0, idx * 0.3, idx % 2 === 0 ? 0.1 : -0.1]}
            mass={0.018}
            friction={0.5}
            restitution={0.3}
            onCollisionEnter={({ totalForceMagnitude }) => {
              if (totalForceMagnitude > 0.08) {
                physicsFoleyAudioService.playPencilDrop(totalForceMagnitude * 3);
              }
            }}
          >
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.005, 0.005, 0.18, 6]} />
              <meshStandardMaterial
                color={['#e11d48', '#16a34a', '#ca8a04', '#7c3aed', '#ea580c'][idx]}
                roughness={0.4}
              />
            </mesh>
          </RigidBody>
        ))}
      </group>

      {/* 4. Metal Hydroflask Bottle (Desk R2-S3 near center aisle: [0.24, 0.88, -0.9]) */}
      <RigidBody
        ref={bottleBodyRef}
        colliders="cuboid"
        position={[0.24, 0.88, -0.9]}
        mass={0.45}
        friction={0.35}
        restitution={0.3}
        linearDamping={0.15}
        angularDamping={0.2}
        onCollisionEnter={({ totalForceMagnitude }) => {
          if (totalForceMagnitude > 0.12) {
            physicsFoleyAudioService.playMetalBottleDrop(totalForceMagnitude * 1.5);
          }
        }}
      >
        <group>
          {/* Main insulated steel flask cylinder */}
          <mesh castShadow position={[0, 0, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 0.20, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.82} roughness={0.22} />
          </mesh>
          {/* Silicone protective boot base */}
          <mesh position={[0, -0.075, 0]}>
            <cylinderGeometry args={[0.039, 0.039, 0.05, 16]} />
            <meshStandardMaterial color="#0369a1" roughness={0.85} />
          </mesh>
          {/* Brushed stainless steel neck rim */}
          <mesh position={[0, 0.108, 0]}>
            <cylinderGeometry args={[0.026, 0.028, 0.022, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Charcoal screw-on sport cap */}
          <mesh position={[0, 0.126, 0]}>
            <cylinderGeometry args={[0.027, 0.027, 0.022, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
          {/* Sport cap carrying loop handle */}
          <mesh position={[0.012, 0.144, 0]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.015, 0.0038, 8, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
        </group>
      </RigidBody>

      {/* 5. Vibrating Smartphone on Desk (Desk R1-S3 Liam Patel: [0.24, 0.776, -3.1]) */}
      <group ref={phoneRef} position={[0.24, 0.776, -3.1]}>
        {/* Phone chassis */}
        <mesh castShadow position={[0, 0.004, 0]}>
          <boxGeometry args={[0.074, 0.0075, 0.148]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Phone screen face */}
        <mesh position={[0, 0.008, 0]}>
          <planeGeometry args={[0.068, 0.142]} />
          <meshStandardMaterial
            color={phoneVibrating ? '#38bdf8' : '#090d16'}
            emissive={phoneVibrating ? '#38bdf8' : '#000000'}
            emissiveIntensity={phoneVibrating ? 1.6 : 0}
            roughness={0.1}
          />
        </mesh>
        {/* Glowing incoming call / notification bar when vibrating */}
        {phoneVibrating && (
          <mesh position={[0, 0.0082, 0.035]}>
            <planeGeometry args={[0.05, 0.018]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )}
      </group>
    </group>
  );
};
