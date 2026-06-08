import React, { useState, useEffect } from 'react';
import { LibraryPageData, LibrarySideTab } from '../types';
import { Manifest } from '../services/contentService';
import SideNav from '../components/SideNav';
import AislesTab from '../components/library/AislesTab';
import DictionaryTab from '../components/library/DictionaryTab';
import SectionPanel from '../components/SectionPanel';

interface LibraryPageProps {
  data: LibraryPageData;
  manifest: Manifest | null;
}

const sideTabs: LibrarySideTab[] = [
  LibrarySideTab.Lobby,
  LibrarySideTab.Aisles,
  LibrarySideTab.Dictionary,
];

const SESSION_STORAGE_KEY = 'zikyinc_library_active_tab';

const LibraryPage: React.FC<LibraryPageProps> = ({ data, manifest }) => {
  const [activeTab, setActiveTab] = useState<LibrarySideTab>(() => {
    const savedTab = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return (savedTab as LibrarySideTab) || LibrarySideTab.Lobby;
  });

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, activeTab);
  }, [activeTab]);

  if (!data) {
    return (
      <div className="p-8 text-center text-amber-400">
        <h2 className="text-2xl font-bold">Library page content is not available.</h2>
      </div>
    );
  }

  const { lobby, aisles, dictionary, error } = data;

  const renderContent = () => {
    if (error) {
        return <SectionPanel><p className="text-red-400">Error loading library: {error}</p></SectionPanel>;
    }

    switch (activeTab) {
      case LibrarySideTab.Lobby:
        return (
          <SectionPanel>
            <div className="text-center">
              <h2 className="text-4xl sm:text-6xl font-extrabold text-amber-400 mb-4 tracking-tight">{lobby.title}</h2>
              <h3 className="text-2xl font-bold text-amber-300 mb-6">{lobby.subtitle}</h3>
            </div>
            <div className="max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed space-y-4">
                <p>{lobby.welcome}</p>
                <p>{lobby.what_its_for}</p>
                <p>{lobby.what_it_covers}</p>
            </div>
          </SectionPanel>
        );
      case LibrarySideTab.Aisles:
        return aisles ? <AislesTab root={aisles} manifest={manifest} /> : <SectionPanel><p>Loading aisles...</p></SectionPanel>;
      case LibrarySideTab.Dictionary:
        return dictionary ? <DictionaryTab dictionary={dictionary} /> : <SectionPanel><p>Loading dictionary...</p></SectionPanel>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 h-full py-8">
      <aside className="w-full md:w-48 lg:w-56 flex-shrink-0">
        <SideNav<LibrarySideTab> tabs={sideTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>
      <div className="flex-grow min-w-0 overflow-y-auto overflow-x-hidden">
        <div className="px-4 sm:px-6 lg:px-8 pb-28">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;