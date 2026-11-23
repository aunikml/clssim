import React from 'react';
import { ClassroomFloor } from './ClassroomFloor';
import { ClassroomWalls } from './ClassroomWalls';
import { ClassroomDoor } from './ClassroomDoor';
import { ClassroomWindows } from './ClassroomWindows';
import { ClassroomCeiling } from './ClassroomCeiling';
import { ClassroomLighting } from './ClassroomLighting';
import { useClassroomStore } from '../../../../store/classroomStore';

export const ClassroomEnvironment = () => {
  const config = useClassroomStore((state) => state.config);
  const showCeiling = useClassroomStore((state) => state.showCeiling);

  const { width = 20, length = 16, height = 5 } = config.dimensions || {};
  const doorPosition = config.architecture?.door?.position || [9.9, 0, 4.5];

  return (
    <group>
      <ClassroomLighting />
      <ClassroomFloor width={width} length={length} />
      <ClassroomWalls width={width} length={length} height={height} />
      <ClassroomDoor position={doorPosition} />
      <ClassroomWindows
        x={-width / 2 + 0.1}
        zPositions={config.architecture?.windows?.z_positions || [-4.5, -1.5, 1.5, 4.5]}
      />
      <ClassroomCeiling width={width} length={length} height={height} visible={showCeiling} />
    </group>
  );
};
