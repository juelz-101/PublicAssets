import React from 'react';
import { ContactUsSection } from '../../types';
import SectionPanel from '../SectionPanel';
import MarkdownRenderer from '../MarkdownRenderer';

const ContactUsTab: React.FC<{ data: ContactUsSection }> = ({ data }) => {
    if (!data) return null;
    return (
        <SectionPanel id={data.id} className="grid md:grid-cols-5 gap-8 lg:gap-12">
            <div className="md:col-span-2">
                <h2 className="text-3xl font-bold text-amber-400 mb-4">{data.title}</h2>
                <div className="text-gray-300 mb-6">
                    <MarkdownRenderer markdown={data.text} />
                </div>
                <div className="space-y-4">
                    {data.details.map(detail => (
                        <div key={detail.type}>
                            <h3 className="font-bold text-amber-300">{detail.type}</h3>
                            <p className="text-gray-400">{detail.value}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="md:col-span-3 bg-gray-900/60 p-6 rounded-lg ring-1 ring-white/10">
                <h3 className="text-xl font-bold text-amber-300 mb-4">{data.form.heading}</h3>
                <form action={data.form.action_url} method="POST" className="space-y-4">
                    {data.form.inputs.map(input => {
                        const InputComponent = input.type === 'textarea' ? 'textarea' : 'input';
                        return (
                            <div key={input.name}>
                                <label htmlFor={input.name} className="block text-sm font-medium text-amber-200">{input.label}</label>
                                <InputComponent
                                    id={input.name}
                                    name={input.name}
                                    type={input.type === 'textarea' ? undefined : input.type}
                                    required={input.required}
                                    rows={input.type === 'textarea' ? 4 : undefined}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-800/60 border border-white/10 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none focus:border-amber-500 transition-all sm:text-sm"
                                />
                            </div>
                        );
                    })}
                    <button type="submit" className="w-full px-6 py-3 text-lg font-semibold text-gray-900 bg-amber-400 rounded-lg hover:bg-amber-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 shadow-lg hover:shadow-xl">
                        Send Message
                    </button>
                </form>
            </div>
        </SectionPanel>
    );
};

export default ContactUsTab;