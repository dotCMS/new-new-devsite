import ContactOptions from './contactOptions';

function ContactInfo({ contactBlocks }) {
    return (
        <ul className="md-px-16 flex flex-wrap gap-x-[6.3125rem] gap-y-12 bg-blue-700 px-5 py-12 md:py-16 lg:px-[7.75rem] lg:pb-6 lg:pt-[3.8125rem]">
            {contactBlocks.map((block) => (
                <li key={block.heading}>
                    <article
                        className="m-h flex max-w-60 flex-col gap-4 whitespace-pre-wrap text-white"
                        role="group"
                        aria-roledescription="Heading group">
                        <h6>{block.heading}</h6>
                        <ul className="flex flex-col gap-5 text-sm font-normal">
                            {block.data.map((data, i) => {
                                const ContactOption = ContactOptions[data.type];
                                return (
                                    <li key={i}>
                                        <ContactOption key={i} {...data} />
                                    </li>
                                );
                            })}
                        </ul>
                    </article>
                </li>
            ))}
        </ul>
    );
}

export default ContactInfo;
