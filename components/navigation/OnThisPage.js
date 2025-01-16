"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export const OnThisPage = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const generateTOC = () => {
      const headers = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3');
      
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
    <div className="sticky top-8 w-64">
      <h3 className="mb-4 text-sm font-semibold">On This Page</h3>
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