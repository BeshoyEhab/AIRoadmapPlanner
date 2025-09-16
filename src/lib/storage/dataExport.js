/**
 * Data export/import functionality for AI Roadmap Planner
 */

import { db } from './db';

/**
 * Formats a date as YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Creates a filename for the export
 * @param {string} prefix - Prefix for the filename
 * @returns {string} - Generated filename
 */
const createExportFilename = (prefix) => {
  const date = formatDate(new Date());
  return `${prefix}-${date}.json`;
};

/**
 * Exports all roadmaps and their progress
 * @returns {Promise<void>}
 */
export const exportAllData = async () => {
  try {
    const roadmaps = await db.getAllRoadmaps();
    const exportData = {
      version: 1,
      timestamp: Date.now(),
      roadmaps: [],
    };

    // Get progress for each roadmap
    for (const roadmap of roadmaps) {
      const progress = await db.getProgress(roadmap.id);
      exportData.roadmaps.push({
        ...roadmap,
        progress: progress || null
      });
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = createExportFilename('roadmap-planner-export');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (_error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export data');
  }
};

/**
 * Exports a single roadmap and its progress
 * @param {string} roadmapId - ID of the roadmap to export
 * @returns {Promise<void>}
 */
export const exportRoadmap = async (roadmapId) => {
  try {
    const roadmap = await db.getRoadmap(roadmapId);
    if (!roadmap) {
      throw new Error('Roadmap not found');
    }

    const progress = await db.getProgress(roadmapId);
    const exportData = {
      version: 1,
      timestamp: Date.now(),
      roadmap: {
        ...roadmap,
        progress: progress || null
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = createExportFilename(`roadmap-${roadmap.title.toLowerCase().replace(/\s+/g, '-')}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (_error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export roadmap');
  }
};

/**
 * Validates imported data
 * @param {Object} data - The data to validate
 * @returns {boolean} - Whether the data is valid
 */
const validateImportData = (data) => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!data.version || !data.timestamp) {
    return false;
  }

  if (data.roadmaps && !Array.isArray(data.roadmaps)) {
    return false;
  }

  if (data.roadmap && typeof data.roadmap !== 'object') {
    return false;
  }

  return true;
};

/**
 * Imports data from a file
 * @param {File} file - The file to import
 * @returns {Promise<{ roadmaps: number, progress: number }>} - Count of imported items
 */
export const importData = async (file) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!validateImportData(data)) {
      throw new Error('Invalid import file format');
    }

    let importedRoadmaps = 0;
    let importedProgress = 0;

    // Handle single roadmap import
    if (data.roadmap) {
      const { progress, ...roadmap } = data.roadmap;
      await db.saveRoadmap(roadmap);
      importedRoadmaps++;

      if (progress) {
        await db.saveProgress(roadmap.id, progress);
        importedProgress++;
      }
    }

    // Handle multiple roadmaps import
    if (data.roadmaps) {
      for (const item of data.roadmaps) {
        const { progress, ...roadmap } = item;
        await db.saveRoadmap(roadmap);
        importedRoadmaps++;

        if (progress) {
          await db.saveProgress(roadmap.id, progress);
          importedProgress++;
        }
      }
    }

    return {
      roadmaps: importedRoadmaps,
      progress: importedProgress
    };
  } catch (_error) {
    console.error('Import failed:', error);
    throw new Error('Failed to import data');
  }
};

/**
 * Creates an export of all settings
 * @returns {Promise<void>}
 */
export const exportSettings = async () => {
  try {
    const settings = {};
    const transaction = await db.init();
    const store = transaction
      .transaction([db.STORES.SETTINGS], 'readonly')
      .objectStore(db.STORES.SETTINGS);

    const request = store.getAll();

    await new Promise((resolve, reject) => {
      request.onsuccess = () => {
        request.result.forEach(item => {
          settings[item.key] = item.value;
        });
        resolve();
      };
      request.onerror = () => reject(request.error);
    });

    const exportData = {
      version: 1,
      timestamp: Date.now(),
      settings
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = createExportFilename('roadmap-planner-settings');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (_error) {
    console.error('Settings export failed:', error);
    throw new Error('Failed to export settings');
  }
};

/**
 * Imports settings from a file
 * @param {File} file - The settings file to import
 * @returns {Promise<number>} - Number of settings imported
 */
export const importSettings = async (file) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.version || !data.timestamp || !data.settings || typeof data.settings !== 'object') {
      throw new Error('Invalid settings file format');
    }

    let importedSettings = 0;
    for (const [key, value] of Object.entries(data.settings)) {
      await db.saveSetting(key, value);
      importedSettings++;
    }

    return importedSettings;
  } catch (_error) {
    console.error('Settings import failed:', error);
    throw new Error('Failed to import settings');
  }
};
