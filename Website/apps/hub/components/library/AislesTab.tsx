// components/library/AislesTab.tsx
import React, { useState, useMemo } from 'react';
import { LibraryContentItem } from '../../types';
import { Manifest } from '../../services/contentService';
import MarkdownViewer from './MarkdownViewer';

interface AislesTabProps {
    root: LibraryContentItem;
    manifest: Manifest | null;
}

const FolderIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);

const FileIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const MarkUnderIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-1 4h-5m2-8h2M5 21V3a2 2 0 012-2h10a2 2 0 012 2v18l-4-4-4 4-4-4-4 4z" />
    </svg>
);


const AislesTab: React.FC<AislesTabProps> = ({ root, manifest }) => {
    const [pathStack, setPathStack] = useState<string[]>([root.path]);
    const [selectedFile, setSelectedFile] = useState<LibraryContentItem | null>(null);

    const currentDirectory = useMemo(() => {
        let current: LibraryContentItem | undefined = root;
        const currentPath = pathStack[pathStack.length - 1];
        
        // Function to find a node by path
        const findNode = (node: LibraryContentItem, path: string): LibraryContentItem | undefined => {
            if (node.path === path) return node;
            if (node.children) {
                for (const child of node.children) {
                    if (path.startsWith(child.path)) {
                        const found = findNode(child, path);
                        if (found) return found;
                    }
                }
            }
            return undefined;
        };
        
        return findNode(root, currentPath) || root;
    }, [pathStack, root]);

    const handleItemClick = (item: LibraryContentItem) => {
        if (item.type === 'dir') {
            setPathStack([...pathStack, item.path]);
            setSelectedFile(null); // Clear file view when navigating folders
        } else {
            setSelectedFile(item);
        }
    };
    
    const handleBreadcrumbClick = (index: number) => {
        setPathStack(pathStack.slice(0, index + 1));
        setSelectedFile(null);
    };

    const getFileIcon = (fileName: string) => {
        if (fileName.endsWith('.mku')) {
            return <MarkUnderIcon />;
        }
        return <FileIcon />;
    };

    if (selectedFile) {
        return <MarkdownViewer file={selectedFile} manifest={manifest} onBack={() => setSelectedFile(null)} />;
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl ring-1 ring-white/10">
            <header className="mb-4">
                <nav aria-label="Breadcrumb" className="flex items-center text-sm text-gray-400 mb-4 overflow-x-auto whitespace-nowrap">
                    {pathStack.map((path, index) => {
                        const name = (path || '').split('/').pop() || 'Library';
                        const isLast = index === pathStack.length - 1;
                        return (
                            <React.Fragment key={path}>
                                <button
                                    onClick={() => !isLast && handleBreadcrumbClick(index)}
                                    className={`px-2 py-1 rounded ${isLast ? 'text-amber-300 font-semibold' : 'hover:bg-white/10'}`}
                                >
                                    {name}
                                </button>
                                {!isLast && <span className="mx-1">/</span>}
                            </React.Fragment>
                        );
                    })}
                </nav>
                <h2 className="text-3xl font-bold text-amber-400">
                    {(currentDirectory.meta as any)?.idx?.viewer?.title ?? (currentDirectory.meta as any)?.idx?.display_name ?? currentDirectory.name}
                </h2>
                {(currentDirectory.meta as any)?.idx?.viewer?.subtitle && (
                    <p className="text-gray-300 mt-1">{(currentDirectory.meta as any).idx.viewer.subtitle}</p>
                )}
            </header>
            <div className="mt-6 space-y-2">
                {currentDirectory.children && currentDirectory.children.map(item => (
                    <button 
                        key={item.path} 
                        onClick={() => handleItemClick(item)}
                        className="w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors hover:bg-white/5"
                    >
                        {item.type === 'dir' ? <FolderIcon /> : getFileIcon(item.name)}
                        <span className="text-gray-200">{item.name}</span>
                    </button>
                ))}
                {(!currentDirectory.children || currentDirectory.children.length === 0) && (
                    <p className="text-gray-500 p-4 text-center">This folder is empty.</p>
                )}
            </div>
        </div>
    );
};

export default AislesTab;