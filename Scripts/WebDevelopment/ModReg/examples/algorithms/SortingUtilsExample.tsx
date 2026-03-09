
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { bubbleSort, selectionSort, quickSort, insertionSort, SortStep } from '../../modules/algorithms/sorting-utils';

// Helper to generate a random array
const generateRandomArray = (size: number, max: number): number[] => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1);
};

// Component to render the sorting visualization
const SortVisualizer: React.FC<{ sortStep: SortStep | null, maxVal: number }> = ({ sortStep, maxVal }) => {
    if (!sortStep) {
        return <div className="h-64 bg-base-100/50 rounded-lg flex items-center justify-center text-text-secondary">Click a sort button to begin</div>;
    }

    const { array, highlights, sortedIndices } = sortStep;

    const getBarColor = (index: number): string => {
        if (sortedIndices?.includes(index)) {
            return 'bg-neon-green';
        }
        if (highlights.includes(index)) {
            return 'bg-neon-pink';
        }
        return 'bg-neon-teal/50';
    };

    return (
        <div className="h-64 bg-base-100/50 rounded-lg flex items-end justify-center space-x-px p-2">
            {array.map((value, index) => (
                <div
                    key={index}
                    className={`flex-grow transition-all duration-150 ${getBarColor(index)}`}
                    style={{ height: `${(value / maxVal) * 100}%` }}
                    title={String(value)}
                />
            ))}
        </div>
    );
};

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
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

const SortingUtilsExample: React.FC = () => {
    const [arraySize, setArraySize] = useState(50);
    const [maxVal, setMaxVal] = useState(100);
    const [animationSpeed, setAnimationSpeed] = useState(50);
    const [isSorting, setIsSorting] = useState(false);
    const [currentArray, setCurrentArray] = useState<number[]>([]);
    const [sortStep, setSortStep] = useState<SortStep | null>(null);
    const animationTimeoutId = useRef<number | null>(null);

    const resetArray = useCallback(() => {
        if (animationTimeoutId.current) {
            clearTimeout(animationTimeoutId.current);
            animationTimeoutId.current = null;
        }
        const newArray = generateRandomArray(arraySize, maxVal);
        setCurrentArray(newArray);
        setSortStep({ array: newArray, highlights: [], sortedIndices: [] });
        setIsSorting(false);
    }, [arraySize, maxVal]);
    
    useEffect(() => {
        resetArray();
    }, [resetArray]);

    const runAnimation = (sortGenerator: Generator<SortStep>) => {
        setIsSorting(true);

        const animate = () => {
            const { value, done } = sortGenerator.next();
            if (done || !value) {
                setIsSorting(false);
                if (value) {
                     setSortStep({ ...value, sortedIndices: Array.from(Array(value.array.length).keys()) });
                }
                return;
            }
            setSortStep(value);
            animationTimeoutId.current = window.setTimeout(animate, animationSpeed);
        };
        
        animate();
    };

    const handleSort = (type: 'bubble' | 'selection' | 'quick' | 'insertion') => {
        if (isSorting) return;
        
        let generator;
        switch(type) {
            case 'bubble':
                generator = bubbleSort(currentArray);
                break;
            case 'selection':
                generator = selectionSort(currentArray);
                break;
            case 'quick':
                generator = quickSort(currentArray);
                break;
            case 'insertion':
                generator = insertionSort(currentArray);
                break;
        }
        runAnimation(generator);
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Sorting Algorithm Visualizer">
                <SortVisualizer sortStep={sortStep} maxVal={maxVal} />
            </FuturisticCard>
            <FuturisticCard title="Controls">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-text-secondary mb-1">Array Size: {arraySize}</label>
                        <input type="range" min="10" max="200" step="10" value={arraySize} onChange={(e) => setArraySize(Number(e.target.value))} disabled={isSorting} className="w-full accent-neon-teal" />
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-1">Max Value: {maxVal}</label>
                        <input type="range" min="10" max="1000" step="10" value={maxVal} onChange={(e) => setMaxVal(Number(e.target.value))} disabled={isSorting} className="w-full accent-neon-teal" />
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-1">Animation Speed (ms): {animationSpeed}</label>
                        <input type="range" min="1" max="200" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} className="w-full accent-neon-teal" />
                    </div>
                    <div className="self-end">
                        <FuturisticButton onClick={resetArray} disabled={isSorting} className="w-full">
                            Generate New Array
                        </FuturisticButton>
                    </div>
                </div>
            </FuturisticCard>
             <FuturisticCard title="Run Algorithm">
                <div className="flex flex-wrap gap-4">
                    <FuturisticButton onClick={() => handleSort('bubble')} disabled={isSorting}>Bubble Sort</FuturisticButton>
                    <FuturisticButton onClick={() => handleSort('selection')} disabled={isSorting}>Selection Sort</FuturisticButton>
                    <FuturisticButton onClick={() => handleSort('insertion')} disabled={isSorting}>Insertion Sort</FuturisticButton>
                    <FuturisticButton onClick={() => handleSort('quick')} disabled={isSorting}>Quick Sort</FuturisticButton>
                </div>
             </FuturisticCard>
        </div>
    );
};

export default SortingUtilsExample;
