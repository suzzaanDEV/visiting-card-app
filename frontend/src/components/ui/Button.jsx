import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon = null,
  className = '',
  ...props
}) => {
  // Styles based on states and variant
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-brand-background select-none cursor-pointer';
  
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primaryHover focus:ring-brand-primary border border-transparent shadow-md hover:shadow-lg',
    secondary: 'bg-brand-secondary text-white hover:bg-brand-secondaryHover focus:ring-brand-secondary border border-transparent shadow-md hover:shadow-lg',
    outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white focus:ring-brand-primary bg-transparent',
    ghost: 'text-brand-textMuted hover:bg-brand-border dark:hover:bg-slate-800 focus:ring-brand-primary bg-transparent',
    danger: 'bg-brand-danger text-white hover:bg-red-600 focus:ring-brand-danger border border-transparent shadow-md hover:shadow-lg',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      type={type}
      onClick={isDisabled ? null : onClick}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${isDisabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none hover:shadow-none' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!isLoading && Icon && <Icon className="mr-2 h-4 w-4 flex-shrink-0" />}
      
      <span>{children}</span>
    </motion.button>
  );
};

export default Button;
export { Button };
