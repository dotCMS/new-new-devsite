import React from 'react';
import Image from 'next/image';

function Author({ author }) {
    return (
        <div className="relative mt-auto flex h-12 flex-row gap-3">
            <Image
                src={author?.imageVersion || author?.image}
                alt={author?.name || 'Author image'}
                className="rounded-full"
                width={48}
                height={48}
            />
            <div className="flex flex-col justify-center">
                <p className="text-sm text-blue-700">
                    {author?.firstName} {author?.lastName}
                </p>
                <p className="text-sm text-blue-600">{author?.title}</p>
            </div>
        </div>
    );
}

export default Author;
