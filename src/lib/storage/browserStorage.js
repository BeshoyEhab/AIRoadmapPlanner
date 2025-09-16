/**
 * Browser-based storage manager for roadmaps
 * Handles user-specific roadmap storage in localStorage
 */

// Generate a unique user ID if one doesn't exist
const getUserId = () => {
  let userId = localStorage.getItem('ai-roadmap-user-id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('ai-roadmap-user-id', userId);
  }
  return userId;
};

// Storage keys
const STORAGE_KEYS = {
  USER_ID: 'ai-roadmap-user-id',
  ROADMAPS: 'ai-roadmap-data',
  BACKUP_KEY: 'ai-roadmap-backup-key'
};

/**
 * Get all roadmaps for the current user
 */
export const getAllRoadmaps = () => {
  try {
    const userId = getUserId();
    const allData = localStorage.getItem(STORAGE_KEYS.ROADMAPS);
    
    if (!allData) return [];
    
    const parsedData = JSON.parse(allData);
    
    // Return roadmaps for the current user only
    return parsedData[userId] || [];
  } catch (error) {
    console.error('Error loading roadmaps:', error);
    return [];
  }
};

/**
 * Save a roadmap for the current user
 */
export const saveRoadmap = (roadmap) => {
  try {
    const userId = getUserId();
    const allData = localStorage.getItem(STORAGE_KEYS.ROADMAPS);
    let parsedData = {};
    
    if (allData) {
      parsedData = JSON.parse(allData);
    }
    
    // Initialize user data if it doesn't exist
    if (!parsedData[userId]) {
      parsedData[userId] = [];
    }
    
    // Create a complete roadmap object
    const roadmapToSave = {
      ...roadmap,
      id: roadmap.id || `roadmap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: roadmap.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId,
      sanitizedName: roadmap.sanitizedName || roadmap.id || `roadmap_${Date.now()}`
    };
    
    // Find existing roadmap index
    const existingIndex = parsedData[userId].findIndex(r => 
      r.id === roadmapToSave.id || r.sanitizedName === roadmapToSave.sanitizedName
    );
    
    if (existingIndex >= 0) {
      // Update existing roadmap
      parsedData[userId][existingIndex] = roadmapToSave;
    } else {
      // Add new roadmap
      parsedData[userId].push(roadmapToSave);
    }
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(parsedData));
    
    return roadmapToSave;
  } catch (error) {
    console.error('Error saving roadmap:', error);
    throw new Error('Failed to save roadmap to browser storage');
  }
};

/**
 * Delete a roadmap by ID or sanitized name
 */
export const deleteRoadmap = (idOrSanitizedName) => {
  try {
    const userId = getUserId();
    const allData = localStorage.getItem(STORAGE_KEYS.ROADMAPS);
    
    if (!allData) return false;
    
    const parsedData = JSON.parse(allData);
    
    if (!parsedData[userId]) return false;
    
    // Find and remove the roadmap
    const initialLength = parsedData[userId].length;
    parsedData[userId] = parsedData[userId].filter(roadmap => 
      roadmap.id !== idOrSanitizedName && roadmap.sanitizedName !== idOrSanitizedName
    );
    
    if (parsedData[userId].length < initialLength) {
      localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(parsedData));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    throw new Error('Failed to delete roadmap from browser storage');
  }
};

/**
 * Generate a backup key for the user's data
 */
export const generateBackupKey = () => {
  try {
    const userId = getUserId();
    const timestamp = new Date().toISOString();
    const backupKey = `${userId}_${timestamp}_${Math.random().toString(36).substring(2, 10)}`;
    
    localStorage.setItem(STORAGE_KEYS.BACKUP_KEY, backupKey);
    
    return backupKey;
  } catch (error) {
    console.error('Error generating backup key:', error);
    throw new Error('Failed to generate backup key');
  }
};

/**
 * Export user's roadmaps with backup key
 */
export const exportUserData = () => {
  try {
    const userId = getUserId();
    const roadmaps = getAllRoadmaps();
    const backupKey = generateBackupKey();
    
    return {
      backupKey,
      userId,
      roadmaps,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw new Error('Failed to export user data');
  }
};

/**
 * Import user's roadmaps from backup data
 */
export const importUserData = (backupData) => {
  try {
    if (!backupData || !backupData.roadmaps || !backupData.userId) {
      throw new Error('Invalid backup data format');
    }
    
    const currentUserId = getUserId();
    const allData = localStorage.getItem(STORAGE_KEYS.ROADMAPS);
    let parsedData = {};
    
    if (allData) {
      parsedData = JSON.parse(allData);
    }
    
    // Import roadmaps to current user
    parsedData[currentUserId] = backupData.roadmaps.map(roadmap => ({
      ...roadmap,
      userId: currentUserId,
      importedAt: new Date().toISOString(),
      originalUserId: backupData.userId
    }));
    
    localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(parsedData));
    
    return parsedData[currentUserId].length;
  } catch (error) {
    console.error('Error importing user data:', error);
    throw new Error('Failed to import user data');
  }
};

/**
 * Get current user ID
 */
export const getCurrentUserId = () => getUserId();

/**
 * Clear all user data (for testing/reset purposes)
 */
export const clearUserData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.ROADMAPS);
    localStorage.removeItem(STORAGE_KEYS.BACKUP_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

/**
 * Get storage statistics
 */
export const getStorageStats = () => {
  try {
    const userId = getUserId();
    const roadmaps = getAllRoadmaps();
    const allData = localStorage.getItem(STORAGE_KEYS.ROADMAPS);
    
    return {
      userId,
      roadmapCount: roadmaps.length,
      completedRoadmaps: roadmaps.filter(r => r.generationState === 'completed').length,
      inProgressRoadmaps: roadmaps.filter(r => r.generationState === 'in-progress').length,
      storageSize: allData ? new Blob([allData]).size : 0,
      lastUpdated: roadmaps.length > 0 ? Math.max(...roadmaps.map(r => new Date(r.updatedAt).getTime())) : null
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return null;
  }
};
