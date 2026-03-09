type AnimationCallback = (deltaTime: number, totalTime: number) => void;

export interface AnimationLoop {
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
}

/**
 * Creates and manages a clean animation loop using requestAnimationFrame.
 * @param callback The function to call on each frame. It receives deltaTime (ms since last frame) and totalTime (ms since start).
 * @returns An object with methods to control the loop: `start()`, `stop()`, `isRunning()`.
 */
export const createAnimationLoop = (callback: AnimationCallback): AnimationLoop => {
  let frameId: number | null = null;
  let lastTime: number | null = null;
  let startTime: number | null = null;

  const loop = (timestamp: number) => {
    if (!lastTime || !startTime) {
      lastTime = timestamp;
      startTime = timestamp;
    }
    
    const deltaTime = timestamp - lastTime;
    const totalTime = timestamp - startTime;
    
    callback(deltaTime, totalTime);

    lastTime = timestamp;
    frameId = requestAnimationFrame(loop);
  };

  const start = () => {
    if (frameId === null) {
      lastTime = null; // Reset time on start
      startTime = null;
      frameId = requestAnimationFrame(loop);
    }
  };

  const stop = () => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  const isRunning = (): boolean => {
    return frameId !== null;
  };

  return { start, stop, isRunning };
};
