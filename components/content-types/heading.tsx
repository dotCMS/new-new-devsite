interface HeadingProps {
  preheading: string;
  heading: { content: [{ content: [{ text: string }] }] };
  subheading: { content: [{ content: [{ text: string }] }] };
}

export default function Heading(props: HeadingProps) {
    const { preheading, heading, subheading } = props;

    // TODO: heading and subheading should use blockeditor components

    return (
        <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">{preheading}</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{heading.content[0].content[0].text}</h2>
            <p className="text-lg text-muted-foreground">
                {subheading.content[0].content[0].text}
            </p>
        </div>
    )
}

