/**
 * Utility functions for processing and formatting markdown content
 * Used by Info and Warn components to extract and format content
 */

/**
 * Extracts text and fixes markdown formatting issues
 * @param node The node to extract text from
 * @returns Properly formatted markdown string
 */
export function extractTextAndFixMarkdown(node: any): string {
  // For already structured content, preserve the structure
  if (node && node.children && Array.isArray(node.children)) {
    // If this is a complex node with HTML elements already processed by MDX,
    // we need to handle it differently than raw text
    return processComplexNodeStructure(node);
  }
  
  // Fall back to simple text extraction for flat structures
  const text = getText(node);
  
  // Now fix common markdown formatting issues:
  
  // Fix headers: Sometimes ## headers get converted to just "header"
  let formattedText = text.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');
  
  return formattedText;
}

/**
 * Processes a complex node structure with nested elements
 * @param node The complex node structure to process
 * @returns HTML/Markdown string representation
 */
function processComplexNodeStructure(node: any): string {
  if (!node || !node.children || !Array.isArray(node.children)) {
    return '';
  }
  
  // Process each child based on its type
  return node.children.map((child: any) => {
    // Plain text nodes
    if (child.type === 'text') {
      // If it's a text node with raw markdown, process and return it
      if (child.value) {
        // Fix only headers in raw text, don't try to add bullets
        return child.value.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');
      }
      return '';
    }
    
    // Already structured elements
    if (child.type === 'element') {
      // If it's a heading, paragraph, list, etc. - preserve it
      switch (child.tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          // For headings, ensure they're properly formatted
          return `${'#'.repeat(parseInt(child.tagName.substring(1)))} ${getTextFromChildren(child.children)}`;
          
        case 'p':
          // For paragraphs, just extract the text content
          return getTextFromChildren(child.children);
          
        case 'ul':
          // For lists, process each list item
          return processListItems(child.children);
          
        case 'li':
          // For list items, add a bullet
          return `* ${getTextFromChildren(child.children)}`;
          
        default:
          // For other elements, recursively process
          if (child.children && Array.isArray(child.children)) {
            return processComplexNodeStructure(child);
          }
          return '';
      }
    }
    
    // Handle recursively for nested structures
    if (child.children && Array.isArray(child.children)) {
      return processComplexNodeStructure(child);
    }
    
    return '';
  }).join('\n');
}

/**
 * Extract text from an array of children nodes
 */
function getTextFromChildren(children: any[]): string {
  if (!children || !Array.isArray(children)) {
    return '';
  }
  
  return children.map((child: any) => {
    if (child.type === 'text') {
      return child.value || '';
    }
    if (child.children) {
      return getTextFromChildren(child.children);
    }
    return '';
  }).join('');
}

/**
 * Process list items to ensure proper bullet formatting
 */
function processListItems(items: any[]): string {
  if (!items || !Array.isArray(items)) {
    return '';
  }
  
  return items.map((item: any) => {
    if (item.type === 'element' && item.tagName === 'li') {
      return `* ${getTextFromChildren(item.children)}`;
    }
    return '';
  }).join('\n');
}

/**
 * Extracts text from any node structure
 * @param node The node to extract text from
 * @returns Plain text content
 */
export function getText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.value) return node.value;
  
  if (node.children) {
    if (typeof node.children === 'string') return node.children;
    if (Array.isArray(node.children)) {
      return node.children.map(getText).join('\n');
    }
  }
  return '';
}

/**
 * Processes markdown content from node or props
 * @param node Node from MDX parsing
 * @param props Component props
 * @returns Processed content string
 */
export function processMarkdownContent(node: any, props: any): string {
  let content = '';
  
  // Try to get the raw string content in various ways
  if (typeof props.children === 'string') {
    content = props.children;
  } else if (node) {
    if (typeof node === 'string') {
      content = node;
    } else if (node.value) {
      content = node.value;
    } else if (node.children) {
      if (typeof node.children === 'string') {
        content = node.children;
      } else if (Array.isArray(node.children) && node.children.length > 0) {
        // Get the raw text and try to restore markdown syntax
        content = extractTextAndFixMarkdown(node);
      }
    }
  } else if (props.children) {
    // If props.children is not a string but exists, try to get its content
    content = String(props.children);
  }
  
  return content;
} 