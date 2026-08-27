import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500 mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}
