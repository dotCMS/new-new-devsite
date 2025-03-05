import Link from 'next/link';


export default function DiscourseLink({position = 'header'}: {readonly position?: 'header' | 'footer'}) {
  // Replaced #231f20 with currentColor in SVG to make it theme aware
  return (
    <Link href="https://community.dotcms.com" target="_blank" rel="noreferrer" className="pl-[0.4em] md:p-2 text-current">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -1 106 106" height={position === 'header' ? "24" : "20"} width={position === 'header' ? "24" : "20"}>
        <path fill="currentColor" d="M51.87 0C23.71 0 0 22.83 0 51v52.81l51.86-.05c28.16 0 51-23.71 51-51.87S80 0 51.87 0Z"/>
        <path fill="#fff9ae" d="M52.37 19.74a31.62 31.62 0 0 0-27.79 46.67l-5.72 18.4 20.54-4.64a31.61 31.61 0 1 0 13-60.43Z"/>
        <path fill="#00aeef" d="M77.45 32.12a31.6 31.6 0 0 1-38.05 48l-20.54 4.7 20.91-2.47a31.6 31.6 0 0 0 37.68-50.23Z"/>
        <path fill="#00a94f" d="M71.63 26.29A31.6 31.6 0 0 1 38.8 78l-19.94 6.82 20.54-4.65a31.6 31.6 0 0 0 32.23-53.88Z"/>
        <path fill="#f15d22" d="M26.47 67.11a31.61 31.61 0 0 1 51-35 31.61 31.61 0 0 0-52.89 34.3l-5.72 18.4Z"/>
        <path fill="#e31b23" d="M24.58 66.41a31.61 31.61 0 0 1 47.05-40.12 31.61 31.61 0 0 0-49 39.63l-3.76 18.9Z"/>
        <title>dotCMS Discourse Community</title>
      </svg>
      <span className="sr-only">dotCMS Discourse Community</span>
    </Link>
  );
};
