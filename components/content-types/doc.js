"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NavTree from '@/components/navigation/NavTree';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import MarkdownContent from '@/components/MarkdownContent';

const TableOfContents = ({ items }) => {
  return (
    <div className="sticky top-8">
      <h3 className="mb-4 text-sm font-semibold">On This Page</h3>
      <nav className="text-sm">
        <ul className="space-y-2 text-muted-foreground">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`#${item.id}`} className="hover:text-foreground">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

const Doc = ({ contentlet, sideNav }) => {
  const currentPath = usePathname();

  const tocItems = [
    { id: 'overview', title: 'Overview' },
    { id: 'features', title: 'Features' },
  ];

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
        <MarkdownContent content={contentlet.documentation} />
      </div>

      {/* Right Sidebar - Table of Contents */}
      <div className="w-48 shrink-0">
        <TableOfContents items={tocItems} />
      </div>
    </div>
  );
};

export default Doc;

