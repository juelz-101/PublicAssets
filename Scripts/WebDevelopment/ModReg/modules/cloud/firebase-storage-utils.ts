import { initializeApp, FirebaseApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, deleteObject, listAll, getDownloadURL, StorageReference, UploadResult } from 'firebase/storage';

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

class FirebaseStorageManager {
    private static instance: FirebaseStorageManager;
    private app: FirebaseApp | null = null;
    private storage: any | null = null;

    private constructor() {}

    public static getInstance(): FirebaseStorageManager {
        if (!FirebaseStorageManager.instance) {
            FirebaseStorageManager.instance = new FirebaseStorageManager();
        }
        return FirebaseStorageManager.instance;
    }

    public init(config: FirebaseConfig): void {
        if (this.app) {
            console.warn("Firebase app already initialized.");
            return;
        }
        try {
            this.app = initializeApp(config);
            this.storage = getStorage(this.app);
        } catch (error) {
            console.error("Failed to initialize Firebase:", error);
            this.app = null;
            this.storage = null;
            throw error;
        }
    }
    
    public isInitialized(): boolean {
        return this.app !== null && this.storage !== null;
    }

    private checkInitialized(): void {
        if (!this.isInitialized()) {
            throw new Error("Firebase Storage is not initialized. Call init() with your Firebase config first.");
        }
    }

    public async uploadFile(path: string, file: File): Promise<UploadResult> {
        this.checkInitialized();
        const fullPath = path ? `${path}/${file.name}` : file.name;
        const storageRef = ref(this.storage, fullPath);
        return await uploadBytes(storageRef, file);
    }

    public async deleteFile(path: string): Promise<void> {
        this.checkInitialized();
        const storageRef = ref(this.storage, path);
        return await deleteObject(storageRef);
    }
    
    public async listFiles(path: string): Promise<{ files: StorageReference[], folders: StorageReference[] }> {
        this.checkInitialized();
        const storageRef = ref(this.storage, path);
        const res = await listAll(storageRef);
        return {
            files: res.items,
            folders: res.prefixes
        };
    }

    public async getDownloadURL(path: string): Promise<string> {
        this.checkInitialized();
        const storageRef = ref(this.storage, path);
        return await getDownloadURL(storageRef);
    }
}

export const firebaseStorage = FirebaseStorageManager.getInstance();
