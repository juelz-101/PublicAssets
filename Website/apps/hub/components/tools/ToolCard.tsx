
import React from 'react';
import { Tool } from '../../types';
import { Manifest } from '../../services/contentService';
import GitHubImage from '../GitHubImage';
import MarkdownRenderer from '../MarkdownRenderer';

interface ToolCardProps {
  item: Tool;
  manifest: Manifest | null;
  onViewDetails: (link: string) => void;
  onLaunch?: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ item, manifest, onViewDetails, onLaunch }) => {
  // Broad detection: if it's in the web category or looks like a web link, show launch button
  const isWebTool = 
    item.category?.toLowerCase().includes('web') || 
    item.tags?.some(t => t.toLowerCase() === 'web') ||
    item.link.toLowerCase().includes('qrg.json');

  const handleMainAction = () => {
    if (isWebTool && onLaunch) {
        onLaunch();
    } else {
        onViewDetails(item.link);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl flex flex-col group glow-on-hover glow-primary transition-all duration-300 h-full">
      <div className="overflow-hidden relative cursor-pointer" onClick={handleMainAction}>
        <GitHubImage
            manifest={manifest}
            path={item.thumbnail}
            alt={item.name}
            className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            placeholderCat="tools"
        />
        {isWebTool && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-gray-900 text-[10px] font-black uppercase rounded shadow-lg">
                Web App
            </div>
        )}
      </div>
      <div className="flex-grow flex flex-col p-4">
        <h3 className="text-xl font-bold text-amber-400 mb-2 truncate" title={item.name}>{item.name}</h3>
        <div className="text-sm text-gray-300 flex-grow mb-4">
            <MarkdownRenderer markdown={item.summary} className="prose-sm line-clamp-3" />
        </div>
        
        <div className="mt-auto flex flex-col gap-2">
            {isWebTool && onLaunch && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onLaunch(); }}
                  className="w-full px-4 py-3 text-sm font-black uppercase tracking-tight text-gray-900 bg-amber-400 rounded-xl hover:bg-amber-300 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] transform active:scale-95"
                >
                  Launch App
                </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onViewDetails(item.link); }}
              className={`w-full px-4 py-2 text-sm font-semibold text-gray-400 border border-white/5 rounded-xl hover:bg-white/5 transition-all ${!isWebTool ? 'bg-amber-400/10 text-amber-300 border-amber-400/20 py-3 font-bold uppercase' : ''}`}
            >
              {isWebTool ? 'View Specs' : 'View Details'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;
