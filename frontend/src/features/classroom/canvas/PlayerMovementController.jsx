import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useClassroomStore } from '../../../store/classroomStore';
import { getSeatCoordinates } from '../../../utils/classroomConfig';
import { spatialAudioService } from '../../../services/spatialAudioService';
import { footstepAudioService } from '../../../services/footstepAudioService';
import { physicsFoleyAudioService } from '../../../services/physicsFoleyAudioService';

export const PlayerMovementController = () => {
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector2(0, 0));
  const currentRotation = useRef(0);

  const isSeated = useClassroomStore((state) => state.isSeated);
  const playerPosition = useClassroomStore((state) => state.playerPosition);
  const playerYaw = useClassroomStore((state) => state.playerYaw);
  const setPlayerPosition = useClassroomStore((state) => state.setPlayerPosition);
  const setPlayerRotation = useClassroomStore((state) => state.setPlayerRotation);
  const setIsWalking = useClassroomStore((state) => state.setIsWalking);
  const targetWalkPosition = useClassroomStore((state) => state.targetWalkPosition);
  const setTargetWalkPosition = useClassroomStore((state) => state.setTargetWalkPosition);
  const sitDown = useClassroomStore((state) => state.sitDown);
  const standUp = useClassroomStore((state) => state.standUp);
  const setPromptNearSeatId = useClassroomStore((state) => state.setPromptNearSeatId);
  const updatePedagogicalMetrics = useClassroomStore((state) => state.updatePedagogicalMetrics);
  const config = useClassroomStore((state) => state.config);
  const toggleBoardModal = useClassroomStore((state) => state.toggleBoardModal);
  const toggleHandRaise = useClassroomStore((state) => state.toggleHandRaise);
  const inspectTarget = useClassroomStore((state) => state.inspectTarget);
  const clearInspectTarget = useClassroomStore((state) => state.clearInspectTarget);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      keys.current[e.code] = true;

      // 'E' Key: Sit Down at desk when walking; Stand Up when already seated
      if (e.code === 'KeyE') {
        const state = useClassroomStore.getState();
        if (state.isSeated) {
          physicsFoleyAudioService.playChairScrape(0.24);
          standUp();
        } else if (state.promptNearSeatId) {
          physicsFoleyAudioService.playChairScrape(0.2);
          sitDown(state.promptNearSeatId);
        }
      }

      // 'N' Key: Toggle Desk Notebook
      if (e.code === 'KeyN') {
        const state = useClassroomStore.getState();
        if (state.isNotebookOpen) {
          state.closeNotebook();
        } else {
          state.openNotebook();
        }
      }

      // 'F' Key: Toggle Connected Student Device
      if (e.code === 'KeyF') {
        const state = useClassroomStore.getState();
        if (state.isDeviceInspected) {
          state.closeDeviceInspection();
        } else {
          state.openDeviceInspection();
        }
      }

      // 'O' Key: Toggle Session Agenda / Objectives
      if (e.code === 'KeyO') {
        useClassroomStore.getState().toggleAgenda();
      }

      // 'R' Key: Toggle Session Report Card
      if (e.code === 'KeyR' && !e.ctrlKey) {
        useClassroomStore.getState().toggleReportCard();
      }

      // Spacebar or 'X' Key to stand up if seated
      if (e.code === 'Space' || e.code === 'KeyX') {
        if (useClassroomStore.getState().isSeated) {
          e.preventDefault();
          physicsFoleyAudioService.playChairScrape(0.24);
          standUp();
        }
      }

      // 'B' Key to toggle Interactive Blackboard Drawing Modal
      if (e.code === 'KeyB') {
        toggleBoardModal();
      }

      // 'T' Key to toggle Display Mode (Traditional Chalkboard vs 4K Digital Screen + Whiteboard)
      if (e.code === 'KeyT' && !e.ctrlKey && !e.altKey) {
        useClassroomStore.getState().toggleTeachingDisplayMode();
      }

      // 'H' Key to toggle Hand Raising
      if (e.code === 'KeyH') {
        toggleHandRaise();
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
  }, [sitDown, standUp, toggleBoardModal, toggleHandRaise]);

  useFrame((state, delta) => {
    const role = useClassroomStore.getState().userRole;
    if (role !== 'student' || isSeated || inspectTarget) {
      velocity.current.set(0, 0);
      setIsWalking(false);
      return;
    }

    let inputForward = 0; // W / S
    let inputStrafe = 0;  // A / D

    if (keys.current['KeyW'] || keys.current['ArrowUp']) inputForward += 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) inputForward -= 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) inputStrafe -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) inputStrafe += 1;

    // Dignified virtual campus stroll (2.2 m/s)
    const maxSpeed = 2.2;

    let posX = playerPosition[0];
    let posZ = playerPosition[2];

    const desiredVelocity = new THREE.Vector2(0, 0);

    if (inputForward !== 0 || inputStrafe !== 0) {
      if (targetWalkPosition) setTargetWalkPosition(null);
      if (inspectTarget) clearInspectTarget();

      const forwardX = -Math.sin(playerYaw);
      const forwardZ = -Math.cos(playerYaw);

      const rightX = Math.cos(playerYaw);
      const rightZ = -Math.sin(playerYaw);

      let dirX = forwardX * inputForward + rightX * inputStrafe;
      let dirZ = forwardZ * inputForward + rightZ * inputStrafe;
      const len = Math.hypot(dirX, dirZ);
      if (len > 0.001) {
        dirX /= len;
        dirZ /= len;
      }

      desiredVelocity.set(dirX * maxSpeed, dirZ * maxSpeed);

      // Smooth turning slerp
      const targetAngle = Math.atan2(dirX, dirZ);
      let angleDiff = targetAngle - currentRotation.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      currentRotation.current += angleDiff * Math.min(delta * 12.0, 1.0);
      setPlayerRotation(currentRotation.current);
    } else if (targetWalkPosition) {
      const diffX = targetWalkPosition[0] - posX;
      const diffZ = targetWalkPosition[1] - posZ;
      const dist = Math.hypot(diffX, diffZ);

      if (dist > 0.28) {
        const speed = Math.min(2.5, dist * 2.5);
        desiredVelocity.set((diffX / dist) * speed, (diffZ / dist) * speed);

        const targetAngle = Math.atan2(diffX, diffZ);
        currentRotation.current = targetAngle;
        setPlayerRotation(targetAngle);
      } else {
        const targetSeat = targetWalkPosition.seatId;
        setTargetWalkPosition(null);
        if (targetSeat) {
          sitDown(targetSeat);
        }
      }
    }

    // Natural friction damping
    velocity.current.lerp(desiredVelocity, Math.min(delta * 10.0, 1.0));

    const currentSpeed = velocity.current.length();
    const moving = currentSpeed > 0.12;

    posX += velocity.current.x * delta;
    posZ += velocity.current.y * delta;

    if (moving) {
      footstepAudioService.playStep(false);
    }

    // Classroom wall boundaries
    posX = THREE.MathUtils.clamp(posX, -8.8, 8.8);
    posZ = THREE.MathUtils.clamp(posZ, -6.8, 6.8);

    // Desk solid collision avoidance & aisle sliding
    const rows = config.seating?.rows || 4;
    const cols = config.seating?.columns || 5;
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const seatId = `R${r}-S${c}`;
        const [deskX, , deskZ] = getSeatCoordinates(seatId, config.seating);
        const halfW = 0.52;
        const halfD = 0.38;
        const dx = posX - deskX;
        const dz = posZ - deskZ;
        if (Math.abs(dx) < halfW && Math.abs(dz) < halfD) {
          const overlapX = halfW - Math.abs(dx);
          const overlapZ = halfD - Math.abs(dz);
          if (overlapX < overlapZ) {
            posX = deskX + (dx > 0 ? halfW : -halfW);
          } else {
            posZ = deskZ + (dz > 0 ? halfD : -halfD);
          }
        }
      }
    }

    if (moving || posX !== playerPosition[0] || posZ !== playerPosition[2]) {
      setPlayerPosition([posX, 0, posZ]);
    }

    setIsWalking(moving);

    // Detect closest desk for proximity prompt [E]
    let closestSeat = null;
    let minDeskDist = 1.35;

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const seatId = `R${r}-S${c}`;
        const [deskX, , deskZ] = getSeatCoordinates(seatId, config.seating);
        const dist = Math.hypot(posX - deskX, posZ - (deskZ + 0.45));
        if (dist < minDeskDist) {
          minDeskDist = dist;
          closestSeat = seatId;
        }
      }
    }

    setPromptNearSeatId(closestSeat);

    // Update 3D spatial audio listener position & head orientation
    const forwardX = -Math.sin(playerYaw);
    const forwardZ = -Math.cos(playerYaw);
    spatialAudioService.updateListener(posX, 1.55, posZ, forwardX, 0, forwardZ);

    // Update pedagogical acoustic & visual metrics
    const distToTeacher = spatialAudioService.getTeacherDistance();
    updatePedagogicalMetrics(distToTeacher);
  });

  return null;
};
