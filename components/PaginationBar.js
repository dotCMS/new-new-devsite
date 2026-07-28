import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

/**
 * @param {{
 *   pagination: any,
 *   additionalQueryParams?: string,
 *   onPageChange?: (page: number) => void,
 * }} props
 */
export default function PaginationBar({
    pagination,
    additionalQueryParams,
    onPageChange,
}) {
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
    const useClientPaging = typeof onPageChange === "function";

    const goTo = (nextPage) => {
        if (!useClientPaging) return;
        onPageChange(nextPage);
    };

    const pageHref = (nextPage) =>
        useClientPaging ? "#" : `?page=${nextPage}${finalAdditionalQueryParams}`;

    return (

        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={pageHref(currentPage - 1)}
                        onClick={useClientPaging ? (e) => {
                            e.preventDefault();
                            if (hasPreviousPage) goTo(currentPage - 1);
                        } : undefined}
                        aria-disabled={!hasPreviousPage}
                        className={!hasPreviousPage ? 'pointer-events-none opacity-50' : useClientPaging ? 'cursor-pointer' : ''}
                    />
                </PaginationItem>

                {startPage > 1 && (
                    <>
                        <PaginationItem>
                            <PaginationLink
                                href={pageHref(1)}
                                onClick={useClientPaging ? (e) => {
                                    e.preventDefault();
                                    goTo(1);
                                } : undefined}
                                className={useClientPaging ? 'cursor-pointer' : undefined}
                            >
                                1
                            </PaginationLink>
                        </PaginationItem>
                        {startPage > 2 && (
                            <PaginationItem>
                                <span className="flex h-9 w-9 items-center justify-center">...</span>
                            </PaginationItem>
                        )}
                    </>
                )}

                {pages.map((pageNum) => (
                    <PaginationItem key={pageNum}>
                        <PaginationLink
                            href={pageHref(pageNum)}
                            onClick={useClientPaging ? (e) => {
                                e.preventDefault();
                                goTo(pageNum);
                            } : undefined}
                            isActive={pageNum === currentPage}
                            className={useClientPaging ? 'cursor-pointer' : undefined}
                        >
                            {pageNum}
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
                            <PaginationLink
                                href={pageHref(totalPages)}
                                onClick={useClientPaging ? (e) => {
                                    e.preventDefault();
                                    goTo(totalPages);
                                } : undefined}
                                className={useClientPaging ? 'cursor-pointer' : undefined}
                            >
                                {totalPages}
                            </PaginationLink>
                        </PaginationItem>
                    </>
                )}

                <PaginationItem>
                    <PaginationNext
                        href={pageHref(currentPage + 1)}
                        onClick={useClientPaging ? (e) => {
                            e.preventDefault();
                            if (hasNextPage) goTo(currentPage + 1);
                        } : undefined}
                        aria-disabled={!hasNextPage}
                        className={!hasNextPage ? 'pointer-events-none opacity-50' : useClientPaging ? 'cursor-pointer' : ''}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>



    )
}
