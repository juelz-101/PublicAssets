import React from 'react';

// A consistent wrapper for all creator forms
export const FormWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-amber-400 border-b-2 border-white/10 pb-2 mb-4">{title}</h2>
        {children}
    </div>
);

// Base props for our form inputs
interface FormComponentProps {
    label: string;
    description?: string;
}

// Reusable styled text input
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement>, FormComponentProps {}

export const FormInput: React.FC<FormInputProps> = ({ label, description, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-amber-200">{label}</label>
        <input
            {...props}
            className="mt-1 block w-full px-3 py-2 bg-gray-800/60 border border-white/10 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none focus:border-amber-500 transition-all sm:text-sm"
        />
        {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
    </div>
);

// Reusable styled text area
interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FormComponentProps {}

export const FormTextArea: React.FC<FormTextAreaProps> = ({ label, description, ...props }) => (
     <div>
        <label className="block text-sm font-medium text-amber-200">{label}</label>
        <textarea
            {...props}
            rows={4}
            className="mt-1 block w-full px-3 py-2 bg-gray-800/60 border border-white/10 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none focus:border-amber-500 transition-all sm:text-sm"
        />
        {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
    </div>
);
