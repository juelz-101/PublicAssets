
export interface IndexSchema {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
}

export interface StoreSchema {
  name: string;
  keyPath: string;
  indexes?: IndexSchema[];
}

/**
 * A promise-based wrapper for IndexedDB to simplify common database operations.
 */
export class DBManager {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;

  constructor(dbName: string, version: number) {
    this.dbName = dbName;
    this.version = version;
  }

  /**
   * Opens the database and handles schema upgrades.
   * @param stores An array of schemas for the object stores.
   * @returns A promise that resolves when the database is open.
   */
  public open(stores: StoreSchema[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve();
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error('Failed to open database.'));
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        stores.forEach(storeSchema => {
          if (!db.objectStoreNames.contains(storeSchema.name)) {
            const store = db.createObjectStore(storeSchema.name, { keyPath: storeSchema.keyPath });
            storeSchema.indexes?.forEach(index => {
              store.createIndex(index.name, index.keyPath, index.options);
            });
          }
        });
      };
    });
  }

  /**
   * Closes the database connection.
   */
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

  /**
   * Adds an item to a store.
   * @param storeName The name of the object store.
   * @param data The data to add.
   * @returns A promise that resolves with the key of the added item.
   */
  public add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Updates an item in a store (or adds it if it doesn't exist).
   * @param storeName The name of the object store.
   * @param data The data to update.
   * @returns A promise that resolves with the key of the updated item.
   */
  public update<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Gets an item by its key from a store.
   * @param storeName The name of the object store.
   * @param key The key of the item to retrieve.
   * @returns A promise that resolves with the item, or undefined if not found.
   */
  public get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readonly');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Gets all items from a store.
   * @param storeName The name of the object store.
   * @returns A promise that resolves with an array of all items.
   */
  public getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readonly');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Deletes an item by its key from a store.
   * @param storeName The name of the object store.
   * @param key The key of the item to delete.
   * @returns A promise that resolves when the item is deleted.
   */
  public delete(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clears all items from a store.
   * @param storeName The name of the object store.
   * @returns A promise that resolves when the store is cleared.
   */
  public clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
