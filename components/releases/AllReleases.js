"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Breadcrumbs from "../navigation/Breadcrumbs";
import { TableReleases } from "./TableReleases/TableReleases";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { FilterReleases } from "@/services/docs/getReleases/types";

export default function AllReleases({ sideNav, slug }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [version, setVersion] = useState("");
    
    // Get filter from URL or default to ALL
    const currentFilter = searchParams.get("filter");
    const filter = currentFilter === "1" 
        ? FilterReleases.CURRENT 
        : currentFilter === "2" 
            ? FilterReleases.LTS 
            : FilterReleases.ALL;

    // Update version state when URL changes
    useEffect(() => {
        const urlVersion = searchParams.get("version") || "";
        setVersion(urlVersion);
    }, [searchParams]);

    const handleVersionToggle = (newFilter) => {
        const params = new URLSearchParams(searchParams);
        params.set("filter", newFilter.toString());
        params.set("version", version);
        //params.delete("version"); // Clear version when changing filter
        params.set("page", "1"); // Reset to first page
        router.push(`?${params.toString()}`);
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setVersion(value);
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set("version", value);
        } else {
            params.delete("version");
        }
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    return (
        <>
            <div className="max-w-[1400px] mx-auto flex">
                <main className="flex-1 min-w-0 pt-8 px-12
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
                >
                    <Breadcrumbs
                        items={sideNav[0]?.dotcmsdocumentationchildren || []}
                        slug={slug}
                    />

                    <div className="markdown-content">
                        <h1 className="text-4xl font-bold mb-6">All Releases</h1>
                        <div className="flex flex-col gap-4 mb-8">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleVersionToggle(FilterReleases.ALL)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        filter === FilterReleases.ALL
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => handleVersionToggle(FilterReleases.CURRENT)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        filter === FilterReleases.CURRENT
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                    }`}
                                >
                                    Agile
                                </button>
                                <button
                                    onClick={() => handleVersionToggle(FilterReleases.LTS)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        filter === FilterReleases.LTS
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                    }`}
                                >
                                    LTS
                                </button>
                            </div>
                            <div className="relative max-w-sm">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search releases..."
                                    value={version}
                                    onChange={handleSearch}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <TableReleases 
                            showCurrent={false} 
                            version={version}
                            filter={filter}
                            limit={40}
                        />
                    </div>
                </main>
            </div>
        </>
    );
}
