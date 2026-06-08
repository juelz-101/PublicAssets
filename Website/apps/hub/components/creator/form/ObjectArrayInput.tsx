import React, { useState } from 'react';

interface FieldConfig {
    name: string;
    placeholder: string;
    type?: 'text' | 'number';
}

interface ObjectArrayInputProps {
    label: string;
    items: any[];
    onChange: (items: any[]) => void;
    fields: FieldConfig[];
    itemTitleKey: string;
}

const ObjectArrayInput: React.FC<ObjectArrayInputProps> = ({ label, items, onChange, fields, itemTitleKey }) => {
    const initialNewItemState = fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {});
    const [newItem, setNewItem] = useState<any>(initialNewItemState);

    const handleInputChange = (field: string, value: string) => {
        setNewItem({ ...newItem, [field]: value });
    };

    const handleAddItem = () => {
        // Basic validation: ensure at least one field is filled
        if (Object.values(newItem).some(v => v !== '')) {
            onChange([...items, newItem]);
            setNewItem(initialNewItemState);
        }
    };

    const handleRemoveItem = (indexToRemove: number) => {
        onChange(items.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="pt-4 border-t border-white/10">
            <label className="block text-lg font-semibold text-amber-300 mb-2">{label}</label>
            
            {/* Display existing items */}
            {items.length > 0 && (
                <div className="space-y-2 mb-4">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 p-2 bg-gray-800/50 rounded-md">
                            <p className="text-sm text-gray-200 truncate">
                                {item[itemTitleKey] || `Item ${index + 1}`}
                            </p>
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="px-2 py-1 text-xs font-bold text-red-300 bg-red-900/50 rounded hover:bg-red-900"
                                aria-label={`Remove ${item[itemTitleKey]}`}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Form to add a new item */}
            <div className="p-3 bg-gray-800/30 rounded-lg space-y-2">
                <h4 className="text-sm font-medium text-amber-200">Add New {label.slice(0, -1)}</h4>
                {fields.map(field => (
                    <input
                        key={field.name}
                        type={field.type || 'text'}
                        value={newItem[field.name]}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="block w-full px-3 py-2 bg-gray-800/60 border border-white/10 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none focus:border-amber-500 transition-all sm:text-sm"
                    />
                ))}
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full mt-2 px-4 py-2 text-sm font-semibold bg-amber-500/80 text-gray-900 rounded-lg hover:bg-amber-500 transition-colors"
                >
                    Add {label.slice(0, -1)}
                </button>
            </div>
        </div>
    );
};

export default ObjectArrayInput;
