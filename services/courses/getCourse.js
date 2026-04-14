import { graphqlResults } from "@/services/gql";
import { logRequest } from "@/util/logRequest";

function escapeLuceneValue(value) {
  return String(value).replace(/([+\-!(){}[\]^"~*?:\\/])/g, "\\$1");
}

/** Backslashes and quotes must be escaped when embedding in a GraphQL "string" literal. */
function escapeGraphqlStringLiteral(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Prefer optional CMS `shortTitle` for browser tab / metadata when set. */
export function courseTitleForMetadata(course) {
  const short = course?.shortTitle;
  if (typeof short === "string" && short.trim()) return short.trim();
  if (short && typeof short === "object" && typeof short.value === "string" && short.value.trim()) {
    return short.value.trim();
  }
  return course?.title ?? "";
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
