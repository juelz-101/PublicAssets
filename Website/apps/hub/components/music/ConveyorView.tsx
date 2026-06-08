import React, { useState, useEffect } from 'react';
import { Song, Album, Artist, MusicSideTab } from '../../types';
import { Manifest } from '../../services/contentService';
import MusicCard from './MusicCard';
import GitHubImage from '../GitHubImage';

type MusicItem = Song | Album | Artist;

interface ConveyorViewProps {
  items: MusicItem[];
  type: 'song' | 'album' | 'artist';
  manifest: Manifest | null;
  onNavigate: (tab: MusicSideTab, id: string) => void;
  onViewDetails: (link: string) => void;
}

const ConveyorView: React.FC<ConveyorViewProps> = ({ items, type, manifest, onNavigate, onViewDetails }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Reset index if items change to avoid out-of-bounds errors and show the first item of the new list
    useEffect(() => {
        setSelectedIndex(0);
    }, [items]);

    if (!items || items.length === 0) {
        return <p className="text-gray-400 mt-4 text-center">No items to display in this view.</p>;
    }

    const selectedItem = items[selectedIndex];

    return (
        <div className="flex flex-col gap-4">
            {/* Main Display Area */}
            <div className="w-full max-w-lg mx-auto min-h-[24rem]">
                {selectedItem && (
                     <div className="animate-fade-in-up">
                        <MusicCard 
                            item={selectedItem} 
                            type={type} 
                            manifest={manifest} 
                            onNavigate={onNavigate} 
                            onViewDetails={onViewDetails}
                            size="default"
                        />
                     </div>
                )}
            </div>

            {/* Thumbnail Filmstrip */}
            {items.length > 1 && (
                <div className="conveyor-scrollbar -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
                    <div className="flex justify-center gap-4">
                        {items.map((item: any, index: number) => {
                             const title = 'title' in item ? item.title : 'album' in item ? item.album : item.artist;
                             return (
                                <button
                                    key={item.link}
                                    onClick={() => setSelectedIndex(index)}
                                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden transition-all duration-200 ring-2 focus:outline-none focus-visible:ring-amber-300 ${
                                        index === selectedIndex ? 'ring-amber-400 scale-105 shadow-lg' : 'ring-transparent hover:ring-white/50 opacity-60 hover:opacity-100'
                                    }`}
                                    aria-label={`View ${title}`}
                                >
                                    <GitHubImage
                                        manifest={manifest}
                                        path={item.thumbnail}
                                        alt={`Thumbnail for ${title}`}
                                        className="w-full h-full object-cover"
                                        placeholderCat="music"
                                        placeholderType={`${type}s`}
                                    />
                                </button>
                             );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConveyorView;
