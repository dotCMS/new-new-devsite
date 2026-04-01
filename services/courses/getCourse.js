import { graphqlResults } from "@/services/gql";
import { logRequest } from "@/util/logRequest";

function escapeLuceneValue(value) {
  return String(value).replace(/([+\-!(){}[\]^"~*?:\\/])/g, "\\$1");
}

export async function getCourseDetail({ slug }) {
  const safeSlug = escapeLuceneValue(slug);
  const query = `query ContentAPI {
  CourseE2eCollection(query: "+CourseE2e.urlTitle:${safeSlug}", limit: 1) {
    title,
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
