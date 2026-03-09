# AI Rules: I-DB Handler (DataManager)

## Overview

The `I-DB Handler` is a critical module for managing application state and IndexedDB interactions. It uses a single JSON configuration file (`appdata.json`) to define databases, stores, and default data.

## Implementation Guidelines

### 1. Initialization

Always initialize the `DataManager` at the start of your application (e.g., in `App.tsx` or `index.tsx`).

```typescript
import { DataManager } from './modules/ziky_inc/data/db';

const manager = new DataManager();
await manager.init('/appdata.json', true); // Pass true to clean stale data
```

### 2. Configuration (`appdata.json`)

When creating or modifying `appdata.json`, adhere to this structure:

- **meta**: Contains application metadata and file merging instructions.
- **settings**: Global application settings (e.g., theme, language).
- **data**: Contains user data definitions (`user`), databases (`db`), and default values (`def`).

**Example:**

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
    "theme": "dark"
  },
  "data": {
    "user": {
      "db": [
        {
          "type": "IndexedDB",
          "name": "AppDB",
          "version": 1,
          "stores": [
            { "name": "Users", "keyPath": "id" }
          ]
        }
      ],
      "def": [
        {
          "db": "AppDB",
          "store": "Users",
          "data": { "id": "admin", "role": "superuser" }
        }
      ]
    }
  }
}
```

### 3. Database Operations

Use the `DBManager` class (internal to `DataManager`) for direct database interactions if needed, but prefer using the `DataManager`'s `getData()` and `getSettings()` methods for read-only access to the initial configuration.

### 4. Auto-Migration

When changing the database schema (e.g., adding a new store or changing a keyPath), **increment the `version` number** in the `db` configuration block. The `DataManager` will automatically handle the migration and data preservation.

### 5. Recursive Merging

Use the `meta.files` array to split large configurations into smaller, manageable files. This is especially useful for modular applications where different features might have their own data requirements.

## Best Practices

- **Keep Config Clean**: Use `cleanStale: true` during development to remove old databases and stores that are no longer needed.
- **Version Control**: Always increment the database version when making schema changes to trigger the auto-migration logic.
- **Error Handling**: Check `manager.getMigrationFailures()` after initialization to ensure all data was migrated successfully.
