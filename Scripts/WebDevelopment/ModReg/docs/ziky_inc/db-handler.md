# I-DB Handler (DataManager)

The `I-DB Handler` is a robust, standalone TypeScript module designed to manage application state, user settings, and IndexedDB interactions through a single JSON configuration file. It supports recursive file merging, auto-migration, and flexible data definitions.

## Features

- **Single Config Source**: Initialize your entire app's data layer from a URL (e.g., `appdata.json`).
- **IndexedDB Wrapper**: A promise-based wrapper around IndexedDB for easy `get`, `set`, `update`, and `delete` operations.
- **Auto-Migration**: Automatically detects schema changes in your JSON config and upgrades the database, preserving existing data.
- **Recursive Merging**: Merges multiple data files (local or web) into a single state object, supporting deep nesting and overrides.
- **Flexible Naming**: Supports various keys for configuration (e.g., `user` vs `user_data`, `db` vs `database`).
- **Stale Data Cleanup**: Optionally cleans up databases and stores that are no longer defined in your config.

## Usage

### Initialization

```typescript
import { DataManager } from './modules/ziky_inc/data/db';

const manager = new DataManager();

// Initialize with a path to your main config file
// Optional: Pass 'true' as the second argument to clean stale data
await manager.init('/appdata.json', true);

// Access Data
const settings = manager.getSettings();
const appData = manager.getData();

console.log('Theme:', settings.theme);
```

### Configuration Structure (`appdata.json`)

The configuration file drives the entire system.

```json
{
  "meta": {
    "name": "My App",
    "version": "1.0.0",
    "files": {
        "load_files": true,
        "files": [
            {
                "web": { "type": "git", "path": "https://..." },
                "local": { "type": "project", "path": "/data/extra.json" },
                "priority": "local",
                "to_nest": "extras"
            }
        ]
    }
  },
  "settings": {
    "theme": "dark",
    "notifications": true
  },
  "data": {
    "user": {
      "db": [
        {
          "type": "IndexedDB",
          "name": "AppDB",
          "version": 1,
          "stores": [
            { "name": "Users", "keyPath": "id" },
            { "name": "Settings", "keyPath": "key" }
          ]
        }
      ],
      "def": [
        {
          "db": "AppDB",
          "store": "Settings",
          "data": { "id": "theme", "value": "dark" }
        }
      ]
    }
  }
}
```

## API Reference

### `DataManager`

#### `init(configUrl: string, cleanStale?: boolean): Promise<void>`
Initializes the manager. Fetches the config, merges files, sets up databases, and applies defaults.
- `cleanStale`: If true, deletes IndexedDB databases and stores that are not defined in the loaded configuration.

#### `getSettings(): any`
Returns the merged `settings` object from the configuration.

#### `getData(): any`
Returns the merged `data` object from the configuration.

#### `getMigrationFailures(): MigrationFailure[]`
Returns a list of any data items that failed to migrate during a database upgrade.

### `DBManager` (Internal but accessible)

The `DBManager` handles the low-level IndexedDB operations. It is automatically instantiated by `DataManager` based on your config, but you can use it directly if needed.

```typescript
const db = new DBManager('AppDB', 1);
await db.open([{ name: 'Users', keyPath: 'id' }]);
await db.add('Users', { id: 1, name: 'Alice' });
```

## Auto-Migration

When you change the `version` of a database in your JSON config, the `DataManager`:
1. Opens the existing database.
2. Backs up all data to memory.
3. Closes and upgrades the database (creating/deleting stores).
4. Restores the data into the new stores.
5. Logs any failures (accessible via `getMigrationFailures()`).

## Recursive File Merging

You can split your data across multiple files. Define them in `meta.files`.
- **Priority**: Choose `web` or `local` as the primary source.
- **Fallback**: Automatically tries the alternative source if the primary fails.
- **Nesting**: Use `to_nest` to merge the file's data into a specific sub-object of the main data (e.g., `data.levels.level1`).
