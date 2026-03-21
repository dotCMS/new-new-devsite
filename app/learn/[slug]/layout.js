import { getCourseDetail } from "@/services/courses/getCourse";
import CourseSidebar from "./CourseSidebar";

export default async function CourseLayout({ children, params }) {
  const { slug } = await params;
  const { course } = await getCourseDetail({ slug });

  return (
    <div className="flex h-screen overflow-hidden">
      <CourseSidebar course={course} courseSlug={slug} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-16 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
