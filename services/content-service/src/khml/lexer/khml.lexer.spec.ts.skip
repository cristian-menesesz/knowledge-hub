import { KHMLLexer, TokenType } from './khml.lexer';

describe('KHMLLexer', () => {
  let lexer: KHMLLexer;

  beforeEach(() => {
    lexer = new KHMLLexer();
  });

  describe('Basic Tokenization', () => {
    it('should tokenize a simple block', () => {
      const source = '@paragraph{Hello, World!}';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens).toHaveLength(5); // AT, IDENTIFIER, LBRACE, TEXT, RBRACE
      expect(result.tokens[0].type).toBe(TokenType.AT);
      expect(result.tokens[1].type).toBe(TokenType.IDENTIFIER);
      expect(result.tokens[1].value).toBe('paragraph');
      expect(result.tokens[2].type).toBe(TokenType.LBRACE);
      expect(result.tokens[3].type).toBe(TokenType.TEXT);
      expect(result.tokens[3].value).toBe('Hello, World!');
      expect(result.tokens[4].type).toBe(TokenType.RBRACE);
    });

    it('should tokenize multiple blocks', () => {
      const source = `@h1{Title}
@paragraph{Content}`;
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens.filter((t) => t.type === TokenType.AT)).toHaveLength(2);
      expect(result.tokens.filter((t) => t.type === TokenType.IDENTIFIER)).toHaveLength(2);
    });

    it('should handle empty blocks', () => {
      const source = '@paragraph{}';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.LBRACE,
        }),
      );
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.RBRACE,
        }),
      );
    });
  });

  describe('Block Attributes', () => {
    it('should tokenize block with attributes', () => {
      const source = '@code[lang=javascript, line-numbers=true]{const x = 42;}';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.LBRACKET,
        }),
      );
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.RBRACKET,
        }),
      );
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.IDENTIFIER,
          value: 'lang',
        }),
      );
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.EQUALS,
        }),
      );
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.IDENTIFIER,
          value: 'javascript',
        }),
      );
    });

    it('should handle quoted attribute values', () => {
      const source = '@image[alt="A beautiful sunset"]{sunset.jpg}';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.STRING,
          value: 'A beautiful sunset',
        }),
      );
    });

    it('should handle multiple attributes', () => {
      const source = '@code[lang=typescript, line-numbers=true, start=10]{code}';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      const commas = result.tokens.filter((t) => t.type === TokenType.COMMA);
      expect(commas).toHaveLength(2);
    });
  });

  describe('Raw Content Blocks', () => {
    it('should tokenize raw content with @@@', () => {
      const source = '@code{@@@const x = { a: 1, b: 2 };@@@}';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.RAW_CONTENT_START,
        }),
      );
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.RAW_CONTENT,
          value: 'const x = { a: 1, b: 2 };',
        }),
      );
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.RAW_CONTENT_END,
        }),
      );
    });

    it('should preserve formatting in raw content', () => {
      const source = `@code{@@@
function test() {
  return 42;
}
@@@}`;
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      const rawToken = result.tokens.find((t) => t.type === TokenType.RAW_CONTENT);
      expect(rawToken?.value).toContain('function test()');
      expect(rawToken?.value).toContain('  return 42;');
    });
  });

  describe('Comments', () => {
    it('should ignore single-line comments', () => {
      const source = `@paragraph{Hello}
// This is a comment
@paragraph{World}`;
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens.filter((t) => t.type === TokenType.COMMENT)).toHaveLength(0);
      expect(
        result.tokens.filter((t) => t.type === TokenType.IDENTIFIER && t.value === 'paragraph'),
      ).toHaveLength(2);
    });

    it('should ignore multi-line comments', () => {
      const source = `@paragraph{Hello}
/*
Multi-line
comment
*/
@paragraph{World}`;
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens.filter((t) => t.type === TokenType.COMMENT)).toHaveLength(0);
    });
  });

  describe('Numbers', () => {
    it('should tokenize integer numbers', () => {
      const source = '@h1[level=1]{Title}';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.NUMBER,
          value: 1,
        }),
      );
    });

    it('should tokenize floating-point numbers', () => {
      const source = '@example[difficulty=2.5]{Content}';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.NUMBER,
          value: 2.5,
        }),
      );
    });
  });

  describe('Strings', () => {
    it('should handle escaped quotes in strings', () => {
      const source = '@paragraph[title="He said \\"Hello\\"!"]{Content}';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.STRING,
          value: 'He said "Hello"!',
        }),
      );
    });

    it('should handle newlines in strings', () => {
      const source = '@paragraph[text="Line 1\\nLine 2"]{Content}';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.STRING,
          value: 'Line 1\nLine 2',
        }),
      );
    });
  });

  describe('Position Tracking', () => {
    it('should track line and column positions', () => {
      const source = `@h1{Title}
@paragraph{Content}`;
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      const firstAt = result.tokens[0];
      expect(firstAt.line).toBe(1);
      expect(firstAt.column).toBe(1);

      const secondAt = result.tokens.find((t, i) => i > 0 && t.type === TokenType.AT);
      expect(secondAt?.line).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should report unterminated string', () => {
      const source = '@paragraph[title="Unterminated]{Content}';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Unterminated string');
    });

    it('should report unexpected character', () => {
      const source = '@paragraph{Content} $ invalid';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should continue after error (error recovery)', () => {
      const source = `@paragraph{Good}
$ invalid
@paragraph{Also good}`;
      const result = lexer.tokenize(source);

      expect(result.success).toBe(false);
      expect(
        result.tokens.filter((t) => t.type === TokenType.IDENTIFIER && t.value === 'paragraph'),
      ).toHaveLength(2);
    });
  });

  describe('Complex Documents', () => {
    it('should tokenize complete article structure', () => {
      const source = `@article{
  @meta[
    title="Test Article",
    author="John Doe"
  ]{}
  
  @content{
    @h1{Introduction}
    @paragraph{This is content.}
    
    @code[lang=javascript]{@@@
const hello = "world";
@@@}
  }
}`;
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      expect(result.tokens.filter((t) => t.type === TokenType.AT).length).toBeGreaterThan(5);
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.IDENTIFIER,
          value: 'article',
        }),
      );
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.IDENTIFIER,
          value: 'meta',
        }),
      );
      expect(result.tokens).toContainEqual(
        expect.objectContaining({
          type: TokenType.RAW_CONTENT_START,
        }),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty source', () => {
      const result = lexer.tokenize('');

      expect(result.success).toBe(true);
      expect(result.tokens).toHaveLength(0);
    });

    it('should handle whitespace-only source', () => {
      const result = lexer.tokenize('   \n\n  \t  ');

      expect(result.success).toBe(true);
      expect(result.tokens).toHaveLength(0);
    });

    it('should handle nested braces in text', () => {
      const source = '@paragraph{This has {nested} braces}';
      const result = lexer.tokenize(source);

      expect(result.success).toBe(true);
      const textToken = result.tokens.find((t) => t.type === TokenType.TEXT);
      expect(textToken?.value).toContain('{nested}');
    });
  });
});
