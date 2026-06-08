import React from 'react';
import { DynamicFormData } from '../../types';
import SectionPanel from '../SectionPanel';

const DynamicForm: React.FC<{ data: DynamicFormData }> = ({ data }) => {
    const { form_details, inputs } = data;

    return (
        <SectionPanel>
            <h3 className="text-2xl font-bold text-amber-400 mb-1">{form_details.title}</h3>
            <p className="text-gray-300 mb-6">{form_details.subtitle}</p>
            <form action={form_details.action_url} method="POST" className="space-y-4">
                {inputs.map(input => {
                    const { type, name, label, required, placeholder, options } = input;
                    if (type === 'textarea') {
                        return (
                            <div key={name}>
                                <label htmlFor={name} className="block text-sm font-medium text-amber-200">{label}</label>
                                <textarea
                                    id={name} name={name} required={required} placeholder={placeholder} rows={4}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-800/60 border border-white/10 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none focus:border-amber-500 transition-all sm:text-sm"
                                />
                            </div>
                        );
                    }
                    if (type === 'select') {
                        return (
                             <div key={name}>
                                <label htmlFor={name} className="block text-sm font-medium text-amber-200">{label}</label>
                                <select
                                    id={name} name={name} required={required}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-800/60 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-amber-500 focus:outline-none focus:border-amber-500 transition-all sm:text-sm"
                                >
                                    {options?.map(opt => <option key={opt} value={opt} className="bg-gray-800">{opt}</option>)}
                                </select>
                            </div>
                        );
                    }
                    return (
                        <div key={name}>
                            <label htmlFor={name} className="block text-sm font-medium text-amber-200">{label}</label>
                            <input
                                id={name} name={name} type={type} required={required} placeholder={placeholder}
                                className="mt-1 block w-full px-3 py-2 bg-gray-800/60 border border-white/10 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none focus:border-amber-500 transition-all sm:text-sm"
                            />
                        </div>
                    );
                })}
                <button type="submit" className="w-full px-6 py-3 text-lg font-semibold text-gray-900 bg-amber-400 rounded-lg hover:bg-amber-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 shadow-lg hover:shadow-xl">
                    Submit
                </button>
            </form>
        </SectionPanel>
    );
};

export default DynamicForm;