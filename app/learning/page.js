import Link from "next/link";
import { BookOpenIcon, NewspaperIcon, PlayCircleIcon } from "lucide-react";
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

const RESOURCES = [
  {
    href: "/blog",
    icon: NewspaperIcon,
    title: "Blogs",
    description: "A curated list of blogs for the discerning dotCMS developer.",
  },
  {
    href: "/learning/listing",
    icon: BookOpenIcon,
    title: "Guides, How-tos & Examples",
    description:
      "Key concepts, best practices, code snippets and step-by-step walkthroughs.",
  },
  {
    href: "/videos",
    icon: PlayCircleIcon,
    title: "Videos",
    description: "Video examples, demos and tutorials for visual learners.",
  },
];

export default async function Learn() {
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

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {courses.map((course) => (
              <li key={course.urlTitle}>
                <Link
                  href={`/learning/courses/${course.urlTitle}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary"
                >
                  {/* Image placeholder */}
                  <div className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground">
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

            {/* Resources card: list of [icon] text rows */}
            <li>
              <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 text-xl font-semibold">Guides &amp; Resources</h2>
                <ul className="flex flex-1 flex-col gap-1">
                  {RESOURCES.map((resource) => {
                    const Icon = resource.icon;
                    return (
                      <li key={resource.href}>
                        <Link
                          href={resource.href}
                          className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-primary">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium transition-colors group-hover:text-primary">
                              {resource.title}
                            </span>
                            <span className="block text-sm text-muted-foreground">
                              {resource.description}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
