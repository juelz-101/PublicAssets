import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import type { ModuleCategory, Module, SystemCategory, System } from '../types';
import { downloadFile } from '../modules/file-system/file-utils';
import FolderIcon from './icons/FolderIcon';
import FileIcon from './icons/FileIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import Squares2X2Icon from './icons/Squares2X2Icon';
import { APP_VERSION } from '../version';

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleData: ModuleCategory[];
  systemData: SystemCategory[];
}

type Tab = 'download' | 'register' | 'systems';

const BulkActionModal: React.FC<BulkActionModalProps> = ({ isOpen, onClose, moduleData, systemData }) => {
  const [activeTab, setActiveTab] = useState<Tab>('download');
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [selectedSystems, setSelectedSystems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(moduleData.map(c => c.category)));
  const [expandedSystemCategories, setExpandedSystemCategories] = useState<Set<string>>(new Set(systemData.map(c => c.category)));
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Download Options
  const [includeDocs, setIncludeDocs] = useState(true);
  const [includeAiRules, setIncludeAiRules] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includeRegisters, setIncludeRegisters] = useState(true);
  const [bundleDependencies, setBundleDependencies] = useState(true);

  // Register Builder Options
  const [regIncludeFunctions, setRegIncludeFunctions] = useState(true);
  const [regIncludeParams, setRegIncludeParams] = useState(true);
  const [regIncludePaths, setRegIncludePaths] = useState(true);
  const [regIncludeDesc, setRegIncludeDesc] = useState(true);

  if (!isOpen) return null;

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    if (!searchQuery) return moduleData;
    const lowerQuery = searchQuery.toLowerCase();
    
    return moduleData.map(cat => {
      const matchingModules = cat.modules.filter(m => 
        m.name.toLowerCase().includes(lowerQuery) || 
        m.description.toLowerCase().includes(lowerQuery)
      );
      
      if (matchingModules.length > 0 || cat.category.toLowerCase().includes(lowerQuery)) {
        return { ...cat, modules: matchingModules.length > 0 ? matchingModules : cat.modules };
      }
      return null;
    }).filter(Boolean) as ModuleCategory[];
  }, [moduleData, searchQuery]);

  // --- Selection Handlers ---
  const toggleModule = (moduleName: string) => {
    const newSet = new Set(selectedModules);
    if (newSet.has(moduleName)) {
        newSet.delete(moduleName);
    } else {
        newSet.add(moduleName);
    }
    setSelectedModules(newSet);
  };

  const toggleSystem = (systemName: string) => {
    const newSet = new Set(selectedSystems);
    if (newSet.has(systemName)) {
        newSet.delete(systemName);
    } else {
        newSet.add(systemName);
    }
    setSelectedSystems(newSet);
  };

  const toggleCategory = (category: ModuleCategory) => {
    const allSelected = category.modules.every(m => selectedModules.has(m.name));
    const newSet = new Set(selectedModules);
    
    category.modules.forEach(m => {
        if (allSelected) {
            newSet.delete(m.name);
        } else {
            newSet.add(m.name);
        }
    });
    setSelectedModules(newSet);
  };

  const toggleSystemCategory = (category: SystemCategory) => {
    const allSelected = category.systems.every(s => selectedSystems.has(s.name));
    const newSet = new Set(selectedSystems);
    
    category.systems.forEach(s => {
        if (allSelected) {
            newSet.delete(s.name);
        } else {
            newSet.add(s.name);
        }
    });
    setSelectedSystems(newSet);
  };

  const toggleExpand = (category: string) => {
      const newSet = new Set(expandedCategories);
      if (newSet.has(category)) newSet.delete(category);
      else newSet.add(category);
      setExpandedCategories(newSet);
  };

  const toggleExpandSystem = (category: string) => {
    const newSet = new Set(expandedSystemCategories);
    if (newSet.has(category)) newSet.delete(category);
    else newSet.add(category);
    setExpandedSystemCategories(newSet);
};

  // --- Action Handlers ---
  const handleBulkDownload = async () => {
      if (selectedModules.size === 0 && selectedSystems.size === 0) return;
      setIsProcessing(true);
      setStatusMessage('Initializing zip...');

      try {
          const zip = new JSZip();
          const usedCategories = new Set<string>();
          const registerData: ModuleCategory[] = [];
          const systemRegisterData: SystemCategory[] = [];

          // Helper to fetch text content
          const fetchText = async (path: string) => {
              try {
                  const res = await fetch(path);
                  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
                  return await res.text();
              } catch (e) {
                  console.warn(`Could not fetch file: ${path}`, e);
                  return null;
              }
          };

          const allModules = moduleData.flatMap(c => c.modules);
          const finalModuleSelection = new Set(selectedModules);

          // 0. Resolve System Dependencies
          if (bundleDependencies && selectedSystems.size > 0) {
            systemData.forEach(cat => {
                cat.systems.forEach(sys => {
                    if (selectedSystems.has(sys.name)) {
                        sys.dependencies.forEach(depName => {
                            const mod = allModules.find(m => m.name === depName || m.path.includes(depName));
                            if (mod) finalModuleSelection.add(mod.name);
                        });
                    }
                });
            });
          }

          // 1. Process Systems
          for (const cat of systemData) {
            const selectedInCat = cat.systems.filter(s => selectedSystems.has(s.name));
            if (selectedInCat.length === 0) continue;

            const catReg = { ...cat, systems: [] as System[] };
            for (const sys of selectedInCat) {
                setStatusMessage(`Processing system ${sys.name}...`);
                catReg.systems.push(sys);

                const sysContent = await fetchText(sys.path);
                if (sysContent) zip.file(sys.path, sysContent);

                if (includeExamples && sys.examplePath) {
                    const exContent = await fetchText(sys.examplePath);
                    if (exContent) zip.file(sys.examplePath, exContent);
                }

                if (includeDocs && sys.docPath) {
                    const docContent = await fetchText(sys.docPath);
                    if (docContent) zip.file(sys.docPath, docContent);
                }

                if (includeAiRules && sys.aiRulesPath) {
                    const aiContent = await fetchText(sys.aiRulesPath);
                    if (aiContent) zip.file(sys.aiRulesPath, aiContent);
                }
            }
            systemRegisterData.push(catReg);
          }

          // 2. Process Modules
          for (const cat of moduleData) {
              const selectedInCat = cat.modules.filter(m => finalModuleSelection.has(m.name));
              if (selectedInCat.length === 0) continue;

              usedCategories.add(cat.category);
              const catRegister = { ...cat, modules: [] as Module[] };

              for (const mod of selectedInCat) {
                  setStatusMessage(`Processing module ${mod.name}...`);
                  catRegister.modules.push(mod);

                  // 1. Add Source File
                  const sourceContent = await fetchText(mod.path);
                  if (sourceContent) {
                      zip.file(mod.path, sourceContent);
                  }

                  // 2. Add Example File (if requested)
                  if (includeExamples && mod.examplePath) {
                      const exampleContent = await fetchText(mod.examplePath);
                      if (exampleContent) {
                          zip.file(mod.examplePath, exampleContent);
                      }
                  }

                  // 3. Add Documentation (if requested and available)
                  if (includeDocs && mod.docPath) {
                      const docContent = await fetchText(mod.docPath);
                      if (docContent) {
                          zip.file(mod.docPath, docContent);
                      }
                  } else if (includeDocs) {
                      // Generate basic README if no doc exists
                      const basicReadme = `# ${mod.name}\n\n${mod.description}\n\n## Usage\nCheck the source file for details.`;
                      zip.file(`docs/${mod.name}.md`, basicReadme);
                  }

                  // 3.5 Add AI Rules (if requested and available)
                  if (includeAiRules && mod.aiRulesPath) {
                      const aiContent = await fetchText(mod.aiRulesPath);
                      if (aiContent) {
                          zip.file(mod.aiRulesPath, aiContent);
                      }
                  }

                  // 4. Add Data Files
                  if (mod.dataFiles) {
                      for (const dataPath of mod.dataFiles) {
                          const dataContent = await fetchText(dataPath);
                          if (dataContent) {
                              zip.file(dataPath, dataContent);
                          }
                      }
                  }
              }
              registerData.push(catRegister);
          }

          // 5. Add Register JSON (if requested)
          if (includeRegisters) {
              if (registerData.length > 0) zip.file('module_register_subset.json', JSON.stringify(registerData, null, 2));
              if (systemRegisterData.length > 0) zip.file('system_register_subset.json', JSON.stringify(systemRegisterData, null, 2));
          }

          setStatusMessage('Compressing...');
          const blob = await zip.generateAsync({ type: 'blob' });
          downloadFile(blob, `ziky_bundle_v${APP_VERSION}.zip`, 'application/zip');
          setStatusMessage('Download started!');
          setTimeout(() => setStatusMessage(''), 3000);

      } catch (error: any) {
          console.error("Bulk download failed:", error);
          setStatusMessage(`Error: ${error.message}`);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleBuildRegister = () => {
      const customRegister: any[] = [];
      
      moduleData.forEach(cat => {
          const selectedInCat = cat.modules.filter(m => selectedModules.has(m.name));
          if (selectedInCat.length > 0) {
              const catEntry = {
                  category: cat.category,
                  description: cat.description,
                  modules: selectedInCat.map(m => {
                      const modEntry: any = { name: m.name };
                      if (regIncludeDesc) modEntry.description = m.description;
                      if (regIncludePaths) {
                          modEntry.path = m.path;
                          modEntry.examplePath = m.examplePath;
                          if (m.docPath) modEntry.docPath = m.docPath;
                      }
                      if (m.version) modEntry.version = m.version;
                      
                      if (regIncludeFunctions) {
                          modEntry.functions = m.functions.map(f => {
                              const funcEntry: any = { name: f.name };
                              if (regIncludeDesc) funcEntry.description = f.description;
                              if (regIncludeParams) funcEntry.params = f.params;
                              funcEntry.returns = f.returns;
                              return funcEntry;
                          });
                      }
                      return modEntry;
                  })
              };
              customRegister.push(catEntry);
          }
      });

      const jsonStr = JSON.stringify(customRegister, null, 2);
      downloadFile(jsonStr, 'custom-register.json', 'application/json');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-base-200 w-full max-w-5xl h-[90vh] rounded-xl border border-neon-teal/20 shadow-glow-lg flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="p-4 border-b border-neon-teal/20 flex justify-between items-center bg-base-200/50">
            <div>
                <h2 className="text-xl font-bold text-text-primary">Bulk Module Actions</h2>
                <p className="text-xs text-text-secondary">Select modules to download or create registers.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:text-neon-teal transition">✕</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar / Options */}
            <div className="w-1/3 bg-base-300/30 border-r border-neon-teal/10 p-4 flex flex-col gap-6 overflow-y-auto">
                {/* Search */}
                <div>
                    <input 
                        type="text" 
                        placeholder="Search modules..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-base-100 border border-base-300 rounded p-2 text-sm focus:ring-1 focus:ring-neon-teal outline-none"
                    />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-base-300">
                    <button 
                        onClick={() => setActiveTab('download')}
                        className={`flex-1 py-2 text-sm font-semibold border-b-2 ${activeTab === 'download' ? 'border-neon-teal text-neon-teal' : 'border-transparent text-text-secondary'}`}
                    >
                        Download
                    </button>
                    <button 
                        onClick={() => setActiveTab('systems')}
                        className={`flex-1 py-2 text-sm font-semibold border-b-2 ${activeTab === 'systems' ? 'border-neon-pink text-neon-pink' : 'border-transparent text-text-secondary'}`}
                    >
                        Systems
                    </button>
                    <button 
                        onClick={() => setActiveTab('register')}
                        className={`flex-1 py-2 text-sm font-semibold border-b-2 ${activeTab === 'register' ? 'border-neon-green text-neon-green' : 'border-transparent text-text-secondary'}`}
                    >
                        Builder
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1">
                    {activeTab === 'download' && (
                        <div className="space-y-4">
                            <p className="text-sm text-text-secondary">Configure download bundle:</p>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={includeDocs} onChange={e => setIncludeDocs(e.target.checked)} className="accent-neon-teal" />
                                <span>Include Documentation (MD)</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={includeAiRules} onChange={e => setIncludeAiRules(e.target.checked)} className="accent-neon-teal" />
                                <span>Include AI Rules (MD)</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={includeExamples} onChange={e => setIncludeExamples(e.target.checked)} className="accent-neon-teal" />
                                <span>Include Example Files (TSX)</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={includeRegisters} onChange={e => setIncludeRegisters(e.target.checked)} className="accent-neon-teal" />
                                <span>Include Register JSON</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={bundleDependencies} onChange={e => setBundleDependencies(e.target.checked)} className="accent-neon-teal" />
                                <span>Auto-bundle Dependencies</span>
                            </label>
                            <div className="mt-8">
                                <button 
                                    onClick={handleBulkDownload}
                                    disabled={(selectedModules.size === 0 && selectedSystems.size === 0) || isProcessing}
                                    className="w-full bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"/>
                                            Processing...
                                        </span>
                                    ) : (
                                        `Download Selected (${selectedModules.size + selectedSystems.size})`
                                    )}
                                </button>
                                {statusMessage && <p className="text-xs text-center mt-2 text-neon-teal font-mono">{statusMessage}</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'systems' && (
                        <div className="space-y-4">
                            <p className="text-sm text-text-secondary italic">Select systems from the list to bundle them with their dependencies.</p>
                            <div className="bg-neon-pink/5 p-3 rounded border border-neon-pink/20">
                                <p className="text-xs text-neon-pink">Tip: Systems automatically include any modules they depend on when 'Auto-bundle Dependencies' is enabled in the Download tab.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'register' && (
                        <div className="space-y-4">
                            <p className="text-sm text-text-secondary">Configure custom register JSON:</p>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={regIncludeFunctions} onChange={e => setRegIncludeFunctions(e.target.checked)} className="accent-neon-teal" />
                                <span>Include Functions</span>
                            </label>
                            {regIncludeFunctions && (
                                <label className="flex items-center space-x-2 text-sm cursor-pointer ml-4">
                                    <input type="checkbox" checked={regIncludeParams} onChange={e => setRegIncludeParams(e.target.checked)} className="accent-neon-teal" />
                                    <span>Include Parameters</span>
                                </label>
                            )}
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={regIncludePaths} onChange={e => setRegIncludePaths(e.target.checked)} className="accent-neon-teal" />
                                <span>Include Paths</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={regIncludeDesc} onChange={e => setRegIncludeDesc(e.target.checked)} className="accent-neon-teal" />
                                <span>Include Descriptions</span>
                            </label>
                            <div className="mt-8">
                                <button 
                                    onClick={handleBuildRegister}
                                    disabled={selectedModules.size === 0}
                                    className="w-full bg-neon-pink/20 hover:bg-neon-pink/30 text-neon-pink border border-neon-pink font-bold py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Build JSON ({selectedModules.size})
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content - Module/System List */}
            <div className="w-2/3 bg-base-100/50 p-4 overflow-y-auto">
                {activeTab === 'systems' ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-text-primary">Available Systems</span>
                            <button 
                                onClick={() => {
                                    if (selectedSystems.size > 0) setSelectedSystems(new Set());
                                    else {
                                        const all = new Set<string>();
                                        systemData.forEach(c => c.systems.forEach(s => all.add(s.name)));
                                        setSelectedSystems(all);
                                    }
                                }}
                                className="text-xs text-neon-pink hover:underline"
                            >
                                {selectedSystems.size > 0 ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="space-y-4">
                            {systemData.map(category => (
                                <div key={category.category} className="border border-base-300 rounded-lg overflow-hidden bg-base-200/30">
                                    <div 
                                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-base-300/50 transition"
                                        onClick={() => toggleExpandSystem(category.category)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox" 
                                                checked={category.systems.every(s => selectedSystems.has(s.name))}
                                                onChange={() => toggleSystemCategory(category)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="accent-neon-pink w-4 h-4"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Squares2X2Icon className="w-5 h-5 text-neon-pink" />
                                                <span className="font-bold text-text-primary">{category.category}</span>
                                            </div>
                                        </div>
                                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedSystemCategories.has(category.category) ? 'rotate-180' : ''}`} />
                                    </div>
                                    {expandedSystemCategories.has(category.category) && (
                                        <div className="p-2 border-t border-base-300 bg-base-100/30 space-y-1">
                                            {category.systems.map(system => (
                                                <div 
                                                    key={system.name} 
                                                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${selectedSystems.has(system.name) ? 'bg-neon-pink/10' : 'hover:bg-base-300/30'}`}
                                                    onClick={() => toggleSystem(system.name)}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedSystems.has(system.name)}
                                                        onChange={() => toggleSystem(system.name)}
                                                        className="accent-neon-pink w-4 h-4 ml-6"
                                                    />
                                                    <FileIcon className="w-4 h-4 text-text-secondary" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-text-primary">{system.name}</span>
                                                        <span className="text-xs text-text-secondary truncate max-w-[400px]">{system.description}</span>
                                                    </div>
                                                    <div className="ml-auto flex items-center gap-2">
                                                        <span className="text-[10px] bg-neon-teal/20 text-neon-teal px-1.5 py-0.5 rounded font-mono">{system.dependencies.length} deps</span>
                                                        {system.version && <span className="text-xs font-mono text-neon-pink">v{system.version}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-text-primary">Available Modules</span>
                            <button 
                                onClick={() => {
                                    if (selectedModules.size > 0) setSelectedModules(new Set());
                                    else {
                                        const all = new Set<string>();
                                        filteredData.forEach(c => c.modules.forEach(m => all.add(m.name)));
                                        setSelectedModules(all);
                                    }
                                }}
                                className="text-xs text-neon-teal hover:underline"
                            >
                                {selectedModules.size > 0 ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {filteredData.map(category => (
                                <div key={category.category} className="border border-base-300 rounded-lg overflow-hidden bg-base-200/30">
                                    <div 
                                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-base-300/50 transition"
                                        onClick={() => toggleExpand(category.category)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox" 
                                                checked={category.modules.every(m => selectedModules.has(m.name))}
                                                ref={el => {
                                                    if (el) {
                                                        const someSelected = category.modules.some(m => selectedModules.has(m.name));
                                                        const allSelected = category.modules.every(m => selectedModules.has(m.name));
                                                        el.indeterminate = someSelected && !allSelected;
                                                    }
                                                }}
                                                onChange={() => toggleCategory(category)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="accent-neon-teal w-4 h-4"
                                            />
                                            <div className="flex items-center gap-2">
                                                <FolderIcon className="w-5 h-5 text-neon-teal" />
                                                <span className="font-bold text-text-primary">{category.category}</span>
                                            </div>
                                        </div>
                                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedCategories.has(category.category) ? 'rotate-180' : ''}`} />
                                    </div>
                                    
                                    {expandedCategories.has(category.category) && (
                                        <div className="p-2 border-t border-base-300 bg-base-100/30 space-y-1">
                                            {category.modules.map(module => (
                                                <div 
                                                    key={module.name} 
                                                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${selectedModules.has(module.name) ? 'bg-neon-teal/10' : 'hover:bg-base-300/30'}`}
                                                    onClick={() => toggleModule(module.name)}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedModules.has(module.name)}
                                                        onChange={() => toggleModule(module.name)}
                                                        className="accent-neon-teal w-4 h-4 ml-6"
                                                    />
                                                    <FileIcon className="w-4 h-4 text-text-secondary" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-text-primary">{module.name}</span>
                                                        <span className="text-xs text-text-secondary truncate max-w-[400px]">{module.description}</span>
                                                    </div>
                                                    {module.version && <span className="ml-auto text-xs font-mono text-neon-pink">v{module.version}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {filteredData.length === 0 && (
                                <div className="text-center p-8 text-text-secondary">No modules found matching "{searchQuery}"</div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionModal;