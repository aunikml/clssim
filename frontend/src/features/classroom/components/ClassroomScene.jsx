import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { ClassroomEnvironment } from './environment/ClassroomEnvironment';
import { ClassroomFurniture } from './furniture/ClassroomFurniture';
import { StudentPlayerAvatar } from './furniture/StudentPlayerAvatar';
import { StudentDeskFirstPersonArms } from './furniture/StudentDeskFirstPersonArms';
import { PlayerMovementController } from '../canvas/PlayerMovementController';
import { ClassroomDisruptionsController } from './physics/ClassroomDisruptionsController';
import { useClassroomStore } from '../../../store/classroomStore';
import { digitalScreenService } from '../../../services/digitalScreenService';

export const ClassroomScene = () => {
  const activeDisruptionEvent = useClassroomStore((state) => state.activeDisruptionEvent);
  const setActiveDisruptionEvent = useClassroomStore((state) => state.setActiveDisruptionEvent);

  // Centrally drive 4K digital screen & student devices rendering each frame
  useFrame(() => {
    const store = useClassroomStore.getState();
    if (store.teachingDisplayMode === 'digital_screen' || store.showStudentDevices || store.isDeviceInspected) {
      digitalScreenService.render(
        null,
        store.lectureTimer,
        store.lectureTranscript,
        store.lectureState,
        store.currentQuizQuestionIndex,
        store.quizFeedback
      );
    }
  });

  return (
    <Physics gravity={[0, -9.81, 0]}>
      <group>
        <ClassroomEnvironment />
        <ClassroomFurniture />
        <StudentPlayerAvatar />
        <StudentDeskFirstPersonArms />
        <PlayerMovementController />
        <ClassroomDisruptionsController
          activeEvent={activeDisruptionEvent}
          onEventComplete={() => setActiveDisruptionEvent(null)}
        />
      </group>
    </Physics>
  );
};
