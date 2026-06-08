// services/dbService.ts
import { DataManager } from "../modules/data/db";

const dbManager = new DataManager();

export const initDb = async (configUrl: string) => {
  await dbManager.init(configUrl);
  return dbManager;
};

export const getDbManager = () => dbManager;
