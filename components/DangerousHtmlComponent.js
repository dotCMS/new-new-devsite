import '@/styles/unset.css';




export default function DangerousHtmlComponent({ content, classNames="raw-html" }) {
    return <div className={classNames} dangerouslySetInnerHTML={{ __html: content }}></div>
}