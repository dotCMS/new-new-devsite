import { courseTitleForMetadata, getCourseDetail } from "@/services/courses/getCourse";
import MarkdownContent from "@/components/MarkdownContent";
import { notFound } from "next/navigation";
import ChapterFooter from "../ChapterFooter";

export async function generateMetadata({ params }) {
  const { slug, chapter } = await params;
  const { course } = await getCourseDetail({ slug });
  if (!course) {
    return { title: "Course not found" };
  }

  const match = chapter.match(/^chapter-(\d+)$/);
  if (!match) {
    return { title: "Chapter not found" };
  }

  const index = parseInt(match[1], 10) - 1;
  const chapterData = course.chapters[index];
  if (!chapterData) {
    return { title: "Chapter not found" };
  }

  const total = course.chapters?.length ?? 0;
  const n = index + 1;
  const label = courseTitleForMetadata(course);
  return { title: `${label} · Ch. ${n}/${total} — ${chapterData.title}` };
}

export default async function ChapterPage({ params }) {
  const { slug, chapter } = await params;
  const { course } = await getCourseDetail({ slug });
  if (!course) notFound();

  const match = chapter.match(/^chapter-(\d+)$/);
  if (!match) notFound();

  const index = parseInt(match[1], 10) - 1;
  const chapterData = course.chapters[index];
  if (!chapterData) notFound();

  return (
    <>
      <p className="text-sm text-white/50 mb-2">{course.title}</p>
      <h1 className="text-4xl font-bold mb-8">{chapterData.title}</h1>
      <MarkdownContent content={chapterData.content} />
      <ChapterFooter
        courseSlug={slug}
        currentIndex={index}
        chapters={course.chapters}
      />
    </>
  );
}
