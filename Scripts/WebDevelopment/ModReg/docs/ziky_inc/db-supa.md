# Supa-DB Handler Library Documentation

The Supa-DB handler is a remote-first counterpart to the 'I-DB Handler'. It parses a modular JSON configuration and provisions application default data into a Supabase project.

## Core Concepts

- **SupaDataManager**: The main entry point to load global application configuration (`appdata.json`). It mirrors settings into a local runtime state and populates defaults into Supabase.
- **SupaDBManager**: Under the hood, this wraps `@supabase/supabase-js` focusing on CRUD operations keyed mostly via `id` in tables mimicking NoSQL stores.
- **File Merging**: Recursive file loading allows you to link modular `.json` resources (`local` and `web`) from your configuration root.

## Basic Example

```typescript
import { SupaDataManager } from '../../modules/ziky_inc/data/db_supa';

// Create a new manager instance
const manager = new SupaDataManager();

// Initialize with config file URL and Supabase credentials
await manager.init(
  '/data/appdata.json', 
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Get parsed application state and settings
const data = manager.getData();
const settings = manager.getSettings();
```

## `appdata.json` Schema differences

While much of the schema matches `I-DB handler` (focusing on `meta`, `settings`, `data`, and `user`), you distinguish local indexing from cloud instances via `type`:

```json
{
  "user": {
    "db": [
      {
        "id": "MY_RECORDS_DB",
        "type": "Supabase",
        "name": "my_records",
        "stores": [
         {
           "name": "users"
         }
        ]
      }
    ]
  }
}
```

The database setup logic connects via the provided keys, asserting that `users` is available as a Supabase table. Note: Supabase tables must be managed independently or by a dashboard, they are not DDL generated automatically by `SupaDBManager` due to RLS privileges.
