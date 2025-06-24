import React from 'react'

import CodeHighlighter from './CodeHighlighter'

interface CodeHighlighterProps {
  node?: any
  className?: string
  children?: React.ReactNode
  [key: string]: any
}

const extractedText = (node: any): string => {
    if(node === null) { 
        return '';
    }
    if (typeof node === 'string') {
        return node;
    }
    if(Array.isArray(node)) {
        return node.map(extractedText).join('');
    }
    if(typeof node === 'object') {
        if (node.children) {
            return node.children.map(extractedText).join('');
        }
        if (node.props) {
            return extractedText(node.props);
        }
        if (node.content) {
            return node.content.map(extractedText).join('');
        }
        if (node.text) {
            return node.text;
        }
    }
    return '';
}



const CodeHighlighterBlockEditor: React.FC<CodeHighlighterProps> = ({ 
  node, 
  className, 
  children, 
  ...props 
}) => {

    const text = extractedText(children);


    return (<>
        <CodeHighlighter node={node} className={className}  {...props} >
        {text}
        </CodeHighlighter>
        </>
    )
}

export default CodeHighlighterBlockEditor
