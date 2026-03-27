import { getCourseDetail } from "@/services/courses/getCourse";

import { redirect } from "next/navigation";

export default function Courses() {
  redirect("/learn/headless");
  return null;
}