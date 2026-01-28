import {
  Token,
  TokenType,
  Block,
  BlockType,
  KHMLDocument,
  ParseResult,
  ParseError,
  ParagraphBlock,
  HeadingBlock,
  CodeBlock,
  QuoteBlock,
  DefinitionBlock,
  ImageBlock,
  InlineFormat,
  InlineType,
} from '../types/khml.types';
import { KHMLLexer } from '../lexer/khml.lexer';

/**
 * KHML Parser - Converts tokens into structured blocks
 */
export class KHMLParser {
  private tokens: Token[] = [];
  private current: number = 0;
  private errors: ParseError[] = [];
  private blockIdCounter: number = 1;

  /**
   * Parse KHML source code
   */
  public parse(source: string): ParseResult {
    // Tokenize
    const lexer = new KHMLLexer(source);
    const { tokens, errors: lexerErrors } = lexer.tokenize();

    this.tokens = tokens.filter(
      (t) => t.type !== TokenType.WHITESPACE && t.type !== TokenType.COMMENT,
    );
    this.errors = [...lexerErrors];
    this.current = 0;

    try {
      const document = this.parseDocument();

      return {
        success: this.errors.length === 0,
        document,
        errors: this.errors.length > 0 ? this.errors : undefined,
      };
    } catch (error) {
      this.errors.push({
        message: error instanceof Error ? error.message : 'Unknown error',
        line: this.currentToken().line,
        column: this.currentToken().column,
        position: this.currentToken().position,
      });

      return {
        success: false,
        errors: this.errors,
      };
    }
  }

  private parseDocument(): KHMLDocument {
    const blocks: Block[] = [];
    const metadata: KHMLDocument['metadata'] = {};
    const variables: Record<string, string> = {};

    while (!this.isAtEnd()) {
      const block = this.parseBlock();
      if (block) {
        // Handle metadata blocks
        if (block.type === ('meta' as BlockType)) {
          Object.assign(metadata, block.attributes);
        } else if (block.type === ('var' as BlockType)) {
          const name = block.attributes.name as string;
          const value = block.attributes.value as string;
          if (name && value) {
            variables[name] = value;
          }
        } else {
          blocks.push(block);
        }
      }
    }

    return {
      version: '1.0',
      blocks,
      metadata,
      variables: Object.keys(variables).length > 0 ? variables : undefined,
    };
  }

  private parseBlock(): Block | null {
    // Skip newlines
    while (this.match(TokenType.NEWLINE)) {
      this.advance();
    }

    if (this.isAtEnd()) {
      return null;
    }

    // Expect @ symbol
    if (!this.check(TokenType.AT)) {
      this.addError('Expected "@" to start a block');
      this.advance(); // Skip invalid token
      return null;
    }

    this.advance(); // Consume @

    // Get block type
    const blockTypeToken = this.consume(TokenType.IDENTIFIER, 'Expected block type identifier');
    const blockType = blockTypeToken.value;

    // Consume {
    this.consume(TokenType.LEFT_BRACE, 'Expected "{" after block type');

    // Parse block based on type
    const block = this.parseBlockByType(blockType);

    // Consume }
    this.consume(TokenType.RIGHT_BRACE, 'Expected "}" to close block');

    return block;
  }

  private parseBlockByType(type: string): Block {
    const id = `block-${this.blockIdCounter++}`;

    switch (type) {
      case 'p':
        return this.parseParagraph(id);
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return this.parseHeading(id, parseInt(type[1]));
      case 'code':
        return this.parseCode(id, false);
      case 'exec':
        return this.parseCode(id, true);
      case 'quote':
        return this.parseQuote(id);
      case 'def':
        return this.parseDefinition(id);
      case 'img':
        return this.parseImage(id);
      case 'note':
      case 'warning':
      case 'tip':
      case 'danger':
      case 'info':
        return this.parseAdmonition(id, type as BlockType);
      case 'ul':
      case 'ol':
        return this.parseList(
          id,
          type === 'ul' ? BlockType.UNORDERED_LIST : BlockType.ORDERED_LIST,
        );
      case 'table':
        return this.parseTable(id);
      case 'tabs':
        return this.parseTabs(id);
      default:
        return this.parseGenericBlock(id, type);
    }
  }

  private parseParagraph(id: string): ParagraphBlock {
    const content = this.parseTextContent();
    const formatting = this.parseInlineFormatting(content);

    return {
      id,
      type: BlockType.PARAGRAPH,
      attributes: {},
      content,
      formatting,
    };
  }

  private parseHeading(id: string, level: 1 | 2 | 3 | 4 | 5 | 6): HeadingBlock {
    const content = this.parseTextContent();

    return {
      id,
      type: BlockType.HEADING,
      level,
      attributes: {},
      content,
    };
  }

  private parseCode(id: string, executable: boolean): CodeBlock {
    const attributes = this.parseAttributes();
    const language = (attributes.lang as string) || 'text';

    // Expect @@@ delimiter
    this.consume(TokenType.DELIMITER, 'Expected "@@@" to start code block');

    // Collect code content until closing @@@
    let code = '';
    while (!this.check(TokenType.DELIMITER) && !this.isAtEnd()) {
      code += this.currentToken().value;
      if (this.check(TokenType.NEWLINE)) {
        code += '\n';
      }
      this.advance();
    }

    this.consume(TokenType.DELIMITER, 'Expected "@@@" to close code block');

    return {
      id,
      type: executable ? (BlockType.EXEC as BlockType) : BlockType.CODE,
      attributes,
      language,
      code: code.trim(),
      highlight: attributes.highlight as number[],
      title: attributes.title as string,
      showLineNumbers: (attributes.showLineNumbers as boolean) ?? true,
    };
  }

  private parseQuote(id: string): QuoteBlock {
    const attributes = this.parseAttributes();

    return {
      id,
      type: BlockType.QUOTE,
      attributes,
      text: attributes.text as string,
      author: attributes.author as string,
      source: attributes.source as string,
    };
  }

  private parseDefinition(id: string): DefinitionBlock {
    const attributes = this.parseAttributes();
    const term = attributes.term as string;
    const definitionType =
      (attributes.type as 'concept' | 'term' | 'algorithm' | 'pattern') || 'concept';

    // Parse nested @content block
    let content = '';
    if (this.check(TokenType.AT)) {
      const contentBlock = this.parseBlock();
      if (contentBlock && contentBlock.content) {
        content = typeof contentBlock.content === 'string' ? contentBlock.content : '';
      }
    }

    return {
      id,
      type: BlockType.DEFINITION,
      attributes,
      term,
      definitionType,
      content,
      examples: attributes.examples as string[],
    };
  }

  private parseImage(id: string): ImageBlock {
    const attributes = this.parseAttributes();

    return {
      id,
      type: BlockType.IMAGE,
      attributes,
      src: attributes.src as string,
      alt: attributes.alt as string,
      caption: attributes.caption as string,
      width: attributes.width as number,
      height: attributes.height as number,
      align: attributes.align as 'left' | 'center' | 'right',
    };
  }

  private parseAdmonition(id: string, type: BlockType): Block {
    const attributes = this.parseAttributes();
    const content = this.parseTextContent();

    return {
      id,
      type,
      attributes,
      content,
    };
  }

  private parseList(id: string, type: BlockType): Block {
    const children: Block[] = [];

    // Parse @li blocks
    while (this.check(TokenType.AT)) {
      const listItem = this.parseBlock();
      if (listItem) {
        children.push(listItem);
      }
    }

    return {
      id,
      type,
      attributes: {},
      content: children,
    };
  }

  private parseTable(id: string): Block {
    const children: Block[] = [];

    // Parse table structure (@thead, @tbody, @tr, @th, @td)
    while (this.check(TokenType.AT)) {
      const child = this.parseBlock();
      if (child) {
        children.push(child);
      }
    }

    return {
      id,
      type: BlockType.TABLE,
      attributes: {},
      content: children,
    };
  }

  private parseTabs(id: string): Block {
    const children: Block[] = [];

    // Parse @tab blocks
    while (this.check(TokenType.AT)) {
      const tab = this.parseBlock();
      if (tab) {
        children.push(tab);
      }
    }

    return {
      id,
      type: BlockType.TABS,
      attributes: {},
      content: children,
    };
  }

  private parseGenericBlock(id: string, type: string): Block {
    const attributes = this.parseAttributes();
    const content = this.parseTextContent();

    return {
      id,
      type: type as BlockType,
      attributes,
      content,
    };
  }

  private parseAttributes(): Record<string, unknown> {
    const attributes: Record<string, unknown> = {};

    while (!this.check(TokenType.DELIMITER) && !this.check(TokenType.AT) && !this.isAtEnd()) {
      // Skip newlines
      if (this.match(TokenType.NEWLINE)) {
        this.advance();
        continue;
      }

      // Parse key: value pairs
      if (this.check(TokenType.IDENTIFIER)) {
        const key = this.advance().value;

        if (this.match(TokenType.COLON)) {
          this.advance(); // Consume :

          const value = this.parseValue();
          attributes[key] = value;

          // Optional comma
          if (this.match(TokenType.COMMA)) {
            this.advance();
          }
        }
      } else {
        break;
      }
    }

    return attributes;
  }

  private parseValue(): unknown {
    const token = this.currentToken();

    if (this.match(TokenType.STRING)) {
      return this.advance().value;
    }

    if (this.match(TokenType.NUMBER)) {
      return parseFloat(this.advance().value);
    }

    if (this.match(TokenType.BOOLEAN)) {
      return this.advance().value === 'true';
    }

    if (this.match(TokenType.LEFT_BRACKET)) {
      return this.parseArray();
    }

    if (this.match(TokenType.LEFT_BRACE)) {
      return this.parseObject();
    }

    this.addError(`Unexpected value type: ${token.type}`);
    return null;
  }

  private parseArray(): unknown[] {
    const values: unknown[] = [];

    this.consume(TokenType.LEFT_BRACKET, 'Expected "["');

    while (!this.check(TokenType.RIGHT_BRACKET) && !this.isAtEnd()) {
      values.push(this.parseValue());

      if (this.match(TokenType.COMMA)) {
        this.advance();
      }
    }

    this.consume(TokenType.RIGHT_BRACKET, 'Expected "]"');

    return values;
  }

  private parseObject(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};

    this.consume(TokenType.LEFT_BRACE, 'Expected "{"');

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      const key = this.consume(TokenType.IDENTIFIER, 'Expected property key').value;
      this.consume(TokenType.COLON, 'Expected ":"');
      const value = this.parseValue();

      obj[key] = value;

      if (this.match(TokenType.COMMA)) {
        this.advance();
      }
    }

    this.consume(TokenType.RIGHT_BRACE, 'Expected "}"');

    return obj;
  }

  private parseTextContent(): string {
    let content = '';

    while (
      !this.check(TokenType.RIGHT_BRACE) &&
      !this.check(TokenType.AT) &&
      !this.check(TokenType.DELIMITER) &&
      !this.isAtEnd()
    ) {
      const token = this.currentToken();

      if (token.type === TokenType.TEXT || token.type === TokenType.IDENTIFIER) {
        content += token.value;
      } else if (token.type === TokenType.NEWLINE) {
        content += '\n';
      } else if (token.type === TokenType.STRING) {
        content += token.value;
      }

      this.advance();
    }

    return content.trim();
  }

  private parseInlineFormatting(text: string): InlineFormat[] {
    const formats: InlineFormat[] = [];

    // Parse **bold**
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      formats.push({
        type: InlineType.BOLD,
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Parse *italic*
    const italicRegex = /\*(.*?)\*/g;
    while ((match = italicRegex.exec(text)) !== null) {
      // Skip if it's part of bold
      const isBold = formats.some(
        (f) => f.type === InlineType.BOLD && match!.index >= f.start && match!.index <= f.end,
      );
      if (!isBold) {
        formats.push({
          type: InlineType.ITALIC,
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }

    // Parse `code`
    const codeRegex = /`(.*?)`/g;
    while ((match = codeRegex.exec(text)) !== null) {
      formats.push({
        type: InlineType.CODE,
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return formats;
  }

  // Token navigation helpers
  private currentToken(): Token {
    return this.tokens[this.current] || this.tokens[this.tokens.length - 1];
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.tokens[this.current - 1];
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.currentToken().type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }

    this.addError(message);
    return this.currentToken();
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length || this.currentToken().type === TokenType.EOF;
  }

  private addError(message: string): void {
    const token = this.currentToken();
    this.errors.push({
      message,
      line: token.line,
      column: token.column,
      position: token.position,
    });
  }
}
