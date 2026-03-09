import React, { useState, useEffect } from 'react';
// FIX: Using namespace import to resolve "no exported member" errors.
import * as ReactRouterDOM from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import type { ModuleCategory, Module } from '../types';
import { downloadFile } from '../modules/file-system/file-utils';
import DownloadIcon from './icons/DownloadIcon';
import PromptBox from './PromptBox';
import DownloadModal from './DownloadModal';
import JSZip from 'jszip';

// Import all possible example components
import StringUtilsExample from '../examples/utilities/StringUtilsExample';
import ArrayUtilsExample from '../examples/utilities/ArrayUtilsExample';
import ObjectUtilsExample from '../examples/utilities/ObjectUtilsExample';
import GeminiServiceExample from '../examples/api/GeminiServiceExample';
import DomUtilsExample from '../examples/dom/DomUtilsExample';
import AsyncUtilsExample from '../examples/async/AsyncUtilsExample';
import ValidationUtilsExample from '../examples/validation/ValidationUtilsExample';
import DateUtilsExample from '../examples/date/DateUtilsExample';
import StorageUtilsExample from '../examples/web-apis/StorageUtilsExample';
import CookieUtilsExample from '../examples/web-apis/CookieUtilsExample';
import IndexedDBUtilsExample from '../examples/web-apis/IndexedDBUtilsExample';
import FileUtilsExample from '../examples/file-system/FileUtilsExample';
import MathUtilsExample from '../examples/math/MathUtilsExample';
import QueueExample from '../examples/data-structures/QueueExample';
import StackExample from '../examples/data-structures/StackExample';
import LinkedListExample from '../examples/data-structures/LinkedListExample';
import StoreExample from '../examples/state-management/StoreExample';
import SortingUtilsExample from '../examples/algorithms/SortingUtilsExample';
import PathfindingExample from '../examples/algorithms/PathfindingExample';
import CanvasUtilsExample from '../examples/graphics/CanvasUtilsExample';
import ColorUtilsExample from '../examples/graphics/ColorUtilsExample';
import VectorUtilsExample from '../examples/graphics/VectorUtilsExample';
import AnimationLoopExample from '../examples/graphics/AnimationLoopExample';
import CollisionUtilsExample from '../examples/graphics/CollisionUtilsExample';
import ParticleSystemExample from '../examples/graphics/ParticleSystemExample';
import CanvasEffectsExample from '../examples/graphics/CanvasEffectsExample';
import CanvasLayerManagerExample from '../examples/graphics/CanvasLayerManagerExample';
import NoiseUtilsExample from '../examples/graphics/NoiseUtilsExample';
import AttractorExample from '../examples/graphics/AttractorExample';
import LSystemExample from '../examples/graphics/LSystemExample';
import ReactionDiffusionExample from '../examples/graphics/ReactionDiffusionExample';
import SVGUtilsExample from '../examples/graphics/SVGUtilsExample';
import UseEventListenerExample from '../examples/hooks/UseEventListenerExample';
import UseCopyToClipboardExample from '../examples/hooks/UseCopyToClipboardExample';
import UseDebounceExample from '../examples/hooks/UseDebounceExample';
import UseLocalStorageExample from '../examples/hooks/UseLocalStorageExample';
import UseToggleExample from '../examples/hooks/UseToggleExample';
import AudioUtilsExample from '../examples/audio/AudioUtilsExample';
import AudioEffectsExample from '../examples/audio/AudioEffectsExample';
import ImportUtilsExample from '../examples/io/ImportUtilsExample';
import ExportUtilsExample from '../examples/io/ExportUtilsExample';
import LoggerExample from '../examples/utilities/LoggerExample';
import WorkerUtilsExample from '../examples/concurrency/WorkerUtilsExample';
import I18nExample from '../examples/internationalization/I18nExample';
import PaletteGeneratorExample from '../examples/design/PaletteGeneratorExample';
import GradientGeneratorExample from '../examples/design/GradientGeneratorExample';
import LayoutCalculatorExample from '../examples/design/LayoutCalculatorExample';
import GeminiChatExample from '../examples/ai/GeminiChatExample';
import ImageEditorExample from '../examples/editing/ImageEditorExample';
import ThemeManagerExample from '../examples/design/ThemeManagerExample';
import SceneManagerExample from '../examples/graphics-3d/SceneManagerExample';
import GeometryPrimitivesExample from '../examples/graphics-3d/GeometryPrimitivesExample';
import GoogleDriveUtilsExample from '../examples/cloud/GoogleDriveUtilsExample';
import DropboxExample from '../examples/cloud/DropboxExample';
import FirebaseStorageExample from '../examples/cloud/FirebaseStorageExample';
import IDBHandlerExample from '../examples/ziky_inc/I-DB_Handler';
import IpcWrapperExample from '../examples/electron/IpcWrapperExample';
import WindowShellExample from '../examples/electron/WindowShellExample';
import FsWrapperExample from '../examples/electron/FsWrapperExample';
import DialogsExample from '../examples/electron/DialogsExample';
import ClipboardExtendedExample from '../examples/electron/ClipboardExtendedExample';
import SystemInfoExample from '../examples/electron/SystemInfoExample';
import MenuManagerExample from '../examples/electron/MenuManagerExample';
import TrayManagerExample from '../examples/electron/TrayManagerExample';
import TaskbarUtilsExample from '../examples/electron/TaskbarUtilsExample';
import GlobalShortcutExample from '../examples/electron/GlobalShortcutExample';
import PowerMonitorExample from '../examples/electron/PowerMonitorExample';
import DesktopCapturerExample from '../examples/electron/DesktopCapturerExample';
import WebFrameExample from '../examples/electron/WebFrameExample';
import AutoUpdaterExample from '../examples/electron/AutoUpdaterExample';
import PowerSaveBlockerExample from '../examples/electron/PowerSaveBlockerExample';
import NativeImageExample from '../examples/electron/NativeImageExample';
import CrashReporterExample from '../examples/electron/CrashReporterExample';

const { useParams, Navigate } = ReactRouterDOM;

// Create a registry to map examplePath to the component
const exampleComponentRegistry: { [key: string]: React.ComponentType } = {
  'examples/ai/GeminiChatExample.tsx': GeminiChatExample,
  'examples/algorithms/PathfindingExample.tsx': PathfindingExample,
  'examples/algorithms/SortingUtilsExample.tsx': SortingUtilsExample,
  'examples/api/GeminiServiceExample.tsx': GeminiServiceExample,
  'examples/async/AsyncUtilsExample.tsx': AsyncUtilsExample,
  'examples/audio/AudioEffectsExample.tsx': AudioEffectsExample,
  'examples/audio/AudioUtilsExample.tsx': AudioUtilsExample,
  'examples/cloud/GoogleDriveUtilsExample.tsx': GoogleDriveUtilsExample,
  'examples/cloud/DropboxExample.tsx': DropboxExample,
  'examples/cloud/FirebaseStorageExample.tsx': FirebaseStorageExample,
  'examples/concurrency/WorkerUtilsExample.tsx': WorkerUtilsExample,
  'examples/data-structures/LinkedListExample.tsx': LinkedListExample,
  'examples/data-structures/QueueExample.tsx': QueueExample,
  'examples/data-structures/StackExample.tsx': StackExample,
  'examples/date/DateUtilsExample.tsx': DateUtilsExample,
  'examples/design/GradientGeneratorExample.tsx': GradientGeneratorExample,
  'examples/design/LayoutCalculatorExample.tsx': LayoutCalculatorExample,
  'examples/design/PaletteGeneratorExample.tsx': PaletteGeneratorExample,
  'examples/design/ThemeManagerExample.tsx': ThemeManagerExample,
  'examples/dom/DomUtilsExample.tsx': DomUtilsExample,
  'examples/editing/ImageEditorExample.tsx': ImageEditorExample,
  'examples/file-system/FileUtilsExample.tsx': FileUtilsExample,
  'examples/graphics-3d/GeometryPrimitivesExample.tsx': GeometryPrimitivesExample,
  'examples/graphics-3d/SceneManagerExample.tsx': SceneManagerExample,
  'examples/graphics/AnimationLoopExample.tsx': AnimationLoopExample,
  'examples/graphics/AttractorExample.tsx': AttractorExample,
  'examples/graphics/CanvasEffectsExample.tsx': CanvasEffectsExample,
  'examples/graphics/CanvasLayerManagerExample.tsx': CanvasLayerManagerExample,
  'examples/graphics/CanvasUtilsExample.tsx': CanvasUtilsExample,
  'examples/graphics/CollisionUtilsExample.tsx': CollisionUtilsExample,
  'examples/graphics/ColorUtilsExample.tsx': ColorUtilsExample,
  'examples/graphics/LSystemExample.tsx': LSystemExample,
  'examples/graphics/NoiseUtilsExample.tsx': NoiseUtilsExample,
  'examples/graphics/ParticleSystemExample.tsx': ParticleSystemExample,
  'examples/graphics/ReactionDiffusionExample.tsx': ReactionDiffusionExample,
  'examples/graphics/SVGUtilsExample.tsx': SVGUtilsExample,
  'examples/graphics/VectorUtilsExample.tsx': VectorUtilsExample,
  'examples/hooks/UseCopyToClipboardExample.tsx': UseCopyToClipboardExample,
  'examples/hooks/UseDebounceExample.tsx': UseDebounceExample,
  'examples/hooks/UseEventListenerExample.tsx': UseEventListenerExample,
  'examples/hooks/UseLocalStorageExample.tsx': UseLocalStorageExample,
  'examples/hooks/UseToggleExample.tsx': UseToggleExample,
  'examples/internationalization/I18nExample.tsx': I18nExample,
  'examples/io/ExportUtilsExample.tsx': ExportUtilsExample,
  'examples/io/ImportUtilsExample.tsx': ImportUtilsExample,
  'examples/math/MathUtilsExample.tsx': MathUtilsExample,
  'examples/state-management/StoreExample.tsx': StoreExample,
  'examples/utilities/ArrayUtilsExample.tsx': ArrayUtilsExample,
  'examples/utilities/LoggerExample.tsx': LoggerExample,
  'examples/utilities/ObjectUtilsExample.tsx': ObjectUtilsExample,
  'examples/utilities/StringUtilsExample.tsx': StringUtilsExample,
  'examples/validation/ValidationUtilsExample.tsx': ValidationUtilsExample,
  'examples/web-apis/CookieUtilsExample.tsx': CookieUtilsExample,
  'examples/web-apis/IndexedDBUtilsExample.tsx': IndexedDBUtilsExample,
  'examples/web-apis/StorageUtilsExample.tsx': StorageUtilsExample,
  'examples/ziky_inc/I-DB_Handler.tsx': IDBHandlerExample,
  'examples/electron/IpcWrapperExample.tsx': IpcWrapperExample,
  'examples/electron/WindowShellExample.tsx': WindowShellExample,
  'examples/electron/FsWrapperExample.tsx': FsWrapperExample,
  'examples/electron/DialogsExample.tsx': DialogsExample,
  'examples/electron/ClipboardExtendedExample.tsx': ClipboardExtendedExample,
  'examples/electron/SystemInfoExample.tsx': SystemInfoExample,
  'examples/electron/MenuManagerExample.tsx': MenuManagerExample,
  'examples/electron/TrayManagerExample.tsx': TrayManagerExample,
  'examples/electron/TaskbarUtilsExample.tsx': TaskbarUtilsExample,
  'examples/electron/GlobalShortcutExample.tsx': GlobalShortcutExample,
  'examples/electron/PowerMonitorExample.tsx': PowerMonitorExample,
  'examples/electron/DesktopCapturerExample.tsx': DesktopCapturerExample,
  'examples/electron/WebFrameExample.tsx': WebFrameExample,
  'examples/electron/AutoUpdaterExample.tsx': AutoUpdaterExample,
  'examples/electron/PowerSaveBlockerExample.tsx': PowerSaveBlockerExample,
  'examples/electron/NativeImageExample.tsx': NativeImageExample,
  'examples/electron/CrashReporterExample.tsx': CrashReporterExample,
};

interface ModuleViewProps {
  moduleData: ModuleCategory[];
}

const ModuleView: React.FC<ModuleViewProps> = ({ moduleData }) => {
  const { category: categoryName, module: moduleName } = useParams<{ category: string, module: string }>();
  const [activeTab, setActiveTab] = useState<'example' | 'api' | 'docs' | 'ai' | 'data'>('example');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [docContent, setDocContent] = useState<string>('');
  const [aiRulesContent, setAiRulesContent] = useState<string>('');
  const [functionalDataContent, setFunctionalDataContent] = useState<string>('');
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  if (!categoryName || !moduleName) {
    return <Navigate to="/" />;
  }

  const decodedCategoryName = decodeURIComponent(categoryName);
  const decodedModuleName = decodeURIComponent(moduleName);

  const category = moduleData.find(c => c.category === decodedCategoryName);
  const moduleInfo = category?.modules.find(m => m.name === decodedModuleName);

  useEffect(() => {
    // Reset state when module changes
    setActiveTab('example');
    setDocContent('');
    setAiRulesContent('');
    setFunctionalDataContent('');
    setIsDownloadModalOpen(false);
  }, [moduleName]);

  useEffect(() => {
    if (activeTab === 'docs' && moduleInfo?.docPath && !docContent) {
      setIsDocLoading(true);
      fetch(moduleInfo.docPath)
        .then(res => {
          if (!res.ok) throw new Error("Documentation not found");
          return res.text();
        })
        .then(text => setDocContent(text))
        .catch(err => setDocContent(`Error loading documentation: ${err.message}`))
        .finally(() => setIsDocLoading(false));
    }

    if (activeTab === 'ai' && moduleInfo?.aiRulesPath && !aiRulesContent) {
      setIsAiLoading(true);
      fetch(moduleInfo.aiRulesPath)
        .then(res => {
          if (!res.ok) throw new Error("AI Rules not found");
          return res.text();
        })
        .then(text => setAiRulesContent(text))
        .catch(err => setAiRulesContent(`Error loading AI Rules: ${err.message}`))
        .finally(() => setIsAiLoading(false));
    }

    if (activeTab === 'data' && moduleInfo?.functionalDataPath && !functionalDataContent) {
      setIsDataLoading(true);
      fetch(moduleInfo.functionalDataPath)
        .then(res => {
          if (!res.ok) throw new Error("Functional data not found");
          return res.text();
        })
        .then(text => setFunctionalDataContent(text))
        .catch(err => setFunctionalDataContent(`Error loading functional data: ${err.message}`))
        .finally(() => setIsDataLoading(false));
    }
  }, [activeTab, moduleInfo, docContent, aiRulesContent, functionalDataContent]);

  const getDownloadFiles = () => {
    if (!moduleInfo) return [];
    const files: Array<{ path: string; label: string; type: 'code' | 'docs' | 'ai' | 'data' }> = [
      { path: moduleInfo.path, label: 'Module Source', type: 'code' }
    ];
    if (moduleInfo.dataFiles) {
      moduleInfo.dataFiles.forEach(path => {
        files.push({ path, label: path.split('/').pop() || 'Data File', type: 'data' });
      });
    }
    if (moduleInfo.docPath) {
      files.push({ path: moduleInfo.docPath, label: 'Documentation', type: 'docs' });
    }
    if (moduleInfo.aiRulesPath) {
      files.push({ path: moduleInfo.aiRulesPath, label: 'AI Rules', type: 'ai' });
    }
    if (moduleInfo.functionalDataPath) {
      files.push({ path: moduleInfo.functionalDataPath, label: 'Functional Data', type: 'data' });
    }
    return files;
  };

  const handleDownloadClick = () => {
    setIsDownloadModalOpen(true);
  };

  const handleDownloadConfirm = async (selectedPaths: string[]) => {
    if (!moduleInfo || selectedPaths.length === 0) return;

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
          zip.file(fileName, content);
        }));

        const blob = await zip.generateAsync({ type: 'blob' });
        const version = moduleInfo.version || "1.0";
        const zipName = `${moduleInfo.name}_Module_v${version}.zip`.replace(/\s+/g, '_');
        downloadFile(blob, zipName, 'application/zip');
      }
      setIsDownloadModalOpen(false);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. See console for details.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!moduleInfo) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-neon-red">Module Not Found</h2>
        <p className="text-text-secondary mt-2">The module '{decodedModuleName}' in category '{decodedCategoryName}' could not be found.</p>
      </div>
    );
  }
  
  const ExampleComponent = exampleComponentRegistry[moduleInfo.examplePath];
  const version = moduleInfo.version || "1.0";
  
  const TabButton: React.FC<{ tabName: 'example' | 'api' | 'docs' | 'ai' | 'data', children: React.ReactNode }> = ({ tabName, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 ${
        activeTab === tabName
          ? 'text-neon-teal border-neon-teal'
          : 'text-text-secondary border-transparent hover:text-text-primary'
      }`}
      role="tab"
      aria-selected={activeTab === tabName}
    >
      {children}
    </button>
  );

  const filesToDownloadCount = 1 + (moduleInfo.dataFiles?.length || 0);
  const downloadButtonText = filesToDownloadCount > 1 ? 'Download Module Files' : 'Download Script';
  const downloadTitle = filesToDownloadCount > 1
    ? `Download ${moduleInfo.name} module files`
    : `Download ${moduleInfo.path.split('/').pop()}`;


  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <div className="flex items-end space-x-3 mb-2">
            <h2 className="text-3xl font-extrabold text-text-primary" style={{ textShadow: '0 0 8px var(--color-glow)' }}>{moduleInfo.name}</h2>
            <span className="text-sm text-neon-pink font-mono mb-1">v{version}</span>
        </div>
        <p className="text-lg text-text-secondary mt-2">{moduleInfo.description}</p>
        <div className="flex items-center space-x-4 mt-2">
            <p className="text-sm text-text-secondary/70 font-mono">path: {moduleInfo.path}</p>
            <button 
                onClick={handleDownloadClick} 
                className="flex items-center space-x-1.5 text-sm text-neon-teal/70 hover:text-neon-teal hover:underline disabled:text-text-secondary disabled:no-underline disabled:cursor-wait transition-colors"
                title={downloadTitle}
            >
                <DownloadIcon className="w-4 h-4" />
                <span className="text-xs font-semibold tracking-wide">
                    {downloadButtonText}
                </span>
            </button>
        </div>
      </header>

      {moduleInfo && (
        <DownloadModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          title={`Download ${moduleInfo.name}`}
          files={getDownloadFiles()}
          onDownload={handleDownloadConfirm}
          isDownloading={isDownloading}
        />
      )}

      <div className="border-b border-neon-teal/20 mb-6" role="tablist">
        <TabButton tabName="example">Interactive Example</TabButton>
        <TabButton tabName="api">API Reference</TabButton>
        {(moduleInfo.functionalDataPath || moduleInfo.templateData) && <TabButton tabName="data">Data</TabButton>}
        {moduleInfo.docPath && <TabButton tabName="docs">Documentation</TabButton>}
        {moduleInfo.aiRulesPath && <TabButton tabName="ai">AI Rules</TabButton>}
      </div>

      <div className="animate-fade-in min-h-[400px]">
        {activeTab === 'example' && (
          <section role="tabpanel" aria-labelledby="tab-example">
            {ExampleComponent ? <ExampleComponent /> : <p className="text-neon-red">Example component not found for path: {moduleInfo.examplePath}</p>}
          </section>
        )}
        
        {activeTab === 'api' && (
           <section role="tabpanel" aria-labelledby="tab-api">
             <div className="space-y-6">
              {moduleInfo.functions.map((func) => (
                <div key={func.name} className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg">
                  <h4 className="text-lg font-semibold text-neon-teal font-mono break-all">
                    {func.name}(<span className="text-text-primary">{func.params.join(', ')}</span>)
                    : <span className="text-neon-pink">{func.returns}</span>
                  </h4>
                  <p className="text-text-secondary mt-2">{func.description}</p>
                </div>
              ))}
            </div>
           </section>
        )}

        {activeTab === 'docs' && moduleInfo.docPath && (
            <section role="tabpanel" aria-labelledby="tab-docs" className="bg-base-200/20 p-6 rounded-lg border border-neon-teal/10">
                {isDocLoading ? (
                    <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-teal"></div></div>
                ) : (
                    <div className="markdown-body">
                        <ReactMarkdown>{docContent || "_No documentation content available._"}</ReactMarkdown>
                    </div>
                )}
            </section>
        )}

        {activeTab === 'ai' && moduleInfo.aiRulesPath && (
            <section role="tabpanel" aria-labelledby="tab-ai" className="space-y-6">
                {moduleInfo.prompts && moduleInfo.prompts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-neon-pink flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                      Pre-made Instructional Prompts
                    </h3>
                    {moduleInfo.prompts.map((p, i) => (
                      <PromptBox key={i} prompt={p} />
                    ))}
                  </div>
                )}

                <div className="bg-base-200/20 p-6 rounded-lg border border-neon-pink/10">
                  <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">AI Implementation Rules</h3>
                  {isAiLoading ? (
                      <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-pink"></div></div>
                  ) : (
                      <div className="markdown-body">
                          <ReactMarkdown>{aiRulesContent || "_No AI rules content available._"}</ReactMarkdown>
                      </div>
                  )}
                </div>
            </section>
        )}

        {activeTab === 'data' && (
          <section role="tabpanel" aria-labelledby="tab-data" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {moduleInfo.functionalDataPath && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-neon-teal flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-teal animate-pulse" />
                    Functional Backend Data
                  </h3>
                  <span className="text-xs font-mono text-text-secondary/60">{moduleInfo.functionalDataPath}</span>
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

            {moduleInfo.templateData && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-neon-pink flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                  Template / Example Data Structure
                </h3>
                <div className="bg-base-300/50 rounded-xl border border-neon-pink/20 overflow-hidden">
                  <pre className="p-6 text-sm font-mono text-text-primary overflow-x-auto custom-scrollbar">
                    <code>{JSON.stringify(moduleInfo.templateData, null, 2)}</code>
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

export default ModuleView;