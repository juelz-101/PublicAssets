
/**
 * Attaches an event listener to an element.
 * @param element The target element.
 * @param event The event name to listen for.
 * @param handler The function to execute when the event is triggered.
 * @param options An object that specifies characteristics about the event listener.
 */
export const on = <K extends keyof HTMLElementEventMap>(
  element: EventTarget, 
  event: K, 
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, 
  options?: boolean | AddEventListenerOptions
): void => {
  element.addEventListener(event, handler as EventListener, options);
};

/**
 * Removes an event listener from an element.
 * @param element The target element.
 * @param event The event name.
 * @param handler The event handler function to remove.
 * @param options An object that specifies characteristics about the event listener.
 */
export const off = <K extends keyof HTMLElementEventMap>(
  element: EventTarget, 
  event: K, 
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, 
  options?: boolean | EventListenerOptions
): void => {
  element.removeEventListener(event, handler as EventListener, options);
};

/**
 * Toggles a CSS class on an element.
 * @param element The target element.
 * @param className The class name to toggle.
 * @returns `true` if the class was added, `false` if it was removed.
 */
export const toggleClass = (element: Element, className: string): boolean => {
  return element.classList.toggle(className);
};

/**
 * Attaches a delegated event listener to a parent element for children matching a selector.
 * @param parent The parent element to attach the listener to.
 * @param selector The selector for the target child elements.
 * @param event The event name to listen for.
 * @param handler The function to execute when the event is triggered on a matching child.
 * @returns A function that, when called, removes the delegated event listener.
 */
export const delegate = (
  parent: Element,
  selector: string,
  event: keyof HTMLElementEventMap,
  handler: (e: Event) => void
): (() => void) => {
  const dispatchedHandler = (e: Event) => {
    const targetElement = e.target as Element;
    // Check if the event target or its ancestor matches the selector
    if (targetElement.closest(selector)) {
      handler(e);
    }
  };

  on(parent, event, dispatchedHandler);

  // Return a cleanup function to remove the listener
  return () => off(parent, event, dispatchedHandler);
};

/**
 * A shorthand for document.querySelector.
 * @param selector The CSS selector to match.
 * @param parent The element to search within (defaults to document).
 * @returns The first matching element or null.
 */
export const qs = <T extends Element>(selector: string, parent: Element | Document = document): T | null => {
    return parent.querySelector<T>(selector);
};

/**
 * A shorthand for document.querySelectorAll.
 * @param selector The CSS selector to match.
 * @param parent The element to search within (defaults to document).
 * @returns A static NodeListOf all matching elements.
 */
export const qsa = <T extends Element>(selector: string, parent: Element | Document = document): NodeListOf<T> => {
    return parent.querySelectorAll<T>(selector);
};

/**
 * Sets multiple CSS properties on an element.
 * @param element The target HTMLElement.
 * @param styles An object of CSS properties to apply.
 */
export const setStyle = (element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void => {
    Object.assign(element.style, styles);
};
