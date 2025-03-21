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
      const toc = Array.from(headers)
        .filter(header => {
          // Only include visible headers that have IDs (which should be all of them due to rehype-slug)
          return header.offsetParent !== null && header.id;
        })
        .map((header) => ({
          id: header.id,
          title: header.textContent.replace(/#/g, '').trim(),
          level: parseInt(header.tagName[1])
        }));

      setItems(toc);
    };

    // Run once after a short delay to ensure content is rendered
    const timer = setTimeout(generateTOC, 0);

    // Only re-run on significant DOM changes
    const observer = new MutationObserver((mutations) => {
      const hasSignificantChanges = mutations.some(mutation => 
        mutation.type === 'childList' && 
        Array.from(mutation.addedNodes).some(node => 
          node.nodeType === 1 && 
          node.matches && 
          node.matches(mySelectors)
        )
      );

      if (hasSignificantChanges) {
        generateTOC();
      }
    });

    const markdownContent = document.querySelector('main');
    if (markdownContent) {
      observer.observe(markdownContent, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
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