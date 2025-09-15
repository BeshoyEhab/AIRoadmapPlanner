import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Settings, 
  Zap, 
  Timer, 
  BarChart3, 
  Activity,
  TrendingUp,
  Clock,
  Users,
  Brain,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueueSettings } from '../hooks/useQueueSettings';

const QueueDashboard = ({
  generationQueue,
  currentlyGenerating,
  isQueuePaused,
  pauseQueue,
  resumeQueue,
  clearQueue,
  loading,
  loadingMessage
}) => {
  const [queueStats, setQueueStats] = useState({
    totalItems: 0,
    estimatedTime: 0,
    completedToday: 0,
    avgProcessingTime: '3-5 min'
  });

  const [showSettings, setShowSettings] = useState(false);
  const settingsButtonRef = useRef(null);
  const settingsDropdownRef = useRef(null);
  
  // Use the queue settings hook
  const {
    queueSettings,
    updateSetting,
    resetToDefaults: resetSettings
  } = useQueueSettings();

  useEffect(() => {
    const totalItems = generationQueue.length + (currentlyGenerating ? 1 : 0);
    const estimatedTime = Math.ceil(totalItems * 4); // 4 minutes average per item
    
    setQueueStats({
      totalItems,
      estimatedTime,
      completedToday: parseInt(localStorage.getItem('roadmaps-completed-today') || '0'),
      avgProcessingTime: '3-5 min'
    });
  }, [generationQueue, currentlyGenerating]);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettings && 
          settingsDropdownRef.current && 
          !settingsDropdownRef.current.contains(event.target) &&
          settingsButtonRef.current &&
          !settingsButtonRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  // Enhanced update setting with toast feedback
  const handleUpdateSetting = (key, value) => {
    updateSetting(key, value);
    const displayName = key.replace(/([A-Z])/g, ' $1').toLowerCase();
    if (typeof value === 'boolean') {
      toast.success(`${displayName} ${value ? 'enabled' : 'disabled'}`);
    } else {
      toast.success(`${displayName} set to ${value}`);
    }
  };

  const handleResetToDefaults = () => {
    resetSettings();
    toast.success('Settings reset to defaults');
  };

  const handlePauseResume = () => {
    if (isQueuePaused) {
      resumeQueue();
      toast.success('Queue resumed! 🚀');
    } else {
      pauseQueue();
      toast.success('Queue paused ⏸️');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all queued items? This cannot be undone.')) {
      clearQueue();
      toast.success('Queue cleared! 🧹');
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="relative bg-surface rounded-2xl p-6 shadow-xl border border-default overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/5 to-theme-accent/5 rounded-2xl"></div>
      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-accent rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="text-main" size={20} />
            </div>
            {(loading || currentlyGenerating) && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse border-2 border-surface"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-main">
              Queue Dashboard
            </h3>
            <p className="text-sm text-secondary">
              AI Generation Control Center
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button
            ref={settingsButtonRef}
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-hover ${
              showSettings ? 'bg-hover shadow-md' : ''
            }`}
            title="Queue Settings"
          >
            <Settings size={16} className="text-muted" />
            <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${
              showSettings ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div 
              ref={settingsDropdownRef}
              className="absolute right-0 top-full mt-2 w-72 bg-surface rounded-xl shadow-xl border border-default p-4 z-50 animate-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-main">Queue Settings</h4>
                <div className="w-2 h-2 bg-theme-primary rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-4">
                {/* Auto-retry Setting */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-main">Auto-retry on failure</span>
                    <p className="text-xs text-secondary mt-0.5">Automatically retry failed generations</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateSetting('autoRetryOnFailure', !queueSettings.autoRetryOnFailure)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                      queueSettings.autoRetryOnFailure 
                        ? 'bg-theme-primary hover:bg-theme-accent focus:ring-theme-primary' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 focus:ring-gray-500'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-300 shadow-sm ${
                      queueSettings.autoRetryOnFailure ? 'translate-x-5' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                
                {/* Parallel Processing Setting */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-main">Parallel processing</span>
                    <p className="text-xs text-secondary mt-0.5">Process multiple roadmaps simultaneously</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateSetting('parallelProcessing', !queueSettings.parallelProcessing)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                      queueSettings.parallelProcessing 
                        ? 'bg-theme-primary hover:bg-theme-accent focus:ring-theme-primary' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 focus:ring-gray-500'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-300 shadow-sm ${
                      queueSettings.parallelProcessing ? 'translate-x-5' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                
                {/* Smart Priority Setting */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-main">Smart priority ordering</span>
                    <p className="text-xs text-secondary mt-0.5">Optimize queue order for efficiency</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateSetting('smartPriorityOrdering', !queueSettings.smartPriorityOrdering)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                      queueSettings.smartPriorityOrdering 
                        ? 'bg-theme-primary hover:bg-theme-accent focus:ring-theme-primary' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 focus:ring-gray-500'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-300 shadow-sm ${
                      queueSettings.smartPriorityOrdering ? 'translate-x-5' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                
                {/* Max Concurrent Setting */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-main">Max concurrent generations</span>
                    <p className="text-xs text-secondary mt-0.5">Limit simultaneous AI requests</p>
                  </div>
                  <select 
                    value={queueSettings.maxConcurrentGenerations}
                    onChange={(e) => handleUpdateSetting('maxConcurrentGenerations', parseInt(e.target.value))}
                    className="text-sm bg-surface border border-default rounded-lg px-3 py-1.5 text-main focus:outline-none focus:ring-2 focus:ring-theme-primary transition-all hover:bg-hover"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
              </div>
              
              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-default">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={handleResetToDefaults}
                    className="text-xs text-muted hover:text-secondary transition-colors hover:underline"
                  >
                    Reset to defaults
                  </button>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                    <span>Saved locally</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface rounded-xl p-4 shadow-md border border-default">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-theme-primary" />
            <span className="text-sm font-medium text-secondary">In Queue</span>
          </div>
          <div className="text-2xl font-bold text-main">
            {queueStats.totalItems}
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 shadow-md border border-default">
          <div className="flex items-center gap-2 mb-2">
            <Timer size={16} className="text-success" />
            <span className="text-sm font-medium text-secondary">Est. Time</span>
          </div>
          <div className="text-2xl font-bold text-main">
            {formatTime(queueStats.estimatedTime)}
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 shadow-md border border-default">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-theme-accent" />
            <span className="text-sm font-medium text-secondary">Completed</span>
          </div>
          <div className="text-2xl font-bold text-main">
            {queueStats.completedToday}
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 shadow-md border border-default">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-warning" />
            <span className="text-sm font-medium text-secondary">Avg. Speed</span>
          </div>
          <div className="text-2xl font-bold text-main">
            {queueStats.avgProcessingTime}
          </div>
        </div>
      </div>

      {/* Current Status */}
      {(currentlyGenerating || loading) && (
        <div className="relative bg-gradient-to-r from-theme-primary/10 to-theme-accent/10 dark:from-theme-primary/20 dark:to-theme-accent/20 rounded-xl p-4 mb-6 border border-theme-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-theme-gradient opacity-5 rounded-xl"></div>
          <div className="relative flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-theme-primary rounded-full flex items-center justify-center">
                <Sparkles className="text-white animate-pulse" size={16} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-main">
                AI Generation in Progress
              </h4>
              <p className="text-sm text-secondary truncate">
                {loadingMessage || currentlyGenerating?.objective || 'Creating personalized roadmap...'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-theme-primary">
              <Activity size={12} />
              <span>LIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-surface rounded-xl p-4 shadow-md border border-default">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-main">Queue Controls</h4>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isQueuePaused 
              ? 'bg-warning/20 text-warning border border-warning/30'
              : 'bg-success/20 text-success border border-success/30'
          }`}>
            {isQueuePaused ? 'PAUSED' : 'ACTIVE'}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handlePauseResume}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg ${
              isQueuePaused
                ? 'bg-success hover:bg-success/90 text-white hover:shadow-glow-theme-subtle'
                : 'bg-warning hover:bg-warning/90 text-white hover:shadow-glow-theme-subtle'
            }`}
            disabled={!loading && generationQueue.length === 0}
          >
            {isQueuePaused ? <Play size={16} /> : <Pause size={16} />}
            {isQueuePaused ? 'Resume' : 'Pause'}
          </button>

          <button
            onClick={handleClearAll}
            disabled={generationQueue.length === 0}
            className="px-4 py-3 rounded-lg font-medium text-secondary hover:bg-active transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square size={16} />
          </button>
        </div>
      </div>


      {/* Queue Empty State */}
      {generationQueue.length === 0 && !currentlyGenerating && !loading && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-surface border border-default rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="text-muted" size={24} />
          </div>
          <p className="text-secondary font-medium">Queue is empty</p>
          <p className="text-sm text-muted">Create a new roadmap to get started</p>
        </div>
      )}
    </div>
  );
};

export default QueueDashboard;
