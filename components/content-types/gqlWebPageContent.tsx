import React from 'react';

interface GqlWebPageContentProps {
  body: string;
}

const GqlWebPageContent: React.FC<GqlWebPageContentProps> = ({ body }) => {
  return (
    <div 
      className="prose lg:prose-xl prose-a:text-blue-600 prose-h3:mb-0 prose-h3:text-purple-700 prose-h2:text-yellow-800 prose-h2:text-4xl prose-h2:tracking-tight prose-h3:tracking-tighter"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

export default GqlWebPageContent;

