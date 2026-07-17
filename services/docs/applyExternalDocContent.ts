import {
  getGitHubConfig,
  isGitHubDoc,
  normalizeDocPath,
  withTag,
} from '@/config/github-docs';
import { getDocsContentWithGitHub } from '@/services/docs/getGitHubContent';

type DotCMSContentMap = {
  inode?: string;
  documentation?: string;
  body?: string;
  content?: string;
  _map?: Record<string, unknown>;
};

type DotCMSPageAsset = {
  urlContentMap?: DotCMSContentMap;
  page?: {
    urlContentMap?: DotCMSContentMap;
  };
};

function getUrlContentMap(pageAsset: DotCMSPageAsset): DotCMSContentMap | undefined {
  return pageAsset?.page?.urlContentMap || pageAsset?.urlContentMap;
}

/**
 * Replace dotCMS page content with its configured external README.
 *
 * `routePath` may belong to either `/docs/...` or
 * `/testing-devresource/...`; both normalize to the same map key.
 */
export async function applyExternalDocContent(
  routePath: string | string[],
  requestedTag: string | undefined,
  pageAsset: DotCMSPageAsset,
): Promise<void> {
  const docPath = normalizeDocPath(routePath);
  const urlContentMap = getUrlContentMap(pageAsset);

  if (!isGitHubDoc(docPath) || !urlContentMap) {
    return;
  }

  const baseConfig = getGitHubConfig(docPath);
  if (!baseConfig) {
    return;
  }

  const config = withTag(baseConfig, requestedTag);
  const pageMap = urlContentMap._map || {};
  const contentResult = await getDocsContentWithGitHub(
    docPath,
    config,
    () =>
      (pageMap.documentation as string) ||
      urlContentMap.documentation ||
      urlContentMap.body ||
      urlContentMap.content ||
      '',
  );

  if (contentResult.source !== 'github') {
    return;
  }

  urlContentMap._map = {
    ...pageMap,
    documentation: contentResult.content,
    githubSource: true,
    githubConfig: contentResult.config,
    tagInfo: {
      betaAvailable: contentResult.betaAvailable,
    },
  };
}
