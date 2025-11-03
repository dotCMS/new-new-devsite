import Link from "next/link";

import { decode } from "html-entities";
import { BlockEditorRenderer } from "@dotcms/react";
import LinkCards from "../content-types/link-cards";
import { YouTubeEmbed } from "@next/third-parties/google";

/**
 * Renders the text in bold.
 *
 * @param children - The content to be rendered in bold.
 */
const Bold = ({ children }) => <strong>{children}</strong>;

/**
 * Renders the text in italic format.
 *
 * @param children - The content to be rendered in italic.
 */
const Italic = ({ children }) => <em>{children}</em>;

/**
 * Renders a strike-through text.
 *
 * @param children - The content to be rendered within the strike-through element.
 */
const Strike = ({ children }) => <s>{children}</s>;

/**
 * Renders an underline element for the given children.
 *
 * @param children - The content to be underlined.
 */
const Underline = ({ children }) => <u>{children}</u>;

/**
 * Renders a link component.
 *
 * @param children - The content of the link.
 * @param attrs - The attributes to be applied to the link.
 * @returns The rendered link component.
 */
const LinkMark = ({ children, attrs }) => {
  const { href } = attrs;
  const relative = href.startsWith("/") || href.startsWith("..");

  if (relative) {
    // If the URL fails it is likely a relative URL
    return (
      <Link {...attrs} href={href || "/"} className="text-primary-purple hover:opacity-80 underline hover:no-underline">
        {children}
      </Link>
    );
  }

  return (
    <a {...attrs} href={href} className="text-primary-purple hover:opacity-80 underline hover:no-underline">
      {children}
    </a>
  );
};

/**
 * Renders the superscript text.
 *
 * @param children - The content to be rendered as superscript.
 */
const Superscript = ({ children }) => <sup>{children}</sup>;

/**
 * Renders a subscript element.
 *
 * @param children - The content to be rendered as subscript.
 */
const Subscript = ({ children }) => <sub>{children}</sub>;

/**
 * Renders inline code with monospace font and appropriate styling.
 * Uses visual styling rather than backticks to indicate code.
 *
 * @param children - The content to be rendered as inline code.
 */
const InlineCode = ({ children }) => (
  <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm before:content-none after:content-none">
    {children}
  </code>
);

const nodeMarks = {
  link: LinkMark,
  bold: Bold,
  underline: Underline,
  italic: Italic,
  strike: Strike,
  superscript: Superscript,
  subscript: Subscript,
  code: InlineCode,
};

/**
 * Renders a text block with optional marks.
 *
 * @param props - The props for the TextBlock component.
 * @returns The rendered text block.
 */
const TextBlock = (props) => {
  const { marks = [], text } = props;
  const mark = marks[0] || { type: "", attrs: {} };
  const newProps = { ...props, marks: marks.slice(1) };
  const Component = nodeMarks[mark?.type];

  // To avoid the warning: "Warning: Invalid DOM property `class`. Did you mean `className`?"
  if (mark.attrs) {
    mark.attrs.className = mark.attrs.class;
    delete mark.attrs.class;
  }

  if (!Component) {
    return text;
  }

  return (
    <Component attrs={mark.attrs}>
      <TextBlock {...newProps} />
    </Component>
  );
};

export const DecodeHTML = (props) => {
  const { text } = props;

  return <TextBlock {...props} text={decode(text)} />;
};
export const VidContent = (props) => {
  const tags = props?.attrs?.data?.tags?.split(",") ||props?.attrs?.tags?.split(",") ||[];
  const src = props.attrs.src;
  const title = props.attrs.title;
  const width = props.attrs.width;
  const height = props.attrs.height;
  const identifier = props.attrs.data.identifier;
  const controls = !tags.includes("nocontrols");
  const autoPlay = tags.includes("autoplay");
  const loop = tags.includes("loop");
  const muted = tags.includes("muted");
  return <video
    width={width}
    height={height}
    controls={controls}
    autoPlay={autoPlay}
    loop={loop}
    muted={muted}
    playsInline
    title={title}
  >
    <track default="" kind="captions" srcLang="en" />
    {src && (
      <source 
        src={src} 
        type={`video/${src.split('.').pop()}`} 
      />
    )}
    Your browser does not support the video tag.
  </video>;
};

const defaultRenderers = {
    DocumentationLinks: LinkCards,
};

export const DotBlockEditor = ({ customRenderers, ...props }) => {
    const mergedCustomRenderers = {
        ...defaultRenderers,
        ...customRenderers,
    };

    return (
        <BlockEditorRenderer
            {...props}
            customRenderers={{
                youtube: YouTubeEmbed,
                text: DecodeHTML,
                dotVideo: VidContent,
                ...mergedCustomRenderers,  // Move this before any other renderers
            }}
        />
    );
};
