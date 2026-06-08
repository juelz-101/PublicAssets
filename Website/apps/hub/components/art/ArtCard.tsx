// components/art/ArtCard.tsx
import React from 'react';
import { ArtPiece, ArtArtist } from '../../types';
import { Manifest } from '../../services/contentService';
import GitHubImage from '../GitHubImage';

interface ArtCardProps {
    item: ArtPiece | ArtArtist;
    type: 'piece' | 'artist';
    manifest: Manifest | null;
    onViewDetails: (link: string) => void;
}

const ArtCard: React.FC<ArtCardProps> = ({ item, type, manifest, onViewDetails }) => {
    const isPiece = type === 'piece';
    const title = isPiece ? (item as ArtPiece).title : (item as ArtArtist).name;
    const subtitle = isPiece ? (item as ArtPiece).artist : (item as ArtArtist).mediums.join(', ');

    return (
        <div 
            onClick={() => onViewDetails(item.link)}
            className="bg-gray-900/50 backdrop-blur-lg rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl flex flex-col group cursor-pointer glow-on-hover glow-primary transition-all duration-300 h-full"
        >
            <div className="overflow-hidden relative aspect-[4/3]">
                <GitHubImage
                    manifest={manifest}
                    path={item.thumbnail}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    placeholderCat="art"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {isPiece && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded">
                        {(item as ArtPiece).year}
                    </div>
                )}
            </div>
            
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-amber-400 group-hover:text-amber-300 transition-colors truncate">
                    {title}
                </h3>
                <p className="text-sm text-amber-200 mt-1 truncate">
                    {subtitle}
                </p>
                {isPiece && (item as ArtPiece).medium && (
                    <p className="text-xs text-gray-400 mt-2 italic">
                        {(item as ArtPiece).medium}
                    </p>
                )}
                
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-xs text-amber-500 font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    View Specs &rarr;
                </div>
            </div>
        </div>
    );
};

export default ArtCard;