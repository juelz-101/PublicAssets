
import React, { useState } from 'react';
import { 
    fetchFromGitHubRaw, 
    getGitHubRepoDirectoryContents, 
    getRandomFileFromGitHubRepo, 
    getGitHubRepoFileCount,
    getNthFileFromGitHubRepo,
    GitHubContent 
} from '../../modules/io/import-utils';
import { formatBytes } from '../../modules/file-system/file-utils';
import FileIcon from '../../components/icons/FileIcon';
import FolderIcon from '../../components/icons/FolderIcon';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button {...props} className={`bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition duration-300 disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const FuturisticInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal focus:border-neon-teal transition-all font-mono" />
);

const ImportUtilsExample: React.FC = () => {
    // Shared state
    const [owner, setOwner] = useState('github');
    const [repo, setRepo] = useState('octodex');
    const [branch, setBranch] = useState('main');
    const [path, setPath] = useState('images');

    // State for Fetch File
    const [isFileLoading, setIsFileLoading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);

    // State for Fetch Directory
    const [isDirLoading, setIsDirLoading] = useState(false);
    const [dirError, setDirError] = useState<string | null>(null);
    const [dirContents, setDirContents] = useState<GitHubContent[] | null>(null);
    const [dirFileCount, setDirFileCount] = useState<number | string | null>(null);
    
    // State for Fetch Random File
    const [isRandomLoading, setIsRandomLoading] = useState(false);
    const [randomError, setRandomError] = useState<string | null>(null);
    const [randomFileResult, setRandomFileResult] = useState<{ content: string; file: GitHubContent, isBinary: boolean }[] | null>(null);
    const [randomFileTypes, setRandomFileTypes] = useState('png, jpg');
    const [randomFileCount, setRandomFileCount] = useState(1);
    
    // State for Fetch Nth File
    const [isNthLoading, setIsNthLoading] = useState(false);
    const [nthError, setNthError] = useState<string | null>(null);
    const [nthFileResult, setNthFileResult] = useState<{ content: string; file: GitHubContent, isBinary: boolean }[] | null>(null);
    const [nthFileTypes, setNthFileTypes] = useState('png, jpg');
    const [nthStart, setNthStart] = useState(1);
    const [nthCount, setNthCount] = useState(3);
    
    const handleFetchFile = async () => {
        setIsFileLoading(true);
        setFileError(null);
        setFileContent(null);
        try {
            const content = await fetchFromGitHubRaw(owner, repo, branch, path);
            setFileContent(content);
        } catch (err: any) {
            setFileError(err.message || 'An unknown error occurred.');
        } finally {
            setIsFileLoading(false);
        }
    };

    const handleFetchDir = async () => {
        setIsDirLoading(true);
        setDirError(null);
        setDirContents(null);
        setDirFileCount(null);
        try {
            const contents = await getGitHubRepoDirectoryContents(owner, repo, branch, path);
            setDirContents(contents);
        } catch (err: any) {
            setDirError(err.message || 'An unknown error occurred.');
        } finally {
            setIsDirLoading(false);
        }
    };

    const handleCountFiles = async () => {
        setDirFileCount('Counting...');
        try {
            const types = nthFileTypes.split(',').map(t => t.trim()).filter(Boolean);
            const count = await getGitHubRepoFileCount(owner, repo, branch, path, { fileTypes: types });
            setDirFileCount(count);
        } catch (err: any) {
            setDirFileCount('Error');
        }
    }
    
    const handleFetchRandomFile = async () => {
        setIsRandomLoading(true);
        setRandomError(null);
        setRandomFileResult(null);
        try {
            const types = randomFileTypes.split(',').map(t => t.trim()).filter(Boolean);
            const result = await getRandomFileFromGitHubRepo(owner, repo, branch, path, { fileTypes: types, count: randomFileCount });
            if (result.length === 0) {
                setRandomError('No matching files found.');
            } else {
                setRandomFileResult(result);
            }
        } catch (err: any) {
            setRandomError(err.message || 'An unknown error occurred.');
        } finally {
            setIsRandomLoading(false);
        }
    };

    const handleFetchNthFile = async () => {
        setIsNthLoading(true);
        setNthError(null);
        setNthFileResult(null);
        try {
            const types = nthFileTypes.split(',').map(t => t.trim()).filter(Boolean);
            const result = await getNthFileFromGitHubRepo(owner, repo, branch, path, { fileTypes: types, start: nthStart, count: nthCount });
             if (result.length === 0) {
                setNthError('No matching files found for the specified range.');
            } else {
                setNthFileResult(result);
            }
        } catch (err: any) {
            setNthError(err.message || 'An unknown error occurred.');
        } finally {
            setIsNthLoading(false);
        }
    };

    const renderContent = (result: { content: string; file: GitHubContent; isBinary: boolean }) => {
        if (result.isBinary) {
            if (result.content.startsWith('data:image/')) {
                return <img src={result.content} alt={result.file.name} className="max-w-full max-h-40 object-contain mx-auto" />;
            } else if (result.content.startsWith('data:audio/')) {
                return <audio controls src={result.content} className="w-full" />;
            } else if (result.content.startsWith('data:video/')) {
                return <video controls src={result.content} className="max-w-full max-h-40" />;
            } else {
                return <p className="text-text-secondary text-sm">Cannot preview binary file type.</p>;
            }
        }
        return <pre className="text-text-primary whitespace-pre-wrap font-mono text-xs">{result.content}</pre>;
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="GitHub Source Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-text-secondary mb-1">Owner:</label>
                        <FuturisticInput value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g., github" />
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-1">Repository:</label>
                        <FuturisticInput value={repo} onChange={e => setRepo(e.target.value)} placeholder="e.g., octodex" />
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-1">Branch:</label>
                        <FuturisticInput value={branch} onChange={e => setBranch(e.target.value)} placeholder="e.g., main" />
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-1">File or Directory Path:</label>
                        <FuturisticInput value={path} onChange={e => setPath(e.target.value)} placeholder="e.g., images" />
                    </div>
                </div>
            </FuturisticCard>
            
            <FuturisticCard title="Action: Fetch File Content" description="Uses `fetchFromGitHubRaw` to get the raw text of a single file. (Best for text-based files like code or markdown).">
                <FuturisticButton onClick={handleFetchFile} disabled={isFileLoading || !owner || !repo || !branch || !path} className="w-full">
                    {isFileLoading ? 'Fetching File...' : 'Fetch File'}
                </FuturisticButton>
                {(isFileLoading || fileError || fileContent) && (
                     <div className="mt-4 bg-base-100/50 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-auto">
                        {isFileLoading && (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-teal"></div>
                            </div>
                        )}
                        {fileError && <pre className="text-neon-red whitespace-pre-wrap font-mono">{fileError}</pre>}
                        {fileContent && <pre className="text-text-primary whitespace-pre-wrap font-mono text-sm">{fileContent}</pre>}
                    </div>
                )}
            </FuturisticCard>

            <FuturisticCard title="Action: Fetch Directory Contents" description="Uses `getGitHubRepoDirectoryContents`. Also demonstrates `getGitHubRepoFileCount`.">
                 <div className="flex flex-wrap gap-2">
                    <FuturisticButton onClick={handleFetchDir} disabled={isDirLoading || !owner || !repo || !branch || !path} className="flex-grow">
                        {isDirLoading ? 'Fetching Directory...' : 'Fetch Directory'}
                    </FuturisticButton>
                     <FuturisticButton onClick={handleCountFiles} disabled={isDirLoading || !owner || !repo || !branch || !path} className="flex-grow">
                        Count Matching Files
                    </FuturisticButton>
                 </div>
                 {dirFileCount !== null && (
                     <div className="mt-4 text-center text-text-secondary">
                        Matching file count (from Nth File filter): <span className="font-mono text-neon-teal">{dirFileCount}</span>
                     </div>
                 )}
                 {(isDirLoading || dirError || dirContents) && (
                     <div className="mt-4 bg-base-100/50 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-auto">
                        {isDirLoading && (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-teal"></div>
                            </div>
                        )}
                        {dirError && <pre className="text-neon-red whitespace-pre-wrap font-mono">{dirError}</pre>}
                        {dirContents && (
                            <ul className="space-y-2">
                                {dirContents.map(item => (
                                    <li key={item.sha} className="flex items-center justify-between p-2 bg-base-200/50 rounded-md">
                                        <div className="flex items-center space-x-3">
                                            {item.type === 'dir' 
                                                ? <FolderIcon className="w-5 h-5 text-neon-teal flex-shrink-0" />
                                                : <FileIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                            }
                                            <span className="font-mono text-text-primary">{item.name}</span>
                                        </div>
                                        {item.type === 'file' && <span className="text-sm text-text-secondary font-mono">{formatBytes(item.size)}</span>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </FuturisticCard>
            
            <FuturisticCard title="Action: Fetch Random File(s)" description="Uses `getRandomFileFromGitHubRepo`. Fetches text or binary content (as a Data URL) automatically.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-text-secondary mb-1">File Types (optional):</label>
                        <FuturisticInput value={randomFileTypes} onChange={e => setRandomFileTypes(e.target.value)} placeholder="e.g., png, jpg" />
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-1">Number of files:</label>
                        <FuturisticInput type="number" min="1" value={randomFileCount} onChange={e => setRandomFileCount(Math.max(1, Number(e.target.value)))} />
                    </div>
                </div>
                 <FuturisticButton onClick={handleFetchRandomFile} disabled={isRandomLoading || !owner || !repo || !branch || !path} className="w-full">
                    {isRandomLoading ? 'Fetching...' : `Fetch ${randomFileCount} Random File(s)`}
                </FuturisticButton>
                 {(isRandomLoading || randomError || randomFileResult) && (
                     <div className="mt-4 bg-base-100/50 rounded-lg p-4 max-h-[400px] overflow-auto">
                        {isRandomLoading && <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-teal"></div></div>}
                        {randomError && <pre className="text-neon-red whitespace-pre-wrap font-mono">{randomError}</pre>}
                        {randomFileResult && (
                           <div className="space-y-4">
                                {randomFileResult.map((result, index) => (
                                    <div key={index} className="bg-base-200/50 p-3 rounded">
                                        <p className="text-sm text-text-secondary font-mono truncate" title={result.file.path}><FileIcon className="w-4 h-4 inline-block mr-2" />{result.file.name}</p>
                                        <div className="mt-2 p-2 bg-base-100/30 rounded max-h-48 overflow-auto">
                                            {renderContent(result)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </FuturisticCard>

            <FuturisticCard title="Action: Fetch Nth File(s)" description="Uses `getNthFileFromGitHubRepo` to get a specific range of files, sorted alphabetically by the GitHub API.">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-text-secondary mb-1">Start Position (1-based):</label>
                        <FuturisticInput type="number" min="1" value={nthStart} onChange={e => setNthStart(Math.max(1, Number(e.target.value)))} />
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-1">Number of files:</label>
                        <FuturisticInput type="number" min="1" value={nthCount} onChange={e => setNthCount(Math.max(1, Number(e.target.value)))} />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-text-secondary mb-1">File Types (optional):</label>
                        <FuturisticInput value={nthFileTypes} onChange={e => setNthFileTypes(e.target.value)} placeholder="e.g., png, jpg" />
                    </div>
                </div>
                 <FuturisticButton onClick={handleFetchNthFile} disabled={isNthLoading || !owner || !repo || !branch || !path} className="w-full">
                    {isNthLoading ? 'Fetching...' : `Fetch ${nthCount} File(s) starting from ${nthStart}`}
                </FuturisticButton>
                 {(isNthLoading || nthError || nthFileResult) && (
                     <div className="mt-4 bg-base-100/50 rounded-lg p-4 max-h-[400px] overflow-auto">
                        {isNthLoading && <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-teal"></div></div>}
                        {nthError && <pre className="text-neon-red whitespace-pre-wrap font-mono">{nthError}</pre>}
                        {nthFileResult && (
                           <div className="space-y-4">
                                {nthFileResult.map((result, index) => (
                                    <div key={index} className="bg-base-200/50 p-3 rounded">
                                        <p className="text-sm text-text-secondary font-mono truncate" title={result.file.path}><FileIcon className="w-4 h-4 inline-block mr-2" />{result.file.name}</p>
                                        <div className="mt-2 p-2 bg-base-100/30 rounded max-h-48 overflow-auto">
                                            {renderContent(result)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </FuturisticCard>
        </div>
    );
};

export default ImportUtilsExample;
