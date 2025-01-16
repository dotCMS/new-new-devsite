"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import NavTree from '@/components/navigation/NavTree';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import OnThisPage from '@/components/navigation/OnThisPage';
import MarkdownContent from '@/components/MarkdownContent';

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

  if (!contentlet || !sideNav) {
    return <div>Loading...</div>;
  }

  const documentation = cleanMarkdown(contentlet.documentation, contentlet.identifier);

  return (
    <div className="container flex min-h-svh py-4">
      {/* Left Navigation */}
      <div className="w-96 border-r pr-8">
        <nav >
          <NavTree 
            items={sideNav[0]?.dotcmsdocumentationchildren || []} 
            currentPath={currentPath}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="px-8 overflow-x-hidden" >
        <Breadcrumbs 
          items={sideNav[0]?.dotcmsdocumentationchildren || []} 
          currentPath={currentPath}
        />
        <h1 className="text-4xl font-bold mb-6">{contentlet.title}</h1>
        <div className="markdown-content">
          <MarkdownContent content={documentation} />
        </div>
      </div>

      {/* Right Sidebar - Table of Contents */}
      <aside className="w-64" >
        <OnThisPage />
      </aside>
    </div>
  );
};

export default Documentation;

