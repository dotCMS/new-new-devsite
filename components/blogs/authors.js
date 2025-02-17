import React from "react";
import Image from "next/image";

function Authors({ authors }) {
  if (authors && authors.length > 0) {
    return (
      <>
        {authors.map((author) => (
          <div className="relative mt-auto flex flex-row gap-2" key={author.identifier}>
            <div className="h-24 w-24 flex items-center justify-center">
              <Image
                src={author?.image.idPath || author?.image}
                alt={
                  author?.firstName
                    ? author?.firstName + " " + author.lastName
                    : "Author image"
                }
                className="rounded-md"
                width={72}
                height={72}
                objectFit="contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              {author?.firstName && (
                <p className="text-sm">
                  {author?.firstName} {author?.lastName}
                </p>
              )}
              <p className="text-sm">
                {author?.title && author?.title + " "}
                 {author?.company && author?.company}
              </p>
            </div>
          </div>
        ))}
        <hr className="border-t border-gray-300 mb-4 mt-2"></hr>
      </>
    );
  }

  return null;
}

export default Authors;
