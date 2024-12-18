import React from 'react';

interface WebPageContentProps {
  title: string;
  body: string;
}

const WebPageContent: React.FC<WebPageContentProps> = ({ title, body }) => {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">{title}</h1>
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: body }} 
      />
    </article>
  );
};

export default WebPageContent;

