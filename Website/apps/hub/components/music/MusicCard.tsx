import React from 'react';
import { Song, Album, Artist, MusicSideTab } from '../../types';
import { Manifest } from '../../services/contentService';
import GitHubImage from '../GitHubImage';

type MusicItem = Song | Album | Artist;

interface MusicCardProps {
  item: MusicItem;
  type: 'song' | 'album' | 'artist';
  manifest: Manifest | null;
  onNavigate: (tab: MusicSideTab, id: string) => void;
  onViewDetails: (link: string) => void;
  size?: 'default' | 'small';
}

const MusicCard: React.FC<MusicCardProps> = ({ item, type, manifest, onNavigate, onViewDetails, size = 'default' }) => {
  const isSmall = size === 'small';

  const renderDetails = () => {
    if (type === 'song' && 'albums' in item) {
      return (
        <div className="space-y-1">
          <p className="text-xs text-amber-200 font-semibold">From albums:</p>
          <ul className="text-xs text-gray-300 list-inside space-y-1">
            {item.albums.map(album => (
              <li key={album.link}>
                <button onClick={() => onNavigate(MusicSideTab.Albums, album.link)} className="hover:underline hover:text-amber-300 text-left transition-colors">
                  {album.album} (CD{album.cd}, Trk {album.track})
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    if (type === 'album' && 'artists' in item) {
      return (
         <div className="space-y-1">
          <p className="text-xs text-amber-200 font-semibold">By artists:</p>
          <ul className="text-xs text-gray-300 space-y-1">
            {item.artists.map(artist => (
              <li key={artist.link}>
                <button onClick={() => onNavigate(MusicSideTab.Artists, artist.link)} className="hover:underline hover:text-amber-300 transition-colors">
                  {artist.artist}
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    if (type === 'artist' && 'albums' in item) {
        return (
          <div className="space-y-1">
            <p className="text-xs text-amber-200 font-semibold">Appears on:</p>
            <ul className="text-xs text-gray-300 list-inside space-y-1">
              {item.albums.slice(0, 2).map(album => ( // Show first 2 albums
                <li key={album.link}>
                  <button onClick={() => onNavigate(MusicSideTab.Albums, album.link)} className="hover:underline hover:text-amber-300 text-left transition-colors">
                    {album.album}
                  </button>
                </li>
              ))}
              {item.albums.length > 2 && <li className="text-gray-400">...and more</li>}
            </ul>
          </div>
        );
      }
    return null;
  };
  
  const title = 'title' in item ? item.title : 'album' in item ? item.album : item.artist;
  const subtitle = 'artist' in item ? item.artist : (('genre' in item) ? item.genre.join(', ') : '');

  return (
    <div 
      className={`bg-gray-900/50 backdrop-blur-lg rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl flex flex-col group glow-on-hover glow-primary transition-all duration-300 ${!isSmall ? 'h-full' : ''}`}
    >
      <div className="overflow-hidden">
        <GitHubImage
            manifest={manifest}
            path={item.thumbnail}
            alt={title}
            className={`w-full ${isSmall ? 'h-24' : 'h-48'} object-cover transition-transform duration-300 ease-in-out group-hover:scale-110`}
            placeholderCat="music"
            placeholderType={`${type}s`}
        />
      </div>
      <div className={`flex-grow flex flex-col ${isSmall ? 'p-2' : 'p-4'}`}>
        <button onClick={() => onViewDetails(item.link)} className="text-left w-full group/title">
            <h3 className={`${isSmall ? 'text-base' : 'text-xl'} font-bold text-amber-400 truncate group-hover/title:text-amber-300 transition-colors`}>{title}</h3>
        </button>
        <p className={`${isSmall ? 'text-xs' : 'text-sm'} text-amber-200 mb-2 truncate`}>{subtitle}</p>
        <div className="flex-grow text-sm">
          {!isSmall && renderDetails()}
        </div>
      </div>
    </div>
  );
};

export default MusicCard;