export interface DropboxFileMetadata {
  '.tag': 'file' | 'folder';
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  size?: number;
}

export interface DropboxListFolderResponse {
  entries: DropboxFileMetadata[];
  cursor: string;
  has_more: boolean;
}

class DropboxManager {
    private static instance: DropboxManager;
    private clientId: string | null = null;
    private accessToken: string | null = null;

    private constructor() {}

    public static getInstance(): DropboxManager {
        if (!DropboxManager.instance) {
            DropboxManager.instance = new DropboxManager();
        }
        return DropboxManager.instance;
    }

    public init(clientId: string): void {
        this.clientId = clientId;
    }

    public signIn(): void {
        if (!this.clientId) {
            throw new Error("Dropbox client ID not initialized. Call init() first.");
        }
        const redirectUri = window.location.origin + window.location.pathname;
        const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${this.clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = authUrl;
    }

    public handleRedirect(): boolean {
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const token = params.get('access_token');
            if (token) {
                this.accessToken = token;
                // Clean the URL
                window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
                return true;
            }
        }
        return false;
    }
    
    public async signOut(): Promise<void> {
        if (!this.accessToken) return;
        try {
            await this.makeApiCall('https://api.dropboxapi.com/2/auth/token/revoke', 'POST');
        } catch (error) {
            console.error("Failed to revoke Dropbox token:", error);
        } finally {
            this.accessToken = null;
        }
    }

    public isSignedIn(): boolean {
        return this.accessToken !== null;
    }

    private async makeApiCall(url: string, method: string = 'POST', body?: any, headers: Record<string, string> = {}) {
        if (!this.accessToken) throw new Error("Not signed in.");
        
        const defaultHeaders: Record<string, string> = {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        };

        const response = await fetch(url, {
            method,
            headers: { ...defaultHeaders, ...headers },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `API call failed with status ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error_summary || errorJson.error || errorMessage;
            } catch (e) {
                // Not a JSON error, use the text
                if (errorText) errorMessage = errorText;
            }
            throw new Error(errorMessage);
        }
        // Handle cases where response body might be empty
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return {};
        }

        return response.json();
    }
    
    public listFiles(path: string): Promise<DropboxListFolderResponse> {
        return this.makeApiCall('https://api.dropboxapi.com/2/files/list_folder', 'POST', {
            path: path === '' ? '' : (path.startsWith('/') ? path : `/${path}`),
            include_media_info: false
        });
    }

    public deleteFile(path: string): Promise<{ metadata: DropboxFileMetadata }> {
         return this.makeApiCall('https://api.dropboxapi.com/2/files/delete_v2', 'POST', { path });
    }

    public async uploadFile(path: string, file: File): Promise<DropboxFileMetadata> {
        if (!this.accessToken) throw new Error("Not signed in.");
        
        const dropboxApiArg = {
            path: `${path}/${file.name}`,
            mode: 'add',
            autorename: true,
            mute: false
        };

        const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Dropbox-API-Arg': JSON.stringify(dropboxApiArg),
                'Content-Type': 'application/octet-stream',
            },
            body: file,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${errorText}`);
        }
        return response.json();
    }
}

export const dropboxService = DropboxManager.getInstance();
