import React, { useState, useEffect, useCallback } from 'react';
import { googleDriveService, GoogleDriveFile } from '../../modules/cloud/google-drive-utils';
import { formatBytes } from '../../modules/file-system/file-utils';

const clientId = process.env.GOOGLE_CLIENT_ID;

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


const GoogleDriveUtilsExample: React.FC = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [files, setFiles] = useState<GoogleDriveFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    useEffect(() => {
        if (!clientId) return;
        googleDriveService.init(clientId)
            .then(() => setIsInitialized(true))
            .catch(err => setError(err.message));
    }, []);

    const handleSignIn = async () => {
        try {
            setError(null);
            await googleDriveService.signIn();
            setIsSignedIn(true);
            handleListFiles();
        } catch (err: any) {
            setError('Failed to sign in. Please allow popups and try again.');
            console.error(err);
        }
    };

    const handleSignOut = () => {
        googleDriveService.signOut();
        setIsSignedIn(false);
        setFiles([]);
    };

    const handleListFiles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await googleDriveService.listFiles();
            setFiles(response.files);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (fileId: string, fileName: string) => {
        if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return;
        try {
            setError(null);
            await googleDriveService.deleteFile(fileId);
            setFiles(prev => prev.filter(f => f.id !== fileId));
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
            await googleDriveService.uploadFile(uploadFile, { name: uploadFile.name, parents: ['root'] });
            setUploadFile(null); // Clear file input
            (document.getElementById('file-upload-input') as HTMLInputElement).value = '';
            await handleListFiles(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };


    if (!clientId) {
        return (
            <FuturisticCard title="Google Drive Utilities" description="Interact with Google Drive files.">
                <div className="p-4 bg-neon-red/10 border border-neon-red/30 rounded-lg text-neon-red">
                    <p className="font-bold">Configuration Error</p>
                    <p>The <code className="font-mono bg-neon-red/20 px-1 rounded">GOOGLE_CLIENT_ID</code> environment variable is not set. This module cannot function without it.</p>
                    <p className="mt-2 text-sm">Please follow Google's documentation to create an OAuth 2.0 Client ID for a Web application and set it as an environment variable.</p>
                </div>
            </FuturisticCard>
        );
    }

    return (
        <div className="space-y-8">
            <FuturisticCard title="Authentication">
                {!isInitialized ? (
                    <p className="text-text-secondary">Initializing Google API Client...</p>
                ) : isSignedIn ? (
                    <FuturisticButton onClick={handleSignOut} variant="red">Sign Out</FuturisticButton>
                ) : (
                    <FuturisticButton onClick={handleSignIn} variant="blue">Sign In with Google</FuturisticButton>
                )}
            </FuturisticCard>
            
            {isSignedIn && (
                <>
                    <FuturisticCard title="Upload File to Drive">
                        <form onSubmit={handleFileUpload} className="space-y-4">
                             <input
                                id="file-upload-input"
                                type="file"
                                onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)}
                                className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-teal/10 file:text-neon-teal hover:file:bg-neon-teal/20"
                            />
                            <FuturisticButton type="submit" disabled={!uploadFile || isLoading}>
                                {isLoading ? 'Uploading...' : 'Upload'}
                            </FuturisticButton>
                        </form>
                    </FuturisticCard>
                
                    <FuturisticCard title="Your Recent Files" description="Showing files from the root of your Google Drive.">
                         <FuturisticButton onClick={handleListFiles} disabled={isLoading} className="w-full">
                            {isLoading ? 'Refreshing...' : 'Refresh File List'}
                         </FuturisticButton>
                         {error && <p className="text-neon-red font-mono mt-2">{error}</p>}
                         <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                            {files.length === 0 && !isLoading && (
                                <p className="text-text-secondary text-center italic">No files found in root.</p>
                            )}
                            {files.map(file => (
                                <div key={file.id} className="flex items-center justify-between p-2 bg-base-100/50 rounded-lg">
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <img src={file.iconLink} alt="" className="w-5 h-5 flex-shrink-0" />
                                        <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="text-text-primary truncate hover:underline" title={file.name}>
                                            {file.name}
                                        </a>
                                    </div>
                                    <FuturisticButton onClick={() => handleDelete(file.id, file.name)} variant="red" className="py-1 px-2 text-sm flex-shrink-0">
                                        Delete
                                    </FuturisticButton>
                                </div>
                            ))}
                         </div>
                    </FuturisticCard>
                </>
            )}
        </div>
    );
};

export default GoogleDriveUtilsExample;
