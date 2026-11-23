import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useClassroomStore } from '../../../store/classroomStore';
import { useSessionStore } from '../../../store/sessionStore';
import { getSeatCoordinates } from '../../../utils/classroomConfig';

export const FirstPersonLookController = () => {
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

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const localYaw = useRef(playerYaw);
  const localPitch = useRef(playerPitch);

  const isFirstPerson = cameraMode === 'walk' || cameraMode === 'board';

  // Keep local refs in sync when state changes externally (e.g. sitDown, standUp)
  useEffect(() => {
    localYaw.current = playerYaw;
    localPitch.current = playerPitch;
  }, [playerYaw, playerPitch, cameraMode, isSeated]);

  useEffect(() => {
    if (!isFirstPerson) return;

    const dom = gl.domElement;

    const handlePointerDown = (e) => {
      // Primary button drag to look
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

      const sensitivity = 0.0028;

      if (cameraMode === 'walk') {
        localYaw.current -= dx * sensitivity;
        localPitch.current = Math.max(-1.15, Math.min(1.15, localPitch.current - dy * sensitivity));
      } else if (cameraMode === 'board') {
        // Seated head swivel: ±80° horizontal turn around blackboard center
        const baseYaw = Math.PI;
        const newYaw = localYaw.current - dx * sensitivity;
        localYaw.current = THREE.MathUtils.clamp(newYaw, baseYaw - 1.4, baseYaw + 1.4);
        localPitch.current = THREE.MathUtils.clamp(localPitch.current - dy * sensitivity, -0.65, 0.75);
      }

      setPlayerLook(localYaw.current, localPitch.current);
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
  }, [isFirstPerson, cameraMode, gl, setPlayerLook]);

  useFrame(() => {
    if (!isFirstPerson) return;

    if (cameraMode === 'walk') {
      // First-person eye height standing/walking
      camera.position.set(playerPosition[0], 1.55, playerPosition[2]);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = localYaw.current;
      camera.rotation.x = localPitch.current;
      camera.rotation.z = 0;
    } else if (cameraMode === 'board') {
      // Seated eye height directly at student desk
      const activeSeatId = seatedSeatId || mySeatId || selectedSeatId || 'R3-S3';
      const [deskX, , deskZ] = getSeatCoordinates(activeSeatId, config.seating);

      camera.position.set(deskX, 1.46, deskZ + 0.38);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = localYaw.current;
      camera.rotation.x = localPitch.current;
      camera.rotation.z = 0;
    }
  });

  return null;
};
