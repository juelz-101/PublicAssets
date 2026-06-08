
import React from 'react';
import { ToolDetail, WebToolDetail, WindowsToolDetail, Link, Tag, BehindTheScenes } from '../../types';
import { Manifest } from '../../services/contentService';
import GitHubImage from '../GitHubImage';
import ImageGallery from '../ImageGallery';
import MarkdownRenderer from '../MarkdownRenderer';

interface ToolDetailViewProps {
  data: ToolDetail | null;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onLaunch?: () => void;
  manifest: Manifest | null;
}

const buildAssetUrl = (manifest: Manifest, path: string): string => {
  const { user, repo, branch } = manifest.data.git;
  return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
};

const DetailPanel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-900/30 backdrop-blur-lg rounded-xl ring-1 ring-white/10 p-4 md:p-6 glow-on-hover glow-dark-primary">
        <h3 className="text-2xl font-bold text-amber-400 mb-4 border-b-2 border-white/10 pb-2">{title}</h3>
        {children}
    </div>
);

const BehindTheScenesRenderer: React.FC<{ data: BehindTheScenes; level?: number }> = ({ data, level = 0 }) => {
    const renderValue = (value: any) => {
        if (typeof value === 'string') {
            return <MarkdownRenderer markdown={value} className="prose-sm" />;
        }
        if (Array.isArray(value)) {
            return <ul className="list-disc list-inside space-y-1">{value.map((item, i) => <li key={i}>{renderValue(item)}</li>)}</ul>;
        }
        if (typeof value === 'object' && value !== null) {
            return <BehindTheScenesRenderer data={value as BehindTheScenes} level={level + 1} />;
        }
        return null;
    };

    return (
        <div className={`space-y-4 ${level > 0 ? 'pl-4 border-l-2 border-white/10' : ''}`}>
            {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                    <h4 className="text-lg font-semibold text-amber-300 capitalize">{key.replace(/_/g, ' ')}</h4>
                    {renderValue(value)}
                </div>
            ))}
        </div>
    );
};

const ToolDetailView: React.FC<ToolDetailViewProps> = ({ data, isLoading, error, onBack, onLaunch, manifest }) => {
  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><p className="text-amber-400 text-xl">Loading details...</p></div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400 bg-red-900/20 rounded-lg">
        <h2 className="text-2xl font-bold">Error</h2>
        <p className="mt-2">{error}</p>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-amber-500 text-gray-900 font-bold rounded-lg hover:bg-amber-400 transition-colors">Go Back</button>
      </div>
    );
  }

  if (!data || !manifest) return null;

  const isWebTool = (d: ToolDetail): d is WebToolDetail => d.category === 'Web Tool';
  const isWindowsTool = (d: ToolDetail): d is WindowsToolDetail => d.category === 'Windows Tool';

  return (
    <div className="p-1">
      <button onClick={onBack} className="sticky top-4 z-20 mb-4 px-5 py-2 bg-amber-500/90 backdrop-blur-sm text-gray-900 font-bold rounded-lg hover:bg-amber-500 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        Back to List
      </button>
      
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/10 p-4 sm:p-6 md:p-8 space-y-8">
        <header>
          <p className="text-amber-300 font-semibold">{data.category}</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-400" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{data.name}</h1>
          <div className="mt-2 text-lg text-gray-300">
            <MarkdownRenderer markdown={data.summary} />
          </div>
          {data.release_date && <p className="text-sm text-gray-400 mt-1">Released: {data.release_date}</p>}
        </header>

        {isWebTool(data) && (
            <div className="text-center">
                <button 
                  onClick={onLaunch}
                  className="inline-block px-10 py-4 text-xl font-bold text-gray-900 bg-amber-400 rounded-lg hover:bg-amber-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                    Launch App
                </button>
            </div>
        )}
        
        {isWindowsTool(data) && (
            <DetailPanel title="Downloads">
                <div className="space-y-4">
                    {data.downloads.map(d => (
                        <div key={d.version} className="bg-gray-800/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <h4 className="text-lg font-bold text-amber-300">Version {d.version}</h4>
                                {d.release_notes && <p className="text-sm text-gray-400 mt-1">{d.release_notes}</p>}
                            </div>
                            <a href={buildAssetUrl(manifest, d.path)} download className="px-6 py-2 font-semibold text-gray-900 bg-amber-400 rounded-lg hover:bg-amber-500 transition-colors shadow-md text-center">
                                Download
                            </a>
                        </div>
                    ))}
                </div>
            </DetailPanel>
        )}
        
        {data.banner_image && <GitHubImage manifest={manifest} path={data.banner_image} alt={`${data.name} banner`} className="rounded-lg shadow-lg w-full object-cover aspect-video" />}

        <DetailPanel title="About This Tool">
          <MarkdownRenderer markdown={data.description} />
        </DetailPanel>

        {data.tags && data.tags.length > 0 && (
          <DetailPanel title="Tags">
            <div className="flex flex-wrap gap-2">
                {data.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-amber-500/20 text-amber-200 text-sm font-semibold rounded-full">{tag}</span>
                ))}
            </div>
          </DetailPanel>
        )}

        {data.image_gallery && data.image_gallery.length > 0 && (
            <DetailPanel title="Gallery">
                <ImageGallery images={data.image_gallery} manifest={manifest} altPrefix={data.name} />
            </DetailPanel>
        )}

        {data.links && data.links.length > 0 && (
            <DetailPanel title="Links">
                 <ul className="space-y-2">
                    {data.links.map(link => (
                        <li key={link.link} className="rounded-md glow-on-hover glow-link p-1 -m-1">
                          <a href={link.link} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:text-amber-100 hover:underline transition-colors break-all">
                            {link.title}
                          </a>
                        </li>
                    ))}
                </ul>
            </DetailPanel>
        )}

        {data.behind_the_scenes && (
            <DetailPanel title="Behind the Scenes">
                <BehindTheScenesRenderer data={data.behind_the_scenes} />
            </DetailPanel>
        )}
      </div>
    </div>
  );
};

export default ToolDetailView;
