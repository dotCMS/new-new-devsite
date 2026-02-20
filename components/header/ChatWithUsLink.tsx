import Link from "next/link";

export default function ChatWithUsLink() {
  return (
    <Link
      href="https://www.dotcms.com/contact-us"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      Chat With Us
    </Link>
  );
}
