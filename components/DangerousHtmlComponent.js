import '@/styles/unset.css';




export default function DangerousHtmlComponent({ content, resetClassName="raw-html", className="" }) {
    return <div className={className + " " + resetClassName} dangerouslySetInnerHTML={{ __html: content }}></div>
}