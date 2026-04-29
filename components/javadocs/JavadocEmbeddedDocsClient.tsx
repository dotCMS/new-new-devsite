'use client';

import { useCallback, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { JavadocVersionListStatus } from '@/services/javadocs/listJavadocS3Versions';

function versionListHelp(status: JavadocVersionListStatus): string {
  switch (status) {
    case 'missing_env':
      return 'Set JAVADOCS_S3_ACCESS_KEY_ID, JAVADOCS_S3_SECRET_ACCESS_KEY, and JAVADOCS_S3_BUCKET on the server, then restart the dev server so Next.js picks up .env.local.';
    case 's3_error':
      return 'S3 listing failed (see server terminal logs). Common fixes: correct JAVADOCS_S3_REGION for the bucket, IAM permission s3:ListBucket on that bucket, and a bucket name that matches AWS exactly.';
    case 'empty':
      return 'Listing succeeded but no version folders matched. Check JAVADOCS_S3_DOCS_PREFIX (default docs/) matches keys in the bucket, and that folder names look like 26.04.28-02 (digits, dots, hyphens; not starting with 99).';
    default:
      return '';
  }
}

export type JavadocEmbeddedDocsClientProps = {
  versions: string[];
  versionListStatus: JavadocVersionListStatus;
  /** No trailing slash, e.g. https://static.dotcms.com/docs */
  baseUrl: string;
  slug: string;
  sideNavItems: unknown[];
  title: string;
  initialSelectedVersion: string | null;
};

function buildJavadocIndexUrl(baseUrl: string, version: string): string {
  const enc = encodeURIComponent(version);
  return `${baseUrl}/${enc}/javadocs/index.html`;
}

export function JavadocEmbeddedDocsClient({
  versions,
  versionListStatus,
  baseUrl,
  slug,
  sideNavItems,
  title,
  initialSelectedVersion,
}: JavadocEmbeddedDocsClientProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(
    initialSelectedVersion
  );

  const iframeSrc = selectedVersion
    ? buildJavadocIndexUrl(baseUrl, selectedVersion)
    : null;

  const onVersionChange = useCallback((value: string) => {
    setSelectedVersion(value);
  }, []);

  return (
    <div className="flex w-full min-w-0 flex-col pt-8 pb-8 lg:pb-12">
      <Breadcrumbs items={sideNavItems as never[]} slug={slug} />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground lg:min-w-0 lg:flex-1">
          {title}
        </h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-5 shrink-0">
          {iframeSrc ? (
            <a
              href={iframeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline sm:mb-2"
            >
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
              Open Javadoc in new tab
            </a>
          ) : null}

          <div className="flex w-full flex-col gap-2 sm:w-72">
            <Label htmlFor="javadoc-version" className="text-sm font-medium">
              Javadoc version
            </Label>
            {versions.length > 0 ? (
              <Select
                value={selectedVersion ?? undefined}
                onValueChange={onVersionChange}
              >
                <SelectTrigger id="javadoc-version" className="w-full">
                  <SelectValue placeholder="Select a version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  No versions in the list yet
                </p>
                <p>{versionListHelp(versionListStatus)}</p>
                <p className="text-xs leading-relaxed">
                  In S3, the <span className="text-foreground">bucket</span> is the
                  top-level store (one name), not a folder inside something else.
                  If Cyberduck shows{' '}
                  <code className="rounded bg-muted px-1 py-0.5 text-foreground">
                    /static.dotcms.com
                  </code>{' '}
                  at the root, set{' '}
                  <code className="rounded bg-muted px-1 py-0.5 text-foreground">
                    JAVADOCS_S3_BUCKET=static.dotcms.com
                  </code>{' '}
                  (no leading slash). Version folders live under keys like{' '}
                  <code className="rounded bg-muted px-1 py-0.5 text-foreground">
                    docs/26.04.28-02/…
                  </code>{' '}
                  inside that bucket.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative h-[min(85vh,1200px)] min-h-[70vh] w-full overflow-hidden rounded-lg border border-border bg-muted/20 shadow-sm">
        {iframeSrc ? (
          <iframe
            key={iframeSrc}
            title={`Javadoc ${selectedVersion}`}
            src={iframeSrc}
            className="absolute inset-0 w-full h-full border-0 bg-background"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-muted-foreground text-sm">
            Select a version to load Javadoc in this frame.
          </div>
        )}
      </div>
    </div>
  );
}
