import React from 'react';
import CardPreview from './Cards/CardPreview';

const SAMPLE_DATA = {
      fullName: 'Suzan Ghimire',
  jobTitle: 'Software Engineer',
  company: 'Acme Corp',
      email: 'ram.thapa@cardly.com',
  phone: '+(977) 9xxxxxxxxx',
  website: 'www.example.com',
        address: '123 Thamel Marg, Kathmandu',
  bio: 'Short bio goes here.'
};

const TemplateSelector = ({ templates, selectedTemplateId, onTemplateSelect }) => {
  if (!templates || templates.length === 0) {
    return <div className="text-gray-500 text-center">No templates available.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {templates.map((template) => (
        <div
          key={template.id}
          className={`rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer hover:shadow-lg transform hover:scale-105 ${
            selectedTemplateId === template.id ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl scale-105' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
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
            <div className="font-bold text-lg mb-1">{template.name}</div>
            <div className="text-gray-500 text-sm mb-1">{template.category}</div>
            <div className="text-gray-400 text-xs">{template.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateSelector; 