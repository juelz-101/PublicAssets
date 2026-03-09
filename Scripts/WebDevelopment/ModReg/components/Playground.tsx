import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Content, Chat } from '@google/genai';
import { createChat } from '../modules/ai/gemini-chat';
import { projectManager, PlaygroundProject, ProjectFile } from '../modules/playground/project-manager';
import { virtualExecutor } from '../modules/playground/virtual-executor';
import { readFileAsText } from '../modules/file-system/file-utils';
import type { ModuleCategory, Module } from '../types';

import FileIcon from './icons/FileIcon';
import FolderIcon from './icons/FolderIcon';
import LabIcon from './icons/LabIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import Squares2X2Icon from './icons/Squares2X2Icon';

// --- Icons ---
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const UserIcon = () => <svg className="w-5 h-5 text-neon-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const ModelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neon-pink flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 13.5a1.5 1.5 0 01-3 0V9a1.5 1.5 0 013 0v4.5zm6-4.5a1.5 1.5 0 01-3 0V9a1.5 1.5 0 013 0v4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15a6 6 0 00-6-6h-1.5a6 6 0 100 12h1.5a6 6 0 006-6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15a6 6 0 016-6h1.5a6 6 0 110 12h-1.5a6 6 0 01-6-6z" /></svg>;
const FunctionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>;

type Pane = 'projects' | 'modules' | 'functions' | 'assistant';
type ViewMode = 'code' | 'blocks';

interface PlaygroundProps {
    moduleData?: ModuleCategory[];
}

// --- Tree View Helper ---
interface TreeNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: TreeNode[];
    isOpen?: boolean;
}

const buildFileTree = (files: ProjectFile[]): TreeNode[] => {
    const root: TreeNode[] = [];
    files.forEach(file => {
        const parts = file.name.split('/');
        let currentLevel = root;
        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1;
            const existingNode = currentLevel.find(node => node.name === part && node.type === (isFile ? 'file' : 'folder'));
            
            if (existingNode) {
                if (!isFile) currentLevel = existingNode.children!;
            } else {
                const newNode: TreeNode = {
                    name: part,
                    path: parts.slice(0, index + 1).join('/'),
                    type: isFile ? 'file' : 'folder',
                    children: isFile ? undefined : [],
                    isOpen: true 
                };
                currentLevel.push(newNode);
                if (!isFile) currentLevel = newNode.children!;
            }
        });
    });
    return root;
};

const FileTreeItem: React.FC<{ 
    node: TreeNode, 
    level: number, 
    activeFile: string | null, 
    onSelect: (path: string) => void,
    onDelete: (path: string) => void
}> = ({ node, level, activeFile, onSelect, onDelete }) => {
    const [isOpen, setIsOpen] = useState(node.isOpen);
    const hasChildren = node.children && node.children.length > 0;

    const handleClick = () => {
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            onSelect(node.path);
        }
    };

    return (
        <div className="group">
            <div 
                className={`flex items-center justify-between py-1 px-2 cursor-pointer hover:bg-base-300/30 transition-colors ${activeFile === node.path ? 'bg-neon-teal/10 text-neon-teal' : 'text-text-secondary'}`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={handleClick}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {node.type === 'folder' ? (
                        <div className="flex items-center gap-1">
                            <ChevronDownIcon className={`w-3 h-3 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                            <FolderIcon className="w-4 h-4 text-neon-teal/70" />
                        </div>
                    ) : (
                        <FileIcon className="w-4 h-4 text-text-secondary" />
                    )}
                    <span className="truncate text-sm font-mono">{node.name}</span>
                </div>
                {node.type === 'file' && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(node.path); }}
                        className="text-text-secondary hover:text-neon-red opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                    >
                        <span className="text-xs">×</span>
                    </button>
                )}
            </div>
            {node.type === 'folder' && isOpen && node.children && (
                <div>
                    {node.children.map(child => (
                        <FileTreeItem key={child.path} node={child} level={level + 1} activeFile={activeFile} onSelect={onSelect} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Playground: React.FC<PlaygroundProps> = ({ moduleData = [] }) => {
  const [activePane, setActivePane] = useState<Pane>('projects');
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  
  // Project State
  const [projects, setProjects] = useState<PlaygroundProject[]>([]);
  const [currentProject, setCurrentProject] = useState<PlaygroundProject | null>(null);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  
  // AI State
  const [chatHistory, setChatHistory] = useState<Content[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Console State
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  
  // UI Helpers
  const [moduleSearch, setModuleSearch] = useState('');
  const [functionSearch, setFunctionSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Startup Logic ---
  useEffect(() => {
      const initPlayground = async () => {
          try {
              const list = await projectManager.getAllProjects();
              setProjects(list);

              if (list.length === 0) {
                  const initial = await projectManager.createProject("Initial Project");
                  setProjects([initial]);
                  setCurrentProject(initial);
                  setActiveFilePath('main.ts');
              } else {
                  setShowResumePrompt(true);
              }
          } catch (err) {
              console.error("Failed to initialize Playground:", err);
          }
      };
      initPlayground();
  }, []);

  const handleResumeLatest = () => {
      if (projects.length > 0) {
          const latest = projects[0];
          setCurrentProject(latest);
          if (latest.files.length > 0) setActiveFilePath(latest.files[0].name);
      }
      setShowResumePrompt(false);
  };

  const handleStartNew = async () => {
      setShowResumePrompt(false);
      await handleCreateProject();
  };

  useEffect(() => {
      if (currentProject && activeFilePath) {
          const file = currentProject.files.find(f => f.name === activeFilePath);
          if (file) {
              setEditorContent(file.content);
          }
      }
  }, [activeFilePath, currentProject?.id]);

  useEffect(() => {
      if (currentProject) {
          initChat(editorContent, currentProject.chatHistory || []);
          if (!activeFilePath && currentProject.files.length > 0) {
              setActiveFilePath(currentProject.files[0].name);
          }
      } else {
          setChatHistory([]);
      }
  }, [currentProject?.id]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleCreateProject = async () => {
      try {
          const name = prompt("Project Name:", "New Project");
          if (name) {
              const newProj = await projectManager.createProject(name);
              setProjects(prev => [newProj, ...prev]);
              setCurrentProject(newProj);
              setActiveFilePath('main.ts');
          }
      } catch (err: any) {
          alert(`Failed to create project.`);
      }
  };

  const handleCreateFile = async () => {
      if (!currentProject) return;
      const path = prompt("File path (e.g., utils/helper.ts):", "newFile.ts");
      if (path) {
          if (currentProject.files.some(f => f.name === path)) {
              alert("File already exists!");
              return;
          }
          const newFiles = [...currentProject.files, { name: path, content: '', language: 'typescript' as const }];
          const updatedProject = { ...currentProject, files: newFiles };
          await projectManager.saveProject(updatedProject);
          setCurrentProject(updatedProject);
          setActiveFilePath(path);
      }
  };

  const handleDeleteFile = async (path: string) => {
      if (!currentProject || !confirm(`Delete ${path}?`)) return;
      const newFiles = currentProject.files.filter(f => f.name !== path);
      const updatedProject = { ...currentProject, files: newFiles };
      await projectManager.saveProject(updatedProject);
      setCurrentProject(updatedProject);
      if (activeFilePath === path) {
          setActiveFilePath(newFiles.length > 0 ? newFiles[0].name : null);
      }
  };

  const handleSaveProject = async () => {
      if (!currentProject || !activeFilePath) return;
      const newFiles = currentProject.files.map(f => 
          f.name === activeFilePath ? { ...f, content: editorContent } : f
      );
      const updatedProject = { ...currentProject, files: newFiles, chatHistory };
      await projectManager.saveProject(updatedProject);
      setCurrentProject(updatedProject);
  };

  const handleInstallModule = async (moduleName: string, modulePath: string) => {
      if (!currentProject) return;
      const imports = currentProject.imports || [];
      if (!imports.includes(moduleName)) {
          const updatedImports = [...imports, moduleName];
          let newContent = editorContent;
          const importStmt = `import { } from '${modulePath.replace('.ts', '')}';\n`;
          if (!editorContent.includes(modulePath.replace('.ts', ''))) {
              newContent = importStmt + editorContent;
              setEditorContent(newContent);
          }
          const updatedFiles = currentProject.files.map(f => f.name === activeFilePath ? { ...f, content: newContent } : f);
          const updatedProject = { ...currentProject, imports: updatedImports, files: updatedFiles };
          await projectManager.saveProject(updatedProject);
          setCurrentProject(updatedProject);
      }
  };

  const initChat = (codeContext: string, history: Content[]) => {
      const systemInstruction = `You are an AI coding assistant. Current Code Context:\n\`\`\`typescript\n${codeContext}\n\`\`\`\nBe concise.`;
      chatRef.current = createChat({ history, config: { systemInstruction } });
  };

  const handleChatSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || isChatLoading || !chatRef.current) return;
      const msg = chatInput.trim();
      setChatInput('');
      setIsChatLoading(true);
      const newHistory = [...chatHistory, { role: 'user', parts: [{ text: msg }] } as Content];
      setChatHistory(newHistory);
      try {
          const stream = await chatRef.current.sendMessageStream({ message: msg });
          let fullResponse = '';
          setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] } as Content]);
          for await (const chunk of stream) {
              fullResponse += chunk.text;
              setChatHistory(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'model', parts: [{ text: fullResponse }] };
                  return updated;
              });
          }
      } catch (error) {
          setConsoleOutput(prev => [...prev, `[AI Error]: Request failed.`]);
      } finally {
          setIsChatLoading(false);
      }
  };

  const handleRunScript = async () => {
      if (!currentProject) return;
      setConsoleOutput([]);
      await virtualExecutor.execute(editorContent, currentProject, (msg) => {
          setConsoleOutput(prev => [...prev, msg]);
      });
  };

  // --- Derived Data ---
  const fileTree = useMemo(() => currentProject ? buildFileTree(currentProject.files) : [], [currentProject?.files]);
  const installedModulesData = useMemo(() => {
      if (!currentProject) return [];
      const installedNames = new Set(currentProject.imports || []);
      const result: Module[] = [];
      moduleData.forEach(cat => cat.modules.forEach(mod => { if (installedNames.has(mod.name)) result.push(mod); }));
      return result;
  }, [currentProject?.imports, moduleData]);

  return (
    <div className="flex h-full bg-base-200/20 overflow-hidden relative">
      <aside className="w-16 bg-base-300/50 flex flex-col items-center py-4 border-r border-neon-teal/10 z-10">
        <button onClick={() => setActivePane('projects')} className={`p-3 rounded-lg mb-4 transition-all ${activePane === 'projects' ? 'bg-neon-teal/20 text-neon-teal shadow-glow-sm' : 'text-text-secondary hover:text-text-primary'}`} title="Projects"><FolderIcon className="w-6 h-6" /></button>
        <button onClick={() => setActivePane('modules')} className={`p-3 rounded-lg mb-4 transition-all ${activePane === 'modules' ? 'bg-neon-teal/20 text-neon-teal shadow-glow-sm' : 'text-text-secondary hover:text-text-primary'}`} title="Modules"><Squares2X2Icon className="w-6 h-6" /></button>
        <button onClick={() => setActivePane('functions')} className={`p-3 rounded-lg mb-4 transition-all ${activePane === 'functions' ? 'bg-neon-teal/20 text-neon-teal shadow-glow-sm' : 'text-text-secondary hover:text-text-primary'}`} title="Functions"><FunctionIcon /></button>
        <button onClick={() => setActivePane('assistant')} className={`p-3 rounded-lg mb-4 transition-all ${activePane === 'assistant' ? 'bg-neon-teal/20 text-neon-teal shadow-glow-sm' : 'text-text-secondary hover:text-text-primary'}`} title="AI Assistant"><LabIcon className="w-6 h-6" /></button>
      </aside>

      <div className="w-80 bg-base-200/50 border-r border-neon-teal/10 flex flex-col relative">
        {activePane === 'projects' && (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-neon-teal/10 bg-base-200/80 backdrop-blur-md flex items-center justify-between">
                    {currentProject ? (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentProject(null)} className="text-text-secondary hover:text-neon-teal"><BackIcon /></button>
                            <h3 className="font-bold text-text-primary truncate">{currentProject.name}</h3>
                        </div>
                    ) : <h3 className="text-lg font-bold text-text-primary">Projects</h3>}
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {showResumePrompt ? (
                        <div className="p-4 bg-neon-teal/5 border border-neon-teal/20 rounded-xl space-y-4 animate-fade-in mx-2 mt-4">
                            <p className="text-sm font-semibold text-neon-teal">Welcome Back!</p>
                            <p className="text-xs text-text-secondary">You have existing work. Would you like to resume or start new?</p>
                            <div className="space-y-2">
                                <button onClick={handleResumeLatest} className="w-full bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal py-2 rounded text-xs font-bold transition-all">Resume Latest</button>
                                <button onClick={() => setShowResumePrompt(false)} className="w-full bg-base-300 hover:bg-base-200 text-text-primary py-2 rounded text-xs font-bold transition-all">Browse All</button>
                                <button onClick={handleStartNew} className="w-full border border-neon-pink/50 text-neon-pink hover:bg-neon-pink/10 py-2 rounded text-xs font-bold transition-all">Start Fresh</button>
                            </div>
                        </div>
                    ) : !currentProject ? (
                        <div className="space-y-2">
                            <button onClick={handleCreateProject} className="w-full flex items-center justify-center gap-2 bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal/50 rounded-lg p-2 transition-all font-bold mb-4"><PlusIcon /> New Project</button>
                            {projects.map(p => (
                                <div key={p.id} onClick={() => setCurrentProject(p)} className="p-3 rounded-lg cursor-pointer bg-base-100/50 hover:bg-base-300/50 border border-transparent hover:border-neon-teal/30 group relative transition-all">
                                    <div className="font-semibold text-text-primary truncate">{p.name}</div>
                                    <div className="text-[10px] text-text-secondary mt-1">{new Date(p.lastModified).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex gap-2 mb-2">
                                <button onClick={handleCreateFile} className="flex-1 text-xs bg-base-300/50 hover:bg-base-300 text-text-primary py-1 px-2 rounded border border-base-300 transition-all">+ File</button>
                            </div>
                            {fileTree.map(node => <FileTreeItem key={node.path} node={node} level={0} activeFile={activeFilePath} onSelect={setActiveFilePath} onDelete={handleDeleteFile} />)}
                        </div>
                    )}
                </div>
            </div>
        )}
        {/* ... Other panes remain largely same ... */}
        {activePane === 'assistant' && (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-neon-teal/10 bg-base-200/80"><h3 className="text-lg font-bold text-text-primary">Assistant</h3></div>
                <div className="flex-1 overflow-y-auto p-2 space-y-4">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-base-300">{msg.role === 'user' ? <UserIcon /> : <ModelIcon />}</div>
                            <div className={`p-2 rounded-lg text-[11px] max-w-[85%] ${msg.role === 'user' ? 'bg-neon-teal/10 text-neon-teal' : 'bg-base-300 text-text-primary'}`}>{msg.parts[0].text}</div>
                        </div>
                    ))}
                    {isChatLoading && <div className="text-[10px] text-text-secondary animate-pulse px-8">Thinking...</div>}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-2 border-t border-neon-teal/10 bg-base-300/30">
                    <form onSubmit={handleChatSend} className="space-y-2">
                        <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about this code..." rows={2} className="w-full bg-base-100 border border-base-300 rounded p-2 text-xs focus:ring-1 focus:ring-neon-teal resize-none" />
                        <button type="submit" disabled={!currentProject || isChatLoading} className="w-full bg-neon-teal/20 text-neon-teal text-[10px] font-bold py-1.5 rounded transition hover:bg-neon-teal/30">Send</button>
                    </form>
                </div>
            </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-base-100">
        <div className="bg-base-200/80 backdrop-blur-md p-2 border-b border-neon-teal/10 flex justify-between items-center h-14 shrink-0 px-4">
            <div className="flex items-center space-x-6 overflow-hidden">
                <span className="font-mono text-sm text-neon-teal font-bold truncate max-w-[150px]">{currentProject ? currentProject.name : 'No Session'}</span>
                <div className="flex bg-base-300 p-1 rounded-lg">
                    <button onClick={() => setViewMode('code')} className={`px-4 py-1 text-[10px] font-bold rounded ${viewMode === 'code' ? 'bg-neon-teal text-black shadow-glow-sm' : 'text-text-secondary'}`}>CODE</button>
                    <button onClick={() => setViewMode('blocks')} className={`px-4 py-1 text-[10px] font-bold rounded ${viewMode === 'blocks' ? 'bg-neon-teal text-black shadow-glow-sm' : 'text-text-secondary'}`}>BLOCKS</button>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={handleSaveProject} disabled={!currentProject} className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded bg-base-300 hover:bg-neon-teal/10 hover:text-neon-teal transition disabled:opacity-30"><SaveIcon /> Save</button>
                <button onClick={handleRunScript} disabled={!currentProject} className="flex items-center gap-1 bg-neon-green/10 hover:bg-neon-green/20 text-neon-green text-[10px] font-bold px-4 py-1.5 rounded border border-neon-green/30 transition shadow-glow-sm disabled:opacity-30">Run ▶</button>
            </div>
        </div>

        <div className="flex-1 relative bg-base-100 overflow-hidden">
            {currentProject ? (
                viewMode === 'code' ? (
                    <textarea
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                        className="absolute inset-0 w-full h-full bg-base-100 p-6 font-mono text-sm text-text-primary resize-none focus:outline-none leading-relaxed"
                        spellCheck="false"
                        disabled={!activeFilePath}
                    />
                ) : (
                    <div className="absolute inset-0 bg-base-100 flex items-center justify-center">
                        <div className="text-center space-y-6">
                            <LabIcon className="w-16 h-16 mx-auto text-neon-teal animate-pulse" />
                            <h3 className="text-xl font-bold text-text-primary tracking-widest uppercase">Initializing City View</h3>
                            <p className="text-sm text-text-secondary max-w-sm italic">"Functions as towers, variables as beams, modules as containers..."</p>
                            <div className="w-48 h-1 bg-base-300 mx-auto rounded-full overflow-hidden">
                                <div className="h-full bg-neon-teal animate-progress-indefinite"></div>
                            </div>
                        </div>
                    </div>
                )
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary space-y-4">
                    <Squares2X2Icon className="w-12 h-12 opacity-10" />
                    <p className="text-sm italic">Select or create a project to start coding.</p>
                </div>
            )}
        </div>

        <div className="h-40 bg-base-300/30 border-t border-neon-teal/10 flex flex-col shrink-0">
            <div className="px-4 py-1 bg-base-200/50 text-[10px] font-bold text-text-secondary flex justify-between items-center border-b border-base-300/50">
                <span>VIRTUAL_TERM</span>
                <button onClick={() => setConsoleOutput([])} className="hover:text-text-primary uppercase tracking-tighter">Clear</button>
            </div>
            <div className="flex-1 p-3 font-mono text-[11px] overflow-y-auto space-y-1">
                {consoleOutput.length === 0 && <div className="text-text-secondary opacity-20 italic">Awaiting input...</div>}
                {consoleOutput.map((log, i) => (
                    <div key={i} className={`${log.includes('error') ? 'text-neon-red' : 'text-neon-green'} opacity-90 border-b border-base-100/5 pb-0.5`}>
                        <span className="opacity-30 mr-2">$</span>{log}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;