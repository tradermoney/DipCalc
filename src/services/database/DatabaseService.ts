import { DB_CONFIG } from '../../types';

export class DatabaseService {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建策略存储
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.strategies)) {
          const strategiesStore = db.createObjectStore(DB_CONFIG.stores.strategies, {
            keyPath: 'id'
          });
          strategiesStore.createIndex('type', 'type', { unique: false });
          strategiesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 创建计算结果存储
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.calculations)) {
          const calculationsStore = db.createObjectStore(DB_CONFIG.stores.calculations, {
            keyPath: 'id'
          });
          calculationsStore.createIndex('strategyId', 'strategyId', { unique: false });
          calculationsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 创建设置存储
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.settings)) {
          db.createObjectStore(DB_CONFIG.stores.settings, {
            keyPath: 'id'
          });
        }

        // 创建历史记录存储
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.history)) {
          const historyStore = db.createObjectStore(DB_CONFIG.stores.history, {
            keyPath: 'id'
          });
          historyStore.createIndex('strategyId', 'strategyId', { unique: false });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 创建临时输入/草稿存储
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.drafts)) {
          const draftsStore = db.createObjectStore(DB_CONFIG.stores.drafts, {
            keyPath: 'id'
          });
          draftsStore.createIndex('pagePath', 'pagePath', { unique: false });
          draftsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    return this.initDB();
  }

  // 通用的增删改查方法
  async add<T>(storeName: string, data: T): Promise<string> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => {
        resolve(request.result as string);
      };

      request.onerror = () => {
        reject(new Error(`Failed to add data to ${storeName}`));
      };
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get data from ${storeName}`));
      };
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get all data from ${storeName}`));
      };
    });
  }

  async update<T>(storeName: string, data: T): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to update data in ${storeName}`));
      };
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete data from ${storeName}`));
      };
    });
  }

  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get data by index from ${storeName}`));
      };
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to clear ${storeName}`));
      };
    });
  }

  async count(storeName: string): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to count records in ${storeName}`));
      };
    });
  }
}

// 单例模式
export const databaseService = new DatabaseService();