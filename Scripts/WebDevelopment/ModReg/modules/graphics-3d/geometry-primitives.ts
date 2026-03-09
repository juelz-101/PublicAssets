
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type Edge = [number, number];

export interface Geometry {
  vertices: Vector3[];
  edges: Edge[];
}

export const createCube = (size: number): Geometry => {
  const s = size / 2;
  const vertices: Vector3[] = [
    { x: -s, y: -s, z: -s },
    { x: s, y: -s, z: -s },
    { x: s, y: s, z: -s },
    { x: -s, y: s, z: -s },
    { x: -s, y: -s, z: s },
    { x: s, y: -s, z: s },
    { x: s, y: s, z: s },
    { x: -s, y: s, z: s },
  ];
  const edges: Edge[] = [
    [0, 1], [1, 2], [2, 3], [3, 0], // back face
    [4, 5], [5, 6], [6, 7], [7, 4], // front face
    [0, 4], [1, 5], [2, 6], [3, 7], // connecting edges
  ];
  return { vertices, edges };
};

export const createIcosahedron = (radius: number): Geometry => {
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;

    const vertices: Vector3[] = [
        { x: -1, y: t, z: 0 }, { x: 1, y: t, z: 0 }, { x: -1, y: -t, z: 0 }, { x: 1, y: -t, z: 0 },
        { y: -1, z: t, x: 0 }, { y: 1, z: t, x: 0 }, { y: -1, z: -t, x: 0 }, { y: 1, z: -t, x: 0 },
        { z: -1, x: t, y: 0 }, { z: 1, x: t, y: 0 }, { z: -1, x: -t, y: 0 }, { z: 1, x: -t, y: 0 }
    ].map(v => ({ x: v.x * radius, y: v.y * radius, z: v.z * radius }));

    const edges: Edge[] = [
        [0, 1], [0, 5], [0, 7], [0, 10], [0, 11],
        [1, 5], [1, 7], [1, 8], [1, 9],
        [2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
        [3, 4], [3, 6], [3, 8], [3, 9],
        [4, 9], [4, 11],
        [5, 9], [5, 11],
        [6, 8], [6, 10],
        [7, 8], [7, 10],
        [8, 9],
        [10, 11]
    ];
    
    return { vertices, edges };
};
