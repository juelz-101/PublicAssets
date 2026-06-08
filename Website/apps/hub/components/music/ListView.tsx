
import React from 'react';
import { Song, Album, Artist, Tool } from '../../types';
import { Manifest } from '../../services/contentService';
import GitHubImage from '../GitHubImage';

type MusicItem = Song | Album | Artist | Tool;

interface ListViewProps {
  items: MusicItem[];
  type: 'song' | 'album' | 'artist' | 'tool';
  manifest: Manifest | null;
  onViewDetails: (link: string) => void;
  onLaunch?: (link: string) => void;
  highlightId?: string | null;
  highlightedItemRef?: React.RefObject<HTMLDivElement>;
}

const ListView: React.FC<ListViewProps> = ({ 
  items, 
  type, 
  manifest, 
  onViewDetails, 
  onLaunch,
  highlightId, 
  highlightedItemRef 
}) => {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {items.map((item: any) => {
                const title = item.title || item.album || item.artist || item.name;
                const subtitle = item.artist || (item.genre ? item.genre.join(', ') : item.summary || item.category);
                
                // Extremely permissive detection for tools
                const isLaunchable = type === 'tool' && (
                    item.category?.toLowerCase().includes('web') || 
                    item.tags?.some((t: string) => t.toLowerCase() === 'web' || t.toLowerCase() === 'utility') ||
                    item.link.toLowerCase().includes('qrg.json') ||
                    item.link.toLowerCase().includes('web')
                );

                return (
                    <div key={item.link} ref={item.link === highlightId ? highlightedItemRef : null}>
                        <div 
                            className="bg-gray-900/50 backdrop-blur-lg rounded-xl ring-1 ring-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center gap-4 p-3 transition-all duration-300 hover:bg-gray-900/80 hover:ring-amber-500/50 glow-on-hover glow-primary"
                        >
                            <div className="w-full sm:w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                <GitHubImage
                                    manifest={manifest}
                                    path={item.thumbnail}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                    placeholderCat={type === 'tool' ? 'tools' : 'music'}
                                    placeholderType={type === 'tool' ? undefined : `${type}s`}
                                />
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-amber-300 truncate">{title}</h3>
                                    {isLaunchable && <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase rounded border border-amber-500/30">APP</span>}
                                </div>
                                <p className="text-sm text-gray-300 truncate">{subtitle}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                {isLaunchable && onLaunch && (
                                    <button
                                        onClick={() => onLaunch(item.link)}
                                        className="px-6 py-2.5 text-sm font-black uppercase tracking-tight text-gray-900 bg-amber-400 rounded-lg hover:bg-amber-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 shadow-md"
                                    >
                                        Launch
                                    </button>
                                )}
                                <button
                                    onClick={() => onViewDetails(item.link)}
                                    className={`px-4 py-2.5 text-sm font-semibold border border-white/10 rounded-lg hover:bg-white/5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 shadow-md ${!isLaunchable ? 'w-full sm:w-auto bg-amber-400/10 text-amber-300 border-amber-400/20' : 'text-gray-400'}`}
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ListView;
