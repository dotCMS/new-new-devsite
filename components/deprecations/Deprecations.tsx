"use client";
import { useMemo } from "react";
import Breadcrumbs from "@/components/navigation/Breadcrumbs.js";
import type { TDeprecation } from "@/services/docs/getDeprecations/types";
import OnThisPage from "../navigation/OnThisPage";
import { DeprecationCard } from "./DeprecationCard";

type Props = {
  sideNav: any[];
  slug: string;
  initialItems?: TDeprecation[];
};

function hasBlockContent(block: any): boolean {
  if (!block) return false;
  if (typeof block === "string") return block.trim().length > 0;
  
  const json = block?.json || block;
  const content = json?.content;
  
  if (!Array.isArray(content) || content.length === 0) return false;
  
  // Check if any content node has actual text content
  return content.some((node: any) => {
    // If node has content array, check if any child has text
    if (node.content && Array.isArray(node.content)) {
      return node.content.some((child: any) => 
        child.type === 'text' && child.text && child.text.trim().length > 0
      );
    }
    // If node itself has text
    if (node.type === 'text' && node.text && node.text.trim().length > 0) {
      return true;
    }
    return false;
  });
}

function isValidDeprecation(item: TDeprecation): boolean {
  return Boolean(
    item?.title &&
      item?.dateDeprecated &&
      item?.versionDeprecated &&
      hasBlockContent(item?.recommendation)
  );
}

export default function Deprecations({ sideNav, slug, initialItems }: Props) {

  const items = useMemo(() => {
    const list = Array.isArray(initialItems) ? initialItems : [];
    return list.filter(isValidDeprecation);
  }, [initialItems]);

  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-8">
      <main
        className="flex-1 min-w-0 pt-8 px-12
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
      >
        <Breadcrumbs
          items={sideNav[0]?.dotcmsdocumentationchildren || []}
          slug={slug}
        />

        <div className="markdown-content">
          <h1 className="text-4xl font-bold mb-2">Deprecations</h1>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            The following features are deprecated or retired. Review details and recommendations to plan migrations.
          </p>

          <div className="grid grid-cols-1 gap-6">
            {items.map((dep, idx) => (
              <DeprecationCard key={`dep-${idx}`} deprecation={dep} />
            ))}
          </div>
          
        </div>
      </main>
      <div id="right-toc" className="hidden lg:block w-[18rem] shrink-0 pr-6">
        <div className="sticky top-8">
          <OnThisPage />
        </div>
      </div>
    </div>
  );
}


