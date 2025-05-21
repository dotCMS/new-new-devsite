"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  type: string;
  children?: NavItem[];
}

interface NextBackButtonsProps {
  navTree: NavItem[];
  currentSlug: string;
}

const NextBackButtons: React.FC<NextBackButtonsProps> = ({ navTree, currentSlug }) => {
  const router = useRouter();

  const getFinalSlug = (item: NavItem) => {
    if(item?.type === 'folder') {
      return item.href + "/index";
    }
    return item?.href;
  }



  const findNextAndPrevious = (
    treeIn: NavItem | NavItem[],
    slug: string
  ): { previous: NavItem | null; next: NavItem | null } => {
    const tree: NavItem[] = Array.isArray(treeIn) 
      ? treeIn 
      : (treeIn?.children || []);
    
    let previous: NavItem | null = null;
    let next: NavItem | null = null;
    let found = false;



    const flattenNavTree = (items: NavItem[]): NavItem[] => {
      const flattenedItems: NavItem[] = [];
      for(let i = 0; i < items.length; i++) {
        if(items[i].type != "folder") {
            flattenedItems.push(items[i]);
        }
        const children = items[i].children;
        if(children && children.length > 0) {
          flattenedItems.push(...flattenNavTree(children));
        }
      }
      return flattenedItems;  
    }   

    const traverse = (items: NavItem[]) => {
      if(!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (getFinalSlug(item) === slug) {
          found = true;
        }

        if (found && i > 0) {
          previous = items[i - 1];
        } 

        if (found && i < items.length - 1) {
          next = items[i + 1];
        } 
        if(found) {
          break;
        }
      }
    };

    const flattenedNavTree = flattenNavTree(tree);
    for(let i = 0; i < flattenedNavTree.length; i++) {  
        console.log(flattenedNavTree[i].href);
    }

    traverse(flattenedNavTree);
    return { previous, next };
  };

  const { previous, next } = findNextAndPrevious(navTree, currentSlug);

  const finalPrevious = previous ? getFinalSlug(previous) : '';
  const finalNext = next ? getFinalSlug(next) : '';



  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:justify-between mt-4 mb-8">
      {previous && (
        <Button variant="ghost" asChild className="w-full sm:w-auto transition-transform duration-200 hover:scale-105 hover:shadow-md">
          <Link href={`${finalPrevious}`} className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous: {previous.title}
          </Link>
        </Button>
      )}
      {!previous && (
        <div></div>
      )}
      {next && (
        <Button variant="default" asChild className="w-full sm:w-auto transition-transform duration-200 hover:scale-105 hover:shadow-md bg-primary-purple/10 hover:bg-primary-purple/10">
          <Link href={`${finalNext}`} className="flex items-center text-primary-purple">
            Next: {next.title}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
      {!next && (
        <div></div>
      )}
    </div>
  );
};

export default NextBackButtons;
