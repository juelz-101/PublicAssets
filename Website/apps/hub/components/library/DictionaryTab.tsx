import React, { useState } from 'react';
import { MasterDictionary } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';

interface DictionaryTabProps {
    dictionary: MasterDictionary;
}

const Accordion: React.FC<{ title: string; children: React.ReactNode, titleClassName?: string, defaultOpen?: boolean }> = ({ title, children, titleClassName, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-white/10 last:border-b-0">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left hover:bg-white/5 transition-colors">
                <h3 className={`text-xl font-semibold ${titleClassName || 'text-amber-300'}`}>{title}</h3>
                <span className={`transform transition-transform text-amber-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && <div className="p-4 bg-black/20">{children}</div>}
        </div>
    );
};

const DictionaryTab: React.FC<DictionaryTabProps> = ({ dictionary }) => {
    // Defensive check to prevent crash if dictionary.dictionary is not populated correctly.
    const { skillsets = [], collections = [] } = dictionary?.dictionary || {};
    const errors = dictionary?.errors || [];

    return (
        <div className="space-y-6">
            <div className="p-6 sm:p-8 bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl ring-1 ring-white/10">
                <h2 className="text-3xl font-bold text-amber-400 mb-4">ZIKYinc Dictionary</h2>
                {dictionary?.dictionary?.desc && <div className="text-gray-300 space-y-2">{dictionary.dictionary.desc.map((p, i) => <MarkdownRenderer key={i} markdown={p} />)}</div>}
            </div>

            {errors.length > 0 && (
                <div className="p-4 bg-red-900/30 text-red-300 rounded-2xl ring-1 ring-red-500/50 shadow-lg">
                    <h3 className="font-bold text-lg text-red-200">Dictionary Merge Error</h3>
                    <p className="text-sm text-red-300 mb-2">The following files contained syntax errors and could not be included:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm font-mono">
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            )}

            {skillsets.length > 0 && (
                 <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                    <Accordion title="Skillsets" titleClassName="text-amber-400">
                        <div className="space-y-6">
                        {skillsets.map(skillset => (
                            <div key={skillset.id}>
                                <h4 className="text-lg font-bold text-amber-200">{skillset.name}</h4>
                                <div className="text-sm text-gray-400 italic mb-2">
                                    <MarkdownRenderer markdown={skillset.desc} inline />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <h5 className="font-semibold text-gray-200">Levels:</h5>
                                        <ul className="list-disc list-inside space-y-1 pl-2 text-gray-300">{skillset.levels.map(l => <li key={l.name}><strong>{l.name}:</strong> <MarkdownRenderer markdown={l.desc} inline /></li>)}</ul>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-200">Difficulties:</h5>
                                        <ul className="list-disc list-inside space-y-1 pl-2 text-gray-300">{skillset.difficulties.map(d => <li key={d.name}><strong>{d.name}:</strong> <MarkdownRenderer markdown={d.desc} inline /></li>)}</ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </Accordion>
                </div>
            )}

            {collections.length > 0 && (
                <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10"><h2 className="text-2xl font-bold text-amber-400">Collections</h2></div>
                    {collections.map(collection => (
                         <Accordion key={collection.id} title={collection.name}>
                             <div className="space-y-6">
                                <div className="text-gray-400 italic">
                                    <MarkdownRenderer markdown={collection.desc} />
                                </div>
                                
                                {collection.terms && collection.terms.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-amber-200 mb-2 border-b border-white/10 pb-1">Terms</h4>
                                        <div className="space-y-3">
                                            {collection.terms.map((term, index) => (
                                                <div key={index} className="p-3 bg-gray-800/40 rounded-lg">
                                                    <p className="font-bold text-amber-200">{term.name}</p>
                                                    <div className="text-sm"><strong>Definition:</strong> <MarkdownRenderer markdown={term.definition} inline /></div>
                                                    <div className="text-sm text-gray-400"><em>Example: <MarkdownRenderer markdown={term.example} inline /></em></div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-1 text-gray-300">
                                                        <span><strong>Level:</strong> {term.level}</span>
                                                        <span><strong>Difficulty:</strong> {term.difficulty}</span>
                                                        <span><strong>Category:</strong> {term.category} / {term.sub}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {collection.categories && collection.categories.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-amber-200 mb-2 border-b border-white/10 pb-1">Categories</h4>
                                        <div className="space-y-3">
                                            {collection.categories.map((category, catIndex) => (
                                                <div key={catIndex} className="p-3 bg-gray-800/40 rounded-lg">
                                                    <p className="font-bold text-amber-200">{category.name}</p>
                                                    <div className="text-sm text-gray-300"><MarkdownRenderer markdown={category.desc} /></div>
                                                    {category.subs && category.subs.length > 0 && (
                                                        <div className="mt-3 pt-2 pl-3 border-l-2 border-white/10 space-y-2">
                                                            {category.subs.map((sub, subIndex) => (
                                                                <div key={subIndex}>
                                                                    <p className="font-semibold text-gray-200">{sub.name}</p>
                                                                    <div className="text-xs text-gray-400"><MarkdownRenderer markdown={sub.desc} inline /></div>
                                                                    <div className="text-xs text-gray-500 italic">Example: <MarkdownRenderer markdown={sub.example} inline /></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                             </div>
                         </Accordion>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DictionaryTab;