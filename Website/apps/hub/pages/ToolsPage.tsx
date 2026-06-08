import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ToolsPageData, ToolsSideTab, Tool, ToolDetail, NavItem } from '../types';
import { Manifest } from '../services/contentService';
import { fetchFromGitHubRaw } from '../modules/io/import-utils';
import SideNav from '../components/SideNav';
import IntroductionTab from '../components/music/IntroductionTab';
import SearchAndFilter from '../components/SearchAndFilter';
import ToolCard from '../components/tools/ToolCard';
import ToolDetailView from '../components/tools/ToolDetailView';
import ViewSwitcher, { ViewMode } from '../components/ViewSwitcher';
import CategoryDashboard from '../components/CategoryDashboard';
import StandaloneLoader from '../components/tools/StandaloneLoader';

interface ToolsPageProps {
  data: ToolsPageData;
  manifest: Manifest | null;
  showDebugContent: boolean;
}

const toolsNav: NavItem<ToolsSideTab>[] = [
  { id: ToolsSideTab.Introduction, label: 'Introduction' },
  { id: ToolsSideTab.AllTools, label: 'All Tools' },
  { id: ToolsSideTab.WebTools, label: 'Web Tools' },
  { id: ToolsSideTab.WindowsTools, label: 'Windows Tools' },
  { 
    id: ToolsSideTab.Scripts, 
    label: 'Scripts',
    children: [
        { id: ToolsSideTab.Scripts_Py, label: 'Python Scripts' },
        { id: ToolsSideTab.Scripts_PS, label: 'PowerShell Scripts' },
        { id: ToolsSideTab.Scripts_AHK, label: 'AutoHotkey Scripts' },
    ]
  },
  { 
    id: ToolsSideTab.AITools, 
    label: 'AI Tools',
    children: [
        { id: ToolsSideTab.AI_Apps, label: 'AI Apps' },
        { id: ToolsSideTab.AI_Prompts, label: 'AI Prompts' },
    ]
  }
];

const SESSION_STORAGE_KEY = 'zikyinc_tools_active_tab';

const ToolsPage: React.FC<ToolsPageProps> = ({ data, manifest, showDebugContent }) => {
  const [activeTab, setActiveTab] = useState<ToolsSideTab>(() => {
    const savedTab = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedTab && Object.values(ToolsSideTab).includes(savedTab as ToolsSideTab)) {
        return savedTab as ToolsSideTab;
    }
    return ToolsSideTab.Introduction;
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const [selectedItemLink, setSelectedItemLink] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<ToolDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [launchedToolConfig, setLaunchedToolConfig] = useState<any | null>(null);

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
        const cleanLink = selectedItemLink.startsWith('/') ? selectedItemLink.slice(1) : selectedItemLink;
        const rawLink = cleanLink.startsWith('data/') ? cleanLink.replace('data/', 'Website/') : cleanLink;
        const content = await fetchFromGitHubRaw(user, repo, branch, rawLink);
        setDetailData(JSON.parse(content));
      } catch (err) {
        setDetailError(err instanceof Error ? err.message : 'Failed to load details.');
      } finally {
        setIsLoadingDetail(false);
      }
    };
    fetchDetailData();
  }, [selectedItemLink, manifest]);

  const allToolsFlat = useMemo(() => {
    const t = data?.tools || {};
    return [
      ...(t.web || []),
      ...(t.win || []),
      ...(t.scripts?.py || []),
      ...(t.scripts?.ps || []),
      ...(t.scripts?.ahk || []),
      ...(t.ai?.apps || []),
      ...(t.ai?.prompts || [])
    ].filter(Boolean);
  }, [data]);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    allToolsFlat.forEach(t => t.tags?.forEach(tag => cats.add(tag)));
    return ['All', ...Array.from(cats).sort()];
  }, [allToolsFlat]);

  const handleLaunch = useCallback(async (toolLink: string, providedData?: any) => {
      if (providedData && providedData.app_path) {
          setLaunchedToolConfig(providedData);
          return;
      }
      
      if (!manifest) return;
      try {
        const { user, repo, branch } = manifest.data.git;
        const cleanLink = toolLink.startsWith('/') ? toolLink.slice(1) : toolLink;
        const rawLink = cleanLink.startsWith('data/') ? cleanLink.replace('data/', 'Website/') : cleanLink;
        const content = await fetchFromGitHubRaw(user, repo, branch, rawLink);
        const config = JSON.parse(content);
        if (config.app_path) {
            setLaunchedToolConfig(config);
        } else {
            console.error("Tool does not have an app_path to launch");
        }
      } catch (err) {
          console.error("Failed to launch tool config:", err);
      }
  }, [manifest]);

  const renderContent = () => {
    if (launchedToolConfig) {
        return <StandaloneLoader toolConfig={launchedToolConfig} manifest={manifest} onClose={() => setLaunchedToolConfig(null)} />;
    }

    if (selectedItemLink) {
        return (
            <ToolDetailView 
                data={detailData} 
                isLoading={isLoadingDetail} 
                error={detailError} 
                onBack={() => setSelectedItemLink(null)} 
                onLaunch={() => handleLaunch(selectedItemLink, detailData)}
                manifest={manifest} 
            />
        );
    }

    if (activeTab === ToolsSideTab.Introduction) {
        return <IntroductionTab htmlContent={data?.intro || ''} newItems={allToolsFlat.filter(t => t.new)} manifest={manifest} onNavigate={() => {}} onViewDetails={setSelectedItemLink} />;
    }

    let itemsToDisplay: Tool[] = [];
    let title = '';

    const t = data?.tools || {};
    switch (activeTab) {
        case ToolsSideTab.AllTools: itemsToDisplay = allToolsFlat; title = 'All Tools'; break;
        case ToolsSideTab.WebTools: itemsToDisplay = t.web || []; title = 'Web Tools'; break;
        case ToolsSideTab.WindowsTools: itemsToDisplay = t.win || []; title = 'Windows Tools'; break;
        case ToolsSideTab.Scripts_Py: itemsToDisplay = t.scripts?.py || []; title = 'Python Scripts'; break;
        case ToolsSideTab.Scripts_PS: itemsToDisplay = t.scripts?.ps || []; title = 'PowerShell Scripts'; break;
        case ToolsSideTab.Scripts_AHK: itemsToDisplay = t.scripts?.ahk || []; title = 'AutoHotkey Scripts'; break;
        case ToolsSideTab.AI_Apps: itemsToDisplay = t.ai?.apps || []; title = 'AI Apps'; break;
        case ToolsSideTab.AI_Prompts: itemsToDisplay = t.ai?.prompts || []; title = 'AI Prompts'; break;
        case ToolsSideTab.Scripts:
             return <CategoryDashboard 
                 title="Scripts" 
                 subtitle={t.scripts?.summary || "Various scripts"} 
                 items={toolsNav.find(n => n.id === ToolsSideTab.Scripts)?.children || []} 
                 onItemClick={(id) => setActiveTab(id as ToolsSideTab)} 
                 manifest={manifest} 
                 dataMapper={() => ({})} 
             />;
        case ToolsSideTab.AITools:
             return <CategoryDashboard 
                 title="AI Tools" 
                 subtitle={t.ai?.summary || "AI related tools"} 
                 items={toolsNav.find(n => n.id === ToolsSideTab.AITools)?.children || []} 
                 onItemClick={(id) => setActiveTab(id as ToolsSideTab)} 
                 manifest={manifest} 
                 dataMapper={() => ({})} 
             />;
    }

    const filteredItems = itemsToDisplay.filter(item => {
        if (!showDebugContent && item.flags?.includes('debug') && !item.flags?.includes('featured')) return false;
        
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.summary?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = genreFilter === 'All' || item.tags?.includes(genreFilter);
        return matchesSearch && matchesGenre;
    });

    const isFeatured = (item: Tool) => item.flags?.includes('featured');
    const featuredItems = filteredItems.filter(isFeatured);

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="sticky top-2 z-10 flex justify-end -mr-2">
                <div className="flex items-center gap-2 bg-gray-900/70 backdrop-blur-md p-1.5 rounded-xl ring-1 ring-white/10 shadow-lg">
                    <SearchAndFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeFilter={genreFilter} setActiveFilter={setGenreFilter} filterOptions={allCategories} filterTypeLabel="Tags" />
                    <ViewSwitcher activeView={viewMode} setActiveView={setViewMode} />
                </div>
            </div>

            <div className="mb-8 border-b-2 border-amber-500/20 pb-4">
                 <h1 className="text-4xl font-bold text-amber-400">{title}</h1>
            </div>

            {featuredItems.length > 0 && (
                <div>
                   <h2 className="text-2xl font-bold text-amber-300 mb-4 border-b-2 border-white/10 pb-2">Featured</h2>
                   <div className="flex flex-wrap gap-6">
                       {featuredItems.map((item) => (
                           <div key={item.link} className="w-full md:w-80 h-full">
                               <ToolCard item={item} manifest={manifest} onViewDetails={setSelectedItemLink} onLaunch={item.category?.toLowerCase().includes('web') || item.tags?.some(tag => tag.toLowerCase() === 'web') ? () => handleLaunch(item.link) : undefined} />
                           </div>
                       ))}
                   </div>
                </div>
            )}

            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <ToolCard key={item.link} item={item} manifest={manifest} onViewDetails={setSelectedItemLink} onLaunch={item.category?.toLowerCase().includes('web') || item.tags?.some(tag => tag.toLowerCase() === 'web') ? () => handleLaunch(item.link) : undefined} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500">No tools found matching your criteria.</div>
            )}
        </div>
    );
  };

  if (!data) return <div className="p-8 text-center text-amber-400 font-bold">Tools content unavailable.</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 h-full py-8">
      <aside className="w-full md:w-48 lg:w-56 flex-shrink-0">
        <SideNav<ToolsSideTab> tabs={toolsNav} activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>
      <div className="flex-grow min-w-0 overflow-y-auto overflow-x-hidden">
        <div className="px-4 sm:px-6 lg:px-8 pb-28">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
