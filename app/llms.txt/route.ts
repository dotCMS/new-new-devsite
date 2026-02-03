import { getNavSections } from "@/services/docs/getNavSections";
import { Config } from "@/util/config";
import { type NavItem, type NavSection } from "@/util/navTransform";

function escapeMarkdownTitle(title: string): string {
  return title.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

function buildFullUrl(href: string, baseUrl: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }
  return new URL(href, baseUrl).href;
}

function generateLlmTxt(sections: NavSection[], baseUrl: string): string {
  const lines: string[] = [];

  lines.push('# dotCMS Documentation');
  lines.push('');
  lines.push(`@base-url: ${baseUrl}`);
  lines.push('');

  function processItems(items: NavItem[], depth: number = 0): void {
    for (const item of items) {
      const indent = '  '.repeat(depth);
      const hasChildren = item.items && item.items.length > 0;

      if (item.href === '#' || !item.href) {
        if (hasChildren && item.items) {
          if (depth === 0) {
            if (lines.length > 0 && lines[lines.length - 1] !== '') {
              lines.push('');
            }
            lines.push(`- ${escapeMarkdownTitle(item.title)}`);
          } else {
            lines.push(`${indent}- ${escapeMarkdownTitle(item.title)}`);
          }
          processItems(item.items, depth + 1);
        }
      } else {
        const fullUrl = buildFullUrl(item.href, baseUrl);
        const safeTitle = escapeMarkdownTitle(item.title);
        
        lines.push(`${indent}- [${safeTitle}](${fullUrl})`);

        if (hasChildren && item.items) {
          processItems(item.items, depth + 1);
        }
      }
    }
  }

  // Process each section (skip empty sections)
  for (const section of sections) {
    if (!section.items || section.items.length === 0) {
      continue;
    }
    
    if (lines.length > 0 && lines[lines.length - 1] !== '') {
      lines.push('');
    }
    lines.push(`- ${escapeMarkdownTitle(section.title)}`);
    processItems(section.items, 1);
  }

  return lines.join('\n');
}

export async function GET() {
  try {
    const sections = await getNavSections({
      path: '/docs/nav',
      depth: 4,
      languageId: 1
    });
    
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      throw new Error("Failed to retrieve navigation sections: invalid or empty response.");
    }

    const markdown = generateLlmTxt(sections, Config.CDNHost);

    return new Response(markdown, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=604800",
      },
    });
  } catch (error) {
    console.error("Error generating llms.txt:", error);
    return new Response(
      `Error generating llms.txt: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      }
    );
  }
}

