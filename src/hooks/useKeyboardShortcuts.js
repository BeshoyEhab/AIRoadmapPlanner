import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook for handling keyboard shortcuts
 * @param {Object} shortcuts - Object containing shortcut configurations
 * @param {Array} dependencies - Dependencies array for the effect
 */
export const useKeyboardShortcuts = (shortcuts = {}, dependencies = []) => {
  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts if user is typing in an input
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.contentEditable === 'true' ||
      event.target.closest('[contenteditable="true"]')
    ) {
      return;
    }

    // Check for modifier keys
    const hasCtrl = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd
    const hasShift = event.shiftKey;
    const hasAlt = event.altKey;

    // Create shortcut key
    const key = event.key.toLowerCase();
    const shortcutKey = [
      hasCtrl ? 'ctrl' : '',
      hasAlt ? 'alt' : '',
      hasShift ? 'shift' : '',
      key
    ].filter(Boolean).join('+');

    // Find matching shortcut
    const shortcut = shortcuts[shortcutKey];
    
    if (shortcut) {
      event.preventDefault();
      
      try {
        if (typeof shortcut === 'function') {
          shortcut(event);
        } else if (shortcut.action) {
          shortcut.action(event);
        }
        
        // Show toast notification if configured
        if (shortcut.showToast !== false && shortcut.description) {
          toast.success(`Shortcut: ${shortcut.description}`);
        }
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error);
        toast.error('Shortcut execution failed');
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, ...dependencies]);
};

/**
 * Predefined shortcut configurations for common actions
 */
export const commonShortcuts = {
  // Navigation shortcuts
  'ctrl+n': {
    action: (setActiveTab) => setActiveTab('create'),
    description: 'New Roadmap',
    showToast: true
  },
  'ctrl+1': {
    action: (setActiveTab) => setActiveTab('create'),
    description: 'Go to Create Tab',
    showToast: true
  },
  'ctrl+2': {
    action: (setActiveTab) => setActiveTab('view'),
    description: 'Go to View Tab',
    showToast: true
  },
  'ctrl+3': {
    action: (setActiveTab) => setActiveTab('saved'),
    description: 'Go to Saved Tab',
    showToast: true
  },
  'ctrl+4': {
    action: (setActiveTab) => setActiveTab('ongoing'),
    description: 'Go to Ongoing Tab',
    showToast: true
  },

  // Action shortcuts
  'ctrl+s': {
    action: (saveFunction) => saveFunction(),
    description: 'Save Roadmap',
    showToast: true
  },
  'ctrl+g': {
    action: (generateFunction) => generateFunction(),
    description: 'Generate Roadmap',
    showToast: true
  },
  'ctrl+e': {
    action: (exportFunction) => exportFunction(),
    description: 'Export Roadmap',
    showToast: true
  },
  'ctrl+r': {
    action: (refreshFunction) => refreshFunction(),
    description: 'Refresh Data',
    showToast: true
  },

  // Utility shortcuts
  'ctrl+/': {
    action: () => {
      // Show help modal or toggle shortcuts display
      toast.info('Keyboard shortcuts are active! Press Ctrl+/ to toggle help.');
    },
    description: 'Show Help',
    showToast: false
  },
  'escape': {
    action: (closeFunction) => closeFunction && closeFunction(),
    description: 'Close Modal/Dialog',
    showToast: false
  },

  // Theme toggle
  'ctrl+shift+t': {
    action: (toggleTheme) => toggleTheme(),
    description: 'Toggle Theme',
    showToast: true
  },

  // Fullscreen toggle
  'f11': {
    action: (toggleFullscreen) => toggleFullscreen(),
    description: 'Toggle Fullscreen',
    showToast: true
  }
};

/**
 * Hook for app-wide keyboard shortcuts
 */
export const useAppKeyboardShortcuts = ({
  setActiveTab,
  saveCurrentRoadmap,
  generateRoadmap,
  exportToPDF,
  toggleTheme,
  toggleFullScreen,
  closeModals
}) => {
  const shortcuts = {
    'ctrl+n': () => setActiveTab('create'),
    'ctrl+1': () => setActiveTab('create'),
    'ctrl+2': () => setActiveTab('view'),
    'ctrl+3': () => setActiveTab('saved'),
    'ctrl+4': () => setActiveTab('ongoing'),
    'ctrl+s': () => saveCurrentRoadmap(),
    'ctrl+g': () => generateRoadmap(),
    'ctrl+e': () => exportToPDF(),
    'ctrl+shift+t': () => toggleTheme(),
    'f11': () => toggleFullScreen(),
    'escape': () => closeModals && closeModals(),
    'ctrl+/': () => {
      toast.info(`
Keyboard Shortcuts:
• Ctrl+N: New Roadmap
• Ctrl+1-4: Switch Tabs
• Ctrl+S: Save
• Ctrl+G: Generate
• Ctrl+E: Export
• Ctrl+Shift+T: Toggle Theme
• F11: Fullscreen
• Esc: Close Modals
      `);
    }
  };

  useKeyboardShortcuts(shortcuts, [
    setActiveTab,
    saveCurrentRoadmap,
    generateRoadmap,
    exportToPDF,
    toggleTheme,
    toggleFullScreen,
    closeModals
  ]);
};

export default useKeyboardShortcuts;
