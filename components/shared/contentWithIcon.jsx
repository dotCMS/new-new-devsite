import Image from 'next/image';

function ContentWithIcon({ icon, children }) {
    return (
        <div className="flex items-center gap-3">
            <Image src={icon} className="size-4" width={16} height={16} alt="Icon" />
            {children}
        </div>
    );
}

export default ContentWithIcon;
