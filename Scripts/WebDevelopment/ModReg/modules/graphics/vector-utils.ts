

export interface Vector {
  x: number;
  y: number;
}

/**
 * Creates a new vector object.
 * @param x The x-component.
 * @param y The y-component.
 * @returns A new vector.
 */
export const createVector = (x: number = 0, y: number = 0): Vector => ({ x, y });

/**
 * Adds two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns A new vector representing the sum.
 */
export const add = (v1: Vector, v2: Vector): Vector => ({ x: v1.x + v2.x, y: v1.y + v2.y });

/**
 * Subtracts the second vector from the first.
 * @param v1 The vector to subtract from.
 * @param v2 The vector to subtract.
 * @returns A new vector representing the difference.
 */
export const subtract = (v1: Vector, v2: Vector): Vector => ({ x: v1.x - v2.x, y: v1.y - v2.y });

/**
 * Multiplies a vector by a scalar value.
 * @param v The vector.
 * @param scalar The scalar multiplier.
 * @returns A new, scaled vector.
 */
export const multiply = (v: Vector, scalar: number): Vector => ({ x: v.x * scalar, y: v.y * scalar });

/**
 * Divides a vector by a scalar value.
 * @param v The vector.
 * @param scalar The scalar divisor.
 * @returns A new, scaled vector.
 */
export const divide = (v: Vector, scalar: number): Vector => {
    if (scalar === 0) {
        console.warn("Division by zero is not allowed.");
        return { x: Infinity, y: Infinity };
    }
    return { x: v.x / scalar, y: v.y / scalar };
}

/**
 * Calculates the magnitude (length) of a vector.
 * @param v The vector.
 * @returns The magnitude of the vector.
 */
export const magnitude = (v: Vector): number => Math.sqrt(v.x * v.x + v.y * v.y);

/**
 * Normalizes a vector to a unit length of 1.
 * @param v The vector to normalize.
 * @returns A new unit vector, or a zero vector if the magnitude is zero.
 */
export const normalize = (v: Vector): Vector => {
  const mag = magnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return divide(v, mag);
};

/**
 * Calculates the dot product of two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The dot product.
 */
export const dot = (v1: Vector, v2: Vector): number => v1.x * v2.x + v1.y * v2.y;


/**
 * Calculates the Euclidean distance between two vectors.
 * @param v1 The first vector.
 * @param v2 The second vector.
 * @returns The distance between the vectors.
 */
export const distance = (v1: Vector, v2: Vector): number => {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Rotates a vector by a given angle.
 * @param v The vector to rotate.
 * @param angle The angle in radians.
 * @returns A new, rotated vector.
 */
export const rotate = (v: Vector, angle: number): Vector => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: v.x * cos - v.y * sin,
        y: v.x * sin + v.y * cos
    };
};

/**
 * Linearly interpolates between two vectors.
 * @param v1 The starting vector.
 * @param v2 The ending vector.
 * @param amount The interpolation amount (usually between 0 and 1).
 * @returns A new, interpolated vector.
 */
export const lerp = (v1: Vector, v2: Vector, amount: number): Vector => {
    return {
        x: v1.x + (v2.x - v1.x) * amount,
        y: v1.y + (v2.y - v1.y) * amount
    };
};

/**
 * Constrains a vector's magnitude to a maximum value.
 * @param v The vector.
 * @param max The maximum magnitude.
 * @returns A new vector with its magnitude limited, or the original vector if it's within the limit.
 */
export const limit = (v: Vector, max: number): Vector => {
    const mag = magnitude(v);
    if (mag > max) {
        return multiply(normalize(v), max);
    }
    return { ...v };
};
