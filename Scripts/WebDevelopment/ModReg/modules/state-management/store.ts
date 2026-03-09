
type Listener<T> = (state: T) => void;
type Updater<T> = Partial<T> | ((prevState: T) => Partial<T>);

export interface Store<T> {
  getState: () => T;
  setState: (updater: Updater<T>) => void;
  subscribe: (listener: Listener<T>) => () => void;
  reset: () => void;
}

/**
 * Creates a simple pub/sub store for centralized state management.
 * @param initialState The initial state of the store.
 * @returns A store object with `getState`, `setState`, `subscribe`, and `reset` methods.
 */
export const createStore = <T extends object>(initialState: T): Store<T> => {
  let state: T = { ...initialState };
  const listeners = new Set<Listener<T>>();

  const getState = (): T => state;

  const setState = (updater: Updater<T>) => {
    const nextState = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...nextState };
    listeners.forEach((listener) => listener(state));
  };

  const subscribe = (listener: Listener<T>): (() => void) => {
    listeners.add(listener);
    // Return an unsubscribe function
    return () => {
      listeners.delete(listener);
    };
  };

  const reset = () => {
    state = { ...initialState };
    listeners.forEach((listener) => listener(state));
  };

  return { getState, setState, subscribe, reset };
};
