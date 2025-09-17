import React from 'react';
import { Brain, Sparkles, Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  message = "Loading...", 
  variant = "default",
  size = "md",
  showIcon = true 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const renderSpinner = () => {
    switch (variant) {
      case "brain":
        return (
          <div className="relative">
            <Brain 
              className={`${sizeClasses[size]} text-primary animate-pulse`}
              aria-hidden="true"
            />
            <Sparkles 
              className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400 animate-ping"
              aria-hidden="true"
            />
          </div>
        );
      case "dots":
        return (
          <div className="flex space-x-1" aria-hidden="true">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        );
      case "pulse":
        return (
          <div 
            className={`${sizeClasses[size]} bg-primary rounded-full animate-pulse`}
            aria-hidden="true"
          />
        );
      default:
        return (
          <Loader2 
            className={`${sizeClasses[size]} text-primary animate-spin`}
            aria-hidden="true"
          />
        );
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center p-8 space-y-4"
      role="status"
      aria-live="polite"
    >
      {showIcon && (
        <div className="flex items-center justify-center">
          {renderSpinner()}
        </div>
      )}
      
      {message && (
        <p className={`${textSizes[size]} text-muted-foreground text-center font-medium`}>
          {message}
        </p>
      )}
      
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

// Specialized loading components
export const BrainLoadingSpinner = ({ message = "AI is thinking...", size = "md" }) => (
  <LoadingSpinner message={message} variant="brain" size={size} />
);

export const DotLoadingSpinner = ({ message = "Processing...", size = "md" }) => (
  <LoadingSpinner message={message} variant="dots" size={size} />
);

export const PulseLoadingSpinner = ({ message = "Loading...", size = "md" }) => (
  <LoadingSpinner message={message} variant="pulse" size={size} />
);

// Loading fallback for Suspense
export const SuspenseFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <LoadingSpinner message="Loading component..." size="md" />
  </div>
);

export default LoadingSpinner;
