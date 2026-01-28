import { Injectable, BadRequestException } from '@nestjs/common';
import { KHMLParser } from '../parser/khml.parser';
import { KHMLRenderer } from '../renderer/khml.renderer';
import { KHMLDocument, ParseResult } from '../types/khml.types';

@Injectable()
export class KHMLService {
  private parser: KHMLParser;
  private renderer: KHMLRenderer;

  constructor() {
    this.parser = new KHMLParser();
    this.renderer = new KHMLRenderer({
      syntaxHighlighter: 'prism',
      mathRenderer: 'katex',
      sanitize: true,
      classPrefix: 'khml-',
    });
  }

  /**
   * Parse KHML source to structured JSONB
   */
  parseToJSONB(source: string): KHMLDocument {
    const result: ParseResult = this.parser.parse(source);

    if (!result.success || !result.document) {
      const errorMessages = result.errors
        ?.map((e) => `Line ${e.line}:${e.column} - ${e.message}`)
        .join('\n');

      throw new BadRequestException(`KHML parse errors:\n${errorMessages}`);
    }

    return result.document;
  }

  /**
   * Convert KHML to HTML
   */
  renderToHTML(source: string): string {
    const document = this.parseToJSONB(source);
    return this.renderer.render(document);
  }

  /**
   * Convert JSONB document to HTML
   */
  renderJSONBToHTML(document: KHMLDocument): string {
    return this.renderer.render(document);
  }

  /**
   * Validate KHML syntax without rendering
   */
  validate(source: string): {
    valid: boolean;
    errors?: Array<{ line: number; column: number; message: string }>;
  } {
    const result: ParseResult = this.parser.parse(source);

    return {
      valid: result.success,
      errors: result.errors?.map((e) => ({
        line: e.line,
        column: e.column,
        message: e.message,
      })),
    };
  }

  /**
   * Extract plain text from KHML (for search indexing)
   */
  extractPlainText(source: string): string {
    try {
      const document = this.parseToJSONB(source);
      return this.extractTextFromBlocks(document.blocks);
    } catch {
      // If parsing fails, return empty string
      return '';
    }
  }

  private extractTextFromBlocks(blocks: Array<Record<string, unknown>>): string {
    let text = '';

    for (const block of blocks) {
      if (typeof block.content === 'string') {
        text += block.content + ' ';
      } else if (Array.isArray(block.content)) {
        text += this.extractTextFromBlocks(block.content) + ' ';
      }

      // Extract from code blocks
      if (block.code) {
        text += block.code + ' ';
      }

      // Extract from definitions
      if (block.term) {
        text += block.term + ' ';
      }
    }

    return text.trim();
  }

  /**
   * Get document metadata from KHML
   */
  extractMetadata(source: string): {
    title?: string;
    author?: string;
    tags?: string[];
    difficulty?: string;
    estimatedReadingTime?: number;
  } {
    try {
      const document = this.parseToJSONB(source);
      return document.metadata;
    } catch {
      return {};
    }
  }

  /**
   * Convert markdown-style content to KHML
   */
  convertFromMarkdown(markdown: string): string {
    // Basic conversion from Markdown to KHML
    let khml = '@article{\n  @content{\n';

    // Convert headings
    markdown = markdown.replace(/^#{1,6}\s+(.+)$/gm, (match, text) => {
      const level = match.indexOf(' ');
      return `    @h${level}{${text}}`;
    });

    // Convert bold
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '**$1**');

    // Convert italic
    markdown = markdown.replace(/\*(.*?)\*/g, '*$1*');

    // Convert code blocks
    markdown = markdown.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const language = lang || 'text';
      return `    @code{\n      lang: "${language}"\n      @@@\n${code}      @@@\n    }`;
    });

    // Convert inline code
    markdown = markdown.replace(/`([^`]+)`/g, '`$1`');

    // Convert paragraphs (anything not already converted)
    const lines = markdown.split('\n');
    let inParagraph = false;

    for (const line of lines) {
      if (line.trim() === '') {
        if (inParagraph) {
          khml += '    }\n';
          inParagraph = false;
        }
      } else if (!line.startsWith('    @')) {
        if (!inParagraph) {
          khml += '    @p{';
          inParagraph = true;
        }
        khml += line + ' ';
      } else {
        if (inParagraph) {
          khml += '    }\n';
          inParagraph = false;
        }
        khml += line + '\n';
      }
    }

    if (inParagraph) {
      khml += '    }\n';
    }

    khml += '  }\n}';

    return khml;
  }
}
