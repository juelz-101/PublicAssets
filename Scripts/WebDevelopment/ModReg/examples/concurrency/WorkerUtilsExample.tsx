
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createWorkerFromFunction, postMessagePromise } from '../../modules/concurrency/worker-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button {...props} className={`bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition duration-300 disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

// This function needs to be self-contained to be stringified for the worker.
const calculateFibonacci = (num: number): number => {
    if (num <= 1) return num;
    // This is intentionally inefficient to simulate a heavy workload
    const fib = (n: number): number => {
      if (n <= 1) return n;
      return fib(n-1) + fib(n-2);
    }
    return fib(num);
};

const WorkerUtilsExample: React.FC = () => {
    const [fibNumber, setFibNumber] = useState(40);
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [worker, setWorker] = useState<Worker | null>(null);

    // Create worker on mount
    useEffect(() => {
        const newWorker = createWorkerFromFunction(calculateFibonacci);
        setWorker(newWorker);
        
        // Terminate worker on unmount
        return () => {
            newWorker.terminate();
        };
    }, []);

    const runCalculation = async (useWorker: boolean) => {
        setIsLoading(true);
        setResult(null);
        const startTime = performance.now();
        
        try {
            let fibResult: number;
            if (useWorker && worker) {
                fibResult = await postMessagePromise<number, number>(worker, fibNumber);
            } else {
                fibResult = calculateFibonacci(fibNumber);
            }
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);
            setResult(`Result: ${fibResult.toLocaleString()}\nTime taken: ${duration} ms`);
        } catch (error: any) {
            setResult(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-8">
             <FuturisticCard title="Responsiveness Test" description="This animated element shows if the main thread is blocked. If it freezes, the UI is unresponsive.">
                 <div className="flex justify-center items-center h-24">
                     <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin-slow border-neon-pink"></div>
                 </div>
            </FuturisticCard>
        
            <FuturisticCard title="Heavy Computation" description="Calculate a high number in the Fibonacci sequence. This is a CPU-intensive task that can freeze the browser if run on the main thread.">
                <div>
                    <label className="block text-text-secondary mb-2">Fibonacci number to calculate:</label>
                    <div className="flex items-center space-x-4">
                         <input
                            type="range"
                            min="20"
                            max="45"
                            value={fibNumber}
                            onChange={(e) => setFibNumber(Number(e.target.value))}
                            className="w-full accent-neon-teal"
                         />
                         <span className="font-mono text-xl text-text-primary">{fibNumber}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    <FuturisticButton onClick={() => runCalculation(false)} disabled={isLoading}>
                        {isLoading ? 'Calculating...' : 'Run on Main Thread'}
                    </FuturisticButton>
                    <FuturisticButton onClick={() => runCalculation(true)} disabled={isLoading || !worker}>
                       {isLoading ? 'Calculating...' : 'Run in Worker'}
                    </FuturisticButton>
                </div>
                {result && (
                    <div className="mt-4 p-4 bg-base-100/50 rounded-md border border-base-300/50">
                        <p className="text-text-secondary">Output:</p>
                        <pre className="text-text-primary font-mono whitespace-pre-wrap">{result}</pre>
                    </div>
                )}
            </FuturisticCard>
        </div>
    );
};

export default WorkerUtilsExample;
