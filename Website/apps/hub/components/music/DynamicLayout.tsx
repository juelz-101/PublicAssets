// components/music/DynamicLayout.tsx
import React, { useState } from 'react';
import { DynamicPageData, LayoutBlock } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';
import SectionPanel from '../SectionPanel';

interface DynamicLayoutProps {
    data: DynamicPageData;
}

const AccordionBlock: React.FC<{ title?: string; items: any[] }> = ({ title, items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-3">
            {title && <h3 className="text-2xl font-bold text-amber-400 mb-4">{title}</h3>}
            {items.map((item, i) => (
                <div key={i} className="bg-gray-900/40 rounded-xl ring-1 ring-white/10 overflow-hidden">
                    <button 
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                    >
                        <span className="font-bold text-amber-300">{item.title || item.label}</span>
                        <span className={`text-amber-500 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {openIndex === i && (
                        <div className="px-6 pb-4 pt-2 border-t border-white/5">
                            <MarkdownRenderer markdown={item.content || item.description} className="prose-sm" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const GridBlock: React.FC<{ title?: string; items: any[]; columns?: number }> = ({ title, items, columns = 3 }) => {
    const gridCols = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    return (
        <div className="space-y-6">
            {title && <h3 className="text-2xl font-bold text-amber-400 border-b border-white/10 pb-2">{title}</h3>}
            <div className={`grid ${gridCols} gap-6`}>
                {items.map((item, i) => (
                    <div key={i} className="bg-gray-900/60 p-5 rounded-2xl ring-1 ring-white/10 hover:ring-amber-500/30 transition-all glow-on-hover glow-primary">
                        <h4 className="text-xl font-bold text-amber-300 mb-2">{item.title}</h4>
                        <p className="text-sm text-gray-400 mb-4">{item.subtitle}</p>
                        <MarkdownRenderer markdown={item.description || item.content} className="prose-sm line-clamp-4" />
                    </div>
                ))}
            </div>
        </div>
    );
};

const DynamicLayout: React.FC<DynamicLayoutProps> = ({ data }) => {
    if (!data || !data.blocks) return null;

    return (
        <div className="space-y-12 animate-fade-in-up">
            <header className="border-b border-white/10 pb-8">
                <h1 className="text-5xl font-black text-amber-400 tracking-tighter uppercase">{data.name}</h1>
                <p className="text-xl text-gray-400 mt-2">{data.summary}</p>
            </header>

            {data.blocks.map((block, index) => {
                switch (block.type) {
                    case 'hero':
                        return (
                            <SectionPanel key={index} className="text-center bg-gradient-to-br from-amber-500/10 to-transparent">
                                <h2 className="text-3xl font-extrabold text-amber-300 mb-4">{block.title}</h2>
                                <div className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                    <MarkdownRenderer markdown={block.content || ''} />
                                </div>
                            </SectionPanel>
                        );
                    case 'grid':
                        return <GridBlock key={index} title={block.title} items={block.items || []} columns={block.config?.columns} />;
                    case 'accordion':
                        return <AccordionBlock key={index} title={block.title} items={block.items || []} />;
                    case 'markdown':
                        return (
                            <div key={index} className="prose prose-invert max-w-none bg-gray-900/30 p-8 rounded-2xl ring-1 ring-white/5">
                                {block.title && <h3 className="text-amber-400">{block.title}</h3>}
                                <MarkdownRenderer markdown={block.content || ''} />
                            </div>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default DynamicLayout;
