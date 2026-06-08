import React, { useState, useEffect } from 'react';

interface JsonTextAreaProps {
    label: string;
    value: any; // Can be an object
    onChange: (obj: any) => void;
    placeholder?: string;
}

const JsonTextArea: React.FC<JsonTextAreaProps> = ({ label, value, onChange, placeholder }) => {
    const [textValue, setTextValue] = useState('');
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        // Sync internal state if the external value object changes
        try {
            setTextValue(JSON.stringify(value, null, 2) || '');
        } catch {
            setTextValue('');
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setTextValue(newText);

        if (newText.trim() === '') {
            setIsValid(true);
            onChange({});
            return;
        }

        try {
            const parsed = JSON.parse(newText);
            setIsValid(true);
            onChange(parsed);
        } catch (error) {
            setIsValid(false);
        }
    };
    
    const borderColor = isValid ? 'border-white/10' : 'border-red-500';
    const ringColor = isValid ? 'focus:ring-amber-500' : 'focus:ring-red-500';

    return (
        <div className="pt-4 border-t border-white/10">
            <label className="block text-sm font-medium text-amber-200">{label}</label>
            <p className="text-xs text-gray-400 mb-1">Enter a valid JSON object string.</p>
            <textarea
                value={textValue}
                onChange={handleChange}
                placeholder={placeholder || '{\n  "key": "value"\n}'}
                rows={6}
                className={`mt-1 block w-full px-3 py-2 bg-gray-800/60 border rounded-md text-white placeholder-gray-400 focus:ring-2 focus:outline-none transition-all sm:text-sm font-mono ${borderColor} ${ringColor}`}
            />
            {!isValid && (
                <p className="mt-1 text-xs text-red-400">Invalid JSON format.</p>
            )}
        </div>
    );
};

export default JsonTextArea;
