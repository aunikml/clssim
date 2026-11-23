/**
 * Default classroom dimensions and layout configuration.
 * Mirrors the Django backend configuration schema.
 */
export const defaultClassroomConfig = {
  dimensions: {
    width: 20.0,
    length: 16.0,
    height: 5.0,
  },
  environment: 'traditional',
  seating: {
    rows: 4,
    columns: 5,
    spacing_x: 2.4,
    spacing_z: 2.2,
    start_x: -4.8,
    start_z: 3.5,
  },
  teaching_area: {
    blackboard: {
      width: 7.2,
      height: 2.4,
      position: [0, 2.4, -7.85],
    },
    teacher_desk: {
      position: [-3.5, 0, -4.8],
      rotation: [0, 0.2, 0],
    },
    teacher_avatar: {
      position: [0, 0, -4.5],
      rotation: [0, 0, 0],
    },
  },
  architecture: {
    door: {
      wall: 'right',
      position: [9.9, 0, 4.5],
    },
    windows: {
      wall: 'left',
      count: 4,
      height: 2.2,
      width: 2.0,
      y_position: 2.4,
      z_positions: [-4.5, -1.5, 1.5, 4.5],
    },
    decorations: {
      clock: [0, 4.2, -7.85],
      noticeboard: [5.5, 2.5, -7.85],
      bookshelf: [-9.2, 0, 0],
    },
  },
  camera: {
    default_position: [0, 9, 14],
    target: [0, 1.5, 0],
    fov: 50,
    min_distance: 0.8,
    max_distance: 28,
    max_polar_angle: Math.PI / 2 - 0.05,
  },
};

/**
 * Dynamically computes classroom seating layout for any class size between 15 and 40.
 * Automatically chooses optimal column count and spacing to maintain generous walkway clearances.
 */
export function computeClassroomSeatingLayout(classSize = 20) {
  const size = Math.max(15, Math.min(40, parseInt(classSize, 10) || 20));

  // Determine optimal column count based on student count
  let cols = 5;
  let spacingX = 2.4;
  let spacingZ = 2.1;

  if (size > 35) {
    cols = 8;
    spacingX = 1.85;
    spacingZ = 1.75;
  } else if (size > 28) {
    cols = 7;
    spacingX = 2.0;
    spacingZ = 1.85;
  } else if (size > 20) {
    cols = 6;
    spacingX = 2.2;
    spacingZ = 1.95;
  } else {
    cols = 5;
    spacingX = 2.4;
    spacingZ = 2.1;
  }

  const rows = Math.ceil(size / cols);
  const startX = -((cols - 1) * spacingX) / 2.0;
  const startZ = 4.2;

  const desks = [];
  for (let i = 0; i < size; i++) {
    const r = Math.floor(i / cols) + 1;
    const c = (i % cols) + 1;
    const id = `R${r}-S${c}`;
    const x = startX + (c - 1) * spacingX;
    const z = (startZ - (rows - 1) * spacingZ) + (r - 1) * spacingZ;
    desks.push({ id, row: r, col: c, position: [x, 0, z] });
  }

  return {
    classSize: size,
    rows,
    columns: cols,
    spacing_x: spacingX,
    spacing_z: spacingZ,
    start_x: startX,
    start_z: startZ,
    desks,
  };
}

/**
 * Calculates 3D desk center coordinates for any seat identifier (e.g. 'R2-S3')
 */
export function getSeatCoordinates(seatId, seatingConfig = defaultClassroomConfig.seating) {
  const match = seatId?.match(/R(\d+)-S(\d+)/i);
  const rows = seatingConfig.rows || 4;
  const cols = seatingConfig.columns || 5;
  const spacingX = seatingConfig.spacing_x || 2.4;
  const spacingZ = seatingConfig.spacing_z || 2.2;
  const startX = seatingConfig.start_x ?? -((cols - 1) * spacingX) / 2.0;
  const startZ = seatingConfig.start_z ?? 3.5;

  const r = match ? Math.min(Math.max(parseInt(match[1], 10), 1), rows) : 3;
  const c = match ? Math.min(Math.max(parseInt(match[2], 10), 1), cols) : 3;

  const x = startX + (c - 1) * spacingX;
  const z = (startZ - (rows - 1) * spacingZ) + (r - 1) * spacingZ;
  return [x, 0, z];
}
