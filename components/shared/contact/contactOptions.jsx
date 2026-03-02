import Image from 'next/image';
import ContentWithIcon from '../contentWithIcon';

const ContactOptions = {
    phone: ({ phone, label, number }) => (
        <ContentWithIcon icon={'/assets/icons/contact/phone.svg'}>
            <a href={'tel:' + number} aria-label={label ?? number}>
                {phone}
            </a>
        </ContentWithIcon>
    ),
    mail: ({ mail }) => (
        <ContentWithIcon icon={'/assets/icons/contact/mail.svg'}>
            <a href={'mailto:' + mail}>{mail}</a>
        </ContentWithIcon>
    ),
    address: ({ address, icon }) => {
        const isMultiline = address.includes('\n');
        const splittedAddress = address.split('\n');

        return isMultiline ? (
            <adresss className="grid grid-cols-[16px_1fr] items-center gap-x-3">
                <Image
                    src={'/assets/icons/contact/' + icon}
                    className="col-start-1 row-start-1 size-4"
                    width={16}
                    height={16}
                    alt="Icon"
                />

                <p className="col-start-2 row-start-1">{splittedAddress[0]}</p>
                {splittedAddress.slice(1).map((line, i) => (
                    <p key={i} className={'col-start-2 row-start-' + (i + 2)}>
                        {line}
                    </p>
                ))}
            </adresss>
        ) : (
            <ContentWithIcon icon={'/assets/icons/contact/' + icon}>
                <address>{address}</address>
            </ContentWithIcon>
        );
    },
    link: ({ link, icon, label }) => (
        <ContentWithIcon icon={'/assets/icons/contact/' + icon}>
            <a href={link} title={label ?? link} className="font-semibold text-green-700 underline">
                {label ?? link}
            </a>
        </ContentWithIcon>
    )
};

export default ContactOptions;
