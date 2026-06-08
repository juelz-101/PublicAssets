// pages/GamingPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GamingPageData, GamingSideTab, NavItem, GamingSection } from '../types';
import { Manifest } from '../services/contentService';
import SideNav from '../components/SideNav';
import IntroductionTab from '../components/music/IntroductionTab';
import GamingCard from '../components/gaming/GamingCard';
import MarkdownRenderer from '../components/MarkdownRenderer';
import CategoryDashboard from '../components/CategoryDashboard';

interface GamingPageProps {
  data: GamingPageData;
  manifest: Manifest | null;
  showDebugContent: boolean;
}

const gamingNav: NavItem<GamingSideTab>[] = [
  { id: GamingSideTab.Introduction, label: 'Introduction' },
  { 
    id: GamingSideTab.UE5, 
    label: 'UE5 Projects',
    children: [
        { id: GamingSideTab.UE5_Games, label: 'Games' },
        { id: GamingSideTab.UE5_Assets, label: 'Assets' },
        { id: GamingSideTab.UE5_Tools, label: 'Tools' },
    ]
  },
  { 
    id: GamingSideTab.Unity, 
    label: 'Unity Projects',
    children: [
        { id: GamingSideTab.Unity_Games, label: 'Games' },
        { id: GamingSideTab.Unity_Assets, label: 'Assets' },
        { id: GamingSideTab.Unity_Tools, label: 'Tools' },
    ]
  },
  { 
    id: GamingSideTab.GTA, 
    label: 'GTA Modding',
    children: [
        { 
            id: GamingSideTab.GTA_FiveM, 
            label: 'FiveM',
            children: [
                { id: GamingSideTab.GTA_FiveM_Servers, label: 'Servers' },
                { id: GamingSideTab.GTA_FiveM_Assets, label: 'Assets' },
                { id: GamingSideTab.GTA_FiveM_Tools, label: 'Tools' },
            ]
        },
        { 
            id: GamingSideTab.GTA_V, 
            label: 'GTA V (SP)',
            children: [
                { id: GamingSideTab.GTA_V_Mods, label: 'Mods' },
                { id: GamingSideTab.GTA_V_Scripts, label: 'Scripts' },
            ]
        },
        { 
            id: GamingSideTab.GTA_IV, 
            label: 'GTA IV',
            children: [
                { id: GamingSideTab.GTA_IV_Mods, label: 'Mods' },
                { id: GamingSideTab.GTA_IV_Scripts, label: 'Scripts' },
            ]
        },
    ]
  },
  { 
    id: GamingSideTab.Valve, 
    label: 'Valve / Source',
    children: [
        { 
            id: GamingSideTab.Valve_GMod, 
            label: 'Garry\'s Mod',
            children: [
                { id: GamingSideTab.Valve_GMod_Mods, label: 'Mods' },
                { id: GamingSideTab.Valve_GMod_Maps, label: 'Maps' },
            ]
        },
        { 
            id: GamingSideTab.Valve_Wire, 
            label: 'Wiremod',
            children: [
                { id: GamingSideTab.Valve_Wire_Tools, label: 'Wire Tools' },
                { id: GamingSideTab.Valve_Wire_Scripts, label: 'Scripts (E2)' },
            ]
        },
    ]
  },
  { id: GamingSideTab.Roblox, label: 'Roblox' },
  { id: GamingSideTab.Web, label: 'Web Games' },
  { id: GamingSideTab.Other, label: 'Other Projects' },
];

const SESSION_STORAGE_KEY = 'zikyinc_gaming_active_tab';

const GamingPage: React.FC<GamingPageProps> = ({ data, manifest, showDebugContent }) => {
  const [activeTab, setActiveTab] = useState<GamingSideTab>(() => {
    const savedTab = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return (savedTab as GamingSideTab) || GamingSideTab.Introduction;
  });

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, activeTab);
  }, [activeTab]);

  const handleViewDetails = (link: string) => {
    console.log('Viewing details for:', link);
  };

  const newGamingItems = useMemo(() => {
      if (!data) return [];
      const items: any[] = [];
      const filterNew = (section: GamingSection | undefined) => {
          if (!section) return;
          const arrays = [section.games, section.mods, section.servers, section.assets, section.tools, section.scripts, section.maps];
          arrays.forEach(arr => {
              if (Array.isArray(arr)) {
                  items.push(...arr.filter(i => i.new === true));
              }
          });
      };

      filterNew(data.ue5);
      filterNew(data.unity);
      filterNew(data.gta?.fivem);
      filterNew(data.gta?.gta5);
      filterNew(data.gta?.iv);
      filterNew(data.valve?.gmod);
      filterNew(data.valve?.wire);
      filterNew(data.roblox);
      filterNew(data.web);
      filterNew(data.other);

      return items;
  }, [data]);

  const findNavItem = (id: GamingSideTab, items: NavItem<GamingSideTab>[] = gamingNav): NavItem<GamingSideTab> | undefined => {
      for (const item of items) {
          if (item.id === id) return item;
          if (item.children) {
              const found = findNavItem(id, item.children);
              if (found) return found;
          }
      }
      return undefined;
  };

  const getSectionData = useCallback((id: GamingSideTab): { name?: string; thumbnail?: string; summary?: string; content?: GamingSection } => {
    if (!data) return {};
    const getFunctionalMeta = (typeName: string) => ({
        name: typeName,
        thumbnail: 'Website/img/logos/ZIKYinc_DevLogo.png',
        summary: `Explore the collection of ${typeName.toLowerCase()} in this section.`
    });

    switch (id) {
        case GamingSideTab.UE5: return { ...data.ue5, content: data.ue5 };
        case GamingSideTab.Unity: return { ...data.unity, content: data.unity };
        case GamingSideTab.GTA: return data.gta || {};
        case GamingSideTab.Valve: return data.valve || {};
        case GamingSideTab.Roblox: return { ...data.roblox, content: data.roblox };
        case GamingSideTab.Web: return { ...data.web, content: data.web };
        case GamingSideTab.Other: return { ...data.other, content: data.other };
        case GamingSideTab.GTA_FiveM: return { ...data.gta?.fivem, content: data.gta?.fivem };
        case GamingSideTab.GTA_V: return { ...data.gta?.gta5, content: data.gta?.gta5 };
        case GamingSideTab.GTA_IV: return { ...data.gta?.iv, content: data.gta?.iv };
        case GamingSideTab.Valve_GMod: return { ...data.valve?.gmod, content: data.valve?.gmod };
        case GamingSideTab.Valve_Wire: return { ...data.valve?.wire, content: data.valve?.wire };
        case GamingSideTab.UE5_Games: return getFunctionalMeta('UE5 Games');
        case GamingSideTab.UE5_Assets: return getFunctionalMeta('UE5 Assets');
        case GamingSideTab.UE5_Tools: return getFunctionalMeta('UE5 Tools');
        case GamingSideTab.Unity_Games: return getFunctionalMeta('Unity Games');
        case GamingSideTab.Unity_Assets: return getFunctionalMeta('Unity Assets');
        case GamingSideTab.Unity_Tools: return getFunctionalMeta('Unity Tools');
        case GamingSideTab.GTA_FiveM_Servers: return getFunctionalMeta('FiveM Servers');
        case GamingSideTab.GTA_FiveM_Assets: return getFunctionalMeta('FiveM Assets');
        case GamingSideTab.GTA_FiveM_Tools: return getFunctionalMeta('FiveM Tools');
        case GamingSideTab.GTA_V_Mods: return getFunctionalMeta('GTA V Mods');
        case GamingSideTab.GTA_V_Scripts: return getFunctionalMeta('GTA V Scripts');
        case GamingSideTab.GTA_IV_Mods: return getFunctionalMeta('GTA IV Mods');
        case GamingSideTab.GTA_IV_Scripts: return getFunctionalMeta('GTA IV Scripts');
        case GamingSideTab.Valve_GMod_Mods: return getFunctionalMeta('GMod Mods');
        case GamingSideTab.Valve_GMod_Maps: return getFunctionalMeta('GMod Maps');
        case GamingSideTab.Valve_Wire_Tools: return getFunctionalMeta('Wire Tools');
        case GamingSideTab.Valve_Wire_Scripts: return getFunctionalMeta('Wire Scripts');
        default: return {};
    }
  }, [data]);

  const renderSection = (section: GamingSection | undefined, title?: string, subSectionFilter?: keyof GamingSection) => {
    if (!section) return null;
    const filter = (items: any[] | undefined) => (items || []).filter(item => showDebugContent || !item.debug);
    const filteredGames = subSectionFilter === 'games' || !subSectionFilter ? filter(section.games) : [];
    const filteredMods = subSectionFilter === 'mods' || !subSectionFilter ? filter(section.mods) : [];
    const filteredServers = subSectionFilter === 'servers' || !subSectionFilter ? filter(section.servers) : [];
    const filteredAssets = subSectionFilter === 'assets' || !subSectionFilter ? filter(section.assets) : [];
    const filteredTools = subSectionFilter === 'tools' || !subSectionFilter ? filter(section.tools) : [];
    const filteredScripts = subSectionFilter === 'scripts' || !subSectionFilter ? filter(section.scripts) : [];
    const filteredMaps = subSectionFilter === 'maps' || !subSectionFilter ? filter(section.maps) : [];

    const hasContent = filteredGames.length > 0 || filteredMods.length > 0 || filteredServers.length > 0 || filteredAssets.length > 0 || filteredTools.length > 0 || filteredScripts.length > 0 || filteredMaps.length > 0;

    if (!hasContent && !section.introduction) {
        return <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-dashed border-white/10"><p className="text-gray-500 font-medium italic">This section is currently being curated. Check back soon!</p></div>;
    }

    return (
      <div className="space-y-8 mb-12 animate-fade-in-up">
        {title && <h2 className="text-3xl font-bold text-amber-400 mb-4 border-b-2 border-white/10 pb-2">{title}</h2>}
        {section.introduction && !subSectionFilter && <div className="prose prose-invert max-w-none mb-6"><MarkdownRenderer markdown={section.introduction} manifest={manifest} /></div>}
        {filteredGames.length > 0 && (<div><h3 className="text-xl font-bold text-amber-300 mb-4">Games</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredGames.map(item => <GamingCard key={item.link} item={item} type="game" manifest={manifest} onViewDetails={handleViewDetails} />)}</div></div>)}
        {filteredMods.length > 0 && (<div><h3 className="text-xl font-bold text-amber-300 mb-4">Mods</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredMods.map(item => <GamingCard key={item.link} item={item} type="mod" manifest={manifest} onViewDetails={handleViewDetails} />)}</div></div>)}
        {filteredServers.length > 0 && (<div><h3 className="text-xl font-bold text-amber-300 mb-4">Servers</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredServers.map(item => <GamingCard key={item.link} item={item} type="server" manifest={manifest} onViewDetails={handleViewDetails} />)}</div></div>)}
        {filteredAssets.length > 0 && (<div><h3 className="text-xl font-bold text-amber-300 mb-4">Assets</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredAssets.map(item => <GamingCard key={item.link} item={{ ...item, genre: [item.type], platform: [] } as any} type="mod" manifest={manifest} onViewDetails={handleViewDetails} />)}</div></div>)}
        {filteredTools.length > 0 && (<div><h3 className="text-xl font-bold text-amber-300 mb-4">Tools</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredTools.map(item => <GamingCard key={item.link} item={{ ...item, genre: [item.type || 'Tool'], platform: [] } as any} type="mod" manifest={manifest} onViewDetails={handleViewDetails} />)}</div></div>)}
        {filteredScripts.length > 0 && (<div><h3 className="text-xl font-bold text-amber-300 mb-4">Scripts</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredScripts.map(item => <GamingCard key={item.link} item={{ ...item, genre: ['Script'], platform: [] } as any} type="mod" manifest={manifest} onViewDetails={handleViewDetails} />)}</div></div>)}
        {filteredMaps.length > 0 && (<div><h3 className="text-xl font-bold text-amber-300 mb-4">Maps</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredMaps.map(item => <GamingCard key={item.link} item={{ ...item, genre: ['Map'], platform: [] } as any} type="mod" manifest={manifest} onViewDetails={handleViewDetails} />)}</div></div>)}
      </div>
    );
  };

  const renderContent = () => {
    if (!data) return null;
    const navItem = findNavItem(activeTab);
    
    if (activeTab === GamingSideTab.Introduction) return <IntroductionTab htmlContent={data.intro} manifest={manifest} pageType="gaming" newItems={newGamingItems} onViewDetails={handleViewDetails} />;

    if (navItem?.children && navItem.children.length > 0) {
        const parentData = getSectionData(activeTab);
        return <CategoryDashboard title={navItem.label} subtitle={parentData.summary || `Explore the sub-sections of ${navItem.label}.`} items={navItem.children} onItemClick={(id) => setActiveTab(id)} manifest={manifest} dataMapper={(id) => getSectionData(id)} />;
    }

    switch (activeTab) {
        case GamingSideTab.UE5_Games: return renderSection(data.ue5, "UE5 Games", 'games');
        case GamingSideTab.UE5_Assets: return renderSection(data.ue5, "UE5 Assets", 'assets');
        case GamingSideTab.UE5_Tools: return renderSection(data.ue5, "UE5 Tools", 'tools');
        case GamingSideTab.Unity_Games: return renderSection(data.unity, "Unity Games", 'games');
        case GamingSideTab.Unity_Assets: return renderSection(data.unity, "Unity Assets", 'assets');
        case GamingSideTab.Unity_Tools: return renderSection(data.unity, "Unity Tools", 'tools');
        case GamingSideTab.GTA_FiveM_Servers: return renderSection(data.gta?.fivem, "FiveM Servers", 'servers');
        case GamingSideTab.GTA_FiveM_Assets: return renderSection(data.gta?.fivem, "FiveM Assets", 'assets');
        case GamingSideTab.GTA_FiveM_Tools: return renderSection(data.gta?.fivem, "FiveM Tools", 'tools');
        case GamingSideTab.GTA_V_Mods: return renderSection(data.gta?.gta5, "GTA V Mods", 'mods');
        case GamingSideTab.GTA_V_Scripts: return renderSection(data.gta?.gta5, "GTA V Scripts", 'scripts');
        case GamingSideTab.GTA_IV_Mods: return renderSection(data.gta?.iv, "GTA IV Mods", 'mods');
        case GamingSideTab.GTA_IV_Scripts: return renderSection(data.gta?.iv, "GTA IV Scripts", 'scripts');
        case GamingSideTab.Valve_GMod_Mods: return renderSection(data.valve?.gmod, "GMod Mods", 'mods');
        case GamingSideTab.Valve_GMod_Maps: return renderSection(data.valve?.gmod, "GMod Maps", 'maps');
        case GamingSideTab.Valve_Wire_Tools: return renderSection(data.valve?.wire, "Wire Tools", 'tools');
        case GamingSideTab.Valve_Wire_Scripts: return renderSection(data.valve?.wire, "Wire Scripts (E2)", 'scripts');
        case GamingSideTab.Roblox: return renderSection(data.roblox, "Roblox Central"); 
        case GamingSideTab.Web: return renderSection(data.web, "Web Games");
        case GamingSideTab.Other: return renderSection(data.other, "Miscellaneous");
        default: return null;
    }
  };

  if (!data) return <div className="p-8 text-center text-amber-400 font-bold">Gaming content unavailable.</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 h-full py-8">
      <aside className="w-full md:w-48 lg:w-56 flex-shrink-0"><SideNav<GamingSideTab> tabs={gamingNav} activeTab={activeTab} setActiveTab={setActiveTab} /></aside>
      <div className="flex-grow min-w-0 overflow-y-auto overflow-x-hidden"><div className="px-4 sm:px-6 lg:px-8 pb-28">{renderContent()}</div></div>
    </div>
  );
};

export default GamingPage;