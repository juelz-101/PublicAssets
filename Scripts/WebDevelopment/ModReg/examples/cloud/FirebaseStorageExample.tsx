import React, { useState, useEffect, useCallback } from 'react';
import { firebaseStorage, FirebaseConfig } from '../../modules/cloud/firebase-storage-utils';
import { StorageReference } from 'firebase/storage';
import { useLocalStorage } from '../../modules/hooks/use-local-storage';
import FileIcon from '../../components/icons/FileIcon';
import FolderIcon from '../../components/icons/FolderIcon';

const sampleConfig = `{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT_ID.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID"
}`;

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


const FirebaseStorageExample: React.FC = () => {
    const [config, setConfig] = useLocalStorage('firebaseConfig', '');
    const [isInitialized, setIsInitialized] = useState(false);
    const [files, setFiles] = useState<StorageReference[]>([]);
    const [folders, setFolders] = useState<StorageReference[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [currentPath, setCurrentPath] = useState('');
    
    const listContent = useCallback(async (path: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { files, folders } = await firebaseStorage.listFiles(path);
            setFiles(files);
            setFolders(folders);
            setCurrentPath(path);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleInitialize = () => {
        try {
            const parsedConfig: FirebaseConfig = JSON.parse(config);
            firebaseStorage.init(parsedConfig);
            setIsInitialized(true);
            setError(null);
            listContent('');
        } catch (e: any) {
            setError('Invalid Firebase config JSON. Please check the format and try again.');
            setIsInitialized(false);
        }
    };
    
    const handleClearConfig = () => {
        setConfig('');
        setIsInitialized(false);
        setFiles([]);
        setFolders([]);
        setCurrentPath('');
    };

    const handleDelete = async (fullPath: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
        try {
            setError(null);
            await firebaseStorage.deleteFile(fullPath);
            listContent(currentPath); // Refresh
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
            await firebaseStorage.uploadFile(currentPath, uploadFile);
            setUploadFile(null);
            (document.getElementById('firebase-file-upload') as HTMLInputElement).value = '';
            await listContent(currentPath);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = async (path: string) => {
        try {
            const url = await firebaseStorage.getDownloadURL(path);
            window.open(url, '_blank');
        } catch (err: any) {
            setError(`Could not get download URL: ${err.message}`);
        }
    };

    if (!isInitialized) {
        return (
             <FuturisticCard title="Firebase Storage Configuration" description="Paste your Firebase project configuration below to get started. You can find this in your Firebase project settings.">
                <textarea
                    value={config}
                    onChange={e => setConfig(e.target.value)}
                    rows={10}
                    className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal font-mono text-sm"
                    placeholder={sampleConfig}
                />
                <div className="flex gap-4">
                    <FuturisticButton onClick={handleInitialize} disabled={!config} className="flex-grow">Initialize</FuturisticButton>
                    <FuturisticButton onClick={() => setConfig(sampleConfig.replace(/"YOUR_.*"/g, '""'))} variant="blue" className="flex-grow">Use Template</FuturisticButton>
                </div>
                {error && <p className="text-neon-red font-mono mt-2">{error}</p>}
            </FuturisticCard>
        );
    }
    
    const pathParts = currentPath.split('/').filter(Boolean);

    return (
        <div className="space-y-8">
            <FuturisticCard title="Configuration">
                <p className="text-text-secondary text-sm">Firebase is initialized. Bucket: <code className="font-mono text-neon-teal">{JSON.parse(config).storageBucket}</code></p>
                <FuturisticButton onClick={handleClearConfig} variant="red">Clear Config & Disconnect</FuturisticButton>
            </FuturisticCard>

            <FuturisticCard title="Upload File" description={`Uploading to: /${currentPath}`}>
                <form onSubmit={handleFileUpload} className="space-y-4">
                    <input
                        id="firebase-file-upload"
                        type="file"
                        onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-teal/10 file:text-neon-teal hover:file:bg-neon-teal/20"
                    />
                    <FuturisticButton type="submit" disabled={!uploadFile || isLoading}>
                        {isLoading ? 'Uploading...' : 'Upload'}
                    </FuturisticButton>
                </form>
            </FuturisticCard>
            
            <FuturisticCard title="File Browser">
                <div className="flex items-center text-sm text-text-secondary mb-2 flex-wrap">
                    <span className="cursor-pointer hover:text-neon-teal" onClick={() => listContent('')}>root</span>
                    {pathParts.map((part, i) => {
                        const path = pathParts.slice(0, i + 1).join('/');
                        return <React.Fragment key={path}>
                            <span className="mx-1">/</span>
                            <span className="cursor-pointer hover:text-neon-teal" onClick={() => listContent(path)}>{part}</span>
                        </React.Fragment>
                    })}
                </div>
                 {error && <p className="text-neon-red font-mono my-2">{error}</p>}
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 border-t border-neon-teal/20 pt-2">
                    {isLoading ? <p className="text-text-secondary text-center">Loading...</p> : (
                        <>
                            {folders.map(folder => (
                                <div key={folder.fullPath} onClick={() => listContent(folder.fullPath)} className="flex items-center space-x-3 p-2 bg-base-100/50 rounded-lg cursor-pointer hover:bg-base-300/50">
                                    <FolderIcon className="w-5 h-5 text-neon-teal flex-shrink-0" />
                                    <span className="text-text-primary truncate">{folder.name}</span>
                                </div>
                            ))}
                             {files.map(file => (
                                <div key={file.fullPath} className="flex items-center justify-between p-2 bg-base-100/50 rounded-lg">
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <FileIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                        <span onClick={() => handleDownload(file.fullPath)} className="text-text-primary truncate cursor-pointer hover:underline" title={file.name}>{file.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        <FuturisticButton onClick={() => handleDelete(file.fullPath, file.name)} variant="red" className="py-1 px-2 text-sm">
                                            Delete
                                        </FuturisticButton>
                                    </div>
                                </div>
                            ))}
                            {files.length === 0 && folders.length === 0 && <p className="text-text-secondary text-center italic">Folder is empty.</p>}
                        </>
                    )}
                </div>
            </FuturisticCard>
        </div>
    );
};

export default FirebaseStorageExample;
