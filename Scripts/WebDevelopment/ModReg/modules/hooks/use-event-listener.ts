import { useEffect, useRef, RefObject } from 'react';

type EventListenerHandler = (event: Event) => void;

/**
 * A React hook that simplifies adding and removing event listeners to DOM elements, window, or other EventTargets.
 * It automatically handles cleanup.
 *
 * @param eventName The name of the event to listen for (e.g., 'click', 'scroll').
 * @param handler The function to execute when the event is triggered.
 * @param element The target to attach the event listener to. Defaults to `window`. Can be a RefObject or a direct element.
 * @param options Optional event listener options.
 */
export function useEventListener<T extends EventTarget>(
  eventName: string,
  handler: EventListenerHandler,
  element?: RefObject<T> | T | null,
  options?: boolean | AddEventListenerOptions
): void {
  // Fix: Explicitly initialize useRef with `null`. Calling `useRef()` without an
  // argument can cause errors with some TypeScript configurations that expect an initial value.
  const savedHandler = useRef<EventListenerHandler | null>(null);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const target = element ?? window;
    const targetElement = 'current' in target ? (target as RefObject<T>)?.current : target;

    if (!(targetElement && 'addEventListener' in targetElement)) {
      return;
    }

    const eventListener = (event: Event) => savedHandler.current?.(event);

    targetElement.addEventListener(eventName as any, eventListener, options);

    return () => {
      targetElement.removeEventListener(eventName as any, eventListener, options);
    };
  }, [eventName, element, options]);
}
