import React, { useState, useEffect } from 'react';
import { MusicItemDetail, SongDetail, ArtistDetail, AlbumDetail, Link, Tag, BehindTheScenes } from '../../types';
import { Manifest } from '../../services/contentService';
import GitHubImage from '../GitHubImage';
import ImageGallery from '../ImageGallery';
import MarkdownRenderer from '../MarkdownRenderer';

interface ItemDetailViewProps {
  data: MusicItemDetail | null;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onNavigateToDetail: (link: string) => void;
  manifest: Manifest | null;
}

const DetailPanel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-900/30 backdrop-blur-lg rounded-xl ring-1 ring-white/10 p-4 md:p-6 glow-on-hover glow-dark-primary">
        <h3 className="text-2xl font-bold text-amber-400 mb-4 border-b-2 border-white/10 pb-2">{title}</h3>
        {children}
    </div>
);

const BehindTheScenesRenderer: React.FC<{ data: BehindTheScenes; level?: number }> = ({ data, level = 0 }) => {
    const renderValue = (value: any) => {
        if (typeof value === 'string') {
            return <MarkdownRenderer markdown={value} className="prose-sm" />;
        }
        if (Array.isArray(value)) {
            return <ul className="list-disc list-inside space-y-1">{value.map((item, i) => <li key={i}>{renderValue(item)}</li>)}</ul>;
        }
        if (typeof value === 'object' && value !== null) {
            return <BehindTheScenesRenderer data={value as BehindTheScenes} level={level + 1} />;
        }
        return null;
    };

    return (
        <div className={`space-y-4 ${level > 0 ? 'pl-4 border-l-2 border-white/10' : ''}`}>
            {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                    <h4 className="text-lg font-semibold text-amber-300 capitalize">{key.replace(/_/g, ' ')}</h4>
                    {renderValue(value)}
                </div>
            ))}
        </div>
    );
};

const TagsPanel: React.FC<{ tags: Tag[] }> = ({ tags }) => (
    <DetailPanel title="Tags">
        <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-amber-500/20 text-amber-200 text-sm font-semibold rounded-full">{tag}</span>
            ))}
        </div>
    </DetailPanel>
);

const LinksPanel: React.FC<{ links: Link[] }> = ({ links }) => (
    <DetailPanel title="Links">
        <ul className="space-y-2">
            {links.map(link => (
                <li key={link.link} className="rounded-md glow-on-hover glow-link p-1 -m-1">
                  <a href={link.link} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:text-amber-100 hover:underline transition-colors break-all">
                    {link.title}
                  </a>
                </li>
            ))}
        </ul>
    </DetailPanel>
);


const ItemDetailView: React.FC<ItemDetailViewProps> = ({ data, isLoading, error, onBack, onNavigateToDetail, manifest }) => {
  const isSong = (d: MusicItemDetail | null): d is SongDetail => !!d && 'lyrics' in d;
  const isArtist = (d: MusicItemDetail | null): d is ArtistDetail => !!d && 'bio' in d;
  const isAlbum = (d: MusicItemDetail | null): d is AlbumDetail => !!d && 'title' in d && 'artists' in d && !isSong(d) && !isArtist(d);
  
  const [activeAudioTab, setActiveAudioTab] = useState<'soundcloud' | 'youtube'>('soundcloud');

  useEffect(() => {
    if (data && isSong(data) && data.audio) {
        if (data.audio.soundcloud_embed) setActiveAudioTab('soundcloud');
        else if (data.audio.youtube_embed) setActiveAudioTab('youtube');
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-amber-400 text-xl">Loading details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400 bg-red-900/20 rounded-lg">
        <h2 className="text-2xl font-bold">Error</h2>
        <p className="mt-2">{error}</p>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-amber-500 text-gray-900 font-bold rounded-lg hover:bg-amber-400 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  if (!data) return null;

  const mainTitle = (data as any).title || (data as any).artist;
  const subtitle = isSong(data) ? data.artist : undefined;

  const renderCommonPanels = (itemData: MusicItemDetail) => (
    <>
        {itemData.image_gallery && itemData.image_gallery.length > 0 && (
            <DetailPanel title="Gallery">
                <ImageGallery images={itemData.image_gallery} manifest={manifest} altPrefix={mainTitle} />
            </DetailPanel>
        )}
        {itemData.links && itemData.links.length > 0 && <LinksPanel links={itemData.links} />}
        {itemData.tags && itemData.tags.length > 0 && <TagsPanel tags={itemData.tags} />}
        {itemData.behind_the_scenes && (
            <DetailPanel title="Behind the Scenes">
                <BehindTheScenesRenderer data={itemData.behind_the_scenes} />
            </DetailPanel>
        )}
    </>
  );

  return (
    <div className="p-1">
        <button 
          onClick={onBack} 
          className="sticky top-4 z-20 mb-4 px-5 py-2 bg-amber-500/90 backdrop-blur-sm text-gray-900 font-bold rounded-lg hover:bg-amber-500 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to List
        </button>
      
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/10 p-4 sm:p-6 md:p-8">
            <header className="mb-6">
                <h1 
                    className="text-4xl md:text-5xl font-extrabold text-amber-400"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                >
                    {mainTitle}
                </h1>
                {subtitle && (
                    <h2 
                        className="text-xl text-amber-200"
                        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
                    >
                        {subtitle}
                    </h2>
                )}
                {data.release_date && <p className="text-sm text-gray-400 mt-1">Released: {data.release_date}</p>}
            </header>
            
            <div className="space-y-6">
                {/* Specific Details */}
                {isSong(data) && (() => {
                    const song = data;
                    const availableAudioSources = song.audio ? (['soundcloud', 'youtube'] as const).filter(
                        source => song.audio[`${source}_embed`]
                    ) : [];
                    return (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <GitHubImage manifest={manifest} path={song.thumbnail} alt={song.title} className="rounded-lg shadow-lg w-full object-cover aspect-square" />
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <MarkdownRenderer markdown={song.description} />
                                    {song.artist_links && <div><h4 className="font-bold text-amber-300">Artists:</h4>{song.artist_links.map(artist => (<button key={artist.link} onClick={() => onNavigateToDetail(artist.link)} className="text-gray-200 hover:text-amber-200 hover:underline mr-2">{artist.name}</button>))}</div>}
                                    {song.albums && <div><h4 className="font-bold text-amber-300">Appears On:</h4>{song.albums.map(album => (<button key={album.link} onClick={() => onNavigateToDetail(album.link)} className="text-gray-200 hover:text-amber-200 hover:underline mr-2">{album.name} (CD{album.cd}, Trk {album.track})</button>))}</div>}
                                    {song.genres && <div><h4 className="font-bold text-amber-300">Genres:</h4><div className="flex flex-wrap gap-2 mt-1">{song.genres.map(genre => (<span key={genre} className="px-2 py-1 bg-amber-500/20 text-amber-200 text-xs font-semibold rounded-full">{genre}</span>))}</div></div>}
                                </div>
                            </div>
                            {availableAudioSources.length > 0 && (
                                <DetailPanel title="Listen">
                                    {availableAudioSources.length > 1 && (<div className="mb-4 flex border-b border-white/10">{availableAudioSources.map(source => (<button key={source} onClick={() => setActiveAudioTab(source)} className={`capitalize px-4 py-2 text-sm font-semibold transition-colors ${activeAudioTab === source ? 'border-b-2 border-amber-400 text-amber-400' : 'text-gray-400 hover:text-white'}`}>{source}</button>))}</div>)}
                                    {activeAudioTab === 'soundcloud' && song.audio.soundcloud_embed && (<iframe key="soundcloud" height="166" scrolling="no" frameBorder="no" allow="autoplay" src={song.audio.soundcloud_embed} className="rounded-lg w-full animate-fade-in-up"></iframe>)}
                                    {activeAudioTab === 'youtube' && song.audio.youtube_embed && (<div className="aspect-video animate-fade-in-up"><iframe key="youtube" src={song.audio.youtube_embed} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="YouTube video player" className="rounded-lg w-full h-full"></iframe></div>)}
                                </DetailPanel>
                            )}
                            {song.lyrics && <DetailPanel title="Lyrics"><div className="prose prose-sm prose-invert max-w-none text-gray-300 whitespace-pre-wrap font-mono">{Object.entries(song.lyrics).map(([key, value]) => (<div key={key}><p className="font-bold text-amber-300 capitalize">[{key.replace(/_/g, ' ')}]</p><p>{value}</p></div>))}</div></DetailPanel>}
                            {renderCommonPanels(data)}
                        </>
                    );
                })()}

                {isArtist(data) && (() => {
                    const artist = data;
                    return (
                        <>
                            {artist.banner_image && (<div className="relative rounded-lg overflow-hidden shadow-lg -mx-4 sm:-mx-6 md:-mx-8"><GitHubImage manifest={manifest} path={artist.banner_image} alt={`${artist.artist} banner`} className="w-full h-48 md:h-64 object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" /></div>)}
                            <DetailPanel title="Biography"><MarkdownRenderer markdown={artist.bio} /></DetailPanel>
                            {artist.songs && artist.songs.length > 0 && (
                                <DetailPanel title="Songs">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {artist.songs.map((song) => (
                                        <button key={song.link} onClick={() => onNavigateToDetail(song.link)} className="bg-gray-800/50 rounded-lg overflow-hidden ring-1 ring-white/10 shadow-lg h-full flex flex-col group text-left transition-all duration-300 hover:scale-[1.03] hover:ring-2 hover:ring-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 glow-on-hover glow-primary">
                                            <div className="overflow-hidden"><GitHubImage manifest={manifest} path={song.thumbnail} alt={song.title} className="w-full h-32 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110" placeholderCat="music" placeholderType="songs" /></div>
                                            <div className="p-3"><h4 className="font-bold text-amber-300 group-hover:text-amber-200 truncate">{song.title}</h4></div>
                                        </button>
                                    ))}
                                    </div>
                                </DetailPanel>
                            )}
                            {renderCommonPanels(data)}
                        </>
                    );
                })()}

                {isAlbum(data) && (() => {
                    const album = data;
                     return (
                        <>
                            {album.banner && (<div className="relative rounded-lg overflow-hidden shadow-lg -mx-4 sm:-mx-6 md:-mx-8"><GitHubImage manifest={manifest} path={album.banner} alt={`${album.title} banner`} className="w-full h-48 md:h-64 object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" /></div>)}
                            <DetailPanel title="About This Album"><MarkdownRenderer markdown={album.description} /></DetailPanel>
                            {album.artists && album.artists.length > 0 && (<DetailPanel title="Artists"><div className="flex flex-wrap gap-x-4 gap-y-2">{album.artists.map(artist => <span key={artist} className="text-lg text-gray-200">{artist}</span>)}</div></DetailPanel>)}
                            {renderCommonPanels(data)}
                        </>
                    );
                })()}
            </div>
        </div>
    </div>
  );
};

export default ItemDetailView;