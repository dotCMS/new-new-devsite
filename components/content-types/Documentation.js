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
    <div className="container mx-auto flex min-h-screen gap-12 py-8">
      {/* Left Navigation */}
      <div className="w-64 border-r pr-8">
        <nav className="sticky top-8">
          <h2 className="mb-4 text-lg font-semibold">Documentation</h2>
          <NavTree 
            items={sideNav[0]?.dotcmsdocumentationchildren || []} 
            currentPath={currentPath}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="pl-4 flex-1 min-w-0 overflow-x-hidden" >
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
      <div className="max-w-8 pl-4 flex min-w-16">
        <OnThisPage />
      </div>
    </div>
  );
};

export default Documentation;

