import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, onChange, ...props }, ref) => {
    // Always render as controlled if value prop is provided (even if undefined)
    // This prevents the warning about switching from uncontrolled to controlled
    const isControlled = 'value' in props;
    
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        value={isControlled ? (value ?? '') : undefined}
        onChange={onChange}
        {...(isControlled ? {} : { defaultValue: props.defaultValue })}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };