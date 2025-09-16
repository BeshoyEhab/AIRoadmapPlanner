import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiKeyManager } from '@/lib/api/apiKeyManager';
import { db } from '@/lib/storage/db';
import { exportAllData, importData } from '@/lib/storage/dataExport';

const AppContext = createContext(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [hasValidApiKey, setHasValidApiKey] = useState(false);
  const [roadmaps, setRoadmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize database and load roadmaps
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        await db.init();
        const storedRoadmaps = await db.getAllRoadmaps();
        setRoadmaps(storedRoadmaps);
      } catch (_err) {
        setError('Failed to initialize app: ' + _err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // API key management
  const setApiKey = async (key) => {
    try {
      const isValid = await apiKeyManager.setKey(key);
      setHasValidApiKey(isValid);
      return isValid;
    } catch (_err) {
      setError('Failed to validate API key: ' + _err.message);
      return false;
    }
  };

  const clearApiKey = () => {
    apiKeyManager.clearKey();
    setHasValidApiKey(false);
  };

  // Roadmap management
  const saveRoadmap = async (roadmap) => {
    try {
      const id = await db.saveRoadmap(roadmap);
      const updatedRoadmaps = await db.getAllRoadmaps();
      setRoadmaps(updatedRoadmaps);
      return id;
    } catch (_err) {
      setError('Failed to save roadmap: ' + _err.message);
      throw _err;
    }
  };

  const deleteRoadmap = async (id) => {
    try {
      await db.deleteRoadmap(id);
      const updatedRoadmaps = await db.getAllRoadmaps();
      setRoadmaps(updatedRoadmaps);
    } catch (_err) {
      setError('Failed to delete roadmap: ' + _err.message);
      throw _err;
    }
  };

  // Progress tracking
  const updateProgress = async (roadmapId, progress) => {
    try {
      await db.saveProgress(roadmapId, progress);
      return true;
    } catch (_err) {
      setError('Failed to update progress: ' + _err.message);
      return false;
    }
  };

  const getProgress = async (roadmapId) => {
    try {
      return await db.getProgress(roadmapId);
    } catch (_err) {
      setError('Failed to get progress: ' + _err.message);
      return null;
    }
  };

  // Data export/import
  const exportData = async () => {
    try {
      await exportAllData();
      return true;
    } catch (_err) {
      setError('Failed to export data: ' + _err.message);
      return false;
    }
  };

  const importRoadmapData = async (file) => {
    try {
      const result = await importData(file);
      const updatedRoadmaps = await db.getAllRoadmaps();
      setRoadmaps(updatedRoadmaps);
      return result;
    } catch (_err) {
      setError('Failed to import data: ' + _err.message);
      throw _err;
    }
  };

  const clearError = () => setError(null);

  const value = {
    // State
    hasValidApiKey,
    roadmaps,
    isLoading,
    error,

    // API key management
    setApiKey,
    clearApiKey,

    // Roadmap management
    saveRoadmap,
    deleteRoadmap,

    // Progress tracking
    updateProgress,
    getProgress,

    // Data export/import
    exportData,
    importRoadmapData,

    // Error handling
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
