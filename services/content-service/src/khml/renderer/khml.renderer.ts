import {
  Block,
  BlockType,
  ParagraphBlock,
  HeadingBlock,
  CodeBlock,
  QuoteBlock,
  DefinitionBlock,
  ImageBlock,
  InlineFormat,
  InlineType,
  KHMLDocument,
} from '../types/khml.types';

/**
 * KHML Renderer - Converts KHML blocks to HTML
 */
export class KHMLRenderer {
  private options: RendererOptions;

  constructor(options: Partial<RendererOptions> = {}) {
    this.options = {
      syntaxHighlighter: options.syntaxHighlighter || 'prism',
      mathRenderer: options.mathRenderer || 'katex',
      sanitize: options.sanitize ?? true,
      classPrefix: options.classPrefix || 'khml-',
      ...options,
    };
  }

  /**
   * Render KHML document to HTML
   */
  public render(document: KHMLDocument): string {
    let html = '<article class="khml-document">\n';

    for (const block of document.blocks) {
      html += this.renderBlock(block);
      html += '\n';
    }

    html += '</article>';

    return html;
  }

  /**
   * Render a single block
   */
  public renderBlock(block: Block): string {
    switch (block.type) {
      case BlockType.PARAGRAPH:
        return this.renderParagraph(block as ParagraphBlock);
      case BlockType.HEADING:
        return this.renderHeading(block as HeadingBlock);
      case BlockType.CODE:
      case BlockType.EXEC:
        return this.renderCode(block as CodeBlock);
      case BlockType.QUOTE:
        return this.renderQuote(block as QuoteBlock);
      case BlockType.DEFINITION:
        return this.renderDefinition(block as DefinitionBlock);
      case BlockType.IMAGE:
        return this.renderImage(block as ImageBlock);
      case BlockType.NOTE:
      case BlockType.WARNING:
      case BlockType.TIP:
      case BlockType.DANGER:
      case BlockType.INFO:
        return this.renderAdmonition(block);
      case BlockType.UNORDERED_LIST:
        return this.renderList(block, 'ul');
      case BlockType.ORDERED_LIST:
        return this.renderList(block, 'ol');
      case BlockType.TABLE:
        return this.renderTable(block);
      case BlockType.TABS:
        return this.renderTabs(block);
      default:
        return this.renderGeneric(block);
    }
  }

  private renderParagraph(block: ParagraphBlock): string {
    const content = this.applyInlineFormatting(block.content, block.formatting || []);
    return `<p class="${this.options.classPrefix}paragraph" data-block-id="${block.id}">${content}</p>`;
  }

  private renderHeading(block: HeadingBlock): string {
    const tag = `h${block.level}`;
    const anchor = block.anchor || this.generateAnchor(block.content);
    return `<${tag} id="${anchor}" class="${this.options.classPrefix}heading ${this.options.classPrefix}h${block.level}" data-block-id="${block.id}">${this.escapeHtml(block.content)}</${tag}>`;
  }

  private renderCode(block: CodeBlock): string {
    const language = block.language || 'text';
    const codeClass = `language-${language}`;
    const showLineNumbers = block.showLineNumbers ?? true;

    let html = `<div class="${this.options.classPrefix}code-block" data-block-id="${block.id}">`;

    if (block.title) {
      html += `<div class="${this.options.classPrefix}code-title">${this.escapeHtml(block.title)}</div>`;
    }

    html += '<pre';
    if (showLineNumbers) {
      html += ' class="line-numbers"';
    }
    html += '>';
    html += `<code class="${codeClass}">${this.escapeHtml(block.code)}</code>`;
    html += '</pre>';

    html += '</div>';

    return html;
  }

  private renderQuote(block: QuoteBlock): string {
    let html = `<blockquote class="${this.options.classPrefix}quote" data-block-id="${block.id}">`;
    html += `<p>${this.escapeHtml(block.text)}</p>`;

    if (block.author || block.source) {
      html += '<footer>';
      if (block.author) {
        html += `<cite>${this.escapeHtml(block.author)}</cite>`;
      }
      if (block.source) {
        html += `, <span class="${this.options.classPrefix}quote-source">${this.escapeHtml(block.source)}</span>`;
      }
      html += '</footer>';
    }

    html += '</blockquote>';
    return html;
  }

  private renderDefinition(block: DefinitionBlock): string {
    let html = `<div class="${this.options.classPrefix}definition ${this.options.classPrefix}definition-${block.definitionType}" data-block-id="${block.id}">`;
    html += `<dt class="${this.options.classPrefix}definition-term">${this.escapeHtml(block.term)}</dt>`;
    html += `<dd class="${this.options.classPrefix}definition-content">${this.escapeHtml(block.content)}</dd>`;

    if (block.examples && block.examples.length > 0) {
      html += `<div class="${this.options.classPrefix}definition-examples">`;
      html += '<strong>Examples:</strong>';
      html += '<ul>';
      for (const example of block.examples) {
        html += `<li>${this.escapeHtml(example)}</li>`;
      }
      html += '</ul>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  private renderImage(block: ImageBlock): string {
    const align = block.align || 'center';
    let html = `<figure class="${this.options.classPrefix}image ${this.options.classPrefix}image-${align}" data-block-id="${block.id}">`;

    html += '<img';
    html += ` src="${this.escapeHtml(block.src)}"`;
    html += ` alt="${this.escapeHtml(block.alt)}"`;

    if (block.width) {
      html += ` width="${block.width}"`;
    }
    if (block.height) {
      html += ` height="${block.height}"`;
    }

    html += ' />';

    if (block.caption) {
      html += `<figcaption>${this.escapeHtml(block.caption)}</figcaption>`;
    }

    html += '</figure>';
    return html;
  }

  private renderAdmonition(block: Block): string {
    const type = block.type.toString();
    const title = block.attributes.title as string | undefined;

    let html = `<div class="${this.options.classPrefix}admonition ${this.options.classPrefix}admonition-${type}" data-block-id="${block.id}" role="alert">`;

    html += `<div class="${this.options.classPrefix}admonition-icon">`;
    html += this.getAdmonitionIcon(type);
    html += '</div>';

    html += `<div class="${this.options.classPrefix}admonition-content">`;

    if (title) {
      html += `<div class="${this.options.classPrefix}admonition-title">${this.escapeHtml(title)}</div>`;
    }

    const content = typeof block.content === 'string' ? block.content : '';
    html += `<div class="${this.options.classPrefix}admonition-body">${this.escapeHtml(content)}</div>`;

    html += '</div>';
    html += '</div>';

    return html;
  }

  private renderList(block: Block, tag: 'ul' | 'ol'): string {
    let html = `<${tag} class="${this.options.classPrefix}list" data-block-id="${block.id}">`;

    const items = Array.isArray(block.content) ? block.content : [];
    for (const item of items) {
      html += this.renderBlock(item);
    }

    html += `</${tag}>`;
    return html;
  }

  private renderTable(block: Block): string {
    let html = `<div class="${this.options.classPrefix}table-wrapper">`;
    html += `<table class="${this.options.classPrefix}table" data-block-id="${block.id}">`;

    const children = Array.isArray(block.content) ? block.content : [];
    for (const child of children) {
      html += this.renderBlock(child);
    }

    html += '</table>';
    html += '</div>';
    return html;
  }

  private renderTabs(block: Block): string {
    const tabs = Array.isArray(block.content) ? block.content : [];

    let html = `<div class="${this.options.classPrefix}tabs" data-block-id="${block.id}">`;

    // Tab buttons
    html += `<div class="${this.options.classPrefix}tabs-header" role="tablist">`;
    tabs.forEach((tab, index) => {
      const label = (tab.attributes.label as string) || `Tab ${index + 1}`;
      const active = index === 0 ? 'active' : '';
      html += `<button class="${this.options.classPrefix}tab-button ${active}" role="tab" data-tab="${index}">${this.escapeHtml(label)}</button>`;
    });
    html += '</div>';

    // Tab panels
    html += `<div class="${this.options.classPrefix}tabs-content">`;
    tabs.forEach((tab, index) => {
      const active = index === 0 ? 'active' : '';
      html += `<div class="${this.options.classPrefix}tab-panel ${active}" role="tabpanel" data-panel="${index}">`;

      const content = Array.isArray(tab.content) ? tab.content : [];
      for (const child of content) {
        html += this.renderBlock(child);
      }

      html += '</div>';
    });
    html += '</div>';

    html += '</div>';
    return html;
  }

  private renderGeneric(block: Block): string {
    const content = typeof block.content === 'string' ? block.content : '';
    return `<div class="${this.options.classPrefix}block ${this.options.classPrefix}${block.type}" data-block-id="${block.id}">${this.escapeHtml(content)}</div>`;
  }

  private applyInlineFormatting(text: string, formats: InlineFormat[]): string {
    if (formats.length === 0) {
      return this.escapeHtml(text);
    }

    // Sort formats by start position
    const sorted = [...formats].sort((a, b) => a.start - b.start);

    let result = '';
    let lastEnd = 0;

    for (const format of sorted) {
      // Add text before this format
      result += this.escapeHtml(text.substring(lastEnd, format.start));

      // Add formatted text
      const content = text.substring(format.start, format.end);
      result += this.wrapInlineFormat(content, format.type);

      lastEnd = format.end;
    }

    // Add remaining text
    result += this.escapeHtml(text.substring(lastEnd));

    return result;
  }

  private wrapInlineFormat(text: string, type: InlineType): string {
    // Remove formatting markers from text
    const cleanText = text.replace(/^\*\*|\*\*$|^\*|\*$|^`|`$/g, '');

    switch (type) {
      case InlineType.BOLD:
        return `<strong>${this.escapeHtml(cleanText)}</strong>`;
      case InlineType.ITALIC:
        return `<em>${this.escapeHtml(cleanText)}</em>`;
      case InlineType.CODE:
        return `<code>${this.escapeHtml(cleanText)}</code>`;
      case InlineType.UNDERLINE:
        return `<u>${this.escapeHtml(cleanText)}</u>`;
      case InlineType.STRIKETHROUGH:
        return `<s>${this.escapeHtml(cleanText)}</s>`;
      case InlineType.MARK:
        return `<mark>${this.escapeHtml(cleanText)}</mark>`;
      case InlineType.KBD:
        return `<kbd>${this.escapeHtml(cleanText)}</kbd>`;
      case InlineType.SUPERSCRIPT:
        return `<sup>${this.escapeHtml(cleanText)}</sup>`;
      case InlineType.SUBSCRIPT:
        return `<sub>${this.escapeHtml(cleanText)}</sub>`;
      default:
        return this.escapeHtml(text);
    }
  }

  private getAdmonitionIcon(type: string): string {
    switch (type) {
      case 'note':
        return '📝';
      case 'warning':
        return '⚠️';
      case 'tip':
        return '💡';
      case 'danger':
        return '🚨';
      case 'info':
        return 'ℹ️';
      default:
        return '📌';
    }
  }

  private generateAnchor(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private escapeHtml(text: string): string {
    if (!this.options.sanitize) {
      return text;
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

/**
 * Renderer options
 */
export interface RendererOptions {
  syntaxHighlighter: 'prism' | 'highlight.js' | 'none';
  mathRenderer: 'katex' | 'mathjax' | 'none';
  sanitize: boolean;
  classPrefix: string;
}
