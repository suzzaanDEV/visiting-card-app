import React, { useId } from 'react';

const Input = ({
  label,
  error,
  icon: Icon = null,
  rightElement = null,
  type = 'text',
  className = '',
  id: customId,
  required = false,
  ...props
}) => {
  const generatedId = useId();
  const id = customId || generatedId;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-brand-text dark:text-brand-text/90 tracking-wide uppercase"
        >
          {label}
          {required && <span className="text-brand-danger ml-1">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-textMuted">
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        <input
          id={id}
          type={type}
          required={required}
          className={`
            w-full px-4 py-3 bg-brand-surface dark:bg-slate-800 text-brand-text border rounded-xl transition-all duration-200 outline-none
            placeholder-brand-textMuted/65 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
            ${Icon ? 'pl-11' : ''}
            ${rightElement ? 'pr-12' : ''}
            ${error 
              ? 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger/20' 
              : 'border-brand-border dark:border-slate-700'
            }
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
            {rightElement}
          </div>
        )}
      </div>
      
      {error && (
        <span
          id={`${id}-error`}
          className="text-xs font-medium text-brand-danger animate-pulse"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
export { Input };
