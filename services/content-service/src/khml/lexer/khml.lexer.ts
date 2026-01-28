import { Token, TokenType, ParseError } from '../types/khml.types';

/**
 * KHML Lexer - Converts raw KHML text into tokens
 */
export class KHMLLexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];
  private errors: ParseError[] = [];

  constructor(input: string) {
    this.input = input;
  }

  /**
   * Tokenize the input string
   */
  public tokenize(): { tokens: Token[]; errors: ParseError[] } {
    while (this.position < this.input.length) {
      this.scanToken();
    }

    // Add EOF token
    this.addToken(TokenType.EOF, '');

    return {
      tokens: this.tokens,
      errors: this.errors,
    };
  }

  private scanToken(): void {
    const char = this.current();

    // Skip whitespace (except in text mode)
    if (this.isWhitespace(char) && !this.isInTextMode()) {
      this.advance();
      return;
    }

    // Comments
    if (char === '/' && this.peek() === '/') {
      this.scanSingleLineComment();
      return;
    }

    if (char === '/' && this.peek() === '*') {
      this.scanMultiLineComment();
      return;
    }

    // Special characters
    switch (char) {
      case '@':
        if (this.peek() === '@' && this.peekAhead(2) === '@') {
          this.addToken(TokenType.DELIMITER, '@@@');
          this.advance(3);
        } else {
          this.addToken(TokenType.AT, '@');
          this.advance();
        }
        break;

      case '{':
        this.addToken(TokenType.LEFT_BRACE, '{');
        this.advance();
        break;

      case '}':
        this.addToken(TokenType.RIGHT_BRACE, '}');
        this.advance();
        break;

      case '[':
        this.addToken(TokenType.LEFT_BRACKET, '[');
        this.advance();
        break;

      case ']':
        this.addToken(TokenType.RIGHT_BRACKET, ']');
        this.advance();
        break;

      case ':':
        this.addToken(TokenType.COLON, ':');
        this.advance();
        break;

      case ',':
        this.addToken(TokenType.COMMA, ',');
        this.advance();
        break;

      case '"':
        this.scanString();
        break;

      case '\n':
        this.addToken(TokenType.NEWLINE, '\n');
        this.advance();
        this.line++;
        this.column = 1;
        break;

      default:
        if (this.isDigit(char)) {
          this.scanNumber();
        } else if (this.isAlpha(char)) {
          this.scanIdentifier();
        } else {
          this.scanText();
        }
    }
  }

  private scanString(): void {
    // const start = this.position; // For future error reporting
    this.advance(); // Skip opening quote

    let value = '';
    let escaped = false;

    while (this.position < this.input.length) {
      const char = this.current();

      if (escaped) {
        // Handle escape sequences
        switch (char) {
          case 'n':
            value += '\n';
            break;
          case 't':
            value += '\t';
            break;
          case '\\':
            value += '\\';
            break;
          case '"':
            value += '"';
            break;
          default:
            value += char;
        }
        escaped = false;
        this.advance();
      } else if (char === '\\') {
        escaped = true;
        this.advance();
      } else if (char === '"') {
        this.advance(); // Skip closing quote
        break;
      } else if (char === '\n') {
        this.line++;
        this.column = 1;
        value += char;
        this.advance();
      } else {
        value += char;
        this.advance();
      }
    }

    this.addToken(TokenType.STRING, value);
  }

  private scanNumber(): void {
    const start = this.position;
    let hasDecimal = false;

    while (this.position < this.input.length) {
      const char = this.current();

      if (this.isDigit(char)) {
        this.advance();
      } else if (char === '.' && !hasDecimal) {
        hasDecimal = true;
        this.advance();
      } else {
        break;
      }
    }

    const value = this.input.substring(start, this.position);
    this.addToken(TokenType.NUMBER, value);
  }

  private scanIdentifier(): void {
    const start = this.position;

    while (
      this.position < this.input.length &&
      (this.isAlphaNumeric(this.current()) || this.current() === '-' || this.current() === '_')
    ) {
      this.advance();
    }

    const value = this.input.substring(start, this.position);

    // Check for boolean keywords
    if (value === 'true' || value === 'false') {
      this.addToken(TokenType.BOOLEAN, value);
    } else {
      this.addToken(TokenType.IDENTIFIER, value);
    }
  }

  private scanText(): void {
    // const start = this.position; // For future error reporting
    let value = '';

    while (this.position < this.input.length) {
      const char = this.current();

      // Stop at special characters
      if (
        char === '@' ||
        char === '{' ||
        char === '}' ||
        char === '[' ||
        char === ']' ||
        char === '\n'
      ) {
        break;
      }

      value += char;
      this.advance();
    }

    if (value.trim().length > 0) {
      this.addToken(TokenType.TEXT, value);
    }
  }

  private scanSingleLineComment(): void {
    const start = this.position;
    this.advance(2); // Skip //

    while (this.position < this.input.length && this.current() !== '\n') {
      this.advance();
    }

    const value = this.input.substring(start, this.position);
    this.addToken(TokenType.COMMENT, value);
  }

  private scanMultiLineComment(): void {
    const start = this.position;
    this.advance(2); // Skip /*

    while (this.position < this.input.length) {
      if (this.current() === '*' && this.peek() === '/') {
        this.advance(2);
        break;
      }

      if (this.current() === '\n') {
        this.line++;
        this.column = 1;
      }

      this.advance();
    }

    const value = this.input.substring(start, this.position);
    this.addToken(TokenType.COMMENT, value);
  }

  private current(): string {
    return this.input[this.position] || '';
  }

  private peek(offset: number = 1): string {
    return this.input[this.position + offset] || '';
  }

  private peekAhead(count: number): string {
    return this.input[this.position + count - 1] || '';
  }

  private advance(count: number = 1): void {
    for (let i = 0; i < count; i++) {
      if (this.position < this.input.length) {
        this.position++;
        this.column++;
      }
    }
  }

  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\r';
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private isInTextMode(): boolean {
    // Check if we're inside a text block (between delimiters)
    // This is a simplified check - full implementation would track state
    return false;
  }

  private addToken(type: TokenType, value: string): void {
    this.tokens.push({
      type,
      value,
      position: this.position - value.length,
      line: this.line,
      column: this.column - value.length,
    });
  }

  private addError(message: string): void {
    this.errors.push({
      message,
      line: this.line,
      column: this.column,
      position: this.position,
      context: this.getContextString(),
    });
  }

  private getContextString(): string {
    const start = Math.max(0, this.position - 20);
    const end = Math.min(this.input.length, this.position + 20);
    return this.input.substring(start, end);
  }
}
