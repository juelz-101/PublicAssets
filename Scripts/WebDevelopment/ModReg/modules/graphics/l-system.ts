
import type { Vector } from './vector-utils';

export interface TurtleState {
  pos: Vector;
  angle: number; // in degrees
}

export type DrawCommand = {
    type: 'line';
    from: Vector;
    to: Vector;
    depth: number;
} | {
    type: 'noop';
};

export interface LSystem {
  axiom: string;
  rules: Record<string, string>;
  angle: number;
  initialAngle?: number;
}

/**
 * Generates the final instruction string for an L-System.
 * @param axiom The starting string.
 * @param rules An object mapping characters to their replacement strings.
 * @param iterations The number of times to apply the rules.
 * @returns The final generated string.
 */
export const generateLSystemString = (axiom: string, rules: Record<string, string>, iterations: number): string => {
  let currentString = axiom;
  for (let i = 0; i < iterations; i++) {
    currentString = currentString.split('').map(char => rules[char] || char).join('');
  }
  return currentString;
};

/**
 * Interprets an L-System string and yields drawing commands.
 * This is a generator function for easy animation.
 * @param system The L-System definition.
 * @param iterations The number of iterations to generate the string.
 * @param initialLength The initial length of a forward movement.
 * @param lengthFactor How much the length changes each iteration (for some systems).
 * @param startPos The starting position of the turtle.
 * @returns A generator that yields DrawCommand objects.
 */
export function* interpretLSystem(
    system: LSystem,
    iterations: number,
    initialLength: number,
    lengthFactor: number,
    startPos: Vector
): Generator<DrawCommand> {
    const instructionString = generateLSystemString(system.axiom, system.rules, iterations);
    const length = initialLength * Math.pow(lengthFactor, iterations);
    
    let turtle: TurtleState = {
        pos: startPos,
        angle: system.initialAngle || -90,
    };
    
    const stack: TurtleState[] = [];

    for (const char of instructionString) {
        switch (char) {
            case 'F':
            case 'G':
                const from = { ...turtle.pos };
                const angleRad = turtle.angle * (Math.PI / 180);
                turtle.pos.x += length * Math.cos(angleRad);
                turtle.pos.y += length * Math.sin(angleRad);
                yield { type: 'line', from, to: { ...turtle.pos }, depth: stack.length };
                break;
            case '+':
                turtle.angle += system.angle;
                break;
            case '-':
                turtle.angle -= system.angle;
                break;
            case '[':
                stack.push({ ...turtle, pos: { ...turtle.pos } });
                break;
            case ']':
                const popped = stack.pop();
                if (popped) {
                    turtle = popped;
                }
                break;
            default:
                // For variables that don't draw anything (like X, Y in plant example)
                yield { type: 'noop' };
                break;
        }
    }
}
