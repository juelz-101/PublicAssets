
export interface WorkerMessage<T> {
  type: 'data' | 'error';
  payload: T;
}

/**
 * Creates a Web Worker from a self-contained function.
 * The function will be executed inside the worker when it receives a message.
 * IMPORTANT: The function is stringified, so it cannot rely on any external scope or closures.
 * Any helper functions it needs must be defined within its own body.
 * @param workerFunction The function to run in the worker. It receives data from `postMessage` and should return a result.
 * @returns A new Worker instance.
 */
export const createWorkerFromFunction = <T, R>(workerFunction: (data: T) => R): Worker => {
    const fnString = `
        self.onmessage = function(e) {
            try {
                const result = (${workerFunction.toString()})(e.data.payload);
                self.postMessage({ type: 'data', payload: result });
            } catch (error) {
                // Assuming error is an Error object, we pass its message
                self.postMessage({ type: 'error', payload: error.message });
            }
        };
    `;
    const blob = new Blob([fnString], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
};

/**
 * Sends a message to a worker and returns a promise that resolves with the worker's response.
 * This simplifies request-response communication with workers. It's designed for single-use responses.
 * @param worker The Worker instance to communicate with.
 * @param message The data payload to send to the worker.
 * @returns A promise that resolves with the worker's response payload or rejects on error.
 */
export const postMessagePromise = <T, R>(worker: Worker, message: T): Promise<R> => {
    return new Promise((resolve, reject) => {
        const messageHandler = (event: MessageEvent<WorkerMessage<R>>) => {
            cleanup();
            if (event.data.type === 'data') {
                resolve(event.data.payload);
            } else {
                reject(new Error(event.data.payload as any));
            }
        };

        const errorHandler = (event: ErrorEvent) => {
            cleanup();
            reject(new Error(`Worker error: ${event.message}`));
        };

        const cleanup = () => {
            worker.removeEventListener('message', messageHandler);
            worker.removeEventListener('error', errorHandler);
        };

        worker.addEventListener('message', messageHandler);
        worker.addEventListener('error', errorHandler);
        
        worker.postMessage({ payload: message });
    });
};
