
// A generic function type
type AnyFunction = (...args: any[]) => any;

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @returns The new debounced function.
 */
export const debounce = <F extends AnyFunction>(func: F, wait: number): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(this: ThisParameterType<F>, ...args: Parameters<F>) {
    const context = this;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
};

/**
 * Creates a throttled function that only invokes `func` at most once per every `wait` milliseconds.
 * @param func The function to throttle.
 * @param wait The number of milliseconds to throttle invocations to.
 * @returns The new throttled function.
 */
export const throttle = <F extends AnyFunction>(func: F, wait: number): ((...args: Parameters<F>) => void) => {
  let inThrottle = false;
  
  return function(this: ThisParameterType<F>, ...args: Parameters<F>) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
};

/**
 * Attempts to execute an async function, retrying a specified number of times on failure.
 * @param asyncFn The async function to execute.
 * @param retries The number of times to retry on failure.
 * @param delay The delay in milliseconds between retries.
 * @returns A promise that resolves with the result of `asyncFn` or rejects after all retries fail.
 */
export const retry = <T>(asyncFn: () => Promise<T>, retries: number, delay: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const attempt = (n: number) => {
      asyncFn()
        .then(resolve)
        .catch((error) => {
          if (n > 0) {
            setTimeout(() => attempt(n - 1), delay);
          } else {
            reject(error);
          }
        });
    };
    attempt(retries);
  });
};

/**
 * Pauses execution for a specified number of milliseconds.
 * A promise-based alternative to setTimeout.
 * @param ms The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified time.
 */
export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Rejects a promise if it doesn't resolve within a given time.
 * @param promise The promise to race against the timeout.
 * @param ms The timeout in milliseconds.
 * @returns A promise that resolves with the original promise's value or rejects with a timeout error.
 */
export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Promise timed out'));
    }, ms);

    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
};
