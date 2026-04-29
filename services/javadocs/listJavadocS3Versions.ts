import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

/** Folder name: digits, dots, hyphens only; must not start with "99". */
const VERSION_FOLDER_REGEX = /^[0-9][0-9.-]*$/;

function isValidVersionFolder(name: string): boolean {
  if (!name || !VERSION_FOLDER_REGEX.test(name)) return false;
  if (name.startsWith('99')) return false;
  return true;
}

export type JavadocVersionListStatus =
  | 'ok'
  | 'missing_env'
  | 's3_error'
  /** List succeeded but no matching version folders (wrong prefix, empty bucket path, or filters excluded everything). */
  | 'empty';

export type JavadocVersionListResult = {
  versions: string[];
  status: JavadocVersionListStatus;
};

function trimEnv(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t || undefined;
}

/**
 * Lists doc release folder names under the configured S3 prefix (e.g. `docs/`)
 * using ListObjectsV2 with Delimiter `/`, same layout as
 * https://static.dotcms.com/docs/{version}/javadocs/
 *
 * **Bucket vs folder:** In S3, the *bucket* is the top-level container (globally
 * unique name). Cyberduck often shows it as `/static.dotcms.com` — that label is
 * the bucket *name* (`static.dotcms.com`), not a path segment inside another bucket.
 * Object keys then look like `docs/26.04.28-02/javadocs/...` *inside* that bucket.
 *
 * Env:
 * - JAVADOCS_S3_ACCESS_KEY_ID
 * - JAVADOCS_S3_SECRET_ACCESS_KEY
 * - JAVADOCS_S3_BUCKET (e.g. static.dotcms.com — no leading slash, no https://)
 * - JAVADOCS_S3_REGION (optional, default us-east-1)
 * - JAVADOCS_S3_DOCS_PREFIX (optional, default docs/)
 */
export async function listJavadocS3Versions(): Promise<JavadocVersionListResult> {
  const accessKeyId = trimEnv(process.env.JAVADOCS_S3_ACCESS_KEY_ID);
  const secretAccessKey = trimEnv(process.env.JAVADOCS_S3_SECRET_ACCESS_KEY);
  let bucket = trimEnv(process.env.JAVADOCS_S3_BUCKET);
  if (bucket) {
    bucket = bucket.replace(/^\/+/, '');
  }
  const region =
    trimEnv(process.env.JAVADOCS_S3_REGION) ||
    trimEnv(process.env.AWS_REGION) ||
    'us-east-1';
  const prefixRaw = trimEnv(process.env.JAVADOCS_S3_DOCS_PREFIX) || 'docs/';
  const prefix = prefixRaw.endsWith('/') ? prefixRaw : `${prefixRaw}/`;

  if (!accessKeyId || !secretAccessKey || !bucket) {
    console.warn(
      '[javadocs] Missing JAVADOCS_S3_ACCESS_KEY_ID, JAVADOCS_S3_SECRET_ACCESS_KEY, or JAVADOCS_S3_BUCKET; returning no versions.'
    );
    return { versions: [], status: 'missing_env' };
  }

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const versions = new Set<string>();
  let continuationToken: string | undefined;

  try {
    do {
      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          Delimiter: '/',
          ContinuationToken: continuationToken,
        })
      );

      for (const cp of response.CommonPrefixes ?? []) {
        const full = cp.Prefix ?? '';
        const relative = full.slice(prefix.length).replace(/\/$/, '');
        if (relative && isValidVersionFolder(relative)) {
          versions.add(relative);
        }
      }

      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined;
    } while (continuationToken);
  } catch (err) {
    console.error('[javadocs] S3 ListObjectsV2 failed:', err);
    return { versions: [], status: 's3_error' };
  }

  const sorted = Array.from(versions).sort((a, b) =>
    b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' })
  );

  if (sorted.length === 0) {
    return { versions: [], status: 'empty' };
  }

  return { versions: sorted, status: 'ok' };
}
