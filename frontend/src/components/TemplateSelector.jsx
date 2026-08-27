import React from 'react';
import CardPreview from './Cards/CardPreview';

const SAMPLE_DATA = {
  fullName: 'Suzan Ghimire',
  jobTitle: 'Software Engineer',
  company: 'Leapfrog Technology',
  email: 'suzan.ghimire@leapfrog.com.np',
  phone: '+977-9801234567',
  website: 'www.leapfrog.com.np',
  address: '123 Thamel Marg, Kathmandu, Nepal',
  bio: 'Full stack developer building modern web solutions.'
};

const TemplateSelector = ({ templates, selectedTemplateId, onTemplateSelect }) => {
  if (!templates || templates.length === 0) {
    return <div className="text-gray-500 dark:text-slate-400 text-center">No templates available.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {templates.map((template) => (
        <div
          key={template.id}
          className={`rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer hover:shadow-lg transform hover:scale-105 bg-white dark:bg-slate-800 ${
            selectedTemplateId === template.id ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/20 shadow-xl scale-105' : 'border-gray-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md'
          }`}
          onClick={() => onTemplateSelect(template)}
        >
          <div className="mb-4">
            <CardPreview 
              card={SAMPLE_DATA} 
              template={template} 
              className="w-full h-48" 
              showActions={false}
            />
          </div>
          <div className="text-center">
            <div className="font-bold text-lg mb-1 text-gray-900 dark:text-slate-200">{template.name}</div>
            <div className="text-gray-500 dark:text-slate-400 text-sm mb-1">{template.category}</div>
            <div className="text-gray-400 dark:text-slate-500 text-xs">{template.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateSelector; 