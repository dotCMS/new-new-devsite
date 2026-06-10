import Link from "next/link";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { getCourses, courseShortTitle } from "@/services/courses/getCourse";

export const metadata = {
  title: "Learn | dotCMS Documentation",
  description: "Browse dotCMS learning courses.",
};

function chapterLabel(course) {
  const count = Array.isArray(course?.chapters) ? course.chapters.length : 0;
  return `${count} ${count === 1 ? "lesson" : "lessons"}`;
}

export default async function Courses() {
  const { courses } = await getCourses();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="text-4xl font-bold mb-2">Learn</h1>
          <p className="text-muted-foreground mb-10">
            Learn dotCMS through hands-on, self-paced courses.
          </p>

          {courses.length === 0 ? (
            <p className="text-muted-foreground">No courses available yet.</p>
          ) : (
            <ul className="flex flex-col gap-6">
              {courses.map((course) => (
                <li key={course.urlTitle}>
                  <Link
                    href={`/learning/courses/${course.urlTitle}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary sm:flex-row"
                  >
                    {/* Image placeholder */}
                    <div className="flex aspect-video w-full shrink-0 items-center justify-center bg-muted text-muted-foreground sm:aspect-auto sm:w-64">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-12 w-12 opacity-40"
                        aria-hidden="true"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="text-xl font-semibold transition-colors group-hover:text-primary">
                        {course.title}
                      </h2>
                      {courseShortTitle(course) ? (
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                          {courseShortTitle(course)}
                        </p>
                      ) : null}
                      <p className="mt-4 text-sm font-medium text-muted-foreground">
                        {chapterLabel(course)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
