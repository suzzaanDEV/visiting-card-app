import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dropdown = ({
  trigger,
  items = [],
  align = 'right',
  className = '',
  width = 'w-48',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignments = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute ${alignments[align] || alignments.right} mt-2 ${width}
              rounded-xl border border-brand-border/60 dark:border-slate-800 bg-brand-surface dark:bg-slate-900 shadow-xl z-30 overflow-hidden
            `}
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              {items.map((item, index) => {
                if (item.divider) {
                  return <div key={index} className="border-t border-brand-border/40 dark:border-slate-800/80 my-1" />;
                }

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-150
                      ${item.danger 
                        ? 'text-brand-danger hover:bg-red-50 dark:hover:bg-red-950/20' 
                        : 'text-brand-text hover:bg-brand-background dark:hover:bg-slate-850'
                      }
                    `}
                    role="menuitem"
                  >
                    {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
export { Dropdown };
