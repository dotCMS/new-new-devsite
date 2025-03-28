import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";




export default function PaginationBar({ pagination, additionalQueryParams }) {
    // Check if pagination is empty or has only one page
    if (!pagination || Object.keys(pagination).length === 0 || pagination.totalPages <= 1) {
        return null;
    }

    const { page, hasPreviousPage, hasNextPage, totalPages } = pagination;
    const currentPage = page;

    // Calculate the range of pages to show
    const MAX_VISIBLE_PAGES = 5
    let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2))
    let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
        startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1)
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

    const finalAdditionalQueryParams = additionalQueryParams && additionalQueryParams.length > 0 ? additionalQueryParams : "";

    return (

        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={`?page=${currentPage - 1}${finalAdditionalQueryParams}`}
                        aria-disabled={!hasPreviousPage}
                        className={!hasPreviousPage ? 'pointer-events-none opacity-50' : ''}
                    />
                </PaginationItem>

                {startPage > 1 && (
                    <>
                        <PaginationItem>
                            <PaginationLink href={`?page=1${finalAdditionalQueryParams}`}>1</PaginationLink>
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
                            href={`?page=${page}${finalAdditionalQueryParams}`}
                            isActive={page === currentPage}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && (
                            <PaginationItem>
                                <span className="flex h-9 w-9 items-center justify-center">...</span>
                            </PaginationItem>
                        )}
                        <PaginationItem>
                            <PaginationLink href={`?page=${totalPages}${finalAdditionalQueryParams}`}>
                                {totalPages}
                            </PaginationLink>
                        </PaginationItem>
                    </>
                )}

                <PaginationItem>
                    <PaginationNext
                        href={`?page=${currentPage + 1}${finalAdditionalQueryParams}`}
                        aria-disabled={!hasNextPage}
                        className={!hasNextPage ? 'pointer-events-none opacity-50' : ''}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>



    )
}