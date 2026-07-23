"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { DocsSlugIndex } from "@/services/docs/resolveDocsHref";
import { resolveDocsHref } from "@/services/docs/resolveDocsHref";

const DocsSlugIndexContext = createContext<DocsSlugIndex | null>(null);

export function DocsSlugIndexProvider({
  index,
  children,
}: {
  index: DocsSlugIndex | null;
  children: ReactNode;
}) {
  return (
    <DocsSlugIndexContext.Provider value={index}>
      {children}
    </DocsSlugIndexContext.Provider>
  );
}

export function useDocsSlugIndex(): DocsSlugIndex | null {
  return useContext(DocsSlugIndexContext);
}

export function useResolvedDocsHref(href: string | null | undefined): string {
  const index = useDocsSlugIndex();
  return resolveDocsHref(href, index);
}
