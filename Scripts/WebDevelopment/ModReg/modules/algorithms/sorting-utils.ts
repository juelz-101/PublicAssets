
export type SortStep = {
  array: number[];
  highlights: number[]; // Indices of elements being compared or swapped
  sortedIndices?: number[]; // Indices of elements that are in their final sorted position
};

/**
 * A generator that yields each step of the Bubble Sort algorithm.
 * @param arr The array of numbers to sort.
 */
export function* bubbleSort(arr: number[]): Generator<SortStep> {
  const localArr = [...arr];
  const n = localArr.length;
  const sortedIndices: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield { array: [...localArr], highlights: [j, j + 1], sortedIndices: [...sortedIndices] };
      if (localArr[j] > localArr[j + 1]) {
        [localArr[j], localArr[j + 1]] = [localArr[j + 1], localArr[j]];
        swapped = true;
        yield { array: [...localArr], highlights: [j, j + 1], sortedIndices: [...sortedIndices] };
      }
    }
    sortedIndices.push(n - 1 - i);
    if (!swapped) break;
  }
  // Mark all as sorted
  yield { array: [...localArr], highlights: [], sortedIndices: Array.from(Array(n).keys()) };
}

/**
 * A generator that yields each step of the Selection Sort algorithm.
 * @param arr The array of numbers to sort.
 */
export function* selectionSort(arr: number[]): Generator<SortStep> {
  const localArr = [...arr];
  const n = localArr.length;
  const sortedIndices: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      yield { array: [...localArr], highlights: [minIndex, j], sortedIndices: [...sortedIndices] };
      if (localArr[j] < localArr[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      [localArr[i], localArr[minIndex]] = [localArr[minIndex], localArr[i]];
      yield { array: [...localArr], highlights: [i, minIndex], sortedIndices: [...sortedIndices] };
    }
    sortedIndices.push(i);
  }
  // Mark all as sorted
  yield { array: [...localArr], highlights: [], sortedIndices: Array.from(Array(n).keys()) };
}


/**
 * A generator that yields each step of the Quick Sort algorithm using an iterative approach.
 * @param arr The array of numbers to sort.
 */
export function* quickSort(arr: number[]): Generator<SortStep> {
    const localArr = [...arr];
    const n = localArr.length;
    const sortedIndices: number[] = [];

    const stack: [number, number][] = [];
    stack.push([0, n - 1]);

    while(stack.length > 0) {
        const [low, high] = stack.pop()!;
        
        if (low > high) continue;

        if (low === high) {
            if (!sortedIndices.includes(low)) sortedIndices.push(low);
            continue;
        }

        const pivot = localArr[high];
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            yield { array: [...localArr], highlights: [j, high], sortedIndices: [...sortedIndices] };
            if(localArr[j] < pivot) {
                i++;
                [localArr[i], localArr[j]] = [localArr[j], localArr[i]];
                yield { array: [...localArr], highlights: [i, j], sortedIndices: [...sortedIndices] };
            }
        }
        
        [localArr[i+1], localArr[high]] = [localArr[high], localArr[i+1]];
        const pi = i + 1;

        if (!sortedIndices.includes(pi)) sortedIndices.push(pi);

        yield { array: [...localArr], highlights: [pi, high], sortedIndices: [...sortedIndices] };

        // Push left and right subarrays to stack
        stack.push([low, pi - 1]);
        stack.push([pi + 1, high]);
    }
    
    // Final yield to mark all as sorted
    yield { array: [...localArr], highlights: [], sortedIndices: Array.from(Array(n).keys()) };
}

/**
 * A generator that yields each step of the Insertion Sort algorithm.
 * @param arr The array of numbers to sort.
 */
export function* insertionSort(arr: number[]): Generator<SortStep> {
  const localArr = [...arr];
  const n = localArr.length;

  for (let i = 1; i < n; i++) {
    const key = localArr[i];
    let j = i - 1;
    const sortedIndices = Array.from({ length: i }, (_, k) => k);

    while (j >= 0 && localArr[j] > key) {
      yield { array: [...localArr], highlights: [j, j + 1], sortedIndices: [...sortedIndices] };
      localArr[j + 1] = localArr[j];
      j--;
    }
    localArr[j + 1] = key;
    yield { array: [...localArr], highlights: [j + 1, i], sortedIndices: [...sortedIndices] };
  }

  yield { array: [...localArr], highlights: [], sortedIndices: Array.from(Array(n).keys()) };
}
