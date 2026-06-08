import React from 'react';
import { DataType } from '../debug/CreatorTab';

interface DataTypeSelectorProps {
    selectedType: DataType | null;
    onTypeChange: (type: DataType) => void;
}

const dataTypes: { id: DataType, name: string }[] = [
    { id: 'song', name: 'Song' },
    { id: 'album', name: 'Album' },
    { id: 'artist', name: 'Artist' },
];

const DataTypeSelector: React.FC<DataTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-amber-200 mb-2">Select Data Type to Create:</label>
            <div className="flex flex-wrap gap-2">
                {dataTypes.map(({ id, name }) => (
                    <button
                        key={id}
                        onClick={() => onTypeChange(id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                            selectedType === id
                                ? 'bg-amber-500 text-gray-900 shadow-lg'
                                : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
                        }`}
                        aria-pressed={selectedType === id}
                    >
                        {name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DataTypeSelector;
