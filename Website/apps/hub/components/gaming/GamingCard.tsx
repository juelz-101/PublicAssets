import React from 'react';
import { Game, Mod, Server } from '../../types';
import { Manifest } from '../../services/contentService';
import GitHubImage from '../GitHubImage';
import MarkdownRenderer from '../MarkdownRenderer';

type GamingItem = Game | Mod | Server;

interface GamingCardProps {
  item: GamingItem;
  type: 'game' | 'mod' | 'server';
  manifest: Manifest | null;
  onViewDetails: (link: string) => void;
}

const GamingCard: React.FC<GamingCardProps> = ({ item, type, manifest, onViewDetails }) => {
    
  const getCategory = () => {
    if (type === 'game' && 'platform' in item) return item.platform.join(', ');
    if ((type === 'mod' || type === 'server') && 'game' in item) return item.game;
    return type;
  }

  return (
    <div 
      className="bg-gray-900/50 backdrop-blur-lg rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl flex flex-col group glow-on-hover glow-primary transition-all duration-300 h-full"
    >
      <div className="overflow-hidden relative">
        <GitHubImage
            manifest={manifest}
            path={item.thumbnail}
            alt={item.name}
            className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            placeholderCat="gaming"
        />
        <div className="absolute top-2 right-2 px-2 py-1 bg-gray-900/70 backdrop-blur-sm text-amber-200 text-xs font-semibold rounded-full capitalize">
          {getCategory()}
        </div>
      </div>
      <div className="flex-grow flex flex-col p-4">
        <h3 className="text-xl font-bold text-amber-400">{item.name}</h3>
        <div className="text-sm text-gray-300 flex-grow my-2">
            <MarkdownRenderer markdown={item.summary} className="prose-sm" />
        </div>
        <button 
          onClick={() => onViewDetails(item.link)}
          className="mt-auto self-start px-5 py-2 text-sm font-semibold text-gray-900 bg-amber-400 rounded-lg hover:bg-amber-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 shadow-md hover:shadow-lg"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default GamingCard;