
declare global {
    interface Window {
        google: any;
        gapi: any;
    }
}

export interface GoogleDriveFile {
  kind: string;
  id: string;
  name: string;
  mimeType: string;
  iconLink: string;
  webViewLink: string;
}

class GoogleDriveManager {
    private static instance: GoogleDriveManager;
    private tokenClient: any = null;
    private accessToken: string | null = null;
    private gisReady: Promise<void>;

    private constructor() {
        this.gisReady = new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (window.google?.accounts?.oauth2) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
            setTimeout(() => {
                clearInterval(interval);
                reject(new Error('Google Identity Services script did not load in time.'));
            }, 5000);
        });
    }

    public static getInstance(): GoogleDriveManager {
        if (!GoogleDriveManager.instance) {
            GoogleDriveManager.instance = new GoogleDriveManager();
        }
        return GoogleDriveManager.instance;
    }

    public async init(clientId: string): Promise<void> {
        await this.gisReady;
        return new Promise((resolve) => {
             this.tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
                callback: (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        this.accessToken = tokenResponse.access_token;
                    }
                },
            });
            resolve();
        });
    }

    public async signIn(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.tokenClient) {
                return reject('Client not initialized. Call init() first.');
            }
             this.tokenClient.callback = (tokenResponse: any) => {
                if (tokenResponse && tokenResponse.access_token) {
                    this.accessToken = tokenResponse.access_token;
                    resolve(this.accessToken!);
                } else {
                    reject('Failed to get access token.');
                }
            };
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    }

    public signOut(): void {
        if (this.accessToken) {
            window.google.accounts.oauth2.revoke(this.accessToken, () => {});
            this.accessToken = null;
        }
    }
    
    public isSignedIn(): boolean {
        return this.accessToken !== null;
    }

    private async makeApiCall(path: string, method: string = 'GET', body?: any) {
        if (!this.accessToken) throw new Error("Not signed in.");
        const response = await fetch(`https://www.googleapis.com${path}`, {
            method,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.message || `API call failed with status ${response.status}`);
        }
        return response.json();
    }
    
    public async listFiles(query: string = "'root' in parents and trashed = false"): Promise<{ files: GoogleDriveFile[] }> {
        const path = `/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,iconLink,webViewLink)`;
        return this.makeApiCall(path);
    }
    
    public async deleteFile(fileId: string): Promise<void> {
        const path = `/drive/v3/files/${fileId}`;
        const response = await fetch(`https://www.googleapis.com${path}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.accessToken}` },
        });
        if (!response.ok && response.status !== 204) {
             const error = await response.json().catch(() => ({error: {message: `API call failed with status ${response.status}`}}));
            throw new Error(error.error.message);
        }
    }

    public async uploadFile(file: File, metadata: { name: string, parents?: string[] }): Promise<GoogleDriveFile> {
         if (!this.accessToken) throw new Error("Not signed in.");

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);
        
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,iconLink,webViewLink', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
            },
            body: form,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.message || `Upload failed with status ${response.status}`);
        }
        return response.json();
    }
}

export const googleDriveService = GoogleDriveManager.getInstance();
