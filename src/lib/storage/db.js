/**
 * IndexedDB storage system for the AI Roadmap Planner
 */

const DB_NAME = 'AIRoadmapPlanner';
const DB_VERSION = 1;

const STORES = {
  ROADMAPS: 'roadmaps',
  SETTINGS: 'settings',
  PROGRESS: 'progress'
};

class DatabaseManager {
  #db = null;
  static #instance = null;

  constructor() {
    if (DatabaseManager.#instance) {
      return DatabaseManager.#instance;
    }
    DatabaseManager.#instance = this;
  }

  /**
   * Initializes the database connection
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    if (this.#db) {
      return this.#db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = (event) => {
        this.#db = event.target.result;
        resolve(this.#db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create roadmaps store
        if (!db.objectStoreNames.contains(STORES.ROADMAPS)) {
          const roadmapsStore = db.createObjectStore(STORES.ROADMAPS, {
            keyPath: 'id'
          });
          roadmapsStore.createIndex('title', 'title', { unique: false });
          roadmapsStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, {
            keyPath: 'key'
          });
        }

        // Create progress store
        if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
          const progressStore = db.createObjectStore(STORES.PROGRESS, {
            keyPath: 'roadmapId'
          });
          progressStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }
      };
    });
  }

  /**
   * Saves a roadmap to the database
   * @param {Object} roadmap - The roadmap to save
   * @returns {Promise<string>} - The ID of the saved roadmap
   */
  async saveRoadmap(roadmap) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([STORES.ROADMAPS], 'readwrite');
      const store = transaction.objectStore(STORES.ROADMAPS);

      // Ensure required fields
      const roadmapToSave = {
        ...roadmap,
        lastModified: Date.now(),
        id: roadmap.id || crypto.randomUUID()
      };

      const request = store.put(roadmapToSave);

      request.onsuccess = () => {
        resolve(roadmapToSave.id);
      };

      request.onerror = () => {
        reject(new Error('Failed to save roadmap'));
      };
    });
  }

  /**
   * Retrieves a roadmap by ID
   * @param {string} id - The roadmap ID
   * @returns {Promise<Object>} - The roadmap object
   */
  async getRoadmap(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([STORES.ROADMAPS], 'readonly');
      const store = transaction.objectStore(STORES.ROADMAPS);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve roadmap'));
      };
    });
  }

  /**
   * Gets all roadmaps
   * @returns {Promise<Array>} - Array of roadmap objects
   */
  async getAllRoadmaps() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([STORES.ROADMAPS], 'readonly');
      const store = transaction.objectStore(STORES.ROADMAPS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve roadmaps'));
      };
    });
  }

  /**
   * Deletes a roadmap by ID
   * @param {string} id - The roadmap ID to delete
   * @returns {Promise<void>}
   */
  async deleteRoadmap(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([STORES.ROADMAPS], 'readwrite');
      const store = transaction.objectStore(STORES.ROADMAPS);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to delete roadmap'));
      };
    });
  }

  /**
   * Saves progress for a roadmap
   * @param {string} roadmapId - The roadmap ID
   * @param {Object} progress - The progress data to save
   * @returns {Promise<void>}
   */
  async saveProgress(roadmapId, progress) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([STORES.PROGRESS], 'readwrite');
      const store = transaction.objectStore(STORES.PROGRESS);

      const progressData = {
        roadmapId,
        ...progress,
        lastUpdated: Date.now()
      };

      const request = store.put(progressData);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to save progress'));
      };
    });
  }

  /**
   * Gets progress for a roadmap
   * @param {string} roadmapId - The roadmap ID
   * @returns {Promise<Object>} - The progress data
   */
  async getProgress(roadmapId) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([STORES.PROGRESS], 'readonly');
      const store = transaction.objectStore(STORES.PROGRESS);
      const request = store.get(roadmapId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve progress'));
      };
    });
  }

  /**
   * Saves a setting
   * @param {string} key - The setting key
   * @param {any} value - The setting value
   * @returns {Promise<void>}
   */
  async saveSetting(key, value) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([STORES.SETTINGS], 'readwrite');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.put({ key, value });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to save setting'));
      };
    });
  }

  /**
   * Gets a setting value
   * @param {string} key - The setting key
   * @returns {Promise<any>} - The setting value
   */
  async getSetting(key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([STORES.SETTINGS], 'readonly');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve setting'));
      };
    });
  }

  /**
   * Gets the singleton instance of DatabaseManager
   * @returns {DatabaseManager}
   */
  static getInstance() {
    if (!DatabaseManager.#instance) {
      DatabaseManager.#instance = new DatabaseManager();
    }
    return DatabaseManager.#instance;
  }
}

export const db = DatabaseManager.getInstance();
