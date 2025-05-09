import Link from 'next/link';


export default function DiscourseLink({position = 'header'}: {readonly position?: 'header' | 'footer'}) {

  return (
    <Link href="https://community.dotcms.com" title="dotCMS Discourse Community" aria-label="dotCMS Discourse Community" prefetch={false} target="_blank" rel="noreferrer" className="pl-[0.4em] md:p-2 text-current">
      <svg fill="currentColor" height={position === 'header' ? "24" : "20"} width={position === 'header' ? "24" : "20"} viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><path d="M12.103 0C18.666 0 24 5.485 24 11.997c0 6.51-5.33 11.99-11.9 11.99L0 24V11.79C0 5.28 5.532 0 12.103 0zm.116 4.563a7.395 7.395 0 0 0-6.337 3.57 7.247 7.247 0 0 0-.148 7.22L4.4 19.61l4.794-1.074a7.424 7.424 0 0 0 8.136-1.39 7.256 7.256 0 0 0 1.737-7.997 7.375 7.375 0 0 0-6.84-4.585h-.008z"/></svg>
      <span className="sr-only">dotCMS Discourse Community</span>
    </Link>
  );
};
