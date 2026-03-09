import React, { useState, useCallback } from 'react';
import { 
    readFileAsText, 
    readFileAsDataURL, 
    readFileAsArrayBuffer,
    downloadFile, 
    formatBytes, 
    getFileExtension,
    getImageDimensions,
    resizeImage
} from '../../modules/file-system/file-utils';

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

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-2 p-4 bg-base-100/50 rounded-md border border-base-300/50">
        <p className="text-text-secondary">{title}</p>
        <pre className="text-text-primary font-mono whitespace-pre-wrap text-sm">{children}</pre>
    </div>
);

const FileUtilsExample: React.FC = () => {
    // State for File Reader
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [fileError, setFileError] = useState<string>('');

    // State for File Downloader
    const [downloadContent, setDownloadContent] = useState('{\n  "name": "example",\n  "value": 42\n}');
    const [fileName, setFileName] = useState('data.json');
    const [mimeType, setMimeType] = useState('application/json');

    // State for Helpers
    const [bytesToFormat, setBytesToFormat] = useState(1048576);
    const [nameForExt, setNameForExt] = useState('archive.zip');

    // State for Image Utilities
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
    const [resizedImageBlob, setResizedImageBlob] = useState<Blob | null>(null);
    const [maxWidth, setMaxWidth] = useState(128);
    const [maxHeight, setMaxHeight] = useState(128);
    const [quality, setQuality] = useState(0.8);
    const [isResizing, setIsResizing] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFileContent('');
            setFileError('');
        }
    };
    
    const handleImageFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            setResizedImageBlob(null);
            try {
                const dims = await getImageDimensions(file);
                setImageDimensions(dims);
            } catch {
                setImageDimensions(null);
            }
        } else {
            setImageFile(null);
            setImageDimensions(null);
        }
    }, []);

    const handleReadAsText = useCallback(async () => {
        if (!selectedFile) return;
        try {
            const text = await readFileAsText(selectedFile);
            setFileContent(text);
            setFileError('');
        } catch (err) {
            setFileError('Failed to read file as text.');
            console.error(err);
        }
    }, [selectedFile]);

    const handleReadAsDataURL = useCallback(async () => {
        if (!selectedFile) return;
        try {
            const dataUrl = await readFileAsDataURL(selectedFile);
            setFileContent(dataUrl);
            setFileError('');
        } catch (err) {
            setFileError('Failed to read file as Data URL.');
            console.error(err);
        }
    }, [selectedFile]);
    
    const handleReadAsArrayBuffer = useCallback(async () => {
        if (!selectedFile) return;
        try {
            const buffer = await readFileAsArrayBuffer(selectedFile);
            const byteArray = new Uint8Array(buffer);
            setFileContent(`ArrayBuffer with ${buffer.byteLength} bytes.\nFirst 20 bytes: [${byteArray.slice(0, 20).join(', ')}]`);
            setFileError('');
        } catch (err) {
            setFileError('Failed to read file as ArrayBuffer.');
            console.error(err);
        }
    }, [selectedFile]);
    
    const handleDownload = () => {
        downloadFile(downloadContent, fileName, mimeType);
    };

    const handleResizeImage = useCallback(async () => {
        if (!imageFile) return;
        setIsResizing(true);
        try {
            const blob = await resizeImage(imageFile, { maxWidth, maxHeight, quality });
            setResizedImageBlob(blob);
        } catch (error) {
            console.error("Resize failed:", error);
        } finally {
            setIsResizing(false);
        }
    }, [imageFile, maxWidth, maxHeight, quality]);

    return (
        <div className="space-y-8">
            <FuturisticCard title="Reading Local Files" description="Select a file from your computer to read its contents into the browser.">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-teal/10 file:text-neon-teal hover:file:bg-neon-teal/20"
                />
                {selectedFile && (
                    <div className="mt-4 p-4 bg-base-100/50 rounded grid grid-cols-2 gap-4">
                        <p className="text-text-secondary">Name: <span className="text-text-primary font-mono">{selectedFile.name}</span></p>
                        <p className="text-text-secondary">Size: <span className="text-text-primary font-mono">{formatBytes(selectedFile.size)}</span></p>
                        <p className="text-text-secondary">Type: <span className="text-text-primary font-mono">{selectedFile.type || 'N/A'}</span></p>
                        <p className="text-text-secondary">Last Modified: <span className="text-text-primary font-mono">{new Date(selectedFile.lastModified).toLocaleDateString()}</span></p>
                    </div>
                )}
                <div className="flex flex-wrap gap-4 mt-4">
                    <FuturisticButton onClick={handleReadAsText} disabled={!selectedFile}>Read as Text</FuturisticButton>
                    <FuturisticButton onClick={handleReadAsDataURL} disabled={!selectedFile}>Read as Data URL</FuturisticButton>
                    <FuturisticButton onClick={handleReadAsArrayBuffer} disabled={!selectedFile}>Read as ArrayBuffer</FuturisticButton>
                </div>
                {(fileContent || fileError) && (
                    <div className="mt-4 p-4 bg-base-100/50 rounded min-h-[100px]">
                        {fileError && <p className="text-neon-red font-mono">{fileError}</p>}
                        {fileContent && (
                            fileContent.startsWith('data:image') ? (
                                <img src={fileContent} alt="File preview" className="max-w-full max-h-64 rounded"/>
                            ) : (
                               <pre className="text-text-primary font-mono whitespace-pre-wrap text-sm max-h-64 overflow-auto">{fileContent}</pre>
                            )
                        )}
                    </div>
                )}
            </FuturisticCard>
            
            <FuturisticCard title="Image Utilities" description="Client-side image processing. Upload an image to get its dimensions and create a resized version.">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-teal/10 file:text-neon-teal hover:file:bg-neon-teal/20"
                />
                {imageFile && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-text-primary mb-2">Original</h4>
                            <img src={URL.createObjectURL(imageFile)} alt="Original" className="max-w-full rounded" />
                            <OutputBox title="getImageDimensions()">{imageDimensions ? `${imageDimensions.width} x ${imageDimensions.height}px` : 'Loading...'}</OutputBox>
                        </div>
                        <div>
                            <h4 className="font-semibold text-text-primary mb-2">Resizer</h4>
                            <div className="space-y-2 p-2 bg-base-100/50 rounded">
                                <div><label className="block text-text-secondary text-sm mb-1">Max Width: {maxWidth}px</label><input type="range" min="32" max="1024" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="w-full accent-neon-pink"/></div>
                                <div><label className="block text-text-secondary text-sm mb-1">Max Height: {maxHeight}px</label><input type="range" min="32" max="1024" value={maxHeight} onChange={(e) => setMaxHeight(Number(e.target.value))} className="w-full accent-neon-pink"/></div>
                                <div><label className="block text-text-secondary text-sm mb-1">JPEG Quality: {quality.toFixed(2)}</label><input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-neon-pink"/></div>
                            </div>
                            <FuturisticButton onClick={handleResizeImage} disabled={isResizing} className="w-full mt-2">
                                {isResizing ? 'Resizing...' : 'resizeImage()'}
                            </FuturisticButton>
                            {resizedImageBlob && (
                                <div className="mt-2">
                                    <img src={URL.createObjectURL(resizedImageBlob)} alt="Resized" className="max-w-full rounded"/>
                                    <OutputBox title="Resized Blob Info">{`${resizedImageBlob.type}, ${formatBytes(resizedImageBlob.size)}`}</OutputBox>
                                    <FuturisticButton onClick={() => downloadFile(resizedImageBlob, 'thumbnail.jpg', 'image/jpeg')} className="w-full mt-2">Download Resized</FuturisticButton>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </FuturisticCard>
            
             <FuturisticCard title="Creating & Downloading Files" description="Create content in the text area and download it as a local file.">
                <div>
                    <label className="block text-text-secondary mb-1">File Content:</label>
                    <textarea 
                        value={downloadContent}
                        onChange={(e) => setDownloadContent(e.target.value)}
                        rows={5}
                        className="w-full bg-base-100/50 p-2 rounded border border-base-300 font-mono focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-text-secondary mb-1">File Name:</label>
                        <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} className="w-full bg-base-100/50 p-2 rounded border border-base-300 font-mono focus:outline-none focus:ring-2 focus:ring-neon-teal"/>
                    </div>
                    <div>
                        <label className="block text-text-secondary mb-1">MIME Type:</label>
                        <input type="text" value={mimeType} onChange={(e) => setMimeType(e.target.value)} className="w-full bg-base-100/50 p-2 rounded border border-base-300 font-mono focus:outline-none focus:ring-2 focus:ring-neon-teal"/>
                    </div>
                </div>
                <FuturisticButton onClick={handleDownload} disabled={!fileName || !downloadContent}>Download File</FuturisticButton>
            </FuturisticCard>

            <FuturisticCard title="Helper Utilities" description="Small, useful functions for working with file information.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold text-text-primary mb-2">formatBytes(bytes)</h4>
                        <label className="block text-text-secondary mb-1">Bytes: {Number(bytesToFormat).toLocaleString()}</label>
                        <input
                            type="range"
                            min="0"
                            max="1000000000"
                            step="1024"
                            value={bytesToFormat}
                            onChange={(e) => setBytesToFormat(Number(e.target.value))}
                            className="w-full accent-neon-pink"
                        />
                        <OutputBox title="Formatted Size:">{formatBytes(bytesToFormat)}</OutputBox>
                    </div>
                     <div>
                        <h4 className="font-semibold text-text-primary mb-2">getFileExtension(fileName)</h4>
                         <label className="block text-text-secondary mb-1">File Name:</label>
                        <input type="text" value={nameForExt} onChange={(e) => setNameForExt(e.target.value)} className="w-full bg-base-100/50 p-2 rounded border border-base-300 font-mono focus:outline-none focus:ring-2 focus:ring-neon-pink"/>
                        <OutputBox title="Extension:">{getFileExtension(nameForExt) || 'N/A'}</OutputBox>
                    </div>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default FileUtilsExample;
