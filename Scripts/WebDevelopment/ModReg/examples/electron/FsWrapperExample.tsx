import React, { useState, useEffect } from 'react';
import { fs } from '../../modules/electron/fs-wrapper';
import { ipc } from '../../modules/electron/ipc-wrapper';
import FileIcon from '../../components/icons/FileIcon';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
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

const FsWrapperExample: React.FC = () => {
    const [fileName, setFileName] = useState('example.txt');
    const [fileContent, setFileContent] = useState('Hello from the virtual file system!');
    const [fileList, setFileList] = useState<string[]>([]);
    const [readContent, setReadContent] = useState<string | null>(null);
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const refreshList = async () => {
        try {
            const files = await fs.readdir('.'); // Path ignored in mock
            setFileList(files);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        refreshList();
    }, []);

    const handleSave = async () => {
        if (!fileName) return;
        setIsLoading(true);
        setStatus('Saving...');
        try {
            await fs.writeFile(fileName, fileContent);
            setStatus(`Saved '${fileName}'`);
            await refreshList();
        } catch (err: any) {
            setStatus(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRead = async (name: string) => {
        setIsLoading(true);
        setStatus(`Reading '${name}'...`);
        try {
            const content = await fs.readFile(name);
            setReadContent(content);
            setStatus(`Read '${name}' successfully.`);
        } catch (err: any) {
            setStatus(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className={`p-4 rounded-lg border ${ipc.isElectron() ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
                <p className="font-bold text-center">
                    {ipc.isElectron() ? "Real File System Access" : "Mock File System (LocalStorage)"}
                </p>
                {!ipc.isElectron() && <p className="text-center text-xs mt-1">Files created here are stored in your browser's LocalStorage.</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FuturisticCard title="Write File" description="Create or overwrite a file.">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-text-secondary mb-1">File Name:</label>
                            <input 
                                type="text" 
                                value={fileName} 
                                onChange={(e) => setFileName(e.target.value)} 
                                className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                            />
                        </div>
                        <div>
                            <label className="block text-text-secondary mb-1">Content:</label>
                            <textarea 
                                value={fileContent} 
                                onChange={(e) => setFileContent(e.target.value)} 
                                rows={4}
                                className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                            />
                        </div>
                        <FuturisticButton onClick={handleSave} disabled={isLoading || !fileName} className="w-full">
                            Save File
                        </FuturisticButton>
                        {status && <p className="text-sm text-text-secondary font-mono">{status}</p>}
                    </div>
                </FuturisticCard>

                <FuturisticCard title="File Browser" description="List and read files from the storage.">
                    <div className="bg-base-100/50 rounded-lg p-2 min-h-[150px] max-h-[300px] overflow-y-auto mb-4">
                        {fileList.length === 0 && <p className="text-text-secondary text-center italic mt-4">No files found.</p>}
                        {fileList.map(file => (
                            <div key={file} onClick={() => handleRead(file)} className="flex items-center space-x-2 p-2 hover:bg-base-300/50 rounded cursor-pointer group">
                                <FileIcon className="w-5 h-5 text-neon-teal" />
                                <span className="text-text-primary flex-1 truncate">{file}</span>
                                <span className="text-xs text-text-secondary opacity-0 group-hover:opacity-100">Read</span>
                            </div>
                        ))}
                    </div>
                    {readContent !== null && (
                        <div className="bg-base-300/30 p-3 rounded border border-base-300">
                            <p className="text-xs text-text-secondary mb-1">File Content:</p>
                            <pre className="text-sm text-text-primary whitespace-pre-wrap font-mono">{readContent}</pre>
                            <button onClick={() => setReadContent(null)} className="text-xs text-neon-red mt-2 hover:underline">Close</button>
                        </div>
                    )}
                </FuturisticCard>
            </div>
        </div>
    );
};

export default FsWrapperExample;
