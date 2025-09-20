import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'bg-gradient-theme text-white hover:shadow-glow-theme border-0',
        glass: 'glass text-foreground hover:bg-accent/50',
        glow: 'bg-primary text-primary-foreground hover:shadow-glow-theme hover:-translate-y-0.5 transition-all duration-200',
        success: 'bg-success text-white hover:bg-success/90 hover:shadow-glow-success',
        warning: 'bg-warning text-white hover:bg-warning/90 hover:shadow-glow-warning',
        error: 'bg-error text-white hover:bg-error/90 hover:shadow-glow-error'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12'
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const EnhancedButton = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton, buttonVariants };

