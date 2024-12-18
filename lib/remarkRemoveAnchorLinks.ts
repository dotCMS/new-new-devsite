import { visit } from 'unist-util-visit'

export function remarkRemoveAnchorLinks() {
  return (tree: any) => {
    visit(tree, 'heading', (node) => {
      if (node.children && node.children.length > 0) {
        const lastChild = node.children[node.children.length - 1]
        if (lastChild.type === 'text' && lastChild.value.includes('{#')) {
          lastChild.value = lastChild.value.replace(/ \{#[\w-]+\}$/, '')
        }
      }
    })
  }
}

