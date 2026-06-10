import { graphqlResults } from "@/services/gql";
import { logRequest } from "@/util/logRequest";

function escapeLuceneValue(value) {
  return String(value).replace(/([+\-!(){}[\]^"~*?:\\/])/g, "\\$1");
}

/** Backslashes and quotes must be escaped when embedding in a GraphQL "string" literal. */
function escapeGraphqlStringLiteral(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Normalize the CMS `shortTitle`, which may be a plain string or an object
 * like `{ value: "..." }`. Returns "" when not set.
 */
export function courseShortTitle(course) {
  const short = course?.shortTitle;
  if (typeof short === "string") return short.trim();
  if (short && typeof short === "object" && typeof short.value === "string") {
    return short.value.trim();
  }
  return "";
}

/** Prefer optional CMS `shortTitle` for browser tab / metadata when set. */
export function courseTitleForMetadata(course) {
  return courseShortTitle(course) || (course?.title ?? "");
}

export async function getCourses() {
  // Explicit high limit: the landing page lists all courses without
  // pagination, so we must override the API's default collection cap.
  const query = `query ContentAPI {
  CourseE2eCollection(limit: 1000) {
    title
    shortTitle
    urlTitle
    chapters {
      title
    }
  }
}`;

  const result = await logRequest(
    async () => graphqlResults(query),
    "getCourses",
  );

  if (result?.errors && result.errors.length > 0) {
    console.error("GraphQL errors in getCourses:", result.errors);
    throw new Error(result.errors[0].message);
  }

  const collection = result?.data?.CourseE2eCollection;
  const courses = Array.isArray(collection) ? collection : [];

  return { courses };
}

export async function getCourseDetail({ slug }) {
  const luceneSlug = escapeLuceneValue(slug);
  const safeSlug = escapeGraphqlStringLiteral(luceneSlug);
  const query = `query ContentAPI {
  CourseE2eCollection(query: "+CourseE2e.urlTitle:${safeSlug}", limit: 1) {
    title,
    shortTitle
    urlTitle
    introduction {
      json
    }
    chapters {
      title
      content
      bunnyVideoId
    }
  }
}`;

  const result = await logRequest(
    async () => graphqlResults(query),
    "getCourseDetail",
  );

  if (result.errors && result.errors.length > 0) {
    console.error("GraphQL errors in getCourseDetail:", result.errors);
    throw new Error(result.errors[0].message);
  }

  const collection = result?.data?.CourseE2eCollection;
  const course = Array.isArray(collection) && collection.length > 0 ? collection[0] : null;

  return { course };
}
