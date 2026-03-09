
import type { Vector } from './vector-utils';

export interface CliffordParams {
  a: number;
  b: number;
  c: number;
  d: number;
}

/**
 * A generator function that iteratively calculates points for a Clifford Attractor.
 * Yields points in batches for efficient, non-blocking rendering.
 *
 * @param params The four parameters (a, b, c, d) that define the attractor's shape.
 * @param startX The initial x-coordinate.
 * @param startY The initial y-coordinate.
 * @param iterations The total number of points to generate.
 * @param batchSize The number of points to yield in each batch.
 * @returns A generator that yields arrays of Point objects.
 */
export function* generateCliffordPoints(
  params: CliffordParams,
  startX: number,
  startY: number,
  iterations: number,
  batchSize: number
): Generator<Vector[]> {
  const { a, b, c, d } = params;
  let x = startX;
  let y = startY;
  let batch: Vector[] = [];

  for (let i = 0; i < iterations; i++) {
    const nextX = Math.sin(a * y) + c * Math.cos(a * x);
    const nextY = Math.sin(b * x) + d * Math.cos(b * y);
    
    x = nextX;
    y = nextY;

    batch.push({ x, y });

    if (batch.length >= batchSize) {
      yield batch;
      batch = [];
    }
  }

  if (batch.length > 0) {
    yield batch;
  }
}
