import React, { useState, useEffect, useCallback } from 'react';
import { dropboxService, DropboxFileMetadata } from '../../modules/cloud/dropbox-utils';
import { formatBytes } from '../../modules/file-system/file-utils';
import FileIcon from '../../components/icons/FileIcon';
import FolderIcon from '../../components/icons/FolderIcon';

const clientId = process.env.DROPBOX_CLIENT_ID;

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'teal' | 'red' | 'blue' }> = ({ children, className, variant = 'teal', ...props }) => {
    const colors = {
        teal: 'bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border-neon-teal',
        red: 'bg-neon-red/20 hover:bg-neon-red/30 text-neon-red border-neon-red',
        blue: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-400',
    };
    return (
        <button {...props} className={`font-bold py-2 px-4 rounded transition duration-300 border disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed ${colors[variant]} ${className}`}>
            {children}
        </button>
    );
};

const DropboxExample: React.FC = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [files, setFiles] = useState<DropboxFileMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [currentPath, setCurrentPath] = useState('');

    const handleListFiles = useCallback(async (path: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await dropboxService.listFiles(path);
            setFiles(response.entries);
            setCurrentPath(path);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!clientId) return;
        dropboxService.init(clientId);
        const hasToken = dropboxService.handleRedirect();
        if (hasToken) {
            setIsSignedIn(true);
            handleListFiles('');
        }
    }, [handleListFiles]);

    const handleSignIn = () => {
        try {
            setError(null);
            dropboxService.signIn();
        } catch (err: any) {
            setError('Failed to initiate sign in.');
            console.error(err);
        }
    };

    const handleSignOut = async () => {
        await dropboxService.signOut();
        setIsSignedIn(false);
        setFiles([]);
    };

    const handleDelete = async (path: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            setError(null);
            await dropboxService.deleteFile(path);
            setFiles(prev => prev.filter(f => f.path_lower !== path));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) return;

        setIsLoading(true);
        setError(null);
        try {
            await dropboxService.uploadFile(currentPath, uploadFile);
            setUploadFile(null); // Clear file input
            (document.getElementById('dropbox-file-upload') as HTMLInputElement).value = '';
            await handleListFiles(currentPath); // Refresh list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!clientId) {
        return (
            <FuturisticCard title="Dropbox Utilities" description="Interact with Dropbox files.">
                <div className="p-4 bg-neon-red/10 border border-neon-red/30 rounded-lg text-neon-red">
                    <p className="font-bold">Configuration Error</p>
                    <p>The <code className="font-mono bg-neon-red/20 px-1 rounded">DROPBOX_CLIENT_ID</code> environment variable is not set. This module cannot function without it.</p>
                    <p className="mt-2 text-sm">Please create a Dropbox App with 'Implicit grant' OAuth2 flow and set the client ID.</p>
                </div>
            </FuturisticCard>
        );
    }
    
    return (
        <div className="space-y-8">
            <FuturisticCard title="Authentication">
                {isSignedIn ? (
                    <FuturisticButton onClick={handleSignOut} variant="red">Sign Out of Dropbox</FuturisticButton>
                ) : (
                    <FuturisticButton onClick={handleSignIn} variant="blue">Sign In with Dropbox</FuturisticButton>
                )}
            </FuturisticCard>

            {isSignedIn && (
                 <>
                    <FuturisticCard title="Upload File" description={`Uploading to: ${currentPath || '/'}`}>
                        <form onSubmit={handleFileUpload} className="space-y-4">
                             <input
                                id="dropbox-file-upload"
                                type="file"
                                onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)}
                                className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-teal/10 file:text-neon-teal hover:file:bg-neon-teal/20"
                            />
                            <FuturisticButton type="submit" disabled={!uploadFile || isLoading}>
                                {isLoading ? 'Uploading...' : 'Upload'}
                            </FuturisticButton>
                        </form>
                    </FuturisticCard>
                 
                    <FuturisticCard title="File Browser" description={`Current path: ${currentPath || '/'}`}>
                         <FuturisticButton onClick={() => handleListFiles(currentPath)} disabled={isLoading} className="w-full">
                            {isLoading ? 'Refreshing...' : 'Refresh File List'}
                         </FuturisticButton>
                         {error && <p className="text-neon-red font-mono mt-2">{error}</p>}
                         <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                            {currentPath !== '' && (
                                <div onClick={() => handleListFiles(currentPath.substring(0, currentPath.lastIndexOf('/')))} className="flex items-center space-x-3 p-2 bg-base-100/50 rounded-lg cursor-pointer hover:bg-base-300/50">
                                    <FolderIcon className="w-5 h-5 text-neon-teal" />
                                    <span>..</span>
                                </div>
                            )}
                            {files.length === 0 && !isLoading && (
                                <p className="text-text-secondary text-center italic">Folder is empty.</p>
                            )}
                            {files.map(file => (
                                <div key={file.id} className="flex items-center justify-between p-2 bg-base-100/50 rounded-lg">
                                    <div onClick={() => file['.tag'] === 'folder' && handleListFiles(file.path_lower)} className={`flex items-center space-x-3 overflow-hidden ${file['.tag'] === 'folder' ? 'cursor-pointer' : ''}`}>
                                        {file['.tag'] === 'folder' ? <FolderIcon className="w-5 h-5 text-neon-teal flex-shrink-0" /> : <FileIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />}
                                        <span className="text-text-primary truncate" title={file.name}>{file.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        <span className="text-sm text-text-secondary font-mono">{file.size ? formatBytes(file.size) : ''}</span>
                                        <FuturisticButton onClick={() => handleDelete(file.path_lower, file.name)} variant="red" className="py-1 px-2 text-sm">
                                            Delete
                                        </FuturisticButton>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </FuturisticCard>
                 </>
            )}
        </div>
    )
};

export default DropboxExample;
