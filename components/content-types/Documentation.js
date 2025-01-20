"use client"

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import NavTree from '@/components/navigation/NavTree';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import OnThisPage from '@/components/navigation/OnThisPage';
import MarkdownContent from '@/components/MarkdownContent';

const SCROLL_STORAGE_KEY = 'docs-nav-scroll';

function cleanMarkdown(markdownString, identifierString) {
  return markdownString
    .replaceAll("${docImage}","/dA/" + identifierString + "/diagram")
    .replaceAll('src="/contentAsset','src="https://www.dotcms.com/contentAsset')
    .replaceAll("(/dA/", "(https://www.dotcms.com/dA/")
    .replaceAll("( /dA/", "(https://www.dotcms.com/dA/")
    .replaceAll('src="/dA/', 'src="https://www.dotcms.com/dA/')
    .replaceAll("(/contentAsset", "(https://www.dotcms.com/contentAsset")
    .replaceAll("( /contentAsset", "(https://www.dotcms.com/contentAsset")
    .replaceAll(/\{#[A-Za-z0-1]*\}/g, "")
    .replaceAll("<br>", "<br/>")
    .replaceAll("()", "")
    .replaceAll("</br>", "<br/>");
}

const Documentation = ({ contentlet, sideNav }) => {
  const currentPath = usePathname();
  const navRef = useRef(null);

  // Save scroll position before unload
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Restore scroll position on mount
    const savedScroll = localStorage.getItem(SCROLL_STORAGE_KEY);
    if (savedScroll) {
      nav.scrollTop = parseInt(savedScroll, 10);
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      localStorage.setItem(SCROLL_STORAGE_KEY, Math.round(nav.scrollTop).toString());
    };

    nav.addEventListener('scroll', handleScroll);
    return () => nav.removeEventListener('scroll', handleScroll);
  }, []);

  if (!contentlet || !sideNav) {
    return <div>Loading...</div>;
  }

  const documentation = cleanMarkdown(contentlet.documentation, contentlet.identifier);

  return (
    <div className="container flex min-h-screen p-0">
      {/* Left Navigation */}
      <div className="w-72 shrink-0">
        <nav 
          ref={navRef}
          className="h-[calc(100vh-4rem)] overflow-y-auto sticky top-16 p-4 pt-8 px-2
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
        >
          <NavTree 
            items={sideNav[0]?.dotcmsdocumentationchildren || []} 
            currentPath={currentPath}
          />
        </nav>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 min-w-0"> 
        <div className="max-w-[1400px] mx-auto flex">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0 pt-8 px-12
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20">
            <Breadcrumbs 
              items={sideNav[0]?.dotcmsdocumentationchildren || []} 
              currentPath={currentPath}
            />
            
            <div className="markdown-content">
              <h1 className="text-4xl font-bold mb-6">{contentlet.title}</h1>
              <MarkdownContent content={documentation} />
            </div>
          </main>

          {/* Right Sidebar - On This Page */}
          <div className="w-64 shrink-0 hidden xl:block">
            <div className="sticky top-16 pt-8 pl-8">
              <OnThisPage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;

