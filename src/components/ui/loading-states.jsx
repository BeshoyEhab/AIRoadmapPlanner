import React from 'react';
import { Loader2, Brain, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced Loading Spinner
export const EnhancedLoadingSpinner = ({ size = 'default', className, ...props }) => {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <Loader2 
      className={cn('animate-spin text-primary', sizes[size], className)} 
      {...props} 
    />
  );
};

// Skeleton Loading Component
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
};

// Card Skeleton
export const CardSkeleton = ({ className }) => {
  return (
    <div className={cn('space-y-3 p-6 border rounded-lg', className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
};

// Enhanced Loading Fallback with Animation
export const EnhancedLoadingFallback = ({ 
  message = "Loading...", 
  icon: _Icon = Brain,
  showSparkles = true,
  className 
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 min-h-[200px] space-y-4',
      className
    )} 
    role="status" 
    aria-live="polite"
    >
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary">
          <Brain className="absolute inset-2 w-8 h-8 text-primary animate-pulse" />
        </div>
        {showSparkles && (
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-ping" />
        )}
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground font-medium">{message}</p>
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({ value = 0, max = 100, className, showLabel = true }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={cn('w-full space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-theme transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Shimmer Effect Component
export const ShimmerEffect = ({ className, children }) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {children}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
};

// Loading Card Grid
export const LoadingCardGrid = ({ count = 6, className }) => {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

// Pulsing Dot Indicator
export const PulsingDot = ({ className, color = 'bg-primary' }) => {
  return (
    <div className={cn('relative', className)}>
      <div className={cn('w-2 h-2 rounded-full', color)} />
      <div className={cn('absolute inset-0 w-2 h-2 rounded-full animate-ping', color, 'opacity-75')} />
    </div>
  );
};

// Loading States for Different Contexts
export const LoadingStates = {
  // For AI generation
  AIGeneration: () => (
    <EnhancedLoadingFallback 
      message="AI is generating your roadmap..." 
      icon={Brain}
      showSparkles={true}
    />
  ),
  
  // For saving operations
  Saving: () => (
    <EnhancedLoadingFallback 
      message="Saving your progress..." 
      icon={Zap}
      showSparkles={false}
    />
  ),
  
  // For loading data
  LoadingData: () => (
    <EnhancedLoadingFallback 
      message="Loading your roadmaps..." 
      icon={Brain}
      showSparkles={false}
    />
  ),
  
  // Generic loading
  Generic: (message) => (
    <EnhancedLoadingFallback 
      message={message || "Loading..."} 
      showSparkles={false}
    />
  )
};

