'use client'

import OnThisPage from '../navigation/OnThisPage'
import ChangeLogEntry from './ChangeLogEntry'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { useChangelog } from '@/hooks/useChangelog'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export default function ChangeLogContainer() {
    const searchParams = useSearchParams()
    var currentPage = Number(searchParams.get('page')) || 1
    if (currentPage < 1) {
        currentPage = 1
    }

    const { data, loading, error, hasNextPage, hasPrevPage } = useChangelog(currentPage)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-destructive">
                Error loading changelogs: {error.message}
            </div>
        )
    }

    if (!data?.changelogs || data.changelogs.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
                No changelogs available
            </div>
        )
    }

    // Calculate the range of pages to show
    const MAX_VISIBLE_PAGES = 5
    let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2))
    let endPage = Math.min(data.pagination.totalPages, startPage + MAX_VISIBLE_PAGES - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
        startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1)
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

    return (
        <div className="max-w-[1400px] mx-auto flex">
            <main
                className="flex-1 px-12
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
            >
                <h1 className="text-4xl font-bold mb-6">Changelogs</h1>
                <div className='float-right'>
                    <div className="flex border-0 border-red-500 w-24 pb-4">
                        <div className="flex justify-left border-0 border-green-500">
                            {hasPrevPage && (
                                <a href={`?page=${currentPage - 1}`}>
                                    <ChevronLeft className="h-5 w-5" />
                                </a>
                            )}
                            {!hasPrevPage && (
                                <div className="w-5"></div>

                            )}
                        </div>
                        <div className="flex-grow text-center text-sm">
                            {currentPage} of {data.pagination.totalPages}

                        </div>
                        <div className="flex justify-right w-5 border-0 border-blue-500 text-right flex-end">
                            {hasNextPage && (
                                <a href={`?page=${currentPage + 1}`}>
                                    <ChevronRight className="h-5 w-5 " />
                                </a>
                            )}
                            {!hasNextPage && (
                                <div className="w-5"></div>

                            )}
                        </div>
                    </div>
                </div>



                {data.changelogs.map((item, index) => (
                    <ChangeLogEntry key={item?.identifier || index} item={item} />
                ))}

                <div className="mt-8 mb-12">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={`?page=${currentPage - 1}`}
                                    aria-disabled={!data.pagination.hasPreviousPage}
                                    className={!data.pagination.hasPreviousPage ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>

                            {startPage > 1 && (
                                <>
                                    <PaginationItem>
                                        <PaginationLink href="?page=1">1</PaginationLink>
                                    </PaginationItem>
                                    {startPage > 2 && (
                                        <PaginationItem>
                                            <span className="flex h-9 w-9 items-center justify-center">...</span>
                                        </PaginationItem>
                                    )}
                                </>
                            )}

                            {pages.map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        href={`?page=${page}`}
                                        isActive={page === currentPage}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            {endPage < data.pagination.totalPages && (
                                <>
                                    {endPage < data.pagination.totalPages - 1 && (
                                        <PaginationItem>
                                            <span className="flex h-9 w-9 items-center justify-center">...</span>
                                        </PaginationItem>
                                    )}
                                    <PaginationItem>
                                        <PaginationLink href={`?page=${data.pagination.totalPages}`}>
                                            {data.pagination.totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                </>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    href={`?page=${currentPage + 1}`}
                                    aria-disabled={!data.pagination.hasNextPage}
                                    className={!data.pagination.hasNextPage ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </main>
            <div className="w-64 shrink-0 hidden xl:block">
                <div className="sticky top-16 pt-8 pl-8">

                    <div >
                        <OnThisPage selectors={"main h2"} showOnThisPage={false} />
                    </div>

                </div>
            </div>
        </div>
    )
}
