// modules/playground/virtual-executor.ts
import { projectManager, PlaygroundProject } from './project-manager';

/**
 * Resolves and executes project code as a virtual ES Module.
 * This allows 'import' statements to work by mapping them to Blobs.
 */
export class VirtualExecutor {
    private activeObjectUrls: string[] = [];

    /**
     * Cleans up previously created Blob URLs to prevent memory leaks.
     */
    public cleanup() {
        this.activeObjectUrls.forEach(url => URL.revokeObjectURL(url));
        this.activeObjectUrls = [];
    }

    /**
     * Pre-processes code to find internal imports and replace them with blob URLs.
     */
    private async resolveImports(code: string, project: PlaygroundProject): Promise<string> {
        // Regex to find: import { x } from './file' or import x from 'modules/...'
        const importRegex = /import\s+(?:[\w\s{},*]+)\s+from\s+['"]([^'"]+)['"]/g;
        let processedCode = code;
        let match;

        while ((match = importRegex.exec(code)) !== null) {
            const path = match[1];
            let resolvedUrl = '';

            if (path.startsWith('./') || path.startsWith('../')) {
                // Internal Project File
                const fileName = path.replace('./', '').replace('.ts', '').replace('.js', '') + '.ts';
                const file = project.files.find(f => f.name === fileName);
                if (file) {
                    const blob = new Blob([file.content], { type: 'application/javascript' });
                    resolvedUrl = URL.createObjectURL(blob);
                    this.activeObjectUrls.push(resolvedUrl);
                }
            } else if (path.startsWith('modules/')) {
                // Registry Module
                try {
                    const res = await fetch(path + (path.endsWith('.ts') ? '' : '.ts'));
                    if (res.ok) {
                        const content = await res.text();
                        const blob = new Blob([content], { type: 'application/javascript' });
                        resolvedUrl = URL.createObjectURL(blob);
                        this.activeObjectUrls.push(resolvedUrl);
                    }
                } catch (e) {
                    console.error(`Failed to resolve registry import: ${path}`);
                }
            }

            if (resolvedUrl) {
                processedCode = processedCode.replace(path, resolvedUrl);
            }
        }

        return processedCode;
    }

    public async execute(code: string, project: PlaygroundProject, onLog: (msg: string) => void) {
        this.cleanup();
        
        try {
            const resolvedCode = await this.resolveImports(code, project);
            
            // We wrap the user code to intercept console logs
            const wrappedCode = `
                const originalLog = console.log;
                const originalError = console.error;
                console.log = (...args) => { 
                    self.postMessage({ type: 'log', data: args.join(' ') });
                    originalLog(...args);
                };
                console.error = (...args) => {
                    self.postMessage({ type: 'error', data: args.join(' ') });
                    originalError(...args);
                };
                
                try {
                    ${resolvedCode}
                } catch (err) {
                    console.error(err.message);
                }
            `;

            const blob = new Blob([wrappedCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            this.activeObjectUrls.push(url);

            // Execute as a dynamic import
            // Note: Since we want to capture logs, we use a worker for the sandbox
            const workerCode = `
                onmessage = async (e) => {
                    try {
                        await import(e.data.url);
                    } catch (err) {
                        postMessage({ type: 'error', data: err.message });
                    }
                };
            `;
            const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(workerBlob);
            const worker = new Worker(workerUrl, { type: 'module' });

            worker.onmessage = (e) => {
                if (e.data.type === 'log' || e.data.type === 'error') {
                    onLog(e.data.data);
                }
            };

            worker.postMessage({ url });
            
            // Terminate worker after timeout to prevent infinite loops
            setTimeout(() => {
                worker.terminate();
                URL.revokeObjectURL(workerUrl);
            }, 5000);

        } catch (err: any) {
            onLog(`[Executor Error]: ${err.message}`);
        }
    }
}

export const virtualExecutor = new VirtualExecutor();
