import React from 'react';
import Image from 'next/image';

function SocialMediaShare({ url }) {
    const encodedURL = encodeURI(url);

    const socialMediaArray = [
        {
            socialMedia: 'x',
            url: 'https://twitter.com/intent/tweet?text=' + encodedURL
        },
        {
            socialMedia: 'linkedin',
            url: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodedURL
        },
        {
            socialMedia: 'facebook',
            url: 'https://www.facebook.com/sharer/sharer.php?u=' + encodedURL
        }
    ];

    return (
        <div className="flex gap-4">
            {socialMediaArray.map(({ socialMedia, url }) => (
                <a key={socialMedia} href={url} target="_blank">
                    <Image
                        src={`/assets/icons/social-media/${socialMedia}-icon.svg`}
                        alt={socialMedia}
                        width={32}
                        height={32}
                        className="dark:hidden"
                    />
                    <Image
                        src={`/assets/icons/social-media/${socialMedia}-dark-icon.svg`}
                        alt={socialMedia}
                        width={32}
                        height={32}
                        className="hidden dark:block"
                    />
                </a>
            ))}
        </div>
    );
}

export default SocialMediaShare;
