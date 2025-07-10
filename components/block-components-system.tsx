import React from 'react';
import { visit } from 'unist-util-visit';
import Info from '@/components/mdx/Info';
import Warn from '@/components/mdx/Warn';
//import Note from '@/components/mdx/Note';
import Endpoint from '@/components/mdx/Endpoint';

// Store raw content for block-level components
const rawContentMap = new Map<string, string>();

// Configuration for block-level components
export interface BlockComponentConfig {
  component: React.ComponentType<any>;
  expectsRawContent?: boolean; // Whether the component expects rawContent prop
}

// Define which components should be treated as block-level
export const BLOCK_COMPONENTS: Record<string, BlockComponentConfig> = {
  info: { component: Info, expectsRawContent: true },
  warn: { component: Warn, expectsRawContent: true },
  // note: { component: Note, expectsRawContent: true },
  endpoint: { component: Endpoint, expectsRawContent: false },
  // Add future components here, e.g.:
  // callout: { component: Callout, expectsRawContent: false },
  // video: { component: Video, expectsRawContent: false },
};

// Get list of component names for regex
export const getBlockComponentNames = (): string[] => Object.keys(BLOCK_COMPONENTS);

// Generalized preprocessing to extract block component content
export function extractBlockComponentContent(content: string): string {
  let processed = content;
  const componentNames = getBlockComponentNames();
  
  // Create regex pattern for all block components
  const componentPattern = componentNames.map(name => `${name}|${name.charAt(0).toUpperCase() + name.slice(1)}`).join('|');
  
  // Single regex to handle both self-closing and regular tags in one pass
  const combinedRegex = new RegExp(
    `<(${componentPattern})([^>]*?)(?:\\s*\\/>|>([\\s\\S]*?)<\\/(${componentPattern})>)`,
    'gi'
  );
  
  processed = processed.replace(combinedRegex, (match, openTag, attributes, innerContent, closeTag) => {
    // If closeTag exists, validate that opening and closing tags match
    if (closeTag && openTag.toLowerCase() !== closeTag.toLowerCase()) {
      // Return the original match if tags don't match - don't process as a component
      return match;
    }
    
    const componentName = openTag.toLowerCase();
    const config = BLOCK_COMPONENTS[componentName];
    
    if (config?.expectsRawContent) {
      const id = `${componentName}_${Date.now()}_${Math.random()}`;
      // Use innerContent if it exists (regular tag), otherwise empty string (self-closing tag)
      rawContentMap.set(id, innerContent ? innerContent.trim() : '');
      return `<${componentName} data-content-id="${id}"${attributes}></${componentName}>`;
    } else {
      // For components that don't need raw content, normalize to proper closing tag
      const content = innerContent || '';
      return `<${componentName}${attributes}>${content}</${componentName}>`;
    }
  });
  
  return processed;
}

// Generalized rehype plugin to unwrap block components from paragraphs
export function rehypeUnwrapBlockComponents() {
  return (tree: any) => {
    const componentNames = getBlockComponentNames();
    
    visit(tree, 'element', (node, index, parent) => {
      // Look for paragraphs that contain block components
      if (node.tagName === 'p' && node.children && parent && typeof index === 'number') {
        let hasBlockComponents = false;
        const blockElements: any[] = [];
        const otherContent: any[] = [];

        // Separate block components from other content
        node.children.forEach((child: any) => {
          if (child.type === 'element' && componentNames.includes(child.tagName)) {
            hasBlockComponents = true;
            blockElements.push(child);
          } else if (child.type === 'text' && child.value.trim() === '') {
            // Skip empty text nodes
          } else {
            otherContent.push(child);
          }
        });

        if (hasBlockComponents) {
          const replacements: any[] = [];
          
          // If there's other content, keep it in a paragraph
          if (otherContent.length > 0) {
            replacements.push({
              type: 'element',
              tagName: 'p',
              properties: node.properties,
              children: otherContent
            });
          }
          
          // Add block components as block elements
          replacements.push(...blockElements);
          
          // Replace the original paragraph with the separated elements
          parent.children.splice(index, 1, ...replacements);
          
          // Return the new index to continue processing
          return index + replacements.length - 1;
        }
      }
    });
  };
}

// Generate dynamic component mappings for React Markdown
export const generateBlockComponentMappings = (disableBlockComponents: boolean = false): Record<string, React.ComponentType<any>> => {
  const mappings: Record<string, React.ComponentType<any>> = {};
  
  Object.entries(BLOCK_COMPONENTS).forEach(([name, config]) => {
    mappings[name] = disableBlockComponents 
      ? (() => null) 
      : ({ 'data-content-id': contentId, ...props }: any) => {
          
          if (config.expectsRawContent) {
            const rawContent = contentId ? rawContentMap.get(contentId) : null;
            return React.createElement(config.component, { rawContent, ...props });
          } else {
            return React.createElement(config.component, props);
          }
        };
  });
  
  return mappings;
};

// Clear the raw content map (useful for testing or memory management)
export const clearRawContentMap = (): void => {
  rawContentMap.clear();
};

// Get the current size of the raw content map (useful for debugging)
export const getRawContentMapSize = (): number => {
  return rawContentMap.size;
}; 