import React from 'react';
import { isJSON } from '@/util/utils';
import { DotBlockEditor } from '@/components/shared/dotBlockEditor';
interface WebPageContentProps {
  title: string;
  body: string;
}

const WebPageContent: React.FC<WebPageContentProps> = ({ title, body }) => {
  return (
    <article className="w-full">
      <h1 className="text-3xl font-bold mb-6 text-primary">{title}</h1>
      <div className="prose  max-w-none">
      {isJSON(body) ? (
        <DotBlockEditor  
          blocks={typeof body === 'string' ? JSON.parse(body) : body}
          customRenderers={{}}
        />
      ) : (
        <>
        <div dangerouslySetInnerHTML={{ __html: body }} />
        </>
      )}
      </div>
    </article>
  );
};

export default WebPageContent;

