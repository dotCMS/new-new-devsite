import { getCourseDetail } from "@/services/courses/getCourse";
import CourseSidebar from "./CourseSidebar";
import Header from "@/components/header/header";
import { notFound } from "next/navigation";

export default async function CourseLayout({ children, params }) {
  const { slug } = await params;
  const { course } = await getCourseDetail({ slug });
  if (!course) notFound();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <CourseSidebar course={course} courseSlug={slug} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-16 py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
