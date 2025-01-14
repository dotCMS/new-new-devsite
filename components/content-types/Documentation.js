"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import NavTree from '@/components/navigation/NavTree';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import OnThisPage from '@/components/navigation/OnThisPage';
import MarkdownContent from '@/components/MarkdownContent';

const Documentation = ({ contentlet, sideNav }) => {
  const currentPath = usePathname();

  if (!contentlet || !sideNav) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto flex min-h-screen gap-8 py-8">
      {/* Left Navigation */}
      <div className="w-72 shrink-0 border-r">
        <nav className="sticky top-8 pr-4">
          <h2 className="mb-4 text-lg font-semibold">Documentation</h2>
          <NavTree 
            items={sideNav[0]?.dotcmsdocumentationchildren || []} 
            currentPath={currentPath}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <Breadcrumbs 
          items={sideNav[0]?.dotcmsdocumentationchildren || []} 
          currentPath={currentPath}
        />
        <h1 className="text-4xl font-bold mb-6">{contentlet.title}</h1>
        <div className="markdown-content">
          <MarkdownContent content={contentlet.documentation} />
        </div>
      </div>

      {/* Right Sidebar - Table of Contents */}
      <div className="w-48 shrink-0">
        <OnThisPage />
      </div>
    </div>
  );
};

export default Documentation;

