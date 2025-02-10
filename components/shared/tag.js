import React from 'react';
import Link from 'next/link';
import { cn } from "@/util/utils";

function Tag({
    fontColor = 'text-primary',
    bgColor = 'bg-muted',
    children,
    hrefMode,
    text,
    className
}) {
    const baseStyle = "flex w-fit items-center justify-center rounded-full transition-colors hover:bg-muted/80";
    const style = cn(baseStyle, fontColor, bgColor, className);
    const TagContent = <div className={style}>{children}</div>;

    return hrefMode ? (
        <Link className={style} href={text || '/'}>
            {TagContent}
        </Link>
    ) : (
        TagContent
    );
}

export default Tag;
