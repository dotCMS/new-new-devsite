import React from 'react';

function ListingContentlets({ Card, contentlets = [] }) {
    return (
        // TODO: Fix the grid classes
        <ul className={'grid w-full grid-cols-cards gap-x-6 gap-y-12 sm:grid-cols-cards-lg'}>
            {contentlets.map((contentlet, i) => (
                <li
                    className={'flex size-full flex-1 cursor-pointer flex-col'}
                    key={contentlet.title + i}>
                    <Card contentlet={contentlet} />
                </li>
            ))}
        </ul>
    );
}

export default ListingContentlets;
