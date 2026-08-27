import React from 'react';

const BrandLoader = ({ full = false, label = 'Loading Cardly…' }) => (
  <div
    className={`flex flex-col items-center justify-center gap-5 select-none ${full ? 'min-h-screen bg-brand-background dark:bg-slate-950' : 'h-64'}`}
    role="status"
    aria-live="polite"
  >
    <div className="relative h-14 w-14">
      <span className="absolute inset-0 rounded-full border-4 border-emerald-200/70 border-t-emerald-600 border-r-teal-500 animate-spin" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="h-3 w-3 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600" />
      </span>
    </div>
    <div className="text-center">
      <p className="text-sm font-bold tracking-tight text-brand-text dark:text-white">
        Cardly
      </p>
      <p className="text-xs text-brand-textMuted dark:text-slate-400 animate-pulse mt-1">
        {label}
      </p>
    </div>
  </div>
);

export default BrandLoader;