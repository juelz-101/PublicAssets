import React from 'react';
import { MeetTheTeamSection } from '../../types';
import { Manifest } from '../../services/contentService';
import GitHubImage from '../GitHubImage';
import SectionPanel from '../SectionPanel';
import MarkdownRenderer from '../MarkdownRenderer';

const MeetTheTeamTab: React.FC<{ data: MeetTheTeamSection; manifest: Manifest | null }> = ({ data, manifest }) => {
    if (!data) return null;
    return (
        <SectionPanel id={data.id}>
            <h2 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-4 text-center">{data.title}</h2>
            <p className="text-center text-amber-300 mb-8 max-w-2xl mx-auto">{data.intro}</p>
             <div className="space-y-8">
                {data.team.map(member => (
                    <div key={member.name}>
                        <div className="text-gray-200 text-lg">
                            <strong className="font-bold text-amber-300">{member.name}:</strong>
                            <div className="mt-1">
                                <MarkdownRenderer markdown={member.bio} />
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {member.images.map((img, index) => (
                            <GitHubImage
                                key={index}
                                manifest={manifest}
                                path={img}
                                alt={`${member.name} photo ${index + 1}`}
                                className="rounded-lg shadow-md object-cover aspect-square transition-transform hover:scale-105"
                            />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <p className="mt-8 text-gray-300 italic text-center">{data.outro}</p>
        </SectionPanel>
    );
};

export default MeetTheTeamTab;