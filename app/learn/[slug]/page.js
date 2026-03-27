import { getCourseDetail } from "@/services/courses/getCourse";
import { DotCMSBlockEditorRenderer } from "@dotcms/react";
import ChapterFooter from "./ChapterFooter";
import { notFound } from "next/navigation";

export default async function CoursePage({ params }) {
  const { slug } = await params;
  const { course } = await getCourseDetail({ slug });
  if (!course) notFound();

  return (
    <>
      <p className="text-sm text-white/50 mb-2">Introduction</p>
      <h1 className="text-4xl font-bold mb-8">{course.title}</h1>
      <DotCMSBlockEditorRenderer
        className="prose dark:prose-invert"
        blocks={course.introduction.json}
      />
      <ChapterFooter courseSlug={slug} currentIndex={-1} chapters={course.chapters} />
    </>
  );
}
