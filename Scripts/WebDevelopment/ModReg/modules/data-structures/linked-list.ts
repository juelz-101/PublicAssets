
class Node<T> {
  public value: T;
  public next: Node<T> | null = null;
  public prev: Node<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class LinkedList<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;
  private length: number = 0;

  append(value: T): void {
    const newNode = new Node(value);
    if (!this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    this.length++;
  }

  prepend(value: T): void {
    const newNode = new Node(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.head.prev = newNode;
      newNode.next = this.head;
      this.head = newNode;
    }
    this.length++;
  }
  
  delete(value: T): Node<T> | null {
    if (!this.head) {
      return null;
    }

    let currentNode: Node<T> | null = this.head;
    while (currentNode && currentNode.value !== value) {
      currentNode = currentNode.next;
    }
    
    if (!currentNode) {
      return null;
    }
    
    if (currentNode.prev) {
      currentNode.prev.next = currentNode.next;
    } else {
      this.head = currentNode.next;
    }
    
    if (currentNode.next) {
      currentNode.next.prev = currentNode.prev;
    } else {
      this.tail = currentNode.prev;
    }

    this.length--;
    return currentNode;
  }

  find(value: T): Node<T> | null {
    if (!this.head) {
      return null;
    }
    let currentNode: Node<T> | null = this.head;
    while (currentNode) {
      if (currentNode.value === value) {
        return currentNode;
      }
      currentNode = currentNode.next;
    }
    return null;
  }

  toArray(): T[] {
    const result: T[] = [];
    let currentNode = this.head;
    while (currentNode) {
      result.push(currentNode.value);
      currentNode = currentNode.next;
    }
    return result;
  }

  get size(): number {
    return this.length;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }
}
