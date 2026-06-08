import type { UserPreset, RecentUrl } from '../../types';

let db: IDBDatabase;
let DB_NAME: string;
let PRESETS_STORE: string;
let URLS_STORE: string;

export function initDB(dbName: string, presetsStoreName: string, urlsStoreName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    DB_NAME = dbName;
    PRESETS_STORE = presetsStoreName;
    URLS_STORE = urlsStoreName;

    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      if (!database.objectStoreNames.contains(PRESETS_STORE)) {
        database.createObjectStore(PRESETS_STORE, { keyPath: 'name' });
      }

      if (!database.objectStoreNames.contains(URLS_STORE)) {
        const urlsStore = database.createObjectStore(URLS_STORE, { keyPath: 'timestamp' });
        urlsStore.createIndex('by_url', 'url', { unique: true });
      }
    };
  });
}

function getStore(storeName: string, mode: IDBTransactionMode): IDBObjectStore {
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
}

// Preset Functions
export function savePreset(preset: UserPreset): Promise<void> {
    return new Promise((resolve, reject) => {
        const store = getStore(PRESETS_STORE, 'readwrite');
        const request = store.put(preset);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export function getPresets(): Promise<UserPreset[]> {
    return new Promise((resolve, reject) => {
        const store = getStore(PRESETS_STORE, 'readonly');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function deletePreset(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const store = getStore(PRESETS_STORE, 'readwrite');
        const request = store.delete(name);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Recent URL Functions
export async function saveRecentUrl(url: string, maxRecent: number): Promise<void> {
    const tx = db.transaction(URLS_STORE, 'readwrite');
    const store = tx.objectStore(URLS_STORE);
    const index = store.index('by_url');

    // 1. Check for existing entry and delete it to update timestamp
    const getRequest = index.get(url);
    getRequest.onsuccess = () => {
        if (getRequest.result) {
            store.delete(getRequest.result.timestamp);
        }
    };
    
    // 2. Add the new entry
    const newEntry: RecentUrl = { url, timestamp: Date.now() };
    store.put(newEntry);

    // 3. Enforce maxRecent limit
    const countRequest = store.count();
    countRequest.onsuccess = () => {
        if (countRequest.result > maxRecent) {
            const cursorRequest = store.openCursor(null, 'next');
            let deleteCount = countRequest.result - maxRecent;
            cursorRequest.onsuccess = (e) => {
                const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor && deleteCount > 0) {
                    cursor.delete();
                    deleteCount--;
                    cursor.continue();
                }
            };
        }
    }

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export function getRecentUrls(): Promise<RecentUrl[]> {
    return new Promise((resolve, reject) => {
        const store = getStore(URLS_STORE, 'readonly');
        const request = store.getAll();
        request.onsuccess = () => {
            // Sort by most recent first
            const sorted = request.result.sort((a, b) => b.timestamp - a.timestamp);
            resolve(sorted);
        };
        request.onerror = () => reject(request.error);
    });
}