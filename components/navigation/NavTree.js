
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import SubNavTree from '@/components/navigation/SubNavTree';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const NavTree = React.memo(({ items, currentPath, level = 0 }) => {
    const toggleSection = useCallback((urlTitle) => {
        setOpenSections((prev) =>
          prev.includes(urlTitle)
            ? prev.filter((t) => t !== urlTitle)
            : [...prev, urlTitle]
        );
      }, []);
  return (
    <div className="space-y-2 w-72">
      {items.map((item) => (
        <div key={item.title}>
            <div className="py-1 font-semibold">{item.title}</div>
            <SubNavTree items={item.dotcmsdocumentationchildren} currentPath={item.urlTitle} level="0"/>
        </div>
      ))}
    </div>
  );
});

NavTree.displayName = 'NavTree';

export default NavTree; 