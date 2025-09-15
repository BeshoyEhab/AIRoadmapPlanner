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
    <div className="relative bg-gradient-to-br from-surface via-surface to-surface/90 rounded-3xl p-8 shadow-2xl shadow-theme-primary/10 border border-default/50 overflow-hidden hover:shadow-3xl hover:shadow-theme-primary/20 transition-all duration-500 group">
      <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/8 to-theme-accent/8 rounded-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-theme-primary via-theme-accent to-theme-primary opacity-60"></div>
      {/* Header */}
      <div className="relative flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative group/icon">
            <div className="absolute inset-0 bg-gradient-to-br from-theme-primary to-theme-accent rounded-2xl blur-md opacity-60 group-hover/icon:opacity-80 transition-opacity duration-300"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-theme-primary to-theme-accent rounded-2xl flex items-center justify-center shadow-xl shadow-theme-primary/30 transform group-hover/icon:scale-110 transition-all duration-300">
              <Brain className="text-main" size={24} />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            </div>
            {(loading || currentlyGenerating) && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse border-2 border-surface shadow-lg">
                <div className="absolute inset-0 bg-success rounded-full animate-ping opacity-30"></div>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-main mb-1 tracking-tight">
              Queue Dashboard
            </h3>
            <p className="text-secondary font-medium">
              AI Generation Control Center
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button
            ref={settingsButtonRef}
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-hover`}
            title="Queue Settings"
          >
            <Settings size={16} className="text-main" />
            <ChevronDown size={14} className={`text-main transition-transform duration-200 ${
              showSettings ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div 
              ref={settingsDropdownRef}
              className="absolute right-0 top-full mt-2 w-72 bg-gradient-to-br from-theme-primary/90 via-theme-primary/95 to-theme-accent/90 dark:from-theme-primary/80 dark:via-theme-primary/85 dark:to-theme-accent/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-theme-primary/30 border border-theme-primary/20 p-5 z-50 animate-in slide-in-from-top-2 duration-300"
            >
              {/* Overlay for better text contrast */}
              <div className="absolute inset-0 bg-white/10 dark:bg-black/20 rounded-xl"></div>
              
              <div className="relative flex items-center justify-between mb-6">
                <h4 className="font-bold text-main text-lg">Queue Settings</h4>
                <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse"></div>
              </div>
              
              <div className="relative space-y-6">
                {/* Auto-retry Setting */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-main">Auto-retry on failure</span>
                    <p className="text-xs text-secondary mt-1">Automatically retry failed generations</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateSetting('autoRetryOnFailure', !queueSettings.autoRetryOnFailure)}
                    className={`relative w-12 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                      queueSettings.autoRetryOnFailure 
                        ? 'bg-white/30 hover:bg-white/40' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-lg ${
                      queueSettings.autoRetryOnFailure ? 'translate-x-6' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
                
                {/* Parallel Processing Setting */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-main">Parallel processing</span>
                    <p className="text-xs text-secondary mt-1">Process multiple roadmaps simultaneously</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateSetting('parallelProcessing', !queueSettings.parallelProcessing)}
                    className={`relative w-12 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                      queueSettings.parallelProcessing 
                        ? 'bg-white/30 hover:bg-white/40' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-lg ${
                      queueSettings.parallelProcessing ? 'translate-x-6' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
                
                {/* Smart Priority Setting */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-main">Smart priority ordering</span>
                    <p className="text-xs text-secondary mt-1">Optimize queue order for efficiency</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateSetting('smartPriorityOrdering', !queueSettings.smartPriorityOrdering)}
                    className={`relative w-12 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                      queueSettings.smartPriorityOrdering 
                        ? 'bg-white/30 hover:bg-white/40' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-lg ${
                      queueSettings.smartPriorityOrdering ? 'translate-x-6' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
                
                {/* Max Concurrent Setting */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-main">Max concurrent generations</span>
                    <p className="text-xs text-secondary mt-1">Limit simultaneous AI requests</p>
                  </div>
                  <select 
                    value={queueSettings.maxConcurrentGenerations}
                    onChange={(e) => handleUpdateSetting('maxConcurrentGenerations', parseInt(e.target.value))}
                    className="text-sm bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 text-main focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all hover:bg-white/25"
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
              <div className="relative mt-6 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={handleResetToDefaults}
                    className="text-xs text-secondary hover:text-main transition-colors hover:underline font-medium"
                  >
                    Reset to defaults
                  </button>
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                    <span className="font-medium">Saved locally</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="group relative bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 shadow-lg border border-default/50 hover:border-theme-primary/50 hover:shadow-2xl hover:shadow-theme-primary/20 transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/5 to-theme-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-theme-primary/20 to-theme-primary/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users size={18} className="text-theme-primary" />
              </div>
              <span className="text-sm font-semibold text-secondary group-hover:text-theme-primary transition-colors duration-300">In Queue</span>
            </div>
            <div className="text-3xl font-bold text-main group-hover:text-theme-primary transition-colors duration-300">
              {queueStats.totalItems}
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 shadow-lg border border-default/50 hover:border-success/50 hover:shadow-2xl hover:shadow-success/20 transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-success/20 to-success/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Timer size={18} className="text-success" />
              </div>
              <span className="text-sm font-semibold text-secondary group-hover:text-success transition-colors duration-300">Est. Time</span>
            </div>
            <div className="text-3xl font-bold text-main group-hover:text-success transition-colors duration-300">
              {formatTime(queueStats.estimatedTime)}
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 shadow-lg border border-default/50 hover:border-theme-accent/50 hover:shadow-2xl hover:shadow-theme-accent/20 transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-theme-accent/5 to-theme-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-theme-accent/20 to-theme-accent/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={18} className="text-theme-accent" />
              </div>
              <span className="text-sm font-semibold text-secondary group-hover:text-theme-accent transition-colors duration-300">Completed</span>
            </div>
            <div className="text-3xl font-bold text-main group-hover:text-theme-accent transition-colors duration-300">
              {queueStats.completedToday}
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 shadow-lg border border-default/50 hover:border-warning/50 hover:shadow-2xl hover:shadow-warning/20 transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-warning/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-warning/20 to-warning/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 size={18} className="text-warning" />
              </div>
              <span className="text-sm font-semibold text-secondary group-hover:text-warning transition-colors duration-300">Avg. Speed</span>
            </div>
            <div className="text-3xl font-bold text-main group-hover:text-warning transition-colors duration-300">
              {queueStats.avgProcessingTime}
            </div>
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
                <Sparkles className="text-main animate-pulse" size={16} />
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
            className={`flex-1 bg-gradient-theme text-main inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg ${
              isQueuePaused
                ? 'bg-success hover:bg-success/90 text-main hover:shadow-glow-theme-subtle'
                : 'bg-warning hover:bg-warning/90 text-main hover:shadow-glow-theme-subtle'
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
