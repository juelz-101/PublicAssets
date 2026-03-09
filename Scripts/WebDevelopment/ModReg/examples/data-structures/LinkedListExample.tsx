
import React, { useState } from 'react';
import { LinkedList } from '../../modules/data-structures/linked-list';

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


const LinkedListExample: React.FC = () => {
    const [list, setList] = useState(() => {
        const l = new LinkedList<string>();
        l.append('20');
        l.append('30');
        l.prepend('10');
        return l;
    });

    const [inputValue, setInputValue] = useState('40');
    const [deleteValue, setDeleteValue] = useState('20');
    const [lastOperationResult, setLastOperationResult] = useState<string>('Initial list created.');

    const updateList = (l: LinkedList<string>) => {
        const newList = new LinkedList<string>();
        for (const item of l.toArray()) {
            newList.append(item);
        }
        setList(newList);
    };

    const handleAppend = (e: React.FormEvent) => {
        e.preventDefault();
        if(!inputValue.trim()) return;
        list.append(inputValue);
        updateList(list);
        setLastOperationResult(`Appended: "${inputValue}"`);
        setInputValue('');
    };
    
     const handlePrepend = (e: React.FormEvent) => {
        e.preventDefault();
        if(!inputValue.trim()) return;
        list.prepend(inputValue);
        updateList(list);
        setLastOperationResult(`Prepended: "${inputValue}"`);
        setInputValue('');
    };

    const handleDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if(!deleteValue.trim()) return;
        const deletedNode = list.delete(deleteValue);
        updateList(list);
        setLastOperationResult(deletedNode ? `Deleted: "${deletedNode.value}"` : `Value "${deleteValue}" not found.`);
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Linked List Visualizer">
                <div className="flex items-center space-x-2 p-4 bg-base-100/50 rounded-lg overflow-x-auto min-h-[80px] border border-base-300">
                    <span className="text-sm font-bold text-neon-teal flex-shrink-0">Head</span>
                    <div className="flex items-center space-x-2 flex-grow">
                        {!list.isEmpty() && <span className="text-text-secondary">&lt;-</span>}
                        {list.toArray().map((item, index) => (
                           <React.Fragment key={index}>
                                <div className="bg-base-300 px-4 py-2 rounded-md text-text-primary shadow-md animate-fade-in flex-shrink-0">
                                    {item}
                                </div>
                                {index < list.size - 1 && <span className="text-text-secondary animate-fade-in">&lt;-&gt;</span>}
                           </React.Fragment>
                        ))}
                        {!list.isEmpty() && <span className="text-text-secondary">-&gt;</span>}
                    </div>
                     {list.isEmpty() && <p className="text-text-secondary italic w-full text-center">List is empty</p>}
                    <span className="text-sm font-bold text-neon-pink flex-shrink-0">Tail</span>
                </div>
                <div className="flex justify-around bg-base-100/50 p-2 rounded-md">
                    <p className="text-text-secondary">Size: <span className="font-mono text-neon-teal">{list.size}</span></p>
                    <p className="text-text-secondary">Is Empty? <span className="font-mono text-neon-teal">{list.isEmpty().toString()}</span></p>
                </div>
            </FuturisticCard>
            
            <FuturisticCard title="Controls">
                 <form onSubmit={handleAppend} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Value to add..."
                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    />
                    <FuturisticButton type="submit">Append</FuturisticButton>
                    <FuturisticButton onClick={handlePrepend} type="button" variant="blue">Prepend</FuturisticButton>
                </form>
                 <form onSubmit={handleDelete} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={deleteValue}
                        onChange={(e) => setDeleteValue(e.target.value)}
                        placeholder="Value to delete..."
                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    />
                    <FuturisticButton type="submit" variant="red">Delete</FuturisticButton>
                </form>
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

export default LinkedListExample;
