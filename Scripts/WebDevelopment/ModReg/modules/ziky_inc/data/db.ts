// --- Standalone Storage Manager ---

interface StorageAPI {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

interface StoredItem<T> {
  value: T;
  expiry: number | null;
}

const createStorage = (storage: StorageAPI) => ({
  get<T>(key: string): T | null {
    const itemStr = storage.getItem(key);
    if (itemStr === null) {
      return null;
    }
    try {
      const item = JSON.parse(itemStr) as StoredItem<T> | T; // Handle old format
      // Check for new structure with expiry
      if (typeof item === 'object' && item !== null && 'value' in item && 'expiry' in item) {
        if ((item as StoredItem<T>).expiry && Date.now() > (item as StoredItem<T>).expiry!) {
            storage.removeItem(key); // Clean up expired item
            return null;
        }
        return (item as StoredItem<T>).value;
      }
      // Fallback for old data structure without expiry wrapper
      return item as T;
    } catch (e) {
      console.error(`Error parsing JSON from storage key "${key}":`, e);
      return null;
    }
  },

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    try {
      const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
      const item: StoredItem<T> = { value, expiry };
      const serializedValue = JSON.stringify(item);
      storage.setItem(key, serializedValue);
    } catch (e) {
      console.error(`Error serializing value for storage key "${key}":`, e);
    }
  },

  remove(key: string): void {
    storage.removeItem(key);
  },

  clear(): void {
    storage.clear();
  },
});

const localStore = createStorage(window.localStorage);
const sessionStore = createStorage(window.sessionStorage);


// --- Standalone IndexedDB Manager ---

interface IndexSchema {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
}

interface StoreSchema {
  name: string;
  keyPath: string;
  indexes?: IndexSchema[];
}

export interface MigrationFailure {
    dbName: string;
    storeName: string;
    key: any;
    data: any;
    error: string;
}

class DBManager {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;

  constructor(dbName: string, version: number) {
    this.dbName = dbName;
    this.version = version;
  }

  public async open(stores: StoreSchema[]): Promise<MigrationFailure[]> {
    const failures: MigrationFailure[] = [];
    
    // 1. Get current DB info
    const info = await this.getDbInfo();
    const currentVersion = info.version;
    const currentStores = info.stores;

    // 2. Check if upgrade is needed (store missing or version 0)
    const needsUpgrade = stores.some(s => !currentStores.includes(s.name));

    if (!needsUpgrade && currentVersion > 0) {
        // Just open the current version
        this.db = await this.performOpen(this.dbName, currentVersion, stores);
        return failures;
    }

    // 3. Migration required
    // Backup data from existing stores if they exist
    const backup: Record<string, any[]> = {};
    if (currentVersion > 0) {
        const tempDb = await this.performOpen(this.dbName, currentVersion, []);
        for (const storeName of currentStores) {
            backup[storeName] = await this.getAllFromDb(tempDb, storeName);
        }
        tempDb.close();
    }

    // Upgrade: Increment version and recreate stores
    const nextVersion = Math.max(currentVersion + 1, this.version);
    this.db = await this.performOpen(this.dbName, nextVersion, stores, true);

    // Restore data
    for (const storeName in backup) {
        if (this.db.objectStoreNames.contains(storeName)) {
            const dataArray = backup[storeName];
            for (const item of dataArray) {
                try {
                    await this.update(storeName, item);
                } catch (e: any) {
                    failures.push({
                        dbName: this.dbName,
                        storeName,
                        key: item.id || 'unknown',
                        data: item,
                        error: e.message || 'Restore failed'
                    });
                }
            }
        }
    }

    return failures;
  }

  private getDbInfo(): Promise<{ version: number; stores: string[] }> {
    return new Promise((resolve) => {
        const request = indexedDB.open(this.dbName);
        request.onsuccess = () => {
            const db = request.result;
            const info = { version: db.version, stores: Array.from(db.objectStoreNames) };
            db.close();
            resolve(info);
        };
        request.onerror = () => resolve({ version: 0, stores: [] });
    });
  }

  private performOpen(name: string, version: number, stores: StoreSchema[], upgrade: boolean = false): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            stores.forEach(schema => {
                if (upgrade && db.objectStoreNames.contains(schema.name)) {
                    db.deleteObjectStore(schema.name);
                }
                if (!db.objectStoreNames.contains(schema.name)) {
                    const store = db.createObjectStore(schema.name, { keyPath: schema.keyPath });
                    schema.indexes?.forEach(idx => store.createIndex(idx.name, idx.keyPath, idx.options));
                }
            });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
  }

  private getAllFromDb(db: IDBDatabase, storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (e) {
            reject(e);
        }
    });
  }

  public close(): void {
    this.db?.close();
    this.db = null;
  }

  private getStore(storeName: string, mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database is not open.');
    }
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  public add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public update<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readonly');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }

  public getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readonly');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  public delete(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}


// --- Helper Functions ---
const isObject = (item: any): item is object => (item && typeof item === 'object' && !Array.isArray(item));

/**
 * Helper to get value from object using multiple possible keys.
 */
const getVal = (obj: any, keys: string[]) => {
    if (!obj || typeof obj !== 'object') return undefined;
    for (const key of keys) {
        if (key in obj) return obj[key];
    }
    return undefined;
};

// Key mappings for flexible naming
const USER_DATA_KEYS = ['user', 'udb', 'user_database', 'ud', 'user_data'];
const USER_DB_KEYS = ['db', 'udb', 'database', 'user_database'];
const USER_DEF_KEYS = ['def', 'data', 'user_defaults'];
const DB_ID_KEYS = ['db', 'db_id'];
const STORE_ID_KEYS = ['store', 'store_id'];
const NAME_KEYS = ['name', 'db_name', 'store_name'];

/**
 * Recursively merges source object into target object (mutates target).
 * Arrays are concatenated.
 */
const deepMerge = (target: any, source: any) => {
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (Array.isArray(source[key])) {
                if (!Array.isArray(target[key])) target[key] = [];
                target[key] = [...target[key], ...source[key]];
            } else if (isObject(source[key])) {
                if (!target[key] || !isObject(target[key])) {
                    target[key] = {};
                }
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
};


/**
 * Recursively merges source into target, only adding properties if they don't exist in the target (mutates target).
 */
const mergeIfNotExists = (target: any, source: any) => {
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (!(key in target)) {
                target[key] = source[key];
            } else if (isObject(source[key]) && isObject(target[key])) {
                mergeIfNotExists(target[key], source[key]);
            }
        }
    }
    return target;
};


/**
 * Recursively removes keys named 'info' and 'dev_ref' from an object.
 */
const stripInfoKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(stripInfoKeys);
    }
    if (isObject(obj)) {
        const newObj: { [key: string]: any } = {};
        for (const key in obj) {
            if (key !== 'info' && key !== 'dev_ref') {
                newObj[key] = stripInfoKeys(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
};


// --- DataManager Class ---
export class DataManager {
    private settings: any = {};
    private data: any = {};
    private migrationFailures: MigrationFailure[] = [];
    public onLog: (message: string) => void = console.log;

    public getSettings = () => this.settings;
    public getData = () => this.data;
    public getMigrationFailures = () => this.migrationFailures;

    public async init(configUrl: string, cleanStale: boolean = false): Promise<void> {
        try {
            this.onLog(`Fetching main config from: ${configUrl}`);
            const mainConfig = await fetch(configUrl).then(res => {
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                return res.json();
            });

            // Step 1: Load Defaults (Initial Seed)
            let effectiveConfig = mainConfig;
            if (mainConfig.meta?.defaults?.load_defaults) {
                const defaultUrl = mainConfig.meta.defaults.web;
                this.onLog(`Loading defaults from: ${defaultUrl}`);
                const defaults = await fetch(defaultUrl).then(res => res.json());
                effectiveConfig = deepMerge(defaults, mainConfig);
                this.onLog('Defaults merged successfully.');
            }

            // Step 2: Initialize state
            effectiveConfig = stripInfoKeys(effectiveConfig);
            this.settings = effectiveConfig.settings || {};
            this.data = effectiveConfig.data || {};
            this.onLog('Initial settings and data loaded.');

            // Step 3: Recursive File Merging
            await this.runRecursiveFileMerge(effectiveConfig.meta?.files);
            
            // Step 4: Handle User Databases (using final merged config)
            const userData = getVal(this.data, USER_DATA_KEYS) || getVal(effectiveConfig, USER_DATA_KEYS);
            const dbConfigs = getVal(userData, USER_DB_KEYS);
            if (dbConfigs) {
                await this.setupDatabases(dbConfigs);
            }

            // Step 5: Handle User Defaults
            const userDefaults = getVal(userData, USER_DEF_KEYS);
            if (userDefaults) {
                await this.applyDefaults(userDefaults, dbConfigs || []);
            }

            // Step 6: Cleanup stale data if requested
            if (cleanStale && dbConfigs) {
                await this.cleanStaleData(dbConfigs);
            }

            this.onLog('Initialization complete!');
        } catch (error: any) {
            this.onLog(`Initialization failed: ${error.message}`);
            console.error(error);
            throw error;
        }
    }

    /**
     * Orchestrates recursive file merging until no new files are discovered.
     */
    private async runRecursiveFileMerge(masterFileMeta: any): Promise<void> {
        const processedFiles = new Set<string>();
        // Initial discovery using master meta
        let filesToProcess = this.extractFilesFromData(this.data, masterFileMeta);

        if (filesToProcess.length === 0) {
            this.onLog('No initial files to process.');
            return;
        }

        this.onLog('Starting recursive file merge...');
        
        while (filesToProcess.length > 0) {
            const currentBatch = [...filesToProcess];
            filesToProcess = []; // Clear for next round of discovery

            for (const file of currentBatch) {
                // Stable ID for tracking
                const fileId = file.web?.path || file.local?.path || JSON.stringify(Object.keys(file).sort().reduce((obj: any, key) => {
                    obj[key] = file[key];
                    return obj;
                }, {}));

                if (processedFiles.has(fileId)) continue;
                processedFiles.add(fileId);

                const fileData = await this.fetchWithFallback(file, masterFileMeta);
                if (fileData) {
                    this.mergeFileData(fileData, file.to_nest);
                    
                    // Discover new files from the newly merged data
                    // Use the merged file's own meta if it exists, otherwise fallback to master
                    const localMeta = fileData.meta?.files || masterFileMeta;
                    const newFiles = this.extractFilesFromData(fileData.data, localMeta);
                    
                    filesToProcess.push(...newFiles.filter(f => {
                        const id = f.web?.path || f.local?.path || JSON.stringify(f);
                        return !processedFiles.has(id);
                    }));
                }
            }
        }
        this.onLog('Recursive merge complete.');
    }

    private extractFilesFromData(data: any, masterMeta: any): any[] {
        if (!masterMeta?.load_files) return [];
        // Look for files in data.files (as per user request)
        return data?.files || [];
    }

    private async fetchWithFallback(file: any, masterMeta: any): Promise<any | null> {
        const allowWeb = masterMeta?.allow_web !== false;
        const allowLocal = masterMeta?.allow_local !== false;
        const priority = file.priority || 'web';

        const sources = priority === 'web' 
            ? [{ type: 'web', config: file.web }, { type: 'local', config: file.local }]
            : [{ type: 'local', config: file.local }, { type: 'web', config: file.web }];

        for (const source of sources) {
            if (!source.config?.path) continue;
            if (source.type === 'web' && !allowWeb) continue;
            if (source.type === 'local' && !allowLocal) continue;

            try {
                this.onLog(`- Fetching ${source.type} file: ${source.config.path}`);
                const res = await fetch(source.config.path);
                if (res.ok) return await res.json();
                this.onLog(`  - ${source.type} fetch failed with status: ${res.status}`);
            } catch (e: any) {
                this.onLog(`  - ${source.type} fetch error: ${e.message}`);
            }
        }

        return null;
    }

    private mergeFileData(fileData: any, toNest?: string): void {
        // We only merge 'data' and 'settings'. 'meta' is ignored.
        const strippedData = stripInfoKeys(fileData);
        const dataToMerge = strippedData.data || {};
        const settingsToMerge = strippedData.settings || {};

        // Merge Settings
        deepMerge(this.settings, settingsToMerge);

        // Merge Data
        let targetData = this.data;
        if (toNest) {
            const keys = toNest.split('/');
            keys.forEach(key => {
                if (!targetData[key]) targetData[key] = {};
                targetData = targetData[key];
            });
        }
        deepMerge(targetData, dataToMerge);
    }

    private async cleanStaleData(dbConfigs: any[]): Promise<void> {
        this.onLog('Cleaning stale databases and stores...');
        if (!('databases' in indexedDB)) {
            this.onLog('- Browser does not support indexedDB.databases(). Skipping cleanup.');
            return;
        }

        try {
            const dbs = await (indexedDB as any).databases();
            const definedDbNames = dbConfigs.map(c => getVal(c, NAME_KEYS));
            
            for (const dbInfo of dbs) {
                if (!dbInfo.name) continue;

                if (!definedDbNames.includes(dbInfo.name)) {
                    this.onLog(`- Deleting stale database: ${dbInfo.name}`);
                    indexedDB.deleteDatabase(dbInfo.name);
                } else {
                    // Check for stale stores within defined databases
                    const config = dbConfigs.find(c => getVal(c, NAME_KEYS) === dbInfo.name);
                    const definedStoreNames = (getVal(config, ['stores']) || []).map((s: any) => getVal(s, NAME_KEYS));
                    
                    const db = await new Promise<IDBDatabase>((resolve, reject) => {
                        const req = indexedDB.open(dbInfo.name);
                        req.onsuccess = () => resolve(req.result);
                        req.onerror = () => reject(req.error);
                    });
                    
                    const actualStoreNames = Array.from(db.objectStoreNames);
                    const currentVersion = db.version;
                    db.close();
                    
                    const staleStores = actualStoreNames.filter(name => !definedStoreNames.includes(name));
                    if (staleStores.length > 0) {
                        this.onLog(`- Database "${dbInfo.name}" has stale stores: ${staleStores.join(', ')}. Triggering upgrade to remove them.`);
                        await new Promise<void>((resolve, reject) => {
                            const req = indexedDB.open(dbInfo.name, currentVersion + 1);
                            req.onupgradeneeded = (event) => {
                                const upgradeDb = (event.target as IDBOpenDBRequest).result;
                                staleStores.forEach(name => upgradeDb.deleteObjectStore(name));
                            };
                            req.onsuccess = () => {
                                req.result.close();
                                resolve();
                            };
                            req.onerror = () => reject(req.error);
                        });
                    }
                }
            }
        } catch (error: any) {
            this.onLog(`- Stale data cleanup failed: ${error.message}`);
        }
    }
    
    private async setupDatabases(dbConfigs: any[]): Promise<void> {
        this.onLog('Setting up databases...');
        for (const dbConfig of dbConfigs) {
            const dbType = dbConfig.type;
            const dbName = getVal(dbConfig, NAME_KEYS);
            const version = dbConfig.version || 1;

            if (dbType === 'IndexedDB') {
                try {
                    const manager = new DBManager(dbName, version);
                    const stores = getVal(dbConfig, ['stores']) || [];
                    const storeSchemas = stores.map((s: any) => ({
                        name: getVal(s, NAME_KEYS),
                        keyPath: 'id', // Use a consistent keyPath for all stores
                        indexes: s.indexes || [],
                    }));
                    const failures = await manager.open(storeSchemas);
                    if (failures.length > 0) {
                        this.onLog(`- Database "${dbName}" opened with ${failures.length} migration failures.`);
                        this.migrationFailures.push(...failures);
                    } else {
                        this.onLog(`- Database "${dbName}" opened/verified.`);
                    }
                    manager.close();
                } catch (error: any) {
                     this.onLog(`- Failed to setup IndexedDB "${dbName}": ${error.message}`);
                }
            } else if (dbType === 'LocalStorage' || dbType === 'SessionStorage') {
                this.onLog(`- Database type "${dbType}" for "${dbName}" requires no special setup.`);
            } else {
                this.onLog(`- Unknown database type "${dbType}" for "${dbName}". Skipping.`);
            }
        }
    }

    private async applyDefaults(defaults: any[], dbConfigs: any[]): Promise<void> {
        this.onLog('Applying user defaults...');
        for (const def of defaults) {
            let targetDbConfig: any, targetStoreConfig: any;

            const dbId = getVal(def, DB_ID_KEYS);
            const storeId = getVal(def, STORE_ID_KEYS);

            if (!dbId && !storeId) {
                targetDbConfig = dbConfigs.find(db => db.mark_as === 'default');
                const stores = getVal(targetDbConfig, ['stores']) || [];
                targetStoreConfig = stores.find((s: any) => s.mark_as === 'default');
            } else {
                // Search for DB: ID first, then Name
                targetDbConfig = dbConfigs.find(db => getVal(db, DB_ID_KEYS) === dbId);
                if (!targetDbConfig) {
                    targetDbConfig = dbConfigs.find(db => getVal(db, NAME_KEYS) === dbId);
                }

                // Search for Store: ID first, then Name
                if (targetDbConfig) {
                    const stores = getVal(targetDbConfig, ['stores']) || [];
                    targetStoreConfig = stores.find((s: any) => getVal(s, STORE_ID_KEYS) === storeId);
                    if (!targetStoreConfig) {
                        targetStoreConfig = stores.find((s: any) => getVal(s, NAME_KEYS) === storeId);
                    }
                }
            }
            
            if (targetDbConfig && targetStoreConfig) {
                const dbType = targetDbConfig.type;
                const dbName = getVal(targetDbConfig, NAME_KEYS);
                const storeName = getVal(targetStoreConfig, NAME_KEYS);
                const storeIdVal = getVal(targetStoreConfig, STORE_ID_KEYS) || storeName;

                if (dbType === 'IndexedDB') {
                    this.onLog(`- Applying defaults to IndexedDB: ${dbName}/${storeName}`);
                    const manager = new DBManager(dbName, targetDbConfig.version);
                    try {
                        await manager.open([{ name: storeName, keyPath: 'id', indexes: targetStoreConfig.indexes || [] }]);
                        
                        const defaultId = def.data.id || storeIdVal; // Use a predictable ID
                        const existingData = await manager.get(storeName, defaultId);

                        const defaultDataWithId = { ...def.data, id: defaultId };
                        
                        // FIX: Ensure existingData is an object before spreading to prevent errors with primitives.
                        // If existingData is not an object, it's overwritten with the defaults.
                        let dataToSave;
                        if (existingData && isObject(existingData)) {
                            this.onLog(`  - Merging defaults with existing data for ID "${defaultId}".`);
                            dataToSave = mergeIfNotExists({ ...existingData }, defaultDataWithId);
                        } else {
                            if (existingData) {
                                this.onLog(`  - Existing data for ID "${defaultId}" is not an object. Overwriting with defaults.`);
                            } else {
                                this.onLog(`  - No existing data found for ID "${defaultId}". Applying new defaults.`);
                            }
                            dataToSave = defaultDataWithId;
                        }

                        await manager.update(storeName, dataToSave);
                        this.onLog(`  - Defaults successfully applied.`);
                    } catch (error: any) {
                        this.onLog(`  - Error applying defaults to ${dbName}/${storeName}: ${error.message}`);
                    } finally {
                        manager.close();
                    }
                } else if (dbType === 'LocalStorage' || dbType === 'SessionStorage') {
                    this.onLog(`- Applying defaults to ${dbType}: key="${storeIdVal}"`);
                    const storage = dbType === 'LocalStorage' ? localStore : sessionStore;
                    try {
                        const existingData = storage.get(storeIdVal);
                        const defaultData = def.data;

                        // FIX: Ensure existingData is an object before spreading to prevent errors with primitives.
                        // If existingData is not an object, it's overwritten with the defaults.
                        let dataToSave;
                        if (existingData && isObject(existingData)) {
                            this.onLog(`  - Merging defaults with existing data for key "${storeIdVal}".`);
                            dataToSave = mergeIfNotExists({ ...existingData }, defaultData);
                        } else {
                            if (existingData) {
                                this.onLog(`  - Existing data for key "${storeIdVal}" is not an object. Overwriting with defaults.`);
                            } else {
                                this.onLog(`  - No existing data found for key "${storeIdVal}". Applying new defaults.`);
                            }
                            dataToSave = defaultData;
                        }

                        storage.set(storeIdVal, dataToSave);
                        this.onLog(`  - Defaults successfully applied to key "${storeIdVal}".`);
                    } catch (error: any) {
                        this.onLog(`  - Error applying defaults to ${dbType}/${storeIdVal}: ${error.message}`);
                    }
                } else {
                    this.onLog(`- Skipping defaults for unknown DB type "${dbType}".`);
                }

            } else {
                this.onLog(`- Could not find target DB/store for a default block (db: ${dbId || 'default'}, store: ${storeId || 'default'}).`);
            }
        }
    }
}