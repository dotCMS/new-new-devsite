"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export const OnThisPage = ({selectors, showOnThisPage = true}) => {
  const [items, setItems] = useState([]);
  const mySelectors = selectors || 'main h2, main h3, main h4, main h1, main h2, main h3, main h4, .dot-block-editor h1, .dot-block-editor h2, .dot-block-editor h3, .dot-block-editor h4';
  
  console.log("mySelectors", mySelectors)
  
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
    const markdownContent = document.querySelector('.markdown-content');
    
    if (markdownContent) {
      observer.observe(markdownContent, {
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-8">
        {showOnThisPage && (
      <h3 className="mb-4 text-sm font-semibold">On This Page</h3>
        )}
      <nav className="text-sm">
        <ul className="space-y-2 text-muted-foreground">
          {items.map((item) => (
            <li 
              key={item.id}
              className={`
                ${item.level === 1 ? 'ml-0' : ''}
                ${item.level === 2 ? 'ml-3' : ''}
                ${item.level === 3 ? 'ml-6' : ''}
              `}
            >
              <Link 
                href={`#${item.id}`} 
                className="hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default OnThisPage; 