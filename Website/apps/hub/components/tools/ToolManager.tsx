import React, { useState, useEffect } from 'react';
import appdata from '../../data/appdata.json';
import toolsData from '../../data/tools.json';
import StandaloneLoader from './StandaloneLoader';
import { fetchFromGitHubRaw } from '../../modules/io/import-utils';
import { Manifest } from '../../services/contentService';

interface ToolManagerProps {
    manifest?: Manifest | null;
}

const ToolManager: React.FC<ToolManagerProps> = ({ manifest }) => {
    const [selectedToolConfig, setSelectedToolConfig] = useState<any | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Flatten all tools from tools.json
    const allTools = [
        ...(toolsData.tools.web || []),
        ...(toolsData.tools.win || []),
        ...(toolsData.tools.scripts?.py || []),
        ...(toolsData.tools.scripts?.ps || []),
        ...(toolsData.tools.scripts?.ahk || []),
        ...(toolsData.tools.ai?.apps || []),
        ...(toolsData.tools.ai?.prompts || [])
    ].filter(Boolean);

    const handleSelectTool = async (tool: any) => {
        setLoadingConfig(true);
        setError(null);
        try {
            const link = tool.link;
            let config = null;

            if (manifest) {
                const { user, repo, branch } = manifest.data.git;
                
                // Try fetching directly via github raw
                const cleanLink = link.startsWith('data/') ? link.replace('data/', 'Website/') : link;
                const candidates = [link, cleanLink];
                
                for (const url of candidates) {
                    try {
                        const content = await fetchFromGitHubRaw(user, repo, branch, url);
                        if (content && content.trim().startsWith('{')) {
                            const json = JSON.parse(content);
                            if (json.category === 'Web Tool' && !json.app_path) continue;
                            config = json;
                            break;
                        }
                    } catch (e) {
                         // ignore and try next
                    }
                }
            }
            
            // local fetch fallback
            if (!config) {
                const cleanLink = link.startsWith('/') ? link.slice(1) : link;
                const candidates = [`/${cleanLink}`];
                if (cleanLink.startsWith('data/')) candidates.push(`/${cleanLink.replace('data/', 'Website/')}`);
                if (cleanLink.startsWith('Website/')) candidates.push(`/${cleanLink.replace('Website/', 'data/')}`);

                for (const url of candidates) {
                    try {
                        const res = await fetch(url);
                        if (res.ok) {
                            const text = await res.text();
                            if (text && text.trim().startsWith('{')) {
                                const json = JSON.parse(text);
                                if (json.category === 'Web Tool' && !json.app_path) continue; 
                                config = json;
                                break;
                            }
                        }
                    } catch (e) {}
                }
            }

            if (!config) {
                throw new Error(`Failed to load tool configuration from ${link}`);
            }
            
            setSelectedToolConfig(config);
        } catch (err) {
            console.error("Failed to load tool config:", err);
            setError(err instanceof Error ? err.message : "Unknown error loading tool configuration");
        } finally {
            setLoadingConfig(false);
        }
    };

    if (selectedToolConfig) {
        return <StandaloneLoader toolConfig={selectedToolConfig} onClose={() => setSelectedToolConfig(null)} />;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-2">Tool Manager</h1>
            <p className="text-gray-400 mb-8">Select a tool to launch it in the Standalone Loader.</p>
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {loadingConfig ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allTools.map((tool, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => handleSelectTool(tool)}
                            className="bg-gray-900 border border-white/10 rounded-xl p-5 cursor-pointer hover:bg-gray-800 hover:border-amber-500/50 transition-all group"
                        >
                            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{tool.name}</h3>
                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">{tool.summary}</p>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs font-mono text-gray-500 bg-black/50 px-2 py-1 rounded">
                                    {tool.category || 'Tool'}
                                </span>
                                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                    Launch
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ToolManager;
