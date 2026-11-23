import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useClassroomStore } from '../../../store/classroomStore';
import { useSessionStore } from '../../../store/sessionStore';
import { getSeatCoordinates } from '../../../utils/classroomConfig';

export const GtaThirdPersonCameraController = () => {
  const { camera, gl } = useThree();

  const cameraMode = useClassroomStore((state) => state.cameraMode);
  const isSeated = useClassroomStore((state) => state.isSeated);
  const seatedSeatId = useClassroomStore((state) => state.seatedSeatId);
  const selectedSeatId = useClassroomStore((state) => state.selectedSeatId);
  const mySeatId = useSessionStore((state) => state.mySeatId);
  const config = useClassroomStore((state) => state.config);

  const playerPosition = useClassroomStore((state) => state.playerPosition);
  const playerYaw = useClassroomStore((state) => state.playerYaw);
  const playerPitch = useClassroomStore((state) => state.playerPitch);
  const setPlayerLook = useClassroomStore((state) => state.setPlayerLook);
  const cameraDistanceTier = useClassroomStore((state) => state.cameraDistanceTier);
  const cycleCameraTier = useClassroomStore((state) => state.cycleCameraTier);

  const inspectTarget = useClassroomStore((state) => state.inspectTarget);
  const clearInspectTarget = useClassroomStore((state) => state.clearInspectTarget);
  const standUp = useClassroomStore((state) => state.standUp);

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const localYaw = useRef(playerYaw);
  const localPitch = useRef(playerPitch);
  const keys = useRef({});
  const currentLean = useRef(0);

  // Smooth camera position & target dampeners
  const currentCamPos = useRef(new THREE.Vector3(6.8, 1.8, 5.8));
  const currentTargetPos = useRef(new THREE.Vector3(0, 1.5, -4.0));

  const isPlayerView = cameraMode === 'walk' || cameraMode === 'board';

  useEffect(() => {
    localYaw.current = playerYaw;
    localPitch.current = playerPitch;

    // Immediately snap camera behind student avatar to prevent blank/stale camera view
    if (camera && isPlayerView && !isSeated && !inspectTarget) {
      const pX = playerPosition[0];
      const pY = playerPosition[1];
      const pZ = playerPosition[2];
      const pivot = new THREE.Vector3(pX, pY + 1.42, pZ);

      const yaw = playerYaw;
      const pitch = playerPitch;
      const forwardX = -Math.sin(yaw) * Math.cos(pitch);
      const forwardY = -Math.sin(pitch);
      const forwardZ = -Math.cos(yaw) * Math.cos(pitch);
      const forward = new THREE.Vector3(forwardX, forwardY, forwardZ).normalize();
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

      const tiers = [
        { distance: 1.85, shoulderOffset: 0.28, heightOffset: 0.32 },
        { distance: 3.15, shoulderOffset: 0.15, heightOffset: 0.52 },
        { distance: 4.85, shoulderOffset: 0.0, heightOffset: 0.85 },
      ];
      const tier = tiers[cameraDistanceTier] || tiers[1];

      const idealOffset = forward.clone().multiplyScalar(-tier.distance);
      idealOffset.addScaledVector(right, tier.shoulderOffset);
      idealOffset.y += tier.heightOffset;

      const initCamPos = pivot.clone().add(idealOffset);
      const initLook = pivot.clone().addScaledVector(forward, 12.0);

      currentCamPos.current.copy(initCamPos);
      currentTargetPos.current.copy(initLook);

      camera.position.copy(initCamPos);
      camera.up.set(0, 1, 0);
      camera.lookAt(initLook);
      camera.updateProjectionMatrix();
    }
  }, [playerYaw, playerPitch, cameraMode, isSeated, isPlayerView, inspectTarget, playerPosition, cameraDistanceTier, camera]);

  // Keyboard navigation & hotkeys:
  // - Press 'V' to cycle Second Life camera distance tiers
  // - Press 'Esc' to exit object inspection
  // - Press 'Space' while seated to stand up
  // - Press 'N' to toggle the student desk notebook
  // - Hold 'Q' / 'E' while seated to lean left / right around classmate heads
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      keys.current[e.code] = true;

      if (e.code === 'KeyV' && !isSeated && !inspectTarget) {
        cycleCameraTier();
      }
      if (e.code === 'Escape' && inspectTarget) {
        clearInspectTarget();
      }
      if (e.code === 'Space' && isSeated) {
        standUp();
      }
      if (e.code === 'KeyN') {
        const store = useClassroomStore.getState();
        if (store.isNotebookOpen) {
          store.closeNotebook();
        } else {
          store.openNotebook();
        }
      }
    };

    const handleKeyUp = (e) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSeated, inspectTarget, cycleCameraTier, clearInspectTarget, standUp]);

  // Pointer drag to orbit / inspect
  useEffect(() => {
    if (!isPlayerView) return;

    const dom = gl.domElement;

    const handlePointerDown = (e) => {
      if (e.button === 0) {
        isDragging.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e) => {
      if (!isDragging.current) return;

      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.003;

      if (inspectTarget) {
        // Orbit around inspected object (Second Life Alt-Click Inspection)
        localYaw.current = (localYaw.current - dx * sensitivity) % (2 * Math.PI);
        localPitch.current = THREE.MathUtils.clamp(localPitch.current - dy * sensitivity, -0.6, 0.85);
      } else if (isSeated) {
        // Seated head swivel looking toward blackboard
        const newYaw = localYaw.current - dx * sensitivity;
        localYaw.current = THREE.MathUtils.clamp(newYaw, -1.25, 1.25);
        localPitch.current = THREE.MathUtils.clamp(localPitch.current - dy * sensitivity, -0.45, 0.45);
        setPlayerLook(localYaw.current, localPitch.current);
      } else {
        // Full 360° Second Life avatar follow orbit
        localYaw.current = (localYaw.current - dx * sensitivity) % (2 * Math.PI);
        localPitch.current = THREE.MathUtils.clamp(localPitch.current - dy * sensitivity, -0.5, 0.85);
        setPlayerLook(localYaw.current, localPitch.current);
      }
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isPlayerView, isSeated, inspectTarget, gl, setPlayerLook]);

  useFrame((state, delta) => {
    if (!isPlayerView) return;

    // Mode A: Second Life Object Inspection Mode (Focus on Blackboard, Desk, or Props)
    if (inspectTarget) {
      const targetVec = new THREE.Vector3(...inspectTarget.target);
      const dist = inspectTarget.distance || 3.2;

      const forwardX = -Math.sin(localYaw.current) * Math.cos(localPitch.current);
      const forwardY = -Math.sin(localPitch.current);
      const forwardZ = -Math.cos(localYaw.current) * Math.cos(localPitch.current);
      const forward = new THREE.Vector3(forwardX, forwardY, forwardZ).normalize();

      const desiredCamPos = targetVec.clone().addScaledVector(forward, -dist);
      desiredCamPos.y = Math.max(0.6, desiredCamPos.y);

      const lerpSpeed = Math.min(delta * 8.0, 1.0);
      currentCamPos.current.lerp(desiredCamPos, lerpSpeed);
      currentTargetPos.current.lerp(targetVec, lerpSpeed);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentTargetPos.current);
      return;
    }

    // Mode B: Seated Board View (directly from chair facing blackboard)
    if (isSeated) {
      const activeSeatId = seatedSeatId || mySeatId || selectedSeatId || 'R3-S3';
      const [deskX, , deskZ] = getSeatCoordinates(activeSeatId, config.seating);

      // Subtle breathing micro-motion
      const time = state.clock.getElapsedTime();
      const breathY = Math.sin(time * 2.2) * 0.003;
      const breathPitch = Math.sin(time * 2.2) * 0.001;

      // Sightline leaning: [Q] Lean Left, [E] Lean Right to peek around classmate heads
      let targetLean = 0;
      if (keys.current['KeyQ']) targetLean -= 0.24;
      if (keys.current['KeyE']) targetLean += 0.24;
      currentLean.current = THREE.MathUtils.lerp(currentLean.current, targetLean, Math.min(delta * 9.0, 1.0));

      const eyePos = new THREE.Vector3(deskX + currentLean.current, 1.48 + breathY, deskZ + 0.42);
      camera.position.copy(eyePos);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = localYaw.current;
      camera.rotation.x = localPitch.current + breathPitch;
      // Head roll tilt while leaning
      camera.rotation.z = -currentLean.current * 0.22;
      return;
    }

    // Mode C: Second Life Third-Person Avatar Follow Mode
    const pX = playerPosition[0];
    const pY = playerPosition[1];
    const pZ = playerPosition[2];

    const pivot = new THREE.Vector3(pX, pY + 1.42, pZ);

    // Second Life Camera Distance Tiers: Close Personal, Standard Follow, Overview
    const tiers = [
      { distance: 1.85, shoulderOffset: 0.28, heightOffset: 0.32 },
      { distance: 3.15, shoulderOffset: 0.15, heightOffset: 0.52 },
      { distance: 4.85, shoulderOffset: 0.0, heightOffset: 0.85 },
    ];
    const tier = tiers[cameraDistanceTier] || tiers[1];

    const yaw = localYaw.current;
    const pitch = localPitch.current;

    const forwardX = -Math.sin(yaw) * Math.cos(pitch);
    const forwardY = -Math.sin(pitch);
    const forwardZ = -Math.cos(yaw) * Math.cos(pitch);
    const forward = new THREE.Vector3(forwardX, forwardY, forwardZ).normalize();

    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

    const idealOffset = forward.clone().multiplyScalar(-tier.distance);
    idealOffset.addScaledVector(right, tier.shoulderOffset);
    idealOffset.y += tier.heightOffset;

    let targetCamPos = pivot.clone().add(idealOffset);

    // Room wall boundaries collision clamp (Width: 20, Length: 16, Height: 5)
    const minX = -9.2;
    const maxX = 9.2;
    const minZ = -7.3;
    const maxZ = 7.3;
    const minY = 0.3;
    const maxY = 4.8;

    const rayDir = targetCamPos.clone().sub(pivot);
    const maxDist = rayDir.length();
    rayDir.normalize();

    let clampedDist = maxDist;

    if (rayDir.x < -0.001) {
      const d = (minX - pivot.x) / rayDir.x;
      if (d > 0 && d < clampedDist) clampedDist = d;
    } else if (rayDir.x > 0.001) {
      const d = (maxX - pivot.x) / rayDir.x;
      if (d > 0 && d < clampedDist) clampedDist = d;
    }

    if (rayDir.z < -0.001) {
      const d = (minZ - pivot.z) / rayDir.z;
      if (d > 0 && d < clampedDist) clampedDist = d;
    } else if (rayDir.z > 0.001) {
      const d = (maxZ - pivot.z) / rayDir.z;
      if (d > 0 && d < clampedDist) clampedDist = d;
    }

    if (rayDir.y < -0.001) {
      const d = (minY - pivot.y) / rayDir.y;
      if (d > 0 && d < clampedDist) clampedDist = d;
    } else if (rayDir.y > 0.001) {
      const d = (maxY - pivot.y) / rayDir.y;
      if (d > 0 && d < clampedDist) clampedDist = d;
    }

    clampedDist = Math.max(0.4, clampedDist - 0.22);
    targetCamPos = pivot.clone().addScaledVector(rayDir, clampedDist);

    const lerpSpeed = Math.min(delta * 12.0, 1.0);
    currentCamPos.current.lerp(targetCamPos, lerpSpeed);

    const lookTarget = pivot.clone().addScaledVector(forward, 12.0);
    lookTarget.addScaledVector(right, tier.shoulderOffset * 0.3);
    currentTargetPos.current.lerp(lookTarget, lerpSpeed);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentTargetPos.current);
  });

  return null;
};
