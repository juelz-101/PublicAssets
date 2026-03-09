import React, { useState } from 'react';
import { Queue } from '../../modules/data-structures/queue';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'teal' | 'red' | 'blue' | 'indigo' }> = ({ children, className, variant = 'teal', ...props }) => {
    const colors = {
        teal: 'bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border-neon-teal',
        red: 'bg-neon-red/20 hover:bg-neon-red/30 text-neon-red border-neon-red',
        blue: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-400',
        indigo: 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border-indigo-400',
    };
    return (
        <button {...props} className={`font-bold py-2 px-4 rounded transition duration-300 border ${colors[variant]} ${className}`}>
            {children}
        </button>
    );
};

const QueueExample: React.FC = () => {
    const [queue, setQueue] = useState(() => {
        const q = new Queue<string>();
        q.enqueue('Apple');
        q.enqueue('Banana');
        q.enqueue('Cherry');
        return q;
    });
    const [inputValue, setInputValue] = useState('Date');
    const [lastOperationResult, setLastOperationResult] = useState<string | null>('Initial queue created.');

    const updateQueue = (q: Queue<string>) => {
        // Create a new queue instance from the old one's items to ensure React detects the state change.
        const newQueue = new Queue<string>();
        for (const item of q.getItems()) {
            newQueue.enqueue(item);
        }
        setQueue(newQueue);
    };

    const handleEnqueue = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        queue.enqueue(inputValue);
        updateQueue(queue);
        setLastOperationResult(`Enqueued: "${inputValue}"`);
        setInputValue('');
    };

    const handleDequeue = () => {
        const dequeuedItem = queue.dequeue();
        updateQueue(queue);
        setLastOperationResult(dequeuedItem !== undefined ? `Dequeued: "${dequeuedItem}"` : 'Queue was empty.');
    };

    const handlePeek = () => {
        const peekedItem = queue.peek();
        setLastOperationResult(peekedItem !== undefined ? `Peeked: "${peekedItem}"` : 'Queue is empty.');
    };

    const handleClear = () => {
        queue.clear();
        updateQueue(queue);
        setLastOperationResult('Queue cleared.');
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Queue Visualizer">
                <div className="flex items-center space-x-2 p-4 bg-base-100/50 rounded-lg overflow-x-auto min-h-[80px] border border-base-300">
                    <span className="text-sm font-bold text-neon-teal flex-shrink-0">Front</span>
                    <div className="flex items-center space-x-2 flex-grow">
                        {queue.getItems().map((item, index) => (
                           <React.Fragment key={index}>
                                <div className="bg-base-300 px-4 py-2 rounded-md text-text-primary shadow-md animate-fade-in flex-shrink-0">
                                    {item}
                                </div>
                                {index < queue.size - 1 && <span className="text-text-secondary animate-fade-in">-&gt;</span>}
                           </React.Fragment>
                        ))}
                    </div>
                     {queue.isEmpty() && <p className="text-text-secondary italic w-full text-center">Queue is empty</p>}
                    <span className="text-sm font-bold text-neon-pink flex-shrink-0">Back</span>
                </div>
                <div className="flex justify-around bg-base-100/50 p-2 rounded-md">
                    <p className="text-text-secondary">Size: <span className="font-mono text-neon-teal">{queue.size}</span></p>
                    <p className="text-text-secondary">Is Empty? <span className="font-mono text-neon-teal">{queue.isEmpty().toString()}</span></p>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Controls">
                <form onSubmit={handleEnqueue} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Item to enqueue..."
                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    />
                    <FuturisticButton type="submit">Enqueue</FuturisticButton>
                </form>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <FuturisticButton onClick={handleDequeue} variant="blue">Dequeue</FuturisticButton>
                    <FuturisticButton onClick={handlePeek} variant="indigo">Peek</FuturisticButton>
                    <FuturisticButton onClick={handleClear} variant="red">Clear</FuturisticButton>
                </div>
            </FuturisticCard>
             {lastOperationResult &&
                <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg">
                    <h4 className="text-lg font-semibold text-text-primary mb-2">Last Operation</h4>
                    <p className="text-text-primary font-mono">{lastOperationResult}</p>
                </div>
            }
        </div>
    );
};

export default QueueExample;
