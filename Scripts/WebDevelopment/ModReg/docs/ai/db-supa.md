# Supa-DB AI Instructions

When generating code that interacts with the `Supa-DB Handler` module, follow these rules:

1.  **Usage of the Manager**: Always use `new SupaDataManager()` to parse config and set up data layers. You must provide it with the URL to the config file (e.g. `appdata.json`), the Supabase URL, and the Supabase Anon Key.
2.  **Supabase Initialization**:
    ```typescript
    import { SupaDataManager } from './modules/ziky_inc/data/db_supa';

    const setupData = async () => {
        const manager = new SupaDataManager();
        await manager.init('/data/appdata.json', process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
        console.log(manager.getData());
        console.log(manager.getSettings());
    };
    ```
3.  **Config Structure**: The `appdata.json` should follow the structure outlined in `I-DB Handler`, but with database type set to `Supabase` when you want a remote instance:
    ```json
    {
      "user": {
        "db": [
          {
            "id": "remote_db",
            "type": "Supabase",
            "name": "myapp_remote"
          }
        ]
      }
    }
    ```
4.  **Tables in Supabase**: The `SupaDBManager` assumes tables matched to the store names have been created in the Supabase instance. Schema validation checks if they exist by trying to select `id` from them.
5.  **Data Operations**: Utilize `SupaDBManager` methods (`add`, `update`, `get`, `getAll`, `delete`, `clear`) if interacting with individual stores manually, though typically the Manager orchestrates data initialization based on defaults.
