import Link from "next/link";

import { decode } from "html-entities";

import { BlockEditorRenderer } from "@dotcms/react";
import LinkCards from "../content-types/link-cards";
import TestComponent from "../content-types/TestComponent";
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
      <Link {...attrs} href={href || "/"}>
        {children}
      </Link>
    );
  }

  return (
    <a {...attrs} href={href}>
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



const defaultRenderers = {
    DocumentationLinks:LinkCards,
    CardContent:TestComponent
};




export const DotBlockEditor = ({ customRenderers, ...props }) => {

    const mergedCustomRenderers = {
        ...defaultRenderers,
        ...customRenderers
    };




  return (
    <BlockEditorRenderer
      {...props}
      customRenderers={{
        text: DecodeHTML,
        ...mergedCustomRenderers,
      }}
    />
  );
};
