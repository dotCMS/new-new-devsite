import { graphqlResults } from "@/services/gql";
import { logRequest } from "@/util/logRequest";
import type { TReference } from "@/services/search/getSiteSearch/types";

/** Multiplicative chapter boost: score' = base * (1 + α * min(chapterHitCount, CAP)). */
const CHAPTER_BOOST_ALPHA = 0.25;
/** Cap so broad terms (e.g. "dotCMS") cannot dominate the page index. */
const CHAPTER_BOOST_CAP = 6;

type CourseChapter = {
  title?: string | null;
  content?: string | null;
};

type CourseRow = {
  title?: string | null;
  shortTitle?: string | { value?: string } | null;
  urlTitle?: string | null;
  introduction?: { json?: unknown } | null;
  chapters?: CourseChapter[] | null;
};

type DevResourceRow = {
  title?: string | null;
  slug?: string | null;
  teaser?: string | null;
  type1?: string | string[] | null;
  body?: { json?: unknown } | null;
};

function courseShortTitle(course: CourseRow): string {
  const short = course.shortTitle;
  if (typeof short === "string") return short.trim();
  if (short && typeof short === "object" && typeof short.value === "string") {
    return short.value.trim();
  }
  return "";
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function jsonToPlainText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return stripHtml(value);
  try {
    return stripHtml(JSON.stringify(value));
  } catch {
    return "";
  }
}

/** Tokenize query into terms (length >= 2). */
export function learnSearchTerms(searchTerm: string): string[] {
  return searchTerm
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function containsAllTerms(haystack: string, terms: string[]): boolean {
  if (!terms.length) return false;
  const h = stripHtml(haystack).toLowerCase();
  if (!h) return false;
  return terms.every((t) => h.includes(t));
}

function firstMatchingSnippet(
  chapters: CourseChapter[],
  terms: string[],
): string {
  for (const ch of chapters) {
    const title = ch.title || "";
    const body = ch.content || "";
    if (containsAllTerms(`${title} ${body}`, terms)) {
      const plain = stripHtml(body);
      if (plain) {
        return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain;
      }
      return title;
    }
  }
  return "";
}

/**
 * Map type1 → label for header chips. Videos are excluded from this corpus.
 */
function devResourceContentType(
  type1: string | string[] | null | undefined,
): string {
  const raw = Array.isArray(type1) ? type1[0] : type1;
  const t = String(raw || "").toLowerCase();
  if (t === "howto") return "How-to";
  if (t === "kb") return "Knowledge Base";
  if (t === "example") return "Example";
  if (t === "guide") return "Guide";
  return "Guide";
}

async function fetchCoursesForSearch(): Promise<CourseRow[]> {
  const query = `query LearnCourseSearch {
  CourseE2eCollection(limit: 1000) {
    title
    shortTitle
    urlTitle
    introduction { json }
    chapters {
      title
      content
    }
  }
}`;
  const result = await logRequest(
    async () => graphqlResults(query),
    "getLearnSearchHits.courses",
  );
  if (result?.errors?.length) {
    console.error("GraphQL errors in getLearnSearchHits.courses:", result.errors);
    return [];
  }
  const collection = result?.data?.CourseE2eCollection;
  return Array.isArray(collection) ? collection : [];
}

async function fetchDevResourcesForSearch(): Promise<DevResourceRow[]> {
  const query = `query LearnDevResourceSearch {
  DevResourceCollection(
    query: "+contenttype:devresource +(conhost:SYSTEM_HOST || conhost:173aff42881a55a562cec436180999cf) -devresource.type1:video +live:true"
    limit: 200
    page: 1
    sortBy: "devresource.publishDate desc"
  ) {
    title
    slug
    type1
    teaser
    body { json }
  }
}`;
  const result = await logRequest(
    async () => graphqlResults(query),
    "getLearnSearchHits.devResources",
  );
  if (result?.errors?.length) {
    console.error(
      "GraphQL errors in getLearnSearchHits.devResources:",
      result.errors,
    );
    return [];
  }
  const collection = result?.data?.DevResourceCollection;
  return Array.isArray(collection) ? collection : [];
}

/**
 * Front-end-only Learn hits projected into the sitesearch `references` shape.
 * Courses always link to `/learning/courses/{urlTitle}` (never chapter deep links);
 * score rises with how many chapters matched.
 */
export async function getLearnSearchHits(
  searchTerm: string,
): Promise<TReference[]> {
  const terms = learnSearchTerms(searchTerm);
  if (!terms.length) return [];

  const [courses, devResources] = await Promise.all([
    fetchCoursesForSearch(),
    fetchDevResourcesForSearch(),
  ]);

  const hits: TReference[] = [];

  for (const course of courses) {
    const urlTitle = (course.urlTitle || "").trim();
    if (!urlTitle) continue;

    const chapters = Array.isArray(course.chapters) ? course.chapters : [];
    const title = (course.title || "").trim();
    const short = courseShortTitle(course);
    const introText = jsonToPlainText(course.introduction?.json);

    const titleHit = containsAllTerms(`${title} ${short} ${urlTitle}`, terms);
    const introHit = containsAllTerms(introText, terms);

    let chapterHitCount = 0;
    for (const ch of chapters) {
      if (containsAllTerms(`${ch.title || ""} ${ch.content || ""}`, terms)) {
        chapterHitCount += 1;
      }
    }

    if (!titleHit && !introHit && chapterHitCount === 0) continue;

    const matches =
      chapterHitCount + (titleHit || introHit ? 1 : 0);
    const baseScore = titleHit ? 7.5 : introHit ? 6.25 : 5.5;
    const boostChapters = Math.min(chapterHitCount, CHAPTER_BOOST_CAP);
    const score = baseScore * (1 + CHAPTER_BOOST_ALPHA * boostChapters);

    const description =
      short ||
      firstMatchingSnippet(chapters, terms) ||
      (introText
        ? introText.length > 160
          ? `${introText.slice(0, 157)}…`
          : introText
        : "");

    hits.push({
      title: title || short || urlTitle,
      uri: `/learning/courses/${urlTitle}`,
      description,
      matches,
      score,
      contentType: "Course",
    });
  }

  for (const resource of devResources) {
    const slug = (resource.slug || "").trim();
    if (!slug) continue;

    const title = resource.title || "";
    const teaser = resource.teaser || "";
    const body = jsonToPlainText(resource.body?.json);
    const blob = `${title} ${teaser} ${body} ${slug}`;
    if (!containsAllTerms(blob, terms)) continue;

    const titleHit = containsAllTerms(title, terms);
    const baseScore = titleHit ? 7.0 : 5.75;

    hits.push({
      title: title || slug,
      uri: `/learning/${slug}`,
      description: teaser
        ? teaser.length > 160
          ? `${teaser.slice(0, 157)}…`
          : teaser
        : "",
      matches: titleHit ? 2 : 1,
      score: baseScore,
      contentType: devResourceContentType(resource.type1),
    });
  }

  return hits;
}
