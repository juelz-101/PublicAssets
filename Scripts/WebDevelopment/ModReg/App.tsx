import React, { useState, useEffect } from 'react';
// FIX: Using namespace import to resolve "no exported member" errors.
import * as ReactRouterDOM from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Welcome from './components/Welcome';
import Playground from './components/Playground';
import ModuleView from './components/ModuleView';
import type { ModuleCategory, SystemCategory } from './types';
import SettingsModal from './components/SettingsModal';
import HomepageBackground from './components/HomepageBackground';
import ParticleBackground from './components/ParticleBackground';
import HomepageToolbar, { BackgroundParams } from './components/HomepageToolbar';
import MobileToolbar from './components/MobileToolbar';
import ModuleListModal from './components/ModuleListModal';
import BulkActionModal from './components/BulkActionModal';
import SystemView from './components/SystemView';

const { HashRouter, Routes, Route, useLocation } = ReactRouterDOM;

const AppContent: React.FC<{ moduleData: ModuleCategory[], systemData: SystemCategory[] }> = ({ moduleData, systemData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const location = useLocation();
  const isHomepage = location.pathname === '/';

  // State for background parameters
  const [backgroundParams, setBackgroundParams] = useState<BackgroundParams>({
    speed: 0.8,
    buildingCount: 60,
    fov: 300,
    worldWidth: 4000,
    gridDensity: 20,
    hillComplexity: 50,
    hillHeight: 30,
    cameraHeight: 200,
  });

  useEffect(() => {
    document.body.classList.toggle('grid-background', !isHomepage);
    return () => {
      document.body.classList.remove('grid-background');
    };
  }, [isHomepage]);


  return (
    <>
      {isHomepage ? <HomepageBackground params={backgroundParams} onBackgroundClick={() => !isUIVisible && setIsUIVisible(true)} /> : <ParticleBackground />}
      
      {isHomepage && <HomepageToolbar params={backgroundParams} setParams={setBackgroundParams} onToggleUI={() => setIsUIVisible(false)} />}
      
      {isUIVisible && (
        <div className="flex h-screen text-text-primary relative z-10">
            <Sidebar 
              moduleData={moduleData} 
              systemData={systemData}
              isOpen={isSidebarOpen} 
              setIsOpen={setIsSidebarOpen}
              onSettingsClick={() => setIsSettingsOpen(true)}
              onBulkClick={() => setIsBulkModalOpen(true)}
            />
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
              <Routes>
                <Route path="/playground" element={<Playground moduleData={moduleData} />} />
                <Route 
                  path="/examples/:category/:module" 
                  element={<ModuleView moduleData={moduleData} />} 
                />
                <Route 
                  path="/systems/:category/:system" 
                  element={<SystemView systemData={systemData} moduleData={moduleData} />} 
                />
                <Route path="/" element={<Welcome onBrowseModules={() => setIsSidebarOpen(true)} />} />
              </Routes>
            </main>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <BulkActionModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} moduleData={moduleData} systemData={systemData} />
             <MobileToolbar 
              onModulesClick={() => setIsModulesModalOpen(true)}
              onSettingsClick={() => setIsSettingsOpen(true)}
              onBulkClick={() => setIsBulkModalOpen(true)}
            />
            <ModuleListModal 
              isOpen={isModulesModalOpen}
              onClose={() => setIsModulesModalOpen(false)}
              moduleData={moduleData}
              systemData={systemData}
            />
        </div>
      )}
    </>
  );
};


const App: React.FC = () => {
  const [moduleData, setModuleData] = useState<ModuleCategory[]>([]);
  const [systemData, setSystemData] = useState<SystemCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const moduleFiles = [
      './module_register.json', 
      './module_register1.json', 
      './module_register2.json', 
      './module_register3.json', 
      './module_register4.json', 
      './module_register5.json', 
      './module_register6.json', 
      './module_register7.json',
      './module_register8.json',
      './module_register9.json'
    ];

    const systemFiles = [
      './system_register.json'
    ];
    
    const fetchData = async () => {
      try {
        // Fetch Modules
        const moduleResponses = await Promise.all(
          moduleFiles.map(file => fetch(file))
        );

        const allModuleData = await Promise.all(
          moduleResponses.map(res => res.ok ? res.json() as Promise<ModuleCategory[]> : Promise.resolve([]))
        );
        
        const moduleCategoryMap = new Map<string, ModuleCategory>();
        for (const dataSet of allModuleData) {
          if (!Array.isArray(dataSet)) continue;
          for (const category of dataSet) {
            if (!moduleCategoryMap.has(category.category)) {
              moduleCategoryMap.set(category.category, { ...category, modules: [...category.modules] });
            } else {
              moduleCategoryMap.get(category.category)!.modules.push(...category.modules);
            }
          }
        }
        setModuleData(Array.from(moduleCategoryMap.values()));

        // Fetch Systems
        const systemResponses = await Promise.all(
          systemFiles.map(file => fetch(file))
        );

        const allSystemData = await Promise.all(
          systemResponses.map(res => res.ok ? res.json() as Promise<SystemCategory[]> : Promise.resolve([]))
        );

        const systemCategoryMap = new Map<string, SystemCategory>();
        for (const dataSet of allSystemData) {
          if (!Array.isArray(dataSet)) continue;
          for (const category of dataSet) {
            if (!systemCategoryMap.has(category.category)) {
              systemCategoryMap.set(category.category, { ...category, systems: [...category.systems] });
            } else {
              systemCategoryMap.get(category.category)!.systems.push(...category.systems);
            }
          }
        }
        setSystemData(Array.from(systemCategoryMap.values()));

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error("Failed to fetch registry data:", errorMessage);
        setError("Failed to load registry data. Please check the console.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-teal"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-neon-red">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <AppContent moduleData={moduleData} systemData={systemData} />
    </HashRouter>
  );
};

export default App;