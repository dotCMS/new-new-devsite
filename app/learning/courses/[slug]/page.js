import { courseTitleForMetadata, getCourseDetail } from "@/services/courses/getCourse";
import ChapterFooter from "./ChapterFooter";
import CourseIntroduction from "./CourseIntroduction";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { course } = await getCourseDetail({ slug });
  if (!course) {
    return { title: "Course not found" };
  }
  return { title: courseTitleForMetadata(course) };
}

export default async function CoursePage({ params }) {
  const { slug } = await params;
  const { course } = await getCourseDetail({ slug });
  if (!course) notFound();

  return (
    <>
      <p className="text-sm text-white/50 mb-2">Introduction</p>
      <h1 className="text-4xl font-bold mb-8">{course.title}</h1>
      <CourseIntroduction blocks={course.introduction.json} />
      <ChapterFooter courseSlug={slug} currentIndex={-1} chapters={course.chapters} />
    </>
  );
}
