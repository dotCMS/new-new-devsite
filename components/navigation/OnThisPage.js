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
        // Extract any custom ID if present
        const customIdMatch = header.textContent.match(/ {#([^}]+)}$/);
        const customId = customIdMatch ? customIdMatch[1] : null;
        
        // Clean the display text by removing the {#custom-id} part
        const displayText = header.textContent.replace(/ {#[^}]+}$/, '').replace(/#/g, '').trim();
        
        // Use custom ID if present, otherwise generate one from cleaned text
        if (!header.id) {
          header.id = customId || displayText
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }

        return {
          id: header.id,
          title: displayText,
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
    <div className="sticky top-8 mb-12" >
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