// pages/MusicPage.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MusicPageData, MusicSideTab, Song, Album, Artist, MusicItemDetail, NavItem } from '../types';
import { Manifest } from '../services/contentService';
import { fetchFromGitHubRaw } from '../modules/io/import-utils';
import SideNav from '../components/SideNav';
import IntroductionTab from '../components/music/IntroductionTab';
import SearchAndFilter from '../components/SearchAndFilter';
import MusicCard from '../components/music/MusicCard';
import ItemDetailView from '../components/music/ItemDetailView';
import ViewSwitcher, { ViewMode } from '../components/ViewSwitcher';
import ConveyorView from '../components/music/ConveyorView';
import ListView from '../components/music/ListView';
import CategoryDashboard from '../components/CategoryDashboard';
import DynamicLayout from '../components/music/DynamicLayout';

interface MusicPageProps {
  data: MusicPageData;
  manifest: Manifest | null;
  showDebugContent: boolean;
}

const musicNav: NavItem<MusicSideTab>[] = [
  { id: MusicSideTab.Introduction, label: 'Introduction' },
  { id: MusicSideTab.Songs, label: 'Songs' },
  { id: MusicSideTab.Albums, label: 'Albums' },
  { id: MusicSideTab.Artists, label: 'Artists' },
  { 
    id: MusicSideTab.JuelzFM, 
    label: 'Juelz-FM',
    children: [
        { id: MusicSideTab.JuelzFM_Live, label: 'Live Stream' },
        { id: MusicSideTab.JuelzFM_Schedule, label: 'Broadcast Schedule' },
        { id: MusicSideTab.JuelzFM_Archives, label: 'Archive Vault' },
    ]
  },
  { 
    id: MusicSideTab.FilmMusic, 
    label: 'Film Music',
    children: [
        { id: MusicSideTab.Film_TheVoid, label: 'The Void' },
        { id: MusicSideTab.Film_NeonNights, label: 'Neon Nights' },
    ]
  },
  { 
    id: MusicSideTab.GamingMusic, 
    label: 'Gaming Music',
    children: [
        { id: MusicSideTab.Game_LoFiRunner, label: 'Lo-Fi Runner' },
        { id: MusicSideTab.Game_ZikyQuest, label: 'Ziky Quest' },
    ]
  },
];

const SESSION_STORAGE_KEY = 'zikyinc_music_active_tab';

const MusicPage: React.FC<MusicPageProps> = ({ data, manifest, showDebugContent }) => {
  const [activeTab, setActiveTab] = useState<MusicSideTab>(() => {
    const savedTab = sessionStorage.getItem(SESSION_STORAGE_KEY);
    // Explicitly validate saved tab against enum values
    if (savedTab && Object.values(MusicSideTab).includes(savedTab as MusicSideTab)) {
        return savedTab as MusicSideTab;
    }
    return MusicSideTab.Introduction;
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  // State for Detail View
  const [selectedItemLink, setSelectedItemLink] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<MusicItemDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, activeTab);
    setSelectedItemLink(null);
    setDetailData(null);
  }, [activeTab]);
  
  useEffect(() => {
    if (!selectedItemLink || !manifest) return;

    const fetchDetailData = async () => {
      setIsLoadingDetail(true);
      setDetailError(null);
      try {
        const { user, repo, branch } = manifest.data.git;
        const content = await fetchFromGitHubRaw(user, repo, branch, selectedItemLink);
        setDetailData(JSON.parse(content));
      } catch (err) {
        setDetailError(err instanceof Error ? err.message : 'Failed to load details.');
      } finally {
        setIsLoadingDetail(false);
      }
    };
    fetchDetailData();
  }, [selectedItemLink, manifest]);

  const handleNavigateToList = useCallback((tab: MusicSideTab, id: string) => {
    setActiveTab(tab);
    setSelectedItemLink(null);
    setSearchTerm(''); 
    setGenreFilter('All');
  }, []);
  
  const handleNavigateToDetail = useCallback((link: string) => setSelectedItemLink(link), []);
  const handleViewDetails = useCallback((link: string) => setSelectedItemLink(link), []);
  const handleBackToList = useCallback(() => { setSelectedItemLink(null); setDetailData(null); }, []);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    (data.songs || []).forEach(s => (s.genre || []).forEach(g => genres.add(g)));
    (data.albums || []).forEach(a => (a.genre || []).forEach(g => genres.add(g)));
    (data.artists || []).forEach(a => (a.genre || []).forEach(g => genres.add(g)));
    return ['All', ...Array.from(genres).sort()];
  }, [data]);

  const newMusicItems = useMemo(() => {
      if (!data) return [];
      const items: any[] = [];
      const filter = (arr: any[]) => arr.filter(item => item.new === true);
      items.push(...filter(data.songs || []));
      items.push(...filter(data.albums || []));
      items.push(...filter(data.artists || []));
      return items;
  }, [data]);

  /**
   * Helper to find nested nav items
   */
  const findNavItem = (id: MusicSideTab, items: NavItem<MusicSideTab>[] = musicNav): NavItem<MusicSideTab> | undefined => {
      for (const item of items) {
          if (item.id === id) return item;
          if (item.children) {
              const found = findNavItem(id, item.children);
              if (found) return found;
          }
      }
      return undefined;
  };

  /**
   * Resolves metadata for Dashboards
   */
  const getSectionData = useCallback((id: MusicSideTab): any => {
      if (!data) return {};
      switch (id) {
          case MusicSideTab.JuelzFM: return data.juelz_fm?.root || {};
          case MusicSideTab.JuelzFM_Live: return data.juelz_fm?.live || { name: 'FM Live', summary: 'Listen to the underground 24/7.' };
          case MusicSideTab.JuelzFM_Schedule: return data.juelz_fm?.schedule || { name: 'Broadcast Schedule', summary: 'Never miss a beat.' };
          case MusicSideTab.JuelzFM_Archives: return data.juelz_fm?.archives || { name: 'Archives', summary: 'Relive the highlights.' };
          case MusicSideTab.FilmMusic: return data.film_music?.root || {};
          case MusicSideTab.GamingMusic: return data.game_music?.root || {};
          default:
              if (data.film_music?.projects[id]) return data.film_music.projects[id];
              if (data.game_music?.projects[id]) return data.game_music.projects[id];
              return {};
      }
  }, [data]);

  const renderListContent = (featuredItems: any[], allItems: any[], type: 'song' | 'album' | 'artist') => (
    <div className="space-y-6">
      <div className="sticky top-2 z-10 flex justify-end -mr-2">
        <div className="flex items-center gap-2 bg-gray-900/70 backdrop-blur-md p-1.5 rounded-xl ring-1 ring-white/10 shadow-lg">
          <SearchAndFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeFilter={genreFilter} setActiveFilter={setGenreFilter} filterOptions={allGenres} filterTypeLabel="Genre" />
          <ViewSwitcher activeView={viewMode} setActiveView={setViewMode} />
        </div>
      </div>
      {featuredItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-amber-300 mb-4 border-b-2 border-white/10 pb-2">Featured</h2>
          <div className="conveyor-scrollbar -mx-2 sm:-mx-4 lg:-mx-6 px-2 sm:px-4 lg:px-6 pb-4 overflow-x-auto"><div className="flex flex-nowrap gap-6">{featuredItems.map((item: any) => (<div key={item.link} className="w-48 flex-shrink-0 h-full"><MusicCard item={item} type={type} manifest={manifest} onNavigate={handleNavigateToList} onViewDetails={handleViewDetails} size="small" /></div>))}</div></div>
        </div>
      )}
      {allItems.length > 0 ? (
         <div className={featuredItems.length > 0 ? "pt-6" : ""}>
             {viewMode === 'card' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{allItems.map((item: any) => <MusicCard key={item.link} item={item} type={type} manifest={manifest} onNavigate={handleNavigateToList} onViewDetails={handleViewDetails} />)}</div>}
             {viewMode === 'list' && <ListView items={allItems} type={type} manifest={manifest} onViewDetails={handleViewDetails} />}
             {viewMode === 'conveyor' && <ConveyorView items={allItems} type={type} manifest={manifest} onNavigate={handleNavigateToList} onViewDetails={handleViewDetails} />}
         </div>
      ) : <div className="text-center py-10"><p className="text-gray-400">No {type}s found.</p></div>}
    </div>
  );

  const renderContent = () => {
    if (selectedItemLink) return <ItemDetailView data={detailData} isLoading={isLoadingDetail} error={detailError} onBack={handleBackToList} onNavigateToDetail={handleNavigateToDetail} manifest={manifest} />;

    const navItem = findNavItem(activeTab);
    
    // 1. Handle Dashboards for Roots (If it has children but no specific component logic)
    if (navItem?.children && navItem.children.length > 0 && 
        activeTab !== MusicSideTab.JuelzFM && 
        activeTab !== MusicSideTab.FilmMusic && 
        activeTab !== MusicSideTab.GamingMusic) {
        const pData = getSectionData(activeTab);
        return <CategoryDashboard title={navItem.label} subtitle={pData.summary} items={navItem.children} onItemClick={(id) => setActiveTab(id)} manifest={manifest} dataMapper={(id) => getSectionData(id)} />;
    }

    // 2. Handle Juelz-FM Hierarchy
    const isJuelzTab = activeTab === MusicSideTab.JuelzFM || 
                       activeTab === MusicSideTab.JuelzFM_Live || 
                       activeTab === MusicSideTab.JuelzFM_Schedule || 
                       activeTab === MusicSideTab.JuelzFM_Archives;

    if (isJuelzTab) {
        let blockData = data.juelz_fm?.root;
        if (activeTab === MusicSideTab.JuelzFM_Live) blockData = data.juelz_fm?.live;
        if (activeTab === MusicSideTab.JuelzFM_Schedule) blockData = data.juelz_fm?.schedule;
        if (activeTab === MusicSideTab.JuelzFM_Archives) blockData = data.juelz_fm?.archives;
        return blockData ? <DynamicLayout data={blockData} /> : <div className="p-8 text-center text-gray-500">Juelz-FM Section content missing in data.</div>;
    }

    // 3. Handle OST Project Albums
    const isFilmOST = data.film_music?.projects[activeTab];
    const isGameOST = data.game_music?.projects[activeTab];
    if (isFilmOST || isGameOST) {
        const album = isFilmOST || isGameOST;
        return (
            <div className="animate-fade-in-up">
                <header className="mb-8 border-b-2 border-amber-500/20 pb-4">
                    <h1 className="text-4xl font-bold text-amber-400">{album.album}</h1>
                    <p className="text-amber-200">{album.genre.join(', ')}</p>
                </header>
                <div className="max-w-md">
                    <MusicCard item={album} type="album" manifest={manifest} onNavigate={handleNavigateToList} onViewDetails={handleViewDetails} />
                </div>
            </div>
        );
    }

    // 4. Handle Root Hubs for Film/Game (Dashboard)
    if (activeTab === MusicSideTab.FilmMusic || activeTab === MusicSideTab.GamingMusic) {
        const pData = getSectionData(activeTab);
        return <CategoryDashboard title={navItem?.label || ''} subtitle={pData.summary} items={navItem?.children || []} onItemClick={(id) => setActiveTab(id)} manifest={manifest} dataMapper={(id) => getSectionData(id)} />;
    }

    // 5. Default List View Tabs
    switch (activeTab) {
      case MusicSideTab.Introduction: return <IntroductionTab htmlContent={data.intro} newItems={newMusicItems} manifest={manifest} onNavigate={handleNavigateToList} onViewDetails={handleViewDetails} />;
      case MusicSideTab.Songs: return renderListContent(data.songs.filter(s => s.flags?.includes('featured')), data.songs, 'song');
      case MusicSideTab.Albums: return renderListContent(data.albums.filter(a => a.flags?.includes('featured')), data.albums, 'album');
      case MusicSideTab.Artists: return renderListContent(data.artists.filter(a => a.flags?.includes('featured')), data.artists, 'artist');
      default: return <div className="p-10 text-center text-gray-500">Select a section to view content.</div>;
    }
  };
  
  if (!data) return <div className="p-8 text-center text-amber-400 font-bold">Music content unavailable.</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 h-full py-8">
      <aside className="w-full md:w-48 lg:w-56 flex-shrink-0">
        <SideNav<MusicSideTab> tabs={musicNav} activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>
      <div className="flex-grow min-w-0 overflow-y-auto overflow-x-hidden">
        <div className="px-4 sm:px-6 lg:px-8 pb-28">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MusicPage;
