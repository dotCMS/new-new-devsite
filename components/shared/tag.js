import React from 'react';
import Link from 'next/link';

function Tag({
    fontColor = 'text-fuschia-800',
    bgColor = 'bg-fuschia-100',
    children,
    hrefMode,
    text
}) {
    const style = `${fontColor} ${bgColor} flex w-fit items-center justify-center rounded-full`;
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
