import React from 'react';
import { AboutUsSection } from '../../types';
import SectionPanel from '../SectionPanel';
import MarkdownRenderer from '../MarkdownRenderer';

const WhoWeAreTab: React.FC<{ data: AboutUsSection }> = ({ data }) => {
    if (!data) return null;
    return (
        <SectionPanel id={data.id}>
            <h2 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-6">{data.title}</h2>
            <div className="text-lg text-gray-300 leading-relaxed mb-6">
                <MarkdownRenderer markdown={data.main_narrative} />
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
                {data.key_points.map(kp => (
                    <div key={kp.point} className="bg-gray-900/40 p-4 rounded-lg ring-1 ring-white/5">
                        <h3 className="font-bold text-amber-300">{kp.point}</h3>
                        <div className="text-sm text-gray-400 mt-1">
                            <MarkdownRenderer markdown={kp.detail} className="prose-sm" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-xl text-amber-200 font-semibold italic text-center">
                <MarkdownRenderer markdown={data.closingStatement} />
            </div>
        </SectionPanel>
    );
};

export default WhoWeAreTab;