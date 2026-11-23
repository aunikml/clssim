import React from 'react';
import { useClassroomStore } from '../../../../store/classroomStore';
import { useAuthStore } from '../../../../store/authStore';
import { ClassroomAvatar } from './ClassroomAvatar';

export const StudentPlayerAvatar = () => {
  const userRole = useClassroomStore((state) => state.userRole);
  const playerPosition = useClassroomStore((state) => state.playerPosition);
  const playerRotation = useClassroomStore((state) => state.playerRotation);
  const isSeated = useClassroomStore((state) => state.isSeated);
  const isWalking = useClassroomStore((state) => state.isWalking);
  const activeGesture = useClassroomStore((state) => state.activeGesture);
  const isMicMuted = useClassroomStore((state) => state.isMicMuted);

  // When user is playing as Teacher, hide the student player avatar
  if (userRole === 'teacher') return null;

  const user = useAuthStore((state) => state.user);
  const playerName = user?.profile?.display_name || user?.username || 'You (Student)';

  const isFirstPerson = isSeated && !activeGesture;

  // Determine posture based on student player state & active Second Life emote
  let posture = 'idle';
  if (activeGesture) {
    posture = activeGesture;
  } else if (isSeated) {
    posture = 'seating';
  } else if (isWalking) {
    posture = 'walking';
  }

  return (
    <ClassroomAvatar
      position={playerPosition}
      rotation={[0, playerRotation, 0]}
      worldPosition={playerPosition}
      name={playerName}
      role="Student"
      posture={posture}
      isSpeaking={!isMicMuted}
      isFirstPerson={isFirstPerson}
      shirtColor="#0284c7"
      pantsColor="#1e293b"
      seed="player"
    />
  );
};
