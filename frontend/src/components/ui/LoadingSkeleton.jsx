import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 flex flex-col gap-3 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-full mt-2" />
  </div>
);

export const ListSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 animate-pulse">
        <div className="flex items-start space-x-3">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="flex items-center space-x-2">
              <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-pulse">
    <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 last:border-0">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className={`h-3 bg-gray-200 dark:bg-gray-700 rounded ${j === 0 ? 'w-1/3' : 'flex-1'}`} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const PageSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64" />
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      ))}
    </div>
    <TableSkeleton rows={5} cols={4} />
  </div>
);

export default CardSkeleton;
