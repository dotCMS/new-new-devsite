import { graphqlResults } from "@/services/gql";
import { logRequest } from "@/util/logRequest";

export async function getCourseDetail({ slug }) {
  const query = `query ContentAPI {
  CourseE2eCollection(query: "+CourseE2e.urlTitle:${slug}") {
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

  return { course: result.data.CourseE2eCollection[0] };
}
