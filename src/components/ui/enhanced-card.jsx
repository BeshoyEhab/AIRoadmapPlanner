import React from 'react';
import { cn } from '@/lib/utils';

const EnhancedCard = React.forwardRef(({ className, children, variant = 'default', hover = true, ...props }, ref) => {
  const variants = {
    default: 'bg-card text-card-foreground border border-border',
    elevated: 'bg-card text-card-foreground border border-border shadow-lg',
    glass: 'glass-card text-card-foreground',
    gradient: 'bg-gradient-theme text-white border-0',
    outline: 'border-2 border-primary/20 bg-transparent text-foreground hover:border-primary/40'
  };

  const hoverEffects = hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : '';

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg p-6',
        variants[variant],
        hoverEffects,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

EnhancedCard.displayName = 'EnhancedCard';

const EnhancedCardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));

EnhancedCardHeader.displayName = 'EnhancedCardHeader';

const EnhancedCardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));

EnhancedCardTitle.displayName = 'EnhancedCardTitle';

const EnhancedCardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

EnhancedCardDescription.displayName = 'EnhancedCardDescription';

const EnhancedCardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));

EnhancedCardContent.displayName = 'EnhancedCardContent';

const EnhancedCardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));

EnhancedCardFooter.displayName = 'EnhancedCardFooter';

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  EnhancedCardFooter,
};

