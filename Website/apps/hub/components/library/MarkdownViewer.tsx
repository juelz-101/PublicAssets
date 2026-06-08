import React, { useState, useEffect } from 'react';
import { LibraryContentItem } from '../../types';
import { Manifest } from '../../services/contentService';
import { fetchFromGitHubRaw } from '../../modules/io/import-utils';
import MarkdownRenderer from '../MarkdownRenderer';

interface MarkdownViewerProps {
    file: LibraryContentItem;
    manifest: Manifest | null;
    onBack: () => void;
}

const getFileCategory = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const textExts = ['md', 'txt', 'mld', 'mku', 'log', 'rtf']; 
    const dbExts = ['json', 'yml', 'yaml', 'xml', 'sql', 'db', 'csv'];
    
    if (textExts.includes(ext)) return 'document';
    if (dbExts.includes(ext)) return 'database';
    return 'code';
};

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ file, manifest, onBack }) => {
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!manifest) {
            setError('Manifest not available.');
            setIsLoading(false);
            return;
        }

        const loadContent = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { user, repo, branch } = manifest.data.git;
                const fileContent = await fetchFromGitHubRaw(user, repo, branch, file.path);
                setContent(fileContent);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load file content.');
            } finally {
                setIsLoading(false);
            }
        };

        loadContent();
    }, [file, manifest]);
    
    const category = getFileCategory(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'text';
    
    // Depending on category, we either render it directly as Markdown, or wrap it in a code block.
    const renderContent = () => {
        if (category === 'document') {
            return <MarkdownRenderer markdown={content} manifest={manifest} />;
        } else {
            // For db and code, wrap in a markdown code block so it gets syntax highlighted
            const wrappedContent = `\`\`\`${ext}\n${content}\n\`\`\``;
            return (
                <div className="flex flex-col gap-2">
                    <div className="text-amber-500 font-bold uppercase tracking-wider text-sm mb-2">
                        {category === 'database' ? 'Database Output' : 'Source Code'}
                    </div>
                    <MarkdownRenderer markdown={wrappedContent} manifest={manifest} />
                </div>
            );
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-amber-400 truncate">{file.name}</h2>
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-sm font-semibold bg-amber-500/90 text-gray-900 rounded-lg hover:bg-amber-500 transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back
                </button>
            </div>
            
            <div className="bg-black/20 p-4 rounded-md overflow-x-auto min-h-[400px]">
                {isLoading && <div className="flex flex-col items-center justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" /><p className="text-amber-400 font-mono text-xs uppercase tracking-widest">Parsing Document...</p></div>}
                {error && <p className="text-red-400">Error: {error}</p>}
                {!isLoading && !error && renderContent()}
            </div>
        </div>
    );
};

export default MarkdownViewer;