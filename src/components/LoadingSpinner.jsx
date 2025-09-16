import React from 'react';
import { Loader, Brain, Sparkles, Zap, Target, Rocket } from 'lucide-react';

const LoadingSpinner = ({ 
  message = "Loading...", 
  variant = "default", 
  size = "md",
  showProgress = false,
  progress = 0,
  subMessage = null
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };

  const getVariantIcon = () => {
    switch (variant) {
      case "brain":
        return <Brain className={`${sizeClasses[size]} text-theme-primary animate-pulse`} />;
      case "sparkles":
        return <Sparkles className={`${sizeClasses[size]} text-yellow-400 animate-ping`} />;
      case "zap":
        return <Zap className={`${sizeClasses[size]} text-blue-500 animate-bounce`} />;
      case "target":
        return <Target className={`${sizeClasses[size]} text-green-500 animate-spin`} />;
      case "rocket":
        return <Rocket className={`${sizeClasses[size]} text-purple-500 animate-pulse`} />;
      default:
        return <Loader className={`${sizeClasses[size]} text-theme-primary animate-spin`} />;
    }
  };

  const getVariantMessage = () => {
    switch (variant) {
      case "brain":
        return message || "AI is thinking...";
      case "sparkles":
        return message || "Generating magic...";
      case "zap":
        return message || "Processing at lightning speed...";
      case "target":
        return message || "Aiming for perfection...";
      case "rocket":
        return message || "Launching your roadmap...";
      default:
        return message;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4" role="status" aria-live="polite">
      {/* Main spinner */}
      <div className="relative">
        {getVariantIcon()}
        
        {/* Optional progress ring */}
        {showProgress && (
          <div className="absolute inset-0">
            <svg className={`${sizeClasses[size]} transform -rotate-90`} viewBox="0 0 36 36">
              <path
                className="text-gray-300"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-theme-primary"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Main message */}
      <div className="text-center">
        <p className="text-sm font-medium text-main">
          {getVariantMessage()}
        </p>
        
        {/* Sub message */}
        {subMessage && (
          <p className="text-xs text-muted-foreground mt-1">
            {subMessage}
          </p>
        )}
        
        {/* Progress percentage */}
        {showProgress && (
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(progress)}% complete
          </p>
        )}
      </div>

      {/* Loading dots animation */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-theme-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-theme-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-theme-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

export default LoadingSpinner;