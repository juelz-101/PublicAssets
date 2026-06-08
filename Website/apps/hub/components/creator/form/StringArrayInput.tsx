import React, { useState } from 'react';

interface StringArrayInputProps {
    label: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
}

const StringArrayInput: React.FC<StringArrayInputProps> = ({ label, items, onChange, placeholder }) => {
    const [currentValue, setCurrentValue] = useState('');

    const handleAddItem = () => {
        if (currentValue && !items.includes(currentValue)) {
            onChange([...items, currentValue]);
            setCurrentValue('');
        }
    };

    const handleRemoveItem = (itemToRemove: string) => {
        onChange(items.filter(item => item !== itemToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem();
        }
    };

    return (
        <div className="pt-4 border-t border-white/10">
            <label className="block text-sm font-medium text-amber-200">{label}</label>
            <div className="mt-1 flex items-center gap-2">
                <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || `Add a new ${label.toLowerCase().slice(0, -1)}...`}
                    className="flex-grow px-3 py-2 bg-gray-800/60 border border-white/10 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none focus:border-amber-500 transition-all sm:text-sm"
                />
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-4 py-2 text-sm font-semibold bg-amber-500/80 text-gray-900 rounded-lg hover:bg-amber-500 transition-colors"
                >
                    Add
                </button>
            </div>
            {items.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {items.map(item => (
                        <span key={item} className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-200 text-sm font-semibold rounded-full">
                            {item}
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(item)}
                                className="text-amber-300 hover:text-white"
                                aria-label={`Remove ${item}`}
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StringArrayInput;
