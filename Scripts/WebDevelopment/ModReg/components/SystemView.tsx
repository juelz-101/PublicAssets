// components/SystemView.tsx
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import type { SystemCategory, System, ModuleCategory, Module } from '../types';
import { downloadFile } from '../modules/file-system/file-utils';
import DownloadIcon from './icons/DownloadIcon';
import JSZip from 'jszip';
import PromptBox from './PromptBox';
import DownloadModal from './DownloadModal';

// Import system examples
import ParticleBackgroundExample from '../examples/systems/ParticleBackgroundExample.tsx';
import NeuralDataNavigatorExample from '../examples/systems/NeuralDataNavigatorExample.tsx';

const systemExampleRegistry: { [key: string]: React.ComponentType } = {
  'examples/systems/ParticleBackgroundExample.tsx': ParticleBackgroundExample,
  'examples/systems/NeuralDataNavigatorExample.tsx': NeuralDataNavigatorExample
};

const { useParams, Navigate } = ReactRouterDOM;

interface SystemViewProps {
  systemData: SystemCategory[];
  moduleData: ModuleCategory[];
}

const SystemView: React.FC<SystemViewProps> = ({ systemData, moduleData }) => {
  const { category: categoryName, system: systemName } = useParams<{ category: string, system: string }>();
  const [activeTab, setActiveTab] = useState<'example' | 'docs' | 'config' | 'ai' | 'data'>('example');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [docContent, setDocContent] = useState<string>('');
  const [aiRulesContent, setAiRulesContent] = useState<string>('');
  const [functionalDataContent, setFunctionalDataContent] = useState<string>('');
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  if (!categoryName || !systemName) {
    return <Navigate to="/" />;
  }

  const decodedCategoryName = decodeURIComponent(categoryName);
  const decodedSystemName = decodeURIComponent(systemName);

  const category = systemData.find(c => c.category === decodedCategoryName);
  const systemInfo = category?.systems.find(s => s.name === decodedSystemName);

  const ExampleComponent = systemInfo ? systemExampleRegistry[systemInfo.examplePath] : null;

  useEffect(() => {
    setActiveTab('example');
    setDocContent('');
    setAiRulesContent('');
    setFunctionalDataContent('');
    setIsDownloadModalOpen(false);
  }, [systemName]);

  useEffect(() => {
    if (activeTab === 'docs' && systemInfo?.docPath && !docContent) {
      setIsDocLoading(true);
      fetch(systemInfo.docPath)
        .then(res => res.ok ? res.text() : Promise.reject("Documentation not found"))
        .then(text => setDocContent(text))
        .catch(err => setDocContent(`Error loading documentation: ${err}`))
        .finally(() => setIsDocLoading(false));
    }

    if (activeTab === 'ai' && systemInfo?.aiRulesPath && !aiRulesContent) {
      setIsAiLoading(true);
      fetch(systemInfo.aiRulesPath)
        .then(res => res.ok ? res.text() : Promise.reject("AI Rules not found"))
        .then(text => setAiRulesContent(text))
        .catch(err => setAiRulesContent(`Error loading AI Rules: ${err}`))
        .finally(() => setIsAiLoading(false));
    }

    if (activeTab === 'data' && systemInfo?.functionalDataPath && !functionalDataContent) {
      setIsDataLoading(true);
      fetch(systemInfo.functionalDataPath)
        .then(res => res.ok ? res.text() : Promise.reject("Functional data not found"))
        .then(text => setFunctionalDataContent(text))
        .catch(err => setFunctionalDataContent(`Error loading functional data: ${err}`))
        .finally(() => setIsDataLoading(false));
    }
  }, [activeTab, systemInfo, docContent, aiRulesContent, functionalDataContent]);

  const getDownloadFiles = () => {
    if (!systemInfo) return [];
    const files: Array<{ path: string; label: string; type: 'code' | 'docs' | 'ai' | 'data' }> = [
      { path: systemInfo.path, label: 'System Source', type: 'code' },
      { path: systemInfo.examplePath, label: 'Example Component', type: 'code' }
    ];

    if (systemInfo.docPath) {
      files.push({ path: systemInfo.docPath, label: 'Documentation', type: 'docs' });
    }
    if (systemInfo.aiRulesPath) {
      files.push({ path: systemInfo.aiRulesPath, label: 'AI Rules', type: 'ai' });
    }
    if (systemInfo.functionalDataPath) {
      files.push({ path: systemInfo.functionalDataPath, label: 'Functional Data', type: 'data' });
    }

    // Add Dependencies
    const allModules = moduleData.flatMap(c => c.modules);
    systemInfo.dependencies.forEach(depName => {
      const module = allModules.find(m => m.name === depName || m.path.includes(depName));
      if (module) {
        files.push({ path: module.path, label: `Dependency: ${module.name}`, type: 'code' });
        if (module.dataFiles) {
          module.dataFiles.forEach(df => {
            files.push({ path: df, label: `Dependency Data: ${df.split('/').pop()}`, type: 'data' });
          });
        }
      }
    });

    return files;
  };

  const handleDownloadClick = () => {
    setIsDownloadModalOpen(true);
  };

  const handleDownloadConfirm = async (selectedPaths: string[]) => {
    if (!systemInfo || selectedPaths.length === 0) return;
    setIsDownloading(true);

    try {
      if (selectedPaths.length === 1) {
        // Single file download
        const filePath = selectedPaths[0];
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to fetch file: ${filePath}`);
        const content = await response.text();
        const fileName = filePath.split('/').pop() || 'file.ts';
        
        const extension = fileName.split('.').pop();
        let mimeType = 'text/plain;charset=utf-8';
        if (extension === 'ts' || extension === 'tsx') {
            mimeType = 'text/plain;charset=utf-8';
        } else if (extension === 'js' || extension === 'jsx') {
            mimeType = 'application/javascript;charset=utf-8';
        } else if (extension === 'json') {
            mimeType = 'application/json;charset=utf-8';
        }

        downloadFile(content, fileName, mimeType);
      } else {
        // Zip download
        const zip = new JSZip();
        
        await Promise.all(selectedPaths.map(async (path) => {
          const response = await fetch(path);
          if (!response.ok) throw new Error(`Failed to fetch file: ${path}`);
          const content = await response.text();
          const fileName = path.split('/').pop() || 'file';
          // Preserve some structure for dependencies? Or flat?
          // User asked for "Name_Type_Version.zip"
          // Let's keep it flat for now as per previous implementation, or maybe group dependencies?
          // The previous implementation put everything in root. Let's stick to that for simplicity unless conflicts.
          zip.file(fileName, content);
        }));

        const blob = await zip.generateAsync({ type: 'blob' });
        const version = systemInfo.version || "1.0";
        const zipName = `${systemInfo.name}_System_v${version}.zip`.replace(/\s+/g, '_');
        downloadFile(blob, zipName, 'application/zip');
      }
      setIsDownloadModalOpen(false);
    } catch (error) {
      console.error("System download failed:", error);
      alert("Failed to download system bundle. Check console for details.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!systemInfo) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-neon-red">System Not Found</h2>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <div className="flex items-end space-x-3 mb-2">
          <h2 className="text-3xl font-extrabold text-text-primary" style={{ textShadow: '0 0 8px var(--color-glow)' }}>{systemInfo.name}</h2>
          <span className="text-sm text-neon-pink font-mono mb-1">v{systemInfo.version}</span>
        </div>
        <p className="text-lg text-text-secondary mt-2">{systemInfo.description}</p>
        
        <div className="flex items-center space-x-6 mt-4">
          <button 
            onClick={handleDownloadClick} 
            className="flex items-center space-x-2 bg-neon-teal/10 hover:bg-neon-teal/20 text-neon-teal border border-neon-teal/30 px-4 py-2 rounded-lg transition"
          >
            <DownloadIcon className="w-4 h-4" />
            <span className="text-sm font-bold">Download System Bundle</span>
          </button>
          
          <div className="flex -space-x-2">
            {systemInfo.dependencies.map((dep, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-base-300 border border-neon-teal/20 flex items-center justify-center text-[10px] font-mono text-neon-teal" title={`Dependency: ${dep}`}>
                {dep.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-xs text-text-secondary font-mono">Dependencies: {systemInfo.dependencies.length}</span>
        </div>
      </header>

      {systemInfo && (
        <DownloadModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          title={`Download ${systemInfo.name}`}
          files={getDownloadFiles()}
          onDownload={handleDownloadConfirm}
          isDownloading={isDownloading}
        />
      )}

      <div className="border-b border-neon-teal/20 mb-6 flex space-x-4">
        <button onClick={() => setActiveTab('example')} className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'example' ? 'text-neon-teal border-neon-teal' : 'text-text-secondary border-transparent'}`}>Live System</button>
        <button onClick={() => setActiveTab('config')} className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'config' ? 'text-neon-teal border-neon-teal' : 'text-text-secondary border-transparent'}`}>Parameters</button>
        {(systemInfo.functionalDataPath || systemInfo.templateData) && <button onClick={() => setActiveTab('data')} className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'data' ? 'text-neon-teal border-neon-teal' : 'text-text-secondary border-transparent'}`}>Data</button>}
        {systemInfo.docPath && <button onClick={() => setActiveTab('docs')} className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'docs' ? 'text-neon-teal border-neon-teal' : 'text-text-secondary border-transparent'}`}>Documentation</button>}
        {systemInfo.aiRulesPath && <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'ai' ? 'text-neon-pink border-neon-pink' : 'text-text-secondary border-transparent'}`}>AI Rules</button>}
      </div>

      <div className="animate-fade-in min-h-[400px]">
        {activeTab === 'example' && (
          <div className="bg-base-200/40 rounded-xl border border-neon-teal/10 p-4 min-h-[500px]">
             {ExampleComponent ? (
               <ExampleComponent />
             ) : (
               <div className="h-full flex items-center justify-center">
                 <p className="text-text-secondary italic">System Example Component Placeholder for {systemInfo.name}</p>
               </div>
             )}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemInfo.parameters.map(param => (
              <div key={param.name} className="bg-base-200/40 p-4 rounded-lg border border-neon-teal/10">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-mono text-neon-teal font-bold">{param.name}</h4>
                  <span className="text-[10px] bg-neon-pink/20 text-neon-pink px-2 py-0.5 rounded uppercase">{param.type}</span>
                </div>
                <p className="text-sm text-text-secondary mb-3">{param.description}</p>
                <div className="text-xs font-mono text-text-primary">Default: <span className="text-neon-green">{JSON.stringify(param.default)}</span></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="bg-base-200/20 p-6 rounded-lg border border-neon-teal/10 markdown-body">
            {isDocLoading ? <div className="animate-spin h-8 w-8 border-b-2 border-neon-teal mx-auto" /> : <ReactMarkdown>{docContent}</ReactMarkdown>}
          </div>
        )}

        {activeTab === 'ai' && (
          <section className="space-y-6">
            {systemInfo.prompts && systemInfo.prompts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-neon-pink flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                  Pre-made Instructional Prompts
                </h3>
                {systemInfo.prompts.map((p, i) => (
                  <PromptBox key={i} prompt={p} />
                ))}
              </div>
            )}

            <div className="bg-base-200/20 p-6 rounded-lg border border-neon-pink/10">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">AI Implementation Rules</h3>
              {isAiLoading ? (
                <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-neon-pink mx-auto" /></div>
              ) : (
                <div className="markdown-body">
                  <ReactMarkdown>{aiRulesContent}</ReactMarkdown>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'data' && (
          <section role="tabpanel" aria-labelledby="tab-data" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {systemInfo.functionalDataPath && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-neon-teal flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-teal animate-pulse" />
                    Functional Backend Data
                  </h3>
                  <span className="text-xs font-mono text-text-secondary/60">{systemInfo.functionalDataPath}</span>
                </div>
                <div className="bg-base-300/50 rounded-xl border border-neon-teal/20 overflow-hidden">
                  {isDataLoading ? (
                    <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-teal"></div></div>
                  ) : (
                    <pre className="p-6 text-sm font-mono text-text-primary overflow-x-auto custom-scrollbar">
                      <code>{functionalDataContent}</code>
                    </pre>
                  )}
                </div>
              </div>
            )}

            {systemInfo.templateData && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-neon-pink flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                  Template / Example Data Structure
                </h3>
                <div className="bg-base-300/50 rounded-xl border border-neon-pink/20 overflow-hidden">
                  <pre className="p-6 text-sm font-mono text-text-primary overflow-x-auto custom-scrollbar">
                    <code>{JSON.stringify(systemInfo.templateData, null, 2)}</code>
                  </pre>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default SystemView;
