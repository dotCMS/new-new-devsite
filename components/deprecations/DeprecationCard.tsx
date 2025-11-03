import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, Ban, Link as LinkIcon } from "lucide-react";
import { DotBlockEditor } from "@/components/shared/dotBlockEditor";
import type { TDeprecation } from "@/services/docs/getDeprecations/types";
import Link from "next/link";
import { extractDateForTables } from "@/util/formatDate";

type DeprecationCardProps = {
  deprecation: TDeprecation;
  variant?: "default" | "inline";
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

export function DeprecationCard({ deprecation: dep, variant = "default" }: DeprecationCardProps) {
  const isInline = variant === "inline";
  const isRetired = Boolean(dep.versionRetired);
  
  // Determine card styling based on variant and state
  const cardClassName = isInline 
    ? (isRetired 
        ? "overflow-hidden bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" 
        : "overflow-hidden bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800")
    : "overflow-hidden border-border/60";
  
  return (
    <Card className={cardClassName}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          {!isInline ?  
            <CardTitle className="text-xl leading-tight break-words">
              {dep.title}
            </CardTitle>
          : <h5 className="text-xl font-semibold">{isRetired ? "Retired" : "Deprecated"}: {dep.title}</h5>}
          <Badge 
            variant={isRetired ? "destructive" : "outline"} 
            className={isRetired 
              ? "shrink-0" 
              : "shrink-0 border-amber-500 text-amber-700 dark:text-amber-400 dark:border-amber-600"
            }
          >
            {isRetired ? (
              <>
                <Ban className="h-3.5 w-3.5 mr-1" />
                {dep.versionRetired}
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                {dep.versionDeprecated}
              </>
            )}
          </Badge>
        </div>
        <div className="mt-2">
          <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {dep.dateDeprecated && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Deprecated {extractDateForTables(dep.dateDeprecated as any)}
              </span>
            )}
            {dep.versionDeprecated && (
              <span>Deprecated in {dep.versionDeprecated}</span>
            )}
            {dep.dateRetired && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Retired {extractDateForTables(dep.dateRetired as any)}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {dep.timeframeNote && (
          <div className="mb-4 text-sm text-muted-foreground">
            {dep.timeframeNote}
          </div>
        )}

        <section className="mb-4">
          <h5 className="font-semibold mb-2">Recommendation</h5>
          <div className="prose dark:prose-invert max-w-none">
            <DotBlockEditor blocks={(dep.recommendation as any)?.json || (dep.recommendation as any)} customRenderers={{}} />
          </div>
        </section>

        {hasBlockContent(dep.reason) && (
          <section className="mb-4">
            <h5 className="font-semibold mb-2">Reason</h5>
            <div className="prose dark:prose-invert max-w-none">
              <DotBlockEditor blocks={(dep.reason as any)?.json || (dep.reason as any)} customRenderers={{}} />
            </div>
          </section>
        )}

        {!isInline && dep.docLinks && Array.isArray(dep.docLinks) && dep.docLinks.length > 0 && (
          <section className="mt-4">
            <h6 className="font-medium mb-2">Documentation links</h6>
            <ul className="text-sm break-words space-y-1">
              {dep.docLinks.map((doc, i) => {
                const url = doc.urlTitle ? `/docs/${doc.urlTitle}` : '#';
                const linkText = doc.title || doc.urlTitle || url;
                return (
                  <li key={`link-${i}`}>
                    <Link href={url} className="inline-flex items-center text-primary underline hover:no-underline">
                      <LinkIcon className="h-4 w-4 mr-1" /> {linkText}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

      {isInline && (
          <div className="text-right">
            <Link 
              href="/docs/deprecations" 
              className="text-sm text-primary underline hover:no-underline inline-flex items-center gap-1"
            >
              All deprecations <LinkIcon className="h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

