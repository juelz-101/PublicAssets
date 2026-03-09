
import React, { useState } from 'react';
import { Stack } from '../../modules/data-structures/stack';

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

const StackExample: React.FC = () => {
    const [stack, setStack] = useState(() => {
        const s = new Stack<string>();
        s.push('Book 1');
        s.push('Book 2');
        s.push('Book 3');
        return s;
    });
    const [inputValue, setInputValue] = useState('Book 4');
    const [lastOperationResult, setLastOperationResult] = useState<string | null>('Initial stack created.');

    const updateStack = (s: Stack<string>) => {
        const newStack = new Stack<string>();
        for (const item of s.getItems()) {
            newStack.push(item);
        }
        setStack(newStack);
    };

    const handlePush = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        stack.push(inputValue);
        updateStack(stack);
        setLastOperationResult(`Pushed: "${inputValue}"`);
        setInputValue('');
    };

    const handlePop = () => {
        const poppedItem = stack.pop();
        updateStack(stack);
        setLastOperationResult(poppedItem !== undefined ? `Popped: "${poppedItem}"` : 'Stack was empty.');
    };

    const handlePeek = () => {
        const peekedItem = stack.peek();
        setLastOperationResult(peekedItem !== undefined ? `Peeked: "${peekedItem}"` : 'Stack is empty.');
    };

    const handleClear = () => {
        stack.clear();
        updateStack(stack);
        setLastOperationResult('Stack cleared.');
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Stack Visualizer">
                <div className="flex flex-col-reverse items-center space-y-2 space-y-reverse p-4 bg-base-100/50 rounded-lg min-h-[200px] border border-base-300">
                     {stack.isEmpty() && <p className="text-text-secondary italic w-full text-center">Stack is empty</p>}
                     {stack.getItems().map((item, index) => (
                       <div key={index} className={`w-3/4 text-center bg-base-300 px-4 py-2 rounded-md text-text-primary shadow-md animate-fade-in ${index === stack.size - 1 ? 'border-2 border-neon-teal' : ''}`}>
                         {item} {index === stack.size - 1 && <span className="text-xs text-neon-teal ml-2">(Top)</span>}
                       </div>
                     ))}
                </div>
                <div className="flex justify-around bg-base-100/50 p-2 rounded-md">
                    <p className="text-text-secondary">Size: <span className="font-mono text-neon-teal">{stack.size}</span></p>
                    <p className="text-text-secondary">Is Empty? <span className="font-mono text-neon-teal">{stack.isEmpty().toString()}</span></p>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Controls">
                <form onSubmit={handlePush} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Item to push..."
                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    />
                    <FuturisticButton type="submit">Push</FuturisticButton>
                </form>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <FuturisticButton onClick={handlePop} variant="blue">Pop</FuturisticButton>
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

export default StackExample;
