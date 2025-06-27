import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit';
  className?: string;
  fullWidth?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  fullWidth = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: ButtonProps) {
  // Base classes with responsive design
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg 
    transition-all duration-200 focus:ring-2 focus:ring-offset-2 
    touch-target relative overflow-hidden focus:outline-none
    ${fullWidth ? 'w-full' : ''}
  `;
  
  // Variant styles
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 active:bg-primary-700 disabled:bg-primary-300',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 active:bg-gray-300 disabled:bg-gray-50',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 active:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400',
  };

  // Responsive size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[2.25rem] gap-1.5',
    md: 'px-4 py-2.5 text-sm min-h-[2.5rem] gap-2 sm:px-4 sm:py-2',
    lg: 'px-6 py-3 text-base min-h-[3rem] gap-2.5 sm:px-6 sm:py-3',
  };

  const isDisabled = disabled || loading;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled && onClick) {
      onClick(event);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === 'Enter' || event.key === ' ') && !isDisabled && onClick) {
      event.preventDefault();
      // Create a synthetic mouse event for keyboard interactions
      const syntheticEvent = {
        ...event,
        type: 'click',
        button: 0,
        buttons: 1,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        screenX: 0,
        screenY: 0,
        stopPropagation: event.stopPropagation.bind(event),
        preventDefault: event.preventDefault.bind(event),
      } as React.MouseEvent<HTMLButtonElement>;
      onClick(syntheticEvent);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={isDisabled}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'} 
        ${className}
      `}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" 
               aria-hidden="true"></div>
          <span className="sr-only">Loading...</span>
        </div>
      )}
      
      {/* Content wrapper - hidden when loading */}
      <div className={`flex items-center ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {Icon && iconPosition === 'left' && (
          <Icon className="h-4 w-4 flex-shrink-0\" aria-hidden="true" />
        )}
        
        <span className="truncate">{children}</span>
        
        {Icon && iconPosition === 'right' && (
          <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        )}
      </div>
    </button>
  );
}