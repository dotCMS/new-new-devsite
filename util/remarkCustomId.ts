import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

/**
 * A remark plugin that supports custom IDs for headings using {#custom-id} syntax
 * Example: ## My Heading {#my-custom-id}
 */
export const remarkCustomId: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'heading', (node: any) => {
      const lastChild = node.children[node.children.length - 1];
      if (lastChild && lastChild.type === 'text') {
        const match = lastChild.value.match(/ {#([^}]+)}$/);
        if (match) {
          // Remove the {#custom-id} from the text
          lastChild.value = lastChild.value.replace(/ {#([^}]+)}$/, '');
          // Add the custom ID to the node data
          node.data = node.data || {};
          node.data.hProperties = node.data.hProperties || {};
          node.data.hProperties.id = match[1];
        }
      }
    });
  };
}; 