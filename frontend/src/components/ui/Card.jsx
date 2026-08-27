import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  elevation = 'md',
  hoverLift = false,
  className = '',
  onClick,
  ...props
}) => {
  const elevations = {
    none: 'border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-800/40',
    flat: 'border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-900',
    sm: 'shadow-sm border border-brand-border/60 dark:border-slate-800/80 bg-brand-surface dark:bg-slate-800/60',
    md: 'shadow-md border border-brand-border/40 dark:border-slate-800/40 bg-brand-surface dark:bg-slate-800',
    lg: 'shadow-lg border border-brand-border/20 dark:border-slate-800/20 bg-brand-surface dark:bg-slate-800/90',
  };

  const Component = hoverLift ? motion.div : 'div';
  const motionProps = hoverLift
    ? {
        whileHover: { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' },
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }
    : {};

  return (
    <Component
      onClick={onClick}
      className={`
        rounded-2xl overflow-hidden
        ${elevations[elevation] || elevations.md}
        ${onClick ? 'cursor-pointer select-none' : ''}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
export { Card };
