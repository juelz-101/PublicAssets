// App.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Header from './components/Header';
import { Tab, HomePageData, MusicPageData, ToolsPageData, AboutPageData, CommunityPageData, LibraryPageData, GamingPageData, ArtPageData } from './types';
import { fetchManifest, fetchAllPagesData, fetchRandomBackgroundUrl, SiteData, Manifest, ManifestUISettings } from './services/contentService';
import HomePage from './pages/HomePage';
import MusicPage from './pages/MusicPage';
import ToolsPage from './pages/ToolsPage';
import AboutPage from './pages/AboutPage';
import CommunityPage from './pages/CommunityPage';
import LibraryPage from './pages/LibraryPage';
import GamingPage from './pages/GamingPage';
import ArtPage from './pages/ArtPage';
import DebugMenu from './components/DebugMenu';

const PageContent: React.FC<{ data: any; title?: string; message?: string[] }> = ({ data, title, message }) => {
  const displayTitle = data?.title || title || 'Loading...';
  const displayParagraphs = data?.paragraphs || message || [];

  return (
    <div className="p-6 sm:p-8 bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl ring-1 ring-white/10">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-amber-400">{displayTitle}</h1>
      <div className="text-gray-300 leading-relaxed space-y-4">
        {displayParagraphs.map((p, index) => <p key={index}>{p}</p>)}
      </div>
    </div>
  );
};

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 11M20 20l-1.5-1.5A9 9 0 003.5 13" />
    </svg>
);

const HideIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ShowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.05 10.05 0 01-4.125 5.825m0 0l3.59 3.59M21 21L3 3" />
  </svg>
);

const BlurIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M5 17v4m-2-2h4m11-12v4m2-2h-4m2 12h-4m4 2v-4M9 5a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
    </svg>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [backgrounds, setBackgrounds] = useState<[string, string]>(['', '']);
  const [activeBgIndex, setActiveBgIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isBlurSliderVisible, setIsBlurSliderVisible] = useState(false);
  const [showDebugContent, setShowDebugContent] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState<boolean>(true);
  const [uiSettings, setUiSettings] = useState<ManifestUISettings | undefined>(undefined);
  const [backgroundLoadedCount, setBackgroundLoadedCount] = useState(0);
  
  const intervalRef = useRef<number | null>(null);
  const backgroundsRef = useRef(backgrounds);
  const isTransitioningRef = useRef(isTransitioning);
  const activeTabRef = useRef(activeTab);
  const initialLoad = useRef(true);

  useEffect(() => { backgroundsRef.current = backgrounds; }, [backgrounds]);
  useEffect(() => { isTransitioningRef.current = isTransitioning; }, [isTransitioning]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isDebug = useMemo(() => {
    console.log("Manifest:", manifest);
    console.log("Debug config:", manifest?.data?.cfg?.debug);
    return manifest?.data?.cfg?.debug?.on || false;
  }, [manifest]);

  useEffect(() => {
    if (!uiSettings || !manifest) return;
    const { layout, effects } = uiSettings;
    const safeMode = manifest.settings.safe_mode;
    
    const css = `
      :root {
        --padding-base: ${layout.padding_base_unit_px}px;
        --main-content-padding: calc(var(--padding-base) * ${layout.main_content_padding_multiplier});
        --panel-padding: calc(var(--padding-base) * ${layout.panel_padding_multiplier});
        --panel-radius: ${layout.panel_border_radius_px}px;
        --panel-ring-color: rgba(255, 255, 255, ${layout.panel_ring_opacity_percent / 100});
        --background-blur-amount: ${effects.background_blur_px}px;
        --header-blur-amount: ${effects.header_blur_px}px;
        --footer-blur-amount: ${effects.footer_blur_px}px;
        --hud-blur-amount: ${effects.hud_blur_px}px;
        --glow-color-primary-rgb: ${effects.glow_primary_color_rgba};
        --glow-color-primary: rgba(var(--glow-color-primary-rgb), ${effects.glow_primary_opacity_percent / 100});
      }
      ${(safeMode.on && safeMode.override.performance.reduced_motion) ? `
        .animate-fade-in-up { animation: none !important; opacity: 1 !important; transform: none !important; }
        .transition-all { transition: none !important; }
        * { transition-duration: 0ms !important; }
      ` : ''}
    `;
    let styleTag = document.getElementById('dynamic-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-styles';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = css;
  }, [uiSettings, manifest]);

  useEffect(() => {
    if (!uiSettings?.effects.enable_glow_effect) {
        document.body.classList.add('glow-disabled');
        return;
    }
    document.body.classList.remove('glow-disabled');
    const handleGlobalMouseMove = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const glowingElement = target.closest('.glow-on-hover');
        if (glowingElement) {
            const rect = glowingElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            (glowingElement as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
            (glowingElement as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
        }
    };
    document.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.body.classList.remove('glow-disabled');
    };
  }, [uiSettings?.effects.enable_glow_effect]);

  const loadNextBackground = useCallback(() => {
    if (isTransitioningRef.current || !manifest || !uiSettings) return;
    
    // --- Safe Mode Background Blocking ---
    const safeMode = manifest.settings.safe_mode;
    if (safeMode.on && safeMode.override.images.block_background.on) {
        const mode = safeMode.override.images.block_background.mode;
        if (mode === 'total_block') {
            console.warn("[SAFE_MODE] Background block: total_block");
            return;
        }
        if (mode === 'one_and_done' && backgroundLoadedCount >= 1) {
            console.info("[SAFE_MODE] Background block: one_and_done limit reached.");
            return;
        }
    }

    setIsTransitioning(true);

    fetchRandomBackgroundUrl(manifest, activeTabRef.current, uiSettings.backgrounds.per_page_switching)
      .then(url => {
        if (!url || backgroundsRef.current.includes(url)) {
          setIsTransitioning(false);
          return; 
        }
        setActiveBgIndex(prevIndex => {
          const inactiveIndex = 1 - prevIndex;
          setBackgrounds(prevBgs => {
            const newBgs: [string, string] = [prevBgs[0], prevBgs[1]];
            newBgs[inactiveIndex] = url;
            return newBgs;
          });
          return inactiveIndex;
        });
        setBackgroundLoadedCount(c => c + 1);
        setTimeout(() => setIsTransitioning(false), 2000);
      })
      .catch((err) => {
        console.warn("Background fetch suppressed to avoid rate limiting:", err.message);
        setIsTransitioning(false);
      });
  }, [manifest, uiSettings, backgroundLoadedCount]);

  const startBgInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!uiSettings || !uiSettings.backgrounds.allow_auto_change) return;
    
    const min = (uiSettings.backgrounds.change_interval_min_seconds || 20) * 1000;
    const max = (uiSettings.backgrounds.change_interval_max_seconds || 40) * 1000;
    const randomDelay = Math.floor(Math.random() * (max - min + 1)) + min;
    intervalRef.current = window.setInterval(loadNextBackground, randomDelay);
  }, [loadNextBackground, uiSettings]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const manifestData = await fetchManifest();
        setManifest(manifestData);
        if (manifestData.settings) {
          const { site, content, ui } = manifestData.settings;
          const params = new URLSearchParams(window.location.search);
          if (!params.get('tab') && site?.default_tab && Object.values(Tab).includes(site.default_tab as Tab)) {
            setActiveTab(site.default_tab as Tab);
          }
          if (ui) {
            setUiSettings(ui);
            setIsUiVisible(ui.show_ui_on_load);
          }
          if (content) setShowDebugContent(content.show_debug_items_by_default);
        }
        const allData = await fetchAllPagesData(manifestData);
        setSiteData(allData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
      if (!manifest || !uiSettings) return;
      if (initialLoad.current) {
          loadNextBackground();
          initialLoad.current = false;
      }
      if (prevTab.current !== activeTab) {
          if (uiSettings.backgrounds.per_page_switching) loadNextBackground();
          prevTab.current = activeTab;
      }
      startBgInterval();
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeTab, manifest, uiSettings, loadNextBackground, startBgInterval]);
  
  const handleNextImageClick = useCallback(() => {
    if (isTransitioning) return;
    loadNextBackground();
    startBgInterval();
  }, [loadNextBackground, startBgInterval, isTransitioning]);

  const renderContent = () => {
    const simplePageWrapper = (content: React.ReactNode) => (
      <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-3xl">{content}</div>
      </div>
    );
    if (loading) return simplePageWrapper(<PageContent data={null} title="Loading ZIKYinc..." message={["Fetching latest content. Please stand by."]} />);
    if (error) return simplePageWrapper(<PageContent data={null} title="System Error" message={[`Details: ${error}`]} />);
    const currentPageData = siteData ? siteData[activeTab] : null;
    if (!currentPageData) return simplePageWrapper(<PageContent data={null} title="Content Not Found" message={[`We couldn't find any content for ${activeTab}.`]} />);

    switch (activeTab) {
      case Tab.Home: return <HomePage data={currentPageData as HomePageData} manifest={manifest} />;
      case Tab.Music: return <MusicPage data={currentPageData as MusicPageData} manifest={manifest} showDebugContent={showDebugContent} />;
      case Tab.Art: return <ArtPage data={currentPageData as ArtPageData} manifest={manifest} />;
      case Tab.Tools: return <ToolsPage data={currentPageData as ToolsPageData} manifest={manifest} showDebugContent={showDebugContent} />;
      case Tab.About: return <AboutPage data={currentPageData as AboutPageData} manifest={manifest} />;
      case Tab.Community: return <CommunityPage data={currentPageData as CommunityPageData} manifest={manifest} showDebugContent={showDebugContent} />;
      case Tab.Library: return <LibraryPage data={currentPageData as LibraryPageData} manifest={manifest} />;
      case Tab.Gaming: return <GamingPage data={currentPageData as GamingPageData} manifest={manifest} showDebugContent={showDebugContent} />;
      default: return simplePageWrapper(<PageContent data={currentPageData} />);
    }
  };

  const prevTab = useRef<Tab>(activeTab);

  return (
    <>
      <div className="fixed inset-0 bg-cover bg-center bg-fixed transition-opacity duration-[2000ms] ease-in-out glow-on-hover glow-bg" style={{ backgroundImage: `url(${backgrounds[0]})`, opacity: activeBgIndex === 0 ? 1 : 0 }} aria-hidden="true" />
      <div className="fixed inset-0 bg-cover bg-center bg-fixed transition-opacity duration-[2000ms] ease-in-out glow-on-hover glow-bg" style={{ backgroundImage: `url(${backgrounds[1]})`, opacity: activeBgIndex === 1 ? 1 : 0 }} aria-hidden="true" />
      <div className="relative h-screen bg-transparent font-sans" aria-live="polite">
        <div className="h-full w-full bg-black/30 flex flex-col overflow-hidden" style={{ backdropFilter: isUiVisible ? `blur(var(--background-blur-amount))` : 'none', transition: 'backdrop-filter 0.5s ease-in-out' }}>
          {isUiVisible && <Header activeTab={activeTab} setActiveTab={setActiveTab} manifest={manifest} isDebug={isDebug} />}
          <main className={`max-w-screen-2xl mx-auto w-full flex-grow transition-opacity duration-500 overflow-hidden ${isUiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ paddingLeft: 'var(--main-content-padding)', paddingRight: 'var(--main-content-padding)'}}>
            <div key={activeTab} className="animate-fade-in-up h-full">{renderContent()}</div>
          </main>
          {isUiVisible && (
              <footer className="w-full text-center p-4 border-t border-white/10" style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)', backdropFilter: `blur(var(--footer-blur-amount))` }}>
                  <h2 className="text-amber-500 font-semibold tracking-wide">ZIKYinc 2024 - London UK</h2>
              </footer>
          )}
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3">
            {isBlurSliderVisible && isUiVisible && uiSettings && (
                <div className="p-3 rounded-lg ring-1 ring-white/10 w-48 animate-fade-in-up" style={{ backgroundColor: 'rgba(17, 24, 39, 0.6)', backdropFilter: `blur(var(--hud-blur-amount))` }}>
                    <label htmlFor="blur-slider" className="text-xs text-amber-200 block mb-2">Background Blur</label>
                    <input id="blur-slider" type="range" min="0" max="40" step="1" value={uiSettings.effects.background_blur_px} onChange={(e) => setUiSettings({ ...uiSettings, effects: { ...uiSettings.effects, background_blur_px: Number(e.target.value) } })} className="w-full h-2 rounded-lg appearance-none cursor-pointer" />
                </div>
            )}
            <div className="flex space-x-3">
                 <button onClick={() => setIsBlurSliderVisible(!isBlurSliderVisible)} className="p-3 text-amber-300 rounded-full ring-1 ring-white/10 shadow-lg hover:bg-gray-900/80 hover:text-amber-400 transition-all duration-300" style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)', backdropFilter: `blur(var(--hud-blur-amount))` }}>
                    <BlurIcon />
                 </button>
                 <button onClick={handleNextImageClick} disabled={isTransitioning} className="p-3 text-amber-300 rounded-full ring-1 ring-white/10 shadow-lg hover:bg-gray-900/80 hover:text-amber-400 transition-all duration-300 disabled:opacity-50" style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)', backdropFilter: `blur(var(--hud-blur-amount))` }}>
                    <RefreshIcon />
                 </button>
                 <button onClick={() => setIsUiVisible(!isUiVisible)} className="p-3 text-amber-300 rounded-full ring-1 ring-white/10 shadow-lg hover:bg-gray-900/80 hover:text-amber-400 transition-all duration-300" style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)', backdropFilter: `blur(var(--hud-blur-amount))` }}>
                    {isUiVisible ? <ShowIcon /> : <HideIcon />}
                 </button>
            </div>
      </div>
      {isDebug && <DebugMenu manifest={manifest} siteData={siteData} uiSettings={uiSettings} setUiSettings={setUiSettings} setManifest={setManifest} />}
    </>
  );
};

export default App;
