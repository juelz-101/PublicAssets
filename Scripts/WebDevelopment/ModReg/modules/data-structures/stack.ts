
/**
 * A generic Stack class implementing the Last-In, First-Out (LIFO) principle.
 */
export class Stack<T> {
  private storage: T[] = [];

  /**
   * Adds an item to the top of the stack.
   * @param item The item to add.
   */
  push(item: T): void {
    this.storage.push(item);
  }

  /**
   * Removes and returns the item from the top of the stack.
   * @returns The removed item, or undefined if the stack is empty.
   */
  pop(): T | undefined {
    return this.storage.pop();
  }

  /**
   * Returns the item at the top of the stack without removing it.
   * @returns The item at the top, or undefined if the stack is empty.
   */
  peek(): T | undefined {
    return this.storage[this.storage.length - 1];
  }

  /**
   * Checks if the stack is empty.
   * @returns `true` if the stack is empty, `false` otherwise.
   */
  isEmpty(): boolean {
    return this.storage.length === 0;
  }

  /**
   * Gets the current number of items in the stack.
   */
  get size(): number {
    return this.storage.length;
  }
  
  /**
   * Clears all items from the stack.
   */
  clear(): void {
    this.storage = [];
  }

  /**
   * Returns a copy of the stack's internal storage as an array.
   * This is useful for rendering the stack's state in a UI.
   * @returns An array of items in the stack.
   */
  getItems(): T[] {
    return [...this.storage];
  }
}
