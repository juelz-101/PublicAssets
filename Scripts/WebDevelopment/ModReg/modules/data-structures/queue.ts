/**
 * A generic Queue class implementing the First-In, First-Out (FIFO) principle.
 */
export class Queue<T> {
  private storage: T[] = [];

  /**
   * Adds an item to the end of the queue.
   * @param item The item to add.
   */
  enqueue(item: T): void {
    this.storage.push(item);
  }

  /**
   * Removes and returns the item from the front of the queue.
   * @returns The removed item, or undefined if the queue is empty.
   */
  dequeue(): T | undefined {
    return this.storage.shift();
  }

  /**
   * Returns the item at the front of the queue without removing it.
   * @returns The item at the front, or undefined if the queue is empty.
   */
  peek(): T | undefined {
    return this.storage[0];
  }

  /**
   * Checks if the queue is empty.
   * @returns `true` if the queue is empty, `false` otherwise.
   */
  isEmpty(): boolean {
    return this.storage.length === 0;
  }

  /**
   * Gets the current number of items in the queue.
   */
  get size(): number {
    return this.storage.length;
  }

  /**
   * Clears all items from the queue.
   */
  clear(): void {
    this.storage = [];
  }

  /**
   * Returns a copy of the queue's internal storage as an array.
   * This is useful for rendering the queue's state in a UI.
   * @returns An array of items in the queue.
   */
  getItems(): T[] {
    return [...this.storage];
  }
}
