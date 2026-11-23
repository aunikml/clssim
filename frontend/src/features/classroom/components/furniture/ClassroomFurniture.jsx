import React, { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { StudentDesk } from './StudentDesk';
import { TeacherDesk } from './TeacherDesk';
import { Blackboard } from './Blackboard';
import { DigitalSmartScreen } from './DigitalSmartScreen';
import { StandingWhiteboard } from './StandingWhiteboard';
import { Bookshelf } from './Bookshelf';
import { WallDecorations } from './WallDecorations';
import { TeacherAvatar } from './TeacherAvatar';
import { BlackboardChalkPhysics } from './BlackboardChalkPhysics';
import { useClassroomStore } from '../../../../store/classroomStore';
import { useSessionStore } from '../../../../store/sessionStore';
import { computeClassroomSeatingLayout } from '../../../../utils/classroomConfig';

export const ClassroomFurniture = () => {
  const config = useClassroomStore((state) => state.config);
  const selectedSeatId = useClassroomStore((state) => state.selectedSeatId);
  const setSelectedSeatId = useClassroomStore((state) => state.setSelectedSeatId);
  const teachingDisplayMode = useClassroomStore((state) => state.teachingDisplayMode);

  const seats = useSessionStore((state) => state.seats);
  const mySeatId = useSessionStore((state) => state.mySeatId);
  const session = useSessionStore((state) => state.session);
  const classSize = useClassroomStore((state) => state.classSize) || 20;

  // Programmatically generate dynamic desks (15 to 40)
  const deskList = useMemo(() => {
    const layout = computeClassroomSeatingLayout(classSize);
    return layout.desks;
  }, [classSize]);

  const activeTeacherName = session?.active_teacher?.display_name || session?.active_teacher?.username || 'Teacher John';

  return (
    <group>
      {/* 1. Teaching Area at Front (-Z) - Toggleable between Traditional Chalkboard and Digital Smart Screen + Whiteboard */}
      {teachingDisplayMode === 'digital_screen' ? (
        <>
          {/* High-Tech 4K Digital Presentation Smart Screen */}
          <DigitalSmartScreen
            position={config.teaching_area?.blackboard?.position || [0, 2.4, -7.85]}
            width={config.teaching_area?.blackboard?.width || 7.2}
            height={config.teaching_area?.blackboard?.height || 2.4}
          />

          {/* Mobile Standing Dry-Erase Whiteboard with Clinical Cardiology Notes */}
          <StandingWhiteboard position={[3.3, 0, -5.4]} rotation={[0, -0.45, 0]} />
        </>
      ) : (
        <>
          {/* Traditional Slate Chalkboard */}
          <Blackboard
            position={config.teaching_area?.blackboard?.position || [0, 2.4, -7.85]}
            width={config.teaching_area?.blackboard?.width || 7.2}
            height={config.teaching_area?.blackboard?.height || 2.4}
          />

          {/* Blackboard Wooden Chalk Ledge Physics Collider */}
          <RigidBody type="fixed" friction={0.9} restitution={0.15}>
            <CuboidCollider args={[3.6, 0.04, 0.1]} position={[0, 1.2, -7.75]} />
          </RigidBody>

          {/* Physical Chalk Pieces & Eraser on Blackboard Ledge */}
          <BlackboardChalkPhysics />
        </>
      )}

      <RigidBody type="fixed" friction={0.6} restitution={0.2}>
        <CuboidCollider args={[0.9, 0.4, 0.5]} position={[-3.5, 0.4, -4.8]} rotation={[0, 0.2, 0]} />
      </RigidBody>

      <TeacherDesk
        position={config.teaching_area?.teacher_desk?.position || [-3.5, 0, -4.8]}
        rotation={config.teaching_area?.teacher_desk?.rotation || [0, 0.2, 0]}
      />

      <TeacherAvatar
        position={config.teaching_area?.teacher_avatar?.position || [0, 0, -4.5]}
        rotation={config.teaching_area?.teacher_avatar?.rotation || [0, 0, 0]}
        name={activeTeacherName}
        role="Teacher"
      />

      {/* 2. Room Props & Storage */}
      <Bookshelf
        position={config.architecture?.decorations?.bookshelf || [-9.2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      <WallDecorations />

      {/* 3. Programmatic Student Desks & Chairs (20 seats) */}
      {deskList.map((desk) => {
        const seatInfo = seats.find((s) => s.seat_identifier === desk.id);
        const isOccupied = seatInfo?.status === 'occupied';
        const isMine = desk.id === mySeatId;
        const isSelected = desk.id === selectedSeatId;

        return (
          <StudentDesk
            key={desk.id}
            seatIdentifier={desk.id}
            position={desk.position}
            status={isOccupied ? 'occupied' : 'available'}
            occupiedBy={seatInfo?.occupied_by}
            isMySeat={isMine}
            isSelected={isSelected}
            onSelect={(id) => setSelectedSeatId(id)}
          />
        );
      })}
    </group>
  );
};
