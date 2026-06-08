// components/music/IntroductionTab.tsx
import React, { useState } from 'react';
import MarkdownRenderer from '../MarkdownRenderer';
import MusicCard from './MusicCard';
import ArtCard from '../art/ArtCard';
import ToolCard from '../tools/ToolCard';
import GamingCard from '../gaming/GamingCard';
import CommunityCard from '../community/CommunityCard';
import SectionPanel from '../SectionPanel';
import { Manifest } from '../../types';

type PageType = 'music' | 'art' | 'tools' | 'gaming' | 'community';

interface IntroductionTabProps {
  htmlContent: string;
  newItems?: any[];
  manifest: Manifest | null;
  pageType?: PageType;
  onNavigate?: (tab: any, id: string) => void;
  onViewDetails?: (link: string) => void;
  onLaunch?: (link: string) => void;
}

const IntroductionTab: React.FC<IntroductionTabProps> = ({ 
    htmlContent, 
    newItems = [], 
    manifest, 
    pageType = 'music',
    onNavigate, 
    onViewDetails,
    onLaunch
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasNewItems = newItems.length > 0;

  const renderNewItem = (item: any, index: number) => {
      const commonProps = {
          key: item.link || index,
          manifest,
          onViewDetails: onViewDetails || (() => {}),
      };

      switch (pageType) {
          case 'art':
              const artType = item.medium ? 'piece' : 'artist';
              return <ArtCard {...commonProps} item={item} type={artType as any} />;
          case 'tools':
              return <ToolCard {...commonProps} item={item} onLaunch={() => onLaunch?.(item.link)} />;
          case 'gaming':
              const gamingType = item.platform ? 'game' : item.ip_address ? 'server' : 'mod';
              return <GamingCard {...commonProps} item={item} type={gamingType as any} />;
          case 'community':
              const commType = item.location ? 'event' : 'person';
              return <CommunityCard {...commonProps} item={item} type={commType as any} />;
          case 'music':
          default:
              const musicType = item.title ? 'song' : (item.album ? 'album' : 'artist');
              return (
                  <MusicCard 
                      {...commonProps} 
                      item={item} 
                      type={musicType as any} 
                      onNavigate={onNavigate || (() => {})} 
                      size="small" 
                  />
              );
      }
  };

  return (
    <div className="space-y-6">
        <SectionPanel className="glow-on-hover glow-dark-primary">
            <MarkdownRenderer markdown={htmlContent} manifest={manifest} />
        </SectionPanel>

        {hasNewItems && (
            <div className={`bg-gray-900/50 backdrop-blur-lg rounded-2xl ring-1 transition-all duration-500 overflow-hidden shadow-2xl ${isExpanded ? 'ring-amber-500/40' : 'ring-white/10 hover:ring-amber-500/20'}`}>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
                >
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <h3 className="text-xl font-bold text-amber-400 uppercase tracking-tight">Latest Releases</h3>
                            <span className="absolute -top-1 -right-3 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-200 text-[10px] font-black uppercase rounded border border-amber-500/30">
                            {newItems.length} New
                        </span>
                    </div>
                    <div className={`text-amber-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>
                
                <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                    <div className="p-6 pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {newItems.map((item, i) => (
                                <div key={item.link || i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                                    {renderNewItem(item, i)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default IntroductionTab;