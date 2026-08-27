import React from 'react';

const Skeleton = ({
  variant = 'text',
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-brand-border/60 dark:bg-slate-800 animate-pulse';

  const variants = {
    text: 'h-3.5 w-full rounded-md',
    title: 'h-5 w-2/3 rounded-md',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-48 w-full rounded-2xl',
    thumbnail: 'h-24 w-24 rounded-xl',
    button: 'h-10 w-28 rounded-xl',
    input: 'h-11 w-full rounded-xl',
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant] || ''} ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
export { Skeleton };
