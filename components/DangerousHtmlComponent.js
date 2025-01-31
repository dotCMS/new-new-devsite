import '@/styles/globals.css';




export default function DangerousHtmlComponent({ content, classNames="raw-html" }) {
    return <div className={classNames} dangerouslySetInnerHTML={{ __html: content }}></div>
}