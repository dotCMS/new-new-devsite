import { listJavadocS3Versions } from '@/services/javadocs/listJavadocS3Versions';
import { JavadocEmbeddedDocsClient } from './JavadocEmbeddedDocsClient';

const DEFAULT_JAVADOCS_BASE = 'https://static.dotcms.com/docs';

type SideNavEntry = { dotcmsdocumentationchildren?: unknown[] };

type Props = {
  contentlet: { navTitle?: string; title?: string };
  sideNav: SideNavEntry[];
  slug: string;
  searchParams?: Record<string, string | string[] | undefined>;
};

function resolveInitialVersion(
  versions: string[],
  requested: string | undefined
): string | null {
  if (requested && versions.includes(requested)) {
    return requested;
  }
  return versions.length > 0 ? versions[0] : null;
}

export async function JavadocEmbeddedDocs({
  contentlet,
  sideNav,
  slug,
  searchParams,
}: Props) {
  const { versions, status: versionListStatus } =
    await listJavadocS3Versions();
  const baseFromEnv = process.env.NEXT_PUBLIC_JAVADOCS_BASE_URL;
  const baseUrl = (baseFromEnv || DEFAULT_JAVADOCS_BASE).replace(/\/$/, '');

  const rawV = searchParams?.v;
  const requested =
    typeof rawV === 'string' ? rawV : Array.isArray(rawV) ? rawV[0] : undefined;

  const initialSelectedVersion = resolveInitialVersion(versions, requested);

  const title =
    contentlet?.navTitle || contentlet?.title || 'Java API (Javadoc)';

  const sideNavItems = sideNav?.[0]?.dotcmsdocumentationchildren ?? [];

  return (
    <JavadocEmbeddedDocsClient
      versions={versions}
      versionListStatus={versionListStatus}
      baseUrl={baseUrl}
      slug={slug}
      sideNavItems={sideNavItems}
      title={title}
      initialSelectedVersion={initialSelectedVersion}
    />
  );
}
