// pages/ArtPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArtPageData, ArtSideTab, NavItem, ArtSection } from '../types';
import { Manifest } from '../services/contentService';
import SideNav from '../components/SideNav';
import IntroductionTab from '../components/music/IntroductionTab';
import CategoryDashboard from '../components/CategoryDashboard';
import ArtCard from '../components/art/ArtCard';

interface ArtPageProps {
    data: ArtPageData;
    manifest: Manifest | null;
}

const SESSION_STORAGE_KEY = 'zikyinc_art_active_tab';

const ArtPage: React.FC<ArtPageProps> = ({ data, manifest }) => {
    const [activeTab, setActiveTab] = useState<ArtSideTab>(() => {
        const savedTab = sessionStorage.getItem(SESSION_STORAGE_KEY);
        return (savedTab as ArtSideTab) || ArtSideTab.Introduction;
    });

    useEffect(() => {
        sessionStorage.setItem(SESSION_STORAGE_KEY, activeTab);
    }, [activeTab]);

    /**
     * Build the nav based on what keys exist in the data.
     */
    const artNav = useMemo((): NavItem<ArtSideTab>[] => {
        const nav: NavItem<ArtSideTab>[] = [{ id: ArtSideTab.Introduction, label: 'Introduction' }];
        if (data.canvas_art) nav.push({ id: ArtSideTab.Canvas, label: 'Canvas Art' });
        if (data.street_art) nav.push({ id: ArtSideTab.Street, label: 'Street Art' });
        if (data.digital_art) nav.push({ id: ArtSideTab.Digital, label: 'Digital Art' });
        if (data.artists) nav.push({ id: ArtSideTab.Artists, label: 'Artists' });
        return nav;
    }, [data]);

    const handleViewDetails = (link: string) => {
        console.log('Viewing art details:', link);
    };

    const newArtItems = useMemo(() => {
        if (!data) return [];
        const items: any[] = [];
        const filterNew = (arr: any[] | undefined) => (arr || []).filter(item => item.new === true);
        
        items.push(...filterNew(data.canvas_art?.pieces));
        items.push(...filterNew(data.street_art?.pieces));
        items.push(...filterNew(data.digital_art?.pieces));
        items.push(...filterNew(data.artists?.list));
        
        return items;
    }, [data]);

    const getSectionData = useCallback((id: ArtSideTab): any => {
        if (!data) return {};
        switch (id) {
            case ArtSideTab.Canvas: return data.canvas_art;
            case ArtSideTab.Street: return data.street_art;
            case ArtSideTab.Digital: return data.digital_art;
            case ArtSideTab.Artists: return data.artists;
            default: return {};
        }
    }, [data]);

    const renderGallery = (section: ArtSection | undefined, title: string, type: 'piece' | 'artist') => {
        if (!section) return null;
        const items = type === 'piece' ? section.pieces : section.list;
        
        return (
            <div className="animate-fade-in-up space-y-8">
                <header className="border-b border-white/10 pb-6">
                    <h2 className="text-4xl font-extrabold text-amber-400">{title}</h2>
                    {section.summary && <p className="text-gray-400 mt-2 text-lg">{section.summary}</p>}
                </header>

                {section.introduction && (
                    <div className="prose prose-invert max-w-none bg-gray-900/30 p-6 rounded-2xl ring-1 ring-white/5">
                        <IntroductionTab 
                            htmlContent={section.introduction} 
                            manifest={manifest} 
                            pageType="art"
                            newItems={newArtItems} // Show all new art items here as well or filter per section
                            onViewDetails={handleViewDetails}
                        />
                    </div>
                )}

                {items && items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {items.map(item => (
                            <ArtCard key={item.link} item={item as any} type={type} manifest={manifest} onViewDetails={handleViewDetails} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-dashed border-white/10">
                        <p className="text-gray-500 italic">No items currently on display in this gallery.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        if (!data) return null;

        if (activeTab === ArtSideTab.Introduction) {
            const galleryItems = artNav.filter(n => n.id !== ArtSideTab.Introduction);
            return (
                <div className="space-y-12">
                    <IntroductionTab 
                        htmlContent={data.intro} 
                        manifest={manifest} 
                        pageType="art" 
                        newItems={newArtItems}
                        onViewDetails={handleViewDetails}
                    />
                    <CategoryDashboard 
                        title="Gallery Aisles"
                        subtitle="Explore our visual collections by medium and artist."
                        items={galleryItems}
                        onItemClick={(id) => setActiveTab(id)}
                        manifest={manifest}
                        dataMapper={(id) => getSectionData(id)}
                    />
                </div>
            );
        }

        switch (activeTab) {
            case ArtSideTab.Canvas: return renderGallery(data.canvas_art, "The Canvas Gallery", 'piece');
            case ArtSideTab.Street: return renderGallery(data.street_art, "Street & Urban Works", 'piece');
            case ArtSideTab.Digital: return renderGallery(data.digital_art, "The Digital Frontier", 'piece');
            case ArtSideTab.Artists: return renderGallery(data.artists, "Resident Artists", 'artist');
            default: return null;
        }
    };

    if (!data) return <div className="p-8 text-center text-amber-400 font-bold">Art content unavailable.</div>;

    return (
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 h-full py-8">
            <aside className="w-full md:w-48 lg:w-56 flex-shrink-0">
                <SideNav<ArtSideTab> tabs={artNav} activeTab={activeTab} setActiveTab={setActiveTab} />
            </aside>
            <div className="flex-grow min-w-0 overflow-y-auto overflow-x-hidden">
                <div className="px-4 sm:px-6 lg:px-8 pb-28">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ArtPage;