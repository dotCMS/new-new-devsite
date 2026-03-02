import Image from 'next/image';

/**
 * dotCMS Image for card component
 * If there is no image, it will show a placeholder
 *
 * @param {*} { src, alt, placeholderFontSize}
 * @return {*}
 */
export const DotCardImage = ({ src, alt, placeholderFontSize }) => {
    return (
        <>
            {src ? (
                <Image
                    src={src}
                    className="object-cover"
                    alt={alt || 'dotCMS Site Image'}
                    fill={true}
                />
            ) : (
                <ImagePlacerholder placeholderFontSize={placeholderFontSize} />
            )}
        </>
    );
};

/**
 *
 *
 * @param {*} { placeholderFontSize }
 * @return {*}
 */
export const ImagePlacerholder = ({ placeholderFontSize = '' }) => {
    return (
        <div className="flex size-full items-center justify-center bg-gradient-to-r from-fuschia-500 via-fuschia-700 to-fuschia-800 text-white">
            <span className="text-5xl" style={{ fontSize: placeholderFontSize }}>
                dotCMS
            </span>
        </div>
    );
};
