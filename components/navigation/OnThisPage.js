"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { smoothScroll } from '@/util/smoothScroll';

export const OnThisPage = ({
  selectors = 'main h1, main h2, main h3, main h4, main h2, main h3, main h4, .dot-block-editor h1, .dot-block-editor h2, .dot-block-editor h3, .dot-block-editor h4', 
  showOnThisPage = true,
  titleOverride = undefined
}) => {
  const [items, setItems] = useState([]);
  const [mySelectors, setMySelectors] = useState(selectors);


  useEffect(() => {
    const generateTOC = () => {
      const headers = document.querySelectorAll(mySelectors);
      const toc = Array.from(headers).map((header) => {
        // Generate an ID if one doesn't exist
        if (!header.id) {
          // Remove any existing hash symbols from the text content
          const cleanText = header.textContent.replace(/#/g, '').trim();
          header.id = cleanText
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }

        return {
          id: header.id,
          // Remove any hash symbols from the display text
          title: header.textContent.replace(/#/g, '').trim(),
          level: parseInt(header.tagName[1]),
        };
      });

      setItems(toc);
    };

    // Initial generation
    generateTOC();

    // Re-generate if content changes
    const observer = new MutationObserver(generateTOC);
    const markdownContent = document.querySelector(mySelectors);
    
    if (markdownContent) {
      observer.observe(markdownContent, {
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  }, [mySelectors]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-8 pb-12 
                overflow-y-auto p-4 px-2
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
                [&::-webkit-scrollbar-thumb]:rounded-full
                hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20
                h-[calc(100vh-4rem)]" >
      {showOnThisPage && (
        <h3 className="mb-4 text-sm font-semibold">On This Page</h3>
      )}
      <nav className="text-sm">
        <ul className="space-y-2 text-muted-foreground">
          {items.map((item) => (
            <li 
              key={item.id}
              className={`
                ${item.level === 1 ? 'ml-0 font-bold' : ''}
                ${item.level === 2 ? 'ml-2 font-semibold' : ''}
                ${(item.level === 3 || item.level === 4) ? 'ml-4 font-normal text-muted-foreground' : ''}
              `}
            >
              <Link 
                prefetch={false}
                href={`#${item.id}`} 
                className="hover:text-foreground transition-colors block"
                onClick={smoothScroll}
              >
                {item.level === 1 ? (titleOverride || item.title) : item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default OnThisPage; 