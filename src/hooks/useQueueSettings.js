import { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  autoRetryOnFailure: true,
  parallelProcessing: false,
  smartPriorityOrdering: true,
  maxConcurrentGenerations: 2
};

/**
 * Custom hook for managing queue settings
 * Provides access to queue settings across the application
 * Settings are persisted in localStorage and synchronized across components
 */
export const useQueueSettings = () => {
  const [queueSettings, setQueueSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('queue-settings');
      return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading queue settings:', error);
      return DEFAULT_SETTINGS;
    }
  });

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('queue-settings', JSON.stringify(queueSettings));
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('queueSettingsChanged', { 
        detail: queueSettings 
      }));
    } catch (error) {
      console.error('Error saving queue settings:', error);
    }
  }, [queueSettings]);

  // Listen for external settings changes (from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'queue-settings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          setQueueSettings(newSettings);
        } catch (error) {
          console.error('Error parsing queue settings from storage:', error);
        }
      }
    };

    const handleCustomEvent = (e) => {
      setQueueSettings(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('queueSettingsChanged', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('queueSettingsChanged', handleCustomEvent);
    };
  }, []);

  const updateSetting = (key, value) => {
    setQueueSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    setQueueSettings(DEFAULT_SETTINGS);
  };

  const getSetting = (key) => {
    return queueSettings[key];
  };

  // Utility functions based on settings
  const shouldRetryOnFailure = () => queueSettings.autoRetryOnFailure;
  const isParallelProcessingEnabled = () => queueSettings.parallelProcessing;
  const isSmartPriorityOrderingEnabled = () => queueSettings.smartPriorityOrdering;
  const getMaxConcurrentGenerations = () => queueSettings.maxConcurrentGenerations;

  return {
    queueSettings,
    updateSetting,
    resetToDefaults,
    getSetting,
    // Convenience getters
    shouldRetryOnFailure,
    isParallelProcessingEnabled,
    isSmartPriorityOrderingEnabled,
    getMaxConcurrentGenerations,
  };
};

export default useQueueSettings;
