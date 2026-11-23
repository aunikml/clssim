import React, { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { physicsFoleyAudioService } from '../../../../services/physicsFoleyAudioService';

/**
 * Dynamic physical chalk pieces and felt eraser resting on the chalkboard tray.
 * Players or teachers can bump or click them, causing them to fall with crisp chalk audio.
 */
export const BlackboardChalkPhysics = () => {
  const chalk1Ref = useRef();
  const chalk2Ref = useRef();
  const eraserRef = useRef();

  const handleKnockChalk = (ref, color) => (e) => {
    e.stopPropagation();
    if (!ref.current) return;
    const impulseZ = 0.008 + Math.random() * 0.008;
    const impulseY = 0.004;
    const impulseX = (Math.random() - 0.5) * 0.006;
    ref.current.applyImpulse({ x: impulseX, y: impulseY, z: impulseZ }, true);
    ref.current.applyTorqueImpulse({ x: 0.002, y: 0.001, z: 0.003 }, true);
    physicsFoleyAudioService.playChalkClack(1.0);
  };

  return (
    <group>
      {/* 1. White Chalk Stick */}
      <RigidBody
        ref={chalk1Ref}
        colliders="hull"
        position={[-0.8, 1.25, -7.72]}
        rotation={[0, 0, Math.PI / 2]}
        mass={0.015}
        friction={0.8}
        restitution={0.2}
        onCollisionEnter={({ totalForceMagnitude }) => {
          if (totalForceMagnitude > 0.05) {
            physicsFoleyAudioService.playChalkClack(totalForceMagnitude * 4);
          }
        }}
      >
        <mesh
          castShadow
          onClick={handleKnockChalk(chalk1Ref, 'white')}
          style={{ cursor: 'pointer' }}
        >
          <cylinderGeometry args={[0.007, 0.007, 0.075, 8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* 2. Yellow Chalk Stick */}
      <RigidBody
        ref={chalk2Ref}
        colliders="hull"
        position={[-0.65, 1.25, -7.72]}
        rotation={[0, 0.2, Math.PI / 2]}
        mass={0.015}
        friction={0.8}
        restitution={0.2}
        onCollisionEnter={({ totalForceMagnitude }) => {
          if (totalForceMagnitude > 0.05) {
            physicsFoleyAudioService.playChalkClack(totalForceMagnitude * 4);
          }
        }}
      >
        <mesh
          castShadow
          onClick={handleKnockChalk(chalk2Ref, 'yellow')}
          style={{ cursor: 'pointer' }}
        >
          <cylinderGeometry args={[0.007, 0.007, 0.07, 8]} />
          <meshStandardMaterial color="#fef08a" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* 3. Felt Chalkboard Eraser */}
      <RigidBody
        ref={eraserRef}
        colliders="cuboid"
        position={[0.5, 1.26, -7.72]}
        mass={0.06}
        friction={0.95}
        restitution={0.1}
        onCollisionEnter={({ totalForceMagnitude }) => {
          if (totalForceMagnitude > 0.08) {
            physicsFoleyAudioService.playBookThud(totalForceMagnitude * 1.5);
          }
        }}
      >
        <group
          onClick={(e) => {
            e.stopPropagation();
            if (!eraserRef.current) return;
            eraserRef.current.applyImpulse({ x: 0.01, y: 0.006, z: 0.02 }, true);
            physicsFoleyAudioService.playBookThud(0.8);
          }}
        >
          {/* Wooden handle */}
          <mesh castShadow position={[0, 0.015, 0]}>
            <boxGeometry args={[0.13, 0.025, 0.05]} />
            <meshStandardMaterial color="#854d0e" roughness={0.6} />
          </mesh>
          {/* Black felt bottom */}
          <mesh position={[0, -0.005, 0]}>
            <boxGeometry args={[0.13, 0.015, 0.05]} />
            <meshStandardMaterial color="#1f2937" roughness={0.95} />
          </mesh>
        </group>
      </RigidBody>
    </group>
  );
};
