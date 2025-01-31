/**
 * Checks if a string contains Markdown formatting
 * @param {string} text - The text to check for Markdown formatting
 * @returns {boolean} - True if the text contains Markdown formatting, false otherwise
 */

export function isMarkdown(text) {
  if (!text || typeof text !== 'string') return false;

  // Common Markdown patterns
  const markdownPatterns = [
    // Headers
    /^#{1,6}\s/m,                          // ATX-style headers
    /^[^\n]+\n[=\-]{2,}/m,                // Setext-style headers

    // Emphasis
    /[*_]{1,2}[^*_]+[*_]{1,2}/,           // *italic* or **bold**
    /[~]{2}[^~]+[~]{2}/,                  // ~~strikethrough~~

    // Lists
    /^[\s]*[-+*]\s/m,                     // Unordered lists
    /^[\s]*\d+\.\s/m,                     // Ordered lists

    // Links and Images
    /\[([^\]]+)\]\(([^)]+)\)/,            // [text](url)
    /!\[([^\]]+)\]\(([^)]+)\)/,           // ![alt](image-url)

    // Code
    /`[^`]+`/,                            // Inline code
    /```[\s\S]*?```/,                     // Code blocks
    /~~~[\s\S]*?~~~/,                     // Alternative code blocks

    // Blockquotes
    /^>\s/m,                              // > blockquote

    // Tables
    /\|[^|\n]+\|/m,                       // |table|cells|
    /^[-:|]+$/m,                          // Table separator line

    // HTML tags (common in Markdown)
    /<\/?[a-z0-9]+(?:\s+[^>]*)?>/i,

    // Reference-style links
    /^\[[^\]]+\]:\s+\S+/m,

    // Task lists
    /^[\s]*[-*+]\s+\[[x ]\]/im,           // - [ ] or - [x]

    // Horizontal rules
    /^(?:[-*_]\s*){3,}$/m                 // --- or *** or ___
  ];

  // Return true if any Markdown pattern is found
  return markdownPatterns.some(pattern => pattern.test(text));
}

/**
 * A more strict version that requires multiple Markdown elements to be present
 * This helps reduce false positives for simple text that might contain a single Markdown-like character
 * @param {string} text - The text to check for Markdown formatting
 * @param {number} minPatterns - Minimum number of different Markdown patterns required (default: 2)
 * @returns {boolean} - True if the text contains enough Markdown formatting, false otherwise
 */
export function isMarkdownStrict(text, minPatterns = 2) {
  if (!text || typeof text !== 'string') return false;

  const patterns = [
    { type: 'header', pattern: /^#{1,6}\s/m },
    { type: 'emphasis', pattern: /[*_]{1,2}[^*_]+[*_]{1,2}/ },
    { type: 'link', pattern: /\[([^\]]+)\]\(([^)]+)\)/ },
    { type: 'list', pattern: /^[\s]*[-+*]\d+\.\s/m },
    { type: 'code', pattern: /`[^`]+`|```[\s\S]*?```/ },
    { type: 'blockquote', pattern: /^>\s/m },
    { type: 'table', pattern: /\|[^|\n]+\|/ },
    { type: 'horizontalRule', pattern: /^(?:[-*_]\s*){3,}$/m }
  ];

  const matchedPatterns = patterns.filter(({ pattern }) => pattern.test(text));
  return matchedPatterns.length >= minPatterns;
} 