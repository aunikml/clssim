import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useClassroomStore } from '../../../store/classroomStore';
import { useSessionStore } from '../../../store/sessionStore';
import { getSeatCoordinates } from '../../../utils/classroomConfig';

export const CAMERA_PRESETS = {
  walk: {
    name: 'Student (Walk/Follow)',
    fov: 64,
  },
  board: {
    name: 'Board Focus',
    position: [0, 2.3, -4.5],
    target: [0, 2.4, -7.85],
    fov: 54,
  },
  teacher: {
    name: 'Teacher Podium',
    position: [0, 1.70, -4.2],
    target: [0, 1.35, 2.0],
    fov: 62,
  },
  observer: {
    name: 'Observer Station',
    position: [8.5, 3.6, 6.8],
    target: [-1.2, 1.5, -2.0],
    fov: 50,
  },
  isometric: {
    name: 'Isometric View',
    position: [12.0, 9.5, 12.0],
    target: [0, 1.2, 0],
    fov: 42,
  },
  topdown: {
    name: 'Top-Down Plan',
    position: [0, 18.0, 0.01],
    target: [0, 0, 0],
    fov: 40,
  },
};

/**
 * Unified Rock-Solid Classroom Camera Controller
 * Seamlessly manages all perspectives without camera unmount conflicts or OrbitControls singularities:
 * 1. Student Walking: Third-person avatar follow with room boundary collision clamping
 * 2. Student Seated: First-person desk eye level facing blackboard with [Q/E] leaning
 * 3. Teacher Mode: First-person eye level at podium/station looking across student rows with mouse-look
 * 4. Observer Mode: High evaluator corner vantage
 * 5. Board Focus Mode: Direct 4K digital screen / chalkboard inspection
 */
export const ClassroomCamera = () => {
  const { camera, gl } = useThree();

  const userRole = useClassroomStore((state) => state.userRole);
  const cameraMode = useClassroomStore((state) => state.cameraMode);
  const setCameraMode = useClassroomStore((state) => state.setCameraMode);
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
  const teacherWorldPosition = useClassroomStore((state) => state.teacherWorldPosition);

  // Interaction & mouse look tracking
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const localYaw = useRef(playerYaw);
  const localPitch = useRef(playerPitch);
  const keys = useRef({});
  const currentLean = useRef(0);

  // Smooth position & target dampeners
  const currentCamPos = useRef(new THREE.Vector3(6.8, 1.8, 5.8));
  const currentTargetPos = useRef(new THREE.Vector3(0, 1.5, -4.0));
  const targetFov = useRef(64);

  // Synchronize orientation on role or camera mode switch
  useEffect(() => {
    const isTeacher = userRole === 'teacher' || cameraMode === 'teacher';
    if (isTeacher) {
      localYaw.current = 0; // Face forward (+Z) toward student desks
      localPitch.current = -0.06;
      targetFov.current = 62;
      const tX = teacherWorldPosition ? teacherWorldPosition[0] : 0;
      const tZ = teacherWorldPosition ? teacherWorldPosition[2] + 0.3 : -4.2;
      currentCamPos.current.set(tX, 1.70, tZ);
      currentTargetPos.current.set(0, 1.35, 2.0);
    } else if (cameraMode === 'observer') {
      localYaw.current = 0;
      localPitch.current = 0;
      targetFov.current = 50;
      currentCamPos.current.set(8.5, 3.6, 6.8);
      currentTargetPos.current.set(-1.2, 1.5, -2.0);
    } else if (cameraMode === 'board') {
      localYaw.current = 0;
      localPitch.current = 0;
      targetFov.current = 54;
      currentCamPos.current.set(0, 2.3, -4.5);
      currentTargetPos.current.set(0, 2.4, -7.85);
    } else if (cameraMode === 'isometric') {
      localYaw.current = 0;
      localPitch.current = 0;
      targetFov.current = 42;
      currentCamPos.current.set(12.0, 9.5, 12.0);
      currentTargetPos.current.set(0, 1.2, 0);
    } else if (cameraMode === 'topdown') {
      localYaw.current = 0;
      localPitch.current = 0;
      targetFov.current = 40;
      currentCamPos.current.set(0, 18.0, 0);
      currentTargetPos.current.set(0, 0, 0);
    } else {
      // Student walk / follow mode
      localYaw.current = typeof playerYaw === 'number' && !isNaN(playerYaw) ? playerYaw : -2.62;
      localPitch.current = typeof playerPitch === 'number' && !isNaN(playerPitch) ? playerPitch : 0.0;
      targetFov.current = isSeated ? 56 : 64;
    }

    if (camera) {
      camera.fov = targetFov.current;
      if (cameraMode === 'topdown') {
        camera.up.set(0, 0, -1);
      } else {
        camera.up.set(0, 1, 0);
      }
      camera.updateProjectionMatrix();
    }
  }, [userRole, cameraMode, isSeated, teacherWorldPosition, camera]);

  // Keyboard navigation & hotkeys:
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      keys.current[e.code] = true;

      if (e.code === 'KeyV' && !isSeated && !inspectTarget && userRole === 'student') {
        cycleCameraTier();
      }
      if (e.code === 'Escape' && inspectTarget) {
        clearInspectTarget();
      }
      if (e.code === 'Space' && isSeated && userRole === 'student') {
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

      // Quick perspective hotkeys:
      switch (e.key) {
        case '1':
          setCameraMode(isSeated ? 'board' : 'walk');
          break;
        case '2':
          if (useClassroomStore.getState().userRole === 'teacher') {
            setCameraMode('teacher');
          }
          break;
        case '3':
          setCameraMode('board');
          break;
        case '4':
          setCameraMode('observer');
          break;
        case '5':
          setCameraMode('isometric');
          break;
        case '6':
          setCameraMode('topdown');
          break;
        case 'l':
        case 'L':
          if (useClassroomStore.getState().userRole === 'teacher') {
            useClassroomStore.getState().toggleLaserPointer();
          }
          break;
        default:
          break;
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
  }, [isSeated, inspectTarget, cycleCameraTier, clearInspectTarget, standUp, userRole, setCameraMode]);

  // Pointer drag to orbit / inspect / mouse-look
  useEffect(() => {
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
        // Orbit around inspected object
        localYaw.current = (localYaw.current - dx * sensitivity) % (2 * Math.PI);
        localPitch.current = THREE.MathUtils.clamp(localPitch.current - dy * sensitivity, -0.6, 0.85);
      } else if (userRole === 'teacher' || cameraMode === 'teacher') {
        // Teacher podium look around classroom
        localYaw.current = (localYaw.current - dx * sensitivity) % (2 * Math.PI);
        localPitch.current = THREE.MathUtils.clamp(localPitch.current - dy * sensitivity, -0.65, 0.65);
      } else if (isSeated) {
        // Seated head swivel looking toward blackboard
        const newYaw = localYaw.current - dx * sensitivity;
        localYaw.current = THREE.MathUtils.clamp(newYaw, -1.25, 1.25);
        localPitch.current = THREE.MathUtils.clamp(localPitch.current - dy * sensitivity, -0.45, 0.45);
        setPlayerLook(localYaw.current, localPitch.current);
      } else {
        // Student 360° avatar follow orbit
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
  }, [gl, inspectTarget, userRole, cameraMode, isSeated, setPlayerLook]);

  // Main per-frame camera execution
  useFrame((state, delta) => {
    if (!camera) return;
    const safeDelta = Math.min(Math.max(delta, 0.001), 0.1);

    // Bulletproof sanitization against NaN or corrupted vectors
    if (isNaN(currentCamPos.current.x) || isNaN(currentCamPos.current.y) || isNaN(currentCamPos.current.z)) {
      currentCamPos.current.set(6.8, 1.8, 5.8);
    }
    if (isNaN(currentTargetPos.current.x) || isNaN(currentTargetPos.current.y) || isNaN(currentTargetPos.current.z)) {
      currentTargetPos.current.set(0, 1.5, -4.0);
    }
    if (isNaN(localYaw.current)) localYaw.current = -2.62;
    if (isNaN(localPitch.current)) localPitch.current = 0.0;

    // Smooth FOV transitions
    if (Math.abs(camera.fov - targetFov.current) > 0.05) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov.current, Math.min(safeDelta * 4, 1.0));
      camera.updateProjectionMatrix();
    }

    // Set correct camera.up depending on mode (Top-Down requires perpendicular up vector)
    if (cameraMode === 'topdown') {
      camera.up.set(0, 0, -1);
    } else {
      camera.up.set(0, 1, 0);
    }

    // MODE 1: Object Inspection Mode
    if (inspectTarget) {
      const targetVec = new THREE.Vector3(...inspectTarget.target);
      const dist = inspectTarget.distance || 3.2;

      const forwardX = -Math.sin(localYaw.current) * Math.cos(localPitch.current);
      const forwardY = -Math.sin(localPitch.current);
      const forwardZ = -Math.cos(localYaw.current) * Math.cos(localPitch.current);
      const forward = new THREE.Vector3(forwardX, forwardY, forwardZ).normalize();

      const desiredCamPos = targetVec.clone().addScaledVector(forward, -dist);
      desiredCamPos.y = Math.max(0.6, desiredCamPos.y);

      const lerpSpeed = Math.min(safeDelta * 8.0, 1.0);
      currentCamPos.current.lerp(desiredCamPos, lerpSpeed);
      currentTargetPos.current.lerp(targetVec, lerpSpeed);

      if (isFinite(currentCamPos.current.x) && isFinite(currentTargetPos.current.x)) {
        camera.position.copy(currentCamPos.current);
        camera.lookAt(currentTargetPos.current);
      }
      return;
    }

    // MODE 2: Teacher Mode (Podium / Pacing Station Looking Across Student Desks)
    if (userRole === 'teacher' || cameraMode === 'teacher') {
      const tX = teacherWorldPosition ? teacherWorldPosition[0] : 0;
      const tZ = teacherWorldPosition ? teacherWorldPosition[2] + 0.3 : -4.2;
      const eyePos = new THREE.Vector3(tX, 1.70, tZ);

      // Mouse-look direction (looking forward toward students at +Z)
      const yaw = localYaw.current;
      const pitch = localPitch.current;

      const forwardX = -Math.sin(yaw) * Math.cos(pitch);
      const forwardY = Math.sin(pitch);
      const forwardZ = Math.cos(yaw) * Math.cos(pitch);
      const forward = new THREE.Vector3(forwardX, forwardY, forwardZ).normalize();

      const lookTarget = eyePos.clone().addScaledVector(forward, 10.0);

      const lerpSpeed = Math.min(safeDelta * 10.0, 1.0);
      currentCamPos.current.lerp(eyePos, lerpSpeed);
      currentTargetPos.current.lerp(lookTarget, lerpSpeed);

      if (isFinite(currentCamPos.current.x) && isFinite(currentTargetPos.current.x)) {
        camera.position.copy(currentCamPos.current);
        camera.lookAt(currentTargetPos.current);
      }
      return;
    }

    // MODE 3: Observer / Evaluator Vantage
    if (cameraMode === 'observer') {
      const eyePos = new THREE.Vector3(8.5, 3.6, 6.8);
      const targetVec = new THREE.Vector3(-1.2, 1.5, -2.0);
      const lerpSpeed = Math.min(safeDelta * 6.0, 1.0);
      currentCamPos.current.lerp(eyePos, lerpSpeed);
      currentTargetPos.current.lerp(targetVec, lerpSpeed);
      if (isFinite(currentCamPos.current.x) && isFinite(currentTargetPos.current.x)) {
        camera.position.copy(currentCamPos.current);
        camera.lookAt(currentTargetPos.current);
      }
      return;
    }

    // MODE 4: Board Focus Mode
    if (cameraMode === 'board') {
      const eyePos = new THREE.Vector3(0, 2.3, -4.5);
      const targetVec = new THREE.Vector3(0, 2.4, -7.85);
      const lerpSpeed = Math.min(safeDelta * 6.0, 1.0);
      currentCamPos.current.lerp(eyePos, lerpSpeed);
      currentTargetPos.current.lerp(targetVec, lerpSpeed);
      if (isFinite(currentCamPos.current.x) && isFinite(currentTargetPos.current.x)) {
        camera.position.copy(currentCamPos.current);
        camera.lookAt(currentTargetPos.current);
      }
      return;
    }

    // MODE 5: Isometric Overview
    if (cameraMode === 'isometric') {
      const eyePos = new THREE.Vector3(12.0, 9.5, 12.0);
      const targetVec = new THREE.Vector3(0, 1.2, 0);
      const lerpSpeed = Math.min(safeDelta * 6.0, 1.0);
      currentCamPos.current.lerp(eyePos, lerpSpeed);
      currentTargetPos.current.lerp(targetVec, lerpSpeed);
      if (isFinite(currentCamPos.current.x) && isFinite(currentTargetPos.current.x)) {
        camera.position.copy(currentCamPos.current);
        camera.lookAt(currentTargetPos.current);
      }
      return;
    }

    // MODE 6: Top-Down Plan (Looking directly down from high elevation)
    if (cameraMode === 'topdown') {
      const eyePos = new THREE.Vector3(0, 18.0, 0);
      const targetVec = new THREE.Vector3(0, 0, 0);
      const lerpSpeed = Math.min(safeDelta * 6.0, 1.0);
      currentCamPos.current.lerp(eyePos, lerpSpeed);
      currentTargetPos.current.lerp(targetVec, lerpSpeed);
      if (isFinite(currentCamPos.current.x) && isFinite(currentTargetPos.current.x)) {
        camera.position.copy(currentCamPos.current);
        camera.lookAt(currentTargetPos.current);
      }
      return;
    }

    // MODE 7: Student Seated View
    if (isSeated) {
      const activeSeatId = seatedSeatId || mySeatId || selectedSeatId || 'R3-S3';
      const [deskX, , deskZ] = getSeatCoordinates(activeSeatId, config.seating);

      const time = state.clock.getElapsedTime();
      const breathY = Math.sin(time * 2.2) * 0.003;
      const breathPitch = Math.sin(time * 2.2) * 0.001;

      let targetLean = 0;
      if (keys.current['KeyQ']) targetLean -= 0.24;
      if (keys.current['KeyE']) targetLean += 0.24;
      currentLean.current = THREE.MathUtils.lerp(currentLean.current, targetLean, Math.min(safeDelta * 9.0, 1.0));

      const eyePos = new THREE.Vector3(deskX + currentLean.current, 1.48 + breathY, deskZ + 0.42);
      camera.position.copy(eyePos);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = localYaw.current;
      camera.rotation.x = localPitch.current + breathPitch;
      camera.rotation.z = -currentLean.current * 0.22;
      return;
    }

    // MODE 8: Student 3rd-Person Avatar Follow Mode
    const pX = (playerPosition && typeof playerPosition[0] === 'number' && !isNaN(playerPosition[0])) ? playerPosition[0] : 6.8;
    const pY = (playerPosition && typeof playerPosition[1] === 'number' && !isNaN(playerPosition[1])) ? playerPosition[1] : 0;
    const pZ = (playerPosition && typeof playerPosition[2] === 'number' && !isNaN(playerPosition[2])) ? playerPosition[2] : 4.2;

    const pivot = new THREE.Vector3(pX, pY + 1.42, pZ);

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

    // Wall collision clamping
    const minX = -9.2;
    const maxX = 9.2;
    const minZ = -7.3;
    const maxZ = 7.3;
    const minY = 0.3;
    const maxY = 4.8;

    const rayDir = targetCamPos.clone().sub(pivot);
    const maxDist = rayDir.length();
    if (maxDist > 0.001) {
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
    }

    const lerpSpeed = Math.min(safeDelta * 12.0, 1.0);
    currentCamPos.current.lerp(targetCamPos, lerpSpeed);

    const lookTarget = pivot.clone().addScaledVector(forward, 12.0);
    lookTarget.addScaledVector(right, tier.shoulderOffset * 0.3);
    currentTargetPos.current.lerp(lookTarget, lerpSpeed);

    // Safety guard against NaN & non-finite numbers
    if (
      isFinite(currentCamPos.current.x) &&
      isFinite(currentCamPos.current.y) &&
      isFinite(currentCamPos.current.z) &&
      isFinite(currentTargetPos.current.x) &&
      isFinite(currentTargetPos.current.y) &&
      isFinite(currentTargetPos.current.z)
    ) {
      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentTargetPos.current);
    }
  });

  return null;
};
export default ClassroomCamera;
