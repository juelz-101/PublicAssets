// modules/electron/fs-wrapper.ts
import { ipc } from './ipc-wrapper';

/**
 * A wrapper for Node's 'fs' module operations via IPC.
 * Includes a LocalStorage fallback for web environments to simulate a file system.
 */

// Key for LocalStorage mock data
const MOCK_FS_KEY = 'mock_fs_data';

const getMockData = (): Record<string, string> => {
    try {
        return JSON.parse(localStorage.getItem(MOCK_FS_KEY) || '{}');
    } catch {
        return {};
    }
};

const saveMockData = (data: Record<string, string>) => {
    localStorage.setItem(MOCK_FS_KEY, JSON.stringify(data));
};

export const fs = {
    /**
     * Writes data to a file.
     * @param path The file path.
     * @param data The string data to write.
     */
    writeFile: async (path: string, data: string): Promise<void> => {
        if (ipc.isElectron()) {
            await ipc.invoke('fs:write-file', { path, data });
        } else {
            console.log(`[FS Mock] Writing to ${path}`);
            const current = getMockData();
            current[path] = data;
            saveMockData(current);
            // Simulate IO delay
            await new Promise(r => setTimeout(r, 200));
        }
    },

    /**
     * Reads a file.
     * @param path The file path.
     * @returns The file content as a string.
     */
    readFile: async (path: string, encoding: string = 'utf-8'): Promise<string> => {
        if (ipc.isElectron()) {
            return ipc.invoke('fs:read-file', { path, encoding });
        } else {
            console.log(`[FS Mock] Reading ${path}`);
            const current = getMockData();
            await new Promise(r => setTimeout(r, 200));
            if (path in current) {
                return current[path];
            }
            throw new Error(`ENOENT: no such file or directory, open '${path}'`);
        }
    },

    /**
     * Checks if a file exists.
     * @param path The file path.
     */
    exists: async (path: string): Promise<boolean> => {
        if (ipc.isElectron()) {
            return ipc.invoke('fs:exists', path);
        } else {
            const current = getMockData();
            return path in current;
        }
    },

    /**
     * Simulates readdir (listing keys in mock storage).
     * @param path Directory path (ignored in mock, returns all keys).
     */
    readdir: async (path: string): Promise<string[]> => {
        if (ipc.isElectron()) {
            return ipc.invoke('fs:readdir', path);
        } else {
            const current = getMockData();
            // In a flat key-value store, we just return all filenames
            return Object.keys(current);
        }
    }
};
