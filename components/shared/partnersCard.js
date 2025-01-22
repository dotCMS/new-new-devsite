import Image from 'next/image';
import Link from 'next/link';

export const PartnerCard = ({ contentlet }) => {
    return (
        <Link
            className="relative flex h-[232px] w-full items-center justify-center rounded-lg bg-white transition-shadow duration-300 ease-in-out hover:shadow-lg"
            href={`/partners/${contentlet.urlTitle}`}>
            <Image
                src={contentlet.identifier}
                width={166}
                height={50}
                className="h-1/2 object-contain"
                alt={`Partner ${contentlet.title} logo`}
            />
            {/* Commented for now. Pending marketing team approval */}
            {/* {contentlet.partnerLevel && ( <div className="flex absolute top-4 right-5 gap-2 items-center">
                    <Image
                        loader={PublicImageLoader}
                        src={`/icons/partner-levels/${contentlet.partnerLevel}.svg`}
                        width={22}
                        height={22}
                        objectFit="contain"
                        alt={`Partner ${contentlet.title} level`}
                    />
                    <span className="font-bold uppercase">
                       {contentlet.partnerLevel}
                    </span>
                </div>)} */}
        </Link>
    );
};
