"use client";

import { useSearchParams, useRouter } from "next/navigation";


import Breadcrumbs from "../navigation/Breadcrumbs";

import { TableReleases } from "./TableReleases/TableReleases";
export default function LatestVersions({ sideNav, slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLts = searchParams.get("lts") === "true";
  var currentPage = Number(searchParams.get("page")) || 1;
  if (currentPage < 1) {
    currentPage = 1;
  }



  return (
    <TableReleases />
  );
}
