import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
      const item = JSON.parse(itemStr) as StoredItem<T> | T;
      if (typeof item === 'object' && item !== null && 'value' in item && 'expiry' in item) {
        if ((item as StoredItem<T>).expiry && Date.now() > (item as StoredItem<T>).expiry!) {
            storage.removeItem(key);
            return null;
        }
        return (item as StoredItem<T>).value;
      }
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

// --- Supabase Manager ---

interface IndexSchema {
  name: string;
  keyPath: string | string[];
  options?: any;
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

export class SupaDBManager {
  private client: SupabaseClient | null = null;
  private dbName: string;
  private version: number;

  constructor(dbName: string, version: number) {
    this.dbName = dbName;
    this.version = version;
  }

  public initClient(supabaseUrl: string, supabaseAnonKey: string) {
    this.client = createClient(supabaseUrl, supabaseAnonKey);
  }

  public async open(stores: StoreSchema[]): Promise<MigrationFailure[]> {
    const failures: MigrationFailure[] = [];
    // Note: Supabase tables must be pre-created by the user in their project dashboard.
    // Client-side schema migrations are generally restricted by RLS and permissions.
    // We can do a simple check if the table is readable.
    for (const store of stores) {
      if (this.client) {
        const { error } = await this.client.from(store.name).select('id').limit(1);
        if (error && error.code !== 'PGRST116') { // PGRST116 is no rows, which is fine
           console.warn(`Supabase warning for table ${store.name}: ${error.message}`);
        }
      }
    }
    return failures;
  }

  public close(): void {
    this.client = null;
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client is not initialized.');
    }
    return this.client;
  }

  public async add<T>(storeName: string, data: T): Promise<any> {
    const { data: result, error } = await this.getClient().from(storeName).insert(data as any).select().single();
    if (error) throw new Error(error.message);
    return result;
  }

  public async update<T>(storeName: string, data: T): Promise<any> {
     // Assuming data has an 'id' property. If standard keyPath is customizable, we would need to map it.
     // By default we fallback to assuming 'id' property is the primary key.
    const keyPath = (data as any).id;
    if (keyPath === undefined) throw new Error('Data must contain an id property for update');
    
    // Attempt upsert
    const { data: result, error } = await this.getClient().from(storeName).upsert(data as any).select().single();
    if (error) throw new Error(error.message);
    return result;
  }

  public async get<T>(storeName: string, key: any): Promise<T | undefined> {
    const { data: result, error } = await this.getClient().from(storeName).select('*').eq('id', key).single();
    if (error) {
        if (error.code === 'PGRST116') return undefined; // NOT FOUND
        throw new Error(error.message);
    }
    return result as T;
  }

  public async getAll<T>(storeName: string): Promise<T[]> {
    const { data: result, error } = await this.getClient().from(storeName).select('*');
    if (error) throw new Error(error.message);
    return result as T[];
  }

  public async delete(storeName: string, key: any): Promise<void> {
    const { error } = await this.getClient().from(storeName).delete().eq('id', key);
    if (error) throw new Error(error.message);
  }

  public async clear(storeName: string): Promise<void> {
    // Dangerous operation: usually delete without where is blocked by Supabase default settings (needs explicit allow).
    // We mock generic delete or try to delete matching all.
    const { error } = await this.getClient().from(storeName).delete().neq('id', 'non_existing');
    if (error) throw new Error(error.message);
  }
}

// --- Helper Functions ---
const isObject = (item: any): item is object => (item && typeof item === 'object' && !Array.isArray(item));

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

// --- SupaDataManager Class ---
export class SupaDataManager {
    private settings: any = {};
    private data: any = {};
    private migrationFailures: MigrationFailure[] = [];
    public onLog: (message: string) => void = console.log;

    public getSettings = () => this.settings;
    public getData = () => this.data;
    public getMigrationFailures = () => this.migrationFailures;

    public async init(configUrl: string, supabaseUrl: string, supabaseAnonKey: string): Promise<void> {
        try {
            this.onLog(`Fetching main config from: ${configUrl}`);
            const mainConfig = await fetch(configUrl).then(res => {
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                return res.json();
            });

            // Step 1: Load Defaults
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
            
            // Step 4: Handle User Databases
            const userData = getVal(this.data, USER_DATA_KEYS) || getVal(effectiveConfig, USER_DATA_KEYS);
            const dbConfigs = getVal(userData, USER_DB_KEYS);
            if (dbConfigs) {
                await this.setupDatabases(dbConfigs, supabaseUrl, supabaseAnonKey);
            }

            // Step 5: Handle User Defaults
            const userDefaults = getVal(userData, USER_DEF_KEYS);
            if (userDefaults) {
                await this.applyDefaults(userDefaults, dbConfigs || [], supabaseUrl, supabaseAnonKey);
            }

            this.onLog('Initialization complete!');
        } catch (error: any) {
            this.onLog(`Initialization failed: ${error.message}`);
            console.error(error);
            throw error;
        }
    }

    private async runRecursiveFileMerge(masterFileMeta: any): Promise<void> {
        const processedFiles = new Set<string>();
        let filesToProcess = this.extractFilesFromData(this.data, masterFileMeta);

        if (filesToProcess.length === 0) {
           return;
        }

        while (filesToProcess.length > 0) {
            const currentBatch = [...filesToProcess];
            filesToProcess = []; 

            for (const file of currentBatch) {
                const fileId = file.web?.path || file.local?.path || JSON.stringify(Object.keys(file).sort().reduce((obj: any, key) => {
                    obj[key] = file[key];
                    return obj;
                }, {}));

                if (processedFiles.has(fileId)) continue;
                processedFiles.add(fileId);

                const fileData = await this.fetchWithFallback(file, masterFileMeta);
                if (fileData) {
                    this.mergeFileData(fileData, file.to_nest);
                    const localMeta = fileData.meta?.files || masterFileMeta;
                    const newFiles = this.extractFilesFromData(fileData.data, localMeta);
                    
                    filesToProcess.push(...newFiles.filter((f: any) => {
                        const id = f.web?.path || f.local?.path || JSON.stringify(f);
                        return !processedFiles.has(id);
                    }));
                }
            }
        }
    }

    private extractFilesFromData(data: any, masterMeta: any): any[] {
        if (!masterMeta?.load_files) return [];
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
                const res = await fetch(source.config.path);
                if (res.ok) return await res.json();
            } catch (e: any) {
               // Ignore
            }
        }
        return null;
    }

    private mergeFileData(fileData: any, toNest?: string): void {
        const strippedData = stripInfoKeys(fileData);
        const dataToMerge = strippedData.data || {};
        const settingsToMerge = strippedData.settings || {};

        deepMerge(this.settings, settingsToMerge);

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

    private async setupDatabases(dbConfigs: any[], supabaseUrl: string, supabaseAnonKey: string): Promise<void> {
        this.onLog('Setting up remote Supabase databases...');
        for (const dbConfig of dbConfigs) {
            const dbType = dbConfig.type;
            const dbName = getVal(dbConfig, NAME_KEYS);
            const version = dbConfig.version || 1;

            if (dbType === 'Supabase' || dbType === 'IndexedDB') { // Also handle IndexedDB fallback mapping to Supabase
                try {
                    const manager = new SupaDBManager(dbName, version);
                    manager.initClient(supabaseUrl, supabaseAnonKey);
                    const stores = getVal(dbConfig, ['stores']) || [];
                    const storeSchemas = stores.map((s: any) => ({
                        name: getVal(s, NAME_KEYS),
                        keyPath: 'id',
                        indexes: s.indexes || [],
                    }));
                    const failures = await manager.open(storeSchemas);
                    if (failures.length > 0) {
                        this.onLog(`- Database "${dbName}" opened with ${failures.length} validation issues.`);
                        this.migrationFailures.push(...failures);
                    } else {
                        this.onLog(`- Database "${dbName}" opened/verified.`);
                    }
                    manager.close();
                } catch (error: any) {
                     this.onLog(`- Failed to verify Supabase DB "${dbName}": ${error.message}`);
                }
            } else if (dbType === 'LocalStorage' || dbType === 'SessionStorage') {
                this.onLog(`- Keeping storage type "${dbType}" local for cache.`);
            }
        }
    }

    private async applyDefaults(defaults: any[], dbConfigs: any[], supabaseUrl: string, supabaseAnonKey: string): Promise<void> {
        this.onLog('Applying user defaults to network tables...');
        for (const def of defaults) {
            let targetDbConfig: any, targetStoreConfig: any;
            const dbId = getVal(def, DB_ID_KEYS);
            const storeId = getVal(def, STORE_ID_KEYS);

            if (!dbId && !storeId) {
                targetDbConfig = dbConfigs.find(db => db.mark_as === 'default');
                const stores = getVal(targetDbConfig, ['stores']) || [];
                targetStoreConfig = stores.find((s: any) => s.mark_as === 'default');
            } else {
                targetDbConfig = dbConfigs.find(db => getVal(db, DB_ID_KEYS) === dbId);
                if (!targetDbConfig) {
                    targetDbConfig = dbConfigs.find(db => getVal(db, NAME_KEYS) === dbId);
                }

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

                if (dbType === 'Supabase' || dbType === 'IndexedDB') {
                    const manager = new SupaDBManager(dbName, targetDbConfig.version);
                    manager.initClient(supabaseUrl, supabaseAnonKey);
                    try {
                        const defaultId = def.data.id || storeIdVal;
                        const existingData = await manager.get(storeName, defaultId);

                        const defaultDataWithId = { ...def.data, id: defaultId };
                        
                        let dataToSave;
                        if (existingData && isObject(existingData)) {
                            this.onLog(`  - Merging defaults with existing data for ID "${defaultId}".`);
                            dataToSave = mergeIfNotExists({ ...existingData }, defaultDataWithId);
                        } else {
                            dataToSave = defaultDataWithId;
                        }

                        await manager.update(storeName, dataToSave);
                    } catch (error: any) {
                        this.onLog(`  - Error applying defaults to ${dbName}/${storeName}: ${error.message}`);
                    } finally {
                        manager.close();
                    }
                } else if (dbType === 'LocalStorage' || dbType === 'SessionStorage') {
                    const storage = dbType === 'LocalStorage' ? localStore : sessionStore;
                    try {
                        const existingData = storage.get(storeIdVal);
                        const defaultData = def.data;

                        let dataToSave;
                        if (existingData && isObject(existingData)) {
                            dataToSave = mergeIfNotExists({ ...existingData }, defaultData);
                        } else {
                            dataToSave = defaultData;
                        }

                        storage.set(storeIdVal, dataToSave);
                    } catch (error: any) {}
                }
            }
        }
    }
}
