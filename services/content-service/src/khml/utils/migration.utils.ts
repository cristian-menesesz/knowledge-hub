/**
 * KHML Migration Utilities
 *
 * Utilities for migrating existing content to KHML format.
 * Supports migration from Markdown, HTML, and plain text.
 */

/**
 * Migrate Markdown to KHML
 *
 * Converts basic Markdown syntax to KHML.
 * Supports:
 * - Headings (# to @h1, ## to @h2, etc.)
 * - Paragraphs
 * - Lists (ordered and unordered)
 * - Code blocks (with language)
 * - Inline formatting (bold, italic, code)
 * - Links and images
 * - Blockquotes (converted to @quote)
 */
export function migrateMarkdownToKHML(markdown: string): string {
  let khml = '@article{\n  @content{\n';
  const lines = markdown.split('\n');
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeContent: string[] = [];
  let inList = false;
  let listType = '';
  let listItems: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        // Starting code block
        inCodeBlock = true;
        codeLanguage = line.substring(3).trim() || 'text';
        codeContent = [];
      } else {
        // Ending code block
        inCodeBlock = false;
        khml += `    @code[lang=${codeLanguage}]{@@@\n${codeContent.join('\n')}\n@@@}\n\n`;
        codeContent = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Handle headings
    if (line.startsWith('# ')) {
      if (inList) {
        khml += closeList(listType, listItems);
        inList = false;
      }
      khml += `    @h1{${line.substring(2)}}\n\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) {
        khml += closeList(listType, listItems);
        inList = false;
      }
      khml += `    @h2{${line.substring(3)}}\n\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) {
        khml += closeList(listType, listItems);
        inList = false;
      }
      khml += `    @h3{${line.substring(4)}}\n\n`;
      continue;
    }
    if (line.startsWith('#### ')) {
      if (inList) {
        khml += closeList(listType, listItems);
        inList = false;
      }
      khml += `    @h4{${line.substring(5)}}\n\n`;
      continue;
    }

    // Handle unordered lists
    if (line.match(/^[-*+]\s+/)) {
      const itemContent = line.replace(/^[-*+]\s+/, '');
      if (!inList) {
        inList = true;
        listType = 'ul';
        listItems = [];
      }
      listItems.push(itemContent);
      continue;
    }

    // Handle ordered lists
    if (line.match(/^\d+\.\s+/)) {
      const itemContent = line.replace(/^\d+\.\s+/, '');
      if (!inList) {
        inList = true;
        listType = 'ol';
        listItems = [];
      }
      listItems.push(itemContent);
      continue;
    }

    // Handle blockquotes
    if (line.startsWith('> ')) {
      if (inList) {
        khml += closeList(listType, listItems);
        inList = false;
      }
      khml += `    @quote{${line.substring(2)}}\n\n`;
      continue;
    }

    // Handle horizontal rules
    if (line.match(/^[-*_]{3,}$/)) {
      if (inList) {
        khml += closeList(listType, listItems);
        inList = false;
      }
      continue; // Skip horizontal rules (no direct KHML equivalent)
    }

    // Handle empty lines
    if (line.trim() === '') {
      if (inList) {
        khml += closeList(listType, listItems);
        inList = false;
      }
      continue;
    }

    // Handle regular paragraphs
    if (inList) {
      khml += closeList(listType, listItems);
      inList = false;
    }
    const convertedLine = convertInlineMarkdown(line);
    khml += `    @paragraph{${convertedLine}}\n\n`;
  }

  // Close any open list
  if (inList) {
    khml += closeList(listType, listItems);
  }

  khml += '  }\n}';
  return khml;
}

/**
 * Close list and return KHML
 */
function closeList(type: string, items: string[]): string {
  if (items.length === 0) return '';

  const listTag = type === 'ul' ? 'ul' : 'ol';
  let khml = `    @${listTag}{\n`;

  for (const item of items) {
    const convertedItem = convertInlineMarkdown(item);
    khml += `      @li{${convertedItem}}\n`;
  }

  khml += '    }\n\n';
  return khml;
}

/**
 * Convert inline Markdown formatting to KHML
 */
function convertInlineMarkdown(text: string): string {
  // Bold: **text** or __text__ → **text** (KHML uses same)
  // Already compatible, no change needed

  // Italic: *text* or _text_ → *text* (KHML uses same)
  // Already compatible, no change needed

  // Inline code: `code` → `code` (KHML uses same)
  // Already compatible, no change needed

  // Links: [text](url) → Keep as is for now (KHML inline format)
  // Images: ![alt](url) → Keep as is for now

  return text;
}

/**
 * Migrate HTML to KHML
 *
 * Converts basic HTML to KHML.
 * Note: This is a simplified converter. Complex HTML will require manual review.
 */
export function migrateHTMLToKHML(html: string): string {
  let khml = '@article{\n  @content{\n';

  // Remove HTML comments
  const processedHtml = html.replace(/<!--[\s\S]*?-->/g, '');

  // Convert headings
  processedHtml.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (_, content) => {
    khml += `    @h1{${stripHtmlTags(content)}}\n\n`;
    return '';
  });
  processedHtml.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_, content) => {
    khml += `    @h2{${stripHtmlTags(content)}}\n\n`;
    return '';
  });
  processedHtml.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_, content) => {
    khml += `    @h3{${stripHtmlTags(content)}}\n\n`;
    return '';
  });

  // Convert paragraphs
  processedHtml.replace(/<p[^>]*>(.*?)<\/p>/gi, (_, content) => {
    const text = convertInlineHtml(stripHtmlTags(content));
    khml += `    @paragraph{${text}}\n\n`;
    return '';
  });

  // Convert code blocks
  processedHtml.replace(
    /<pre[^>]*><code[^>]*class="language-(\w+)"[^>]*>(.*?)<\/code><\/pre>/gis,
    (_, lang, content) => {
      khml += `    @code[lang=${lang}]{@@@\n${stripHtmlTags(content)}\n@@@}\n\n`;
      return '';
    },
  );

  // Convert lists
  processedHtml.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    khml += '    @ul{\n';
    items.forEach((item: string) => {
      const text = item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1');
      khml += `      @li{${stripHtmlTags(text)}}\n`;
    });
    khml += '    }\n\n';
    return '';
  });

  processedHtml.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    khml += '    @ol{\n';
    items.forEach((item: string) => {
      const text = item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1');
      khml += `      @li{${stripHtmlTags(text)}}\n`;
    });
    khml += '    }\n\n';
    return '';
  });

  khml += '  }\n}';
  return khml;
}

/**
 * Strip HTML tags from text
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Convert inline HTML to KHML inline formatting
 */
function convertInlineHtml(text: string): string {
  // Bold: <strong> or <b> → **text**
  text = text.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, '**$2**');

  // Italic: <em> or <i> → *text*
  text = text.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, '*$2*');

  // Inline code: <code> → `text`
  text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Underline: <u> → __text__
  text = text.replace(/<u[^>]*>(.*?)<\/u>/gi, '__$1__');

  // Strikethrough: <del> or <s> → ~~text~~
  text = text.replace(/<(del|s)[^>]*>(.*?)<\/(del|s)>/gi, '~~$2~~');

  return text;
}

/**
 * Migrate plain text to KHML
 *
 * Converts plain text with minimal structure to KHML.
 * Attempts to detect headings and paragraphs based on formatting.
 */
export function migratePlainTextToKHML(text: string): string {
  let khml = '@article{\n  @content{\n';
  const lines = text.split('\n');
  let currentParagraph: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line - end current paragraph
    if (trimmed === '') {
      if (currentParagraph.length > 0) {
        khml += `    @paragraph{${currentParagraph.join(' ')}}\n\n`;
        currentParagraph = [];
      }
      continue;
    }

    // Detect potential headings (all caps, short lines)
    if (trimmed.length < 80 && trimmed === trimmed.toUpperCase() && /^[A-Z\s]+$/.test(trimmed)) {
      if (currentParagraph.length > 0) {
        khml += `    @paragraph{${currentParagraph.join(' ')}}\n\n`;
        currentParagraph = [];
      }
      khml += `    @h2{${trimmed}}\n\n`;
      continue;
    }

    // Add to current paragraph
    currentParagraph.push(trimmed);
  }

  // Close last paragraph
  if (currentParagraph.length > 0) {
    khml += `    @paragraph{${currentParagraph.join(' ')}}\n\n`;
  }

  khml += '  }\n}';
  return khml;
}

/**
 * Batch migration utility
 *
 * Migrate multiple documents at once.
 */
export interface MigrationResult {
  success: boolean;
  khml?: string;
  error?: string;
  warnings?: string[];
}

export function batchMigrate(
  documents: Array<{ id: string; content: string; format: 'markdown' | 'html' | 'text' }>,
): Record<string, MigrationResult> {
  const results: Record<string, MigrationResult> = {};

  for (const doc of documents) {
    try {
      let khml: string;
      const warnings: string[] = [];

      switch (doc.format) {
        case 'markdown':
          khml = migrateMarkdownToKHML(doc.content);
          break;
        case 'html':
          khml = migrateHTMLToKHML(doc.content);
          warnings.push('HTML conversion may require manual review for complex structures');
          break;
        case 'text':
          khml = migratePlainTextToKHML(doc.content);
          warnings.push('Plain text conversion uses heuristics - manual review recommended');
          break;
        default:
          throw new Error(`Unsupported format: ${doc.format}`);
      }

      results[doc.id] = {
        success: true,
        khml,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      results[doc.id] = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return results;
}

/**
 * Validate migrated KHML
 *
 * Basic validation of migrated KHML to catch common issues.
 */
export function validateMigratedKHML(khml: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for @article wrapper
  if (!khml.includes('@article{')) {
    issues.push('Missing @article wrapper');
  }

  // Check for @content section
  if (!khml.includes('@content{')) {
    issues.push('Missing @content section');
  }

  // Check for matching braces
  const openBraces = (khml.match(/{/g) || []).length;
  const closeBraces = (khml.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`);
  }

  // Check for empty blocks
  if (khml.match(/@\w+\{\s*\}/)) {
    issues.push('Contains empty blocks (may be intentional)');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
