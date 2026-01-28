/**
 * KHML (KHub Markup Language) Type Definitions
 */

/**
 * Supported block types in KHML
 */
export enum BlockType {
  // Text blocks
  PARAGRAPH = 'paragraph',
  HEADING = 'heading',
  QUOTE = 'quote',

  // Code blocks
  CODE = 'code',
  EXEC = 'exec',

  // Lists
  UNORDERED_LIST = 'ul',
  ORDERED_LIST = 'ol',
  LIST_ITEM = 'li',
  DEFINITION_LIST = 'dl',
  DEFINITION_TERM = 'dt',
  DEFINITION_DESCRIPTION = 'dd',

  // Educational blocks
  DEFINITION = 'definition',
  THEOREM = 'theorem',
  EXAMPLE = 'example',

  // Admonitions
  NOTE = 'note',
  WARNING = 'warning',
  TIP = 'tip',
  DANGER = 'danger',
  INFO = 'info',

  // Math
  MATH = 'math',
  EQUATION = 'equation',
  ALIGN = 'align',

  // Media
  IMAGE = 'image',
  FIGURE = 'figure',
  VIDEO = 'video',

  // Interactive
  TABS = 'tabs',
  TAB = 'tab',
  COLLAPSE = 'collapse',
  QUIZ = 'quiz',
  PLAYGROUND = 'playground',

  // Tables
  TABLE = 'table',
  THEAD = 'thead',
  TBODY = 'tbody',
  TR = 'tr',
  TH = 'th',
  TD = 'td',

  // References
  LINK = 'link',
  FOOTNOTE = 'footnote',
  CITATION = 'citation',

  // Layout
  COLUMNS = 'columns',
  COLUMN = 'column',
  GRID = 'grid',
  CARD = 'card',

  // Advanced
  DIAGRAM = 'diagram',
}

/**
 * Inline formatting types
 */
export enum InlineType {
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINE = 'underline',
  STRIKETHROUGH = 'strikethrough',
  CODE = 'code',
  SUPERSCRIPT = 'superscript',
  SUBSCRIPT = 'subscript',
  MARK = 'mark',
  KBD = 'kbd',
  LINK = 'link',
  MATH_INLINE = 'math_inline',
}

/**
 * Base block structure
 */
export interface Block {
  id: string;
  type: BlockType;
  attributes: Record<string, unknown>;
  content?: string | Block[];
  position?: {
    start: number;
    end: number;
    line: number;
    column: number;
  };
}

/**
 * Inline formatting range
 */
export interface InlineFormat {
  type: InlineType;
  start: number;
  end: number;
  value?: string; // For links, etc.
}

/**
 * Paragraph block
 */
export interface ParagraphBlock extends Block {
  type: BlockType.PARAGRAPH;
  content: string;
  formatting?: InlineFormat[];
}

/**
 * Heading block
 */
export interface HeadingBlock extends Block {
  type: BlockType.HEADING;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
  anchor?: string;
}

/**
 * Code block
 */
export interface CodeBlock extends Block {
  type: BlockType.CODE;
  language: string;
  code: string;
  title?: string;
  highlight?: number[];
  showLineNumbers?: boolean;
  startLine?: number;
}

/**
 * Executable code block
 */
export interface ExecBlock extends Block {
  type: BlockType.EXEC;
  language: string;
  code: string;
  output?: string;
  runnable: boolean;
}

/**
 * Quote block
 */
export interface QuoteBlock extends Block {
  type: BlockType.QUOTE;
  text: string;
  author?: string;
  source?: string;
}

/**
 * Definition block
 */
export interface DefinitionBlock extends Block {
  type: BlockType.DEFINITION;
  term: string;
  definitionType: 'concept' | 'term' | 'algorithm' | 'pattern';
  content: string;
  examples?: string[];
}

/**
 * Example block
 */
export interface ExampleBlock extends Block {
  type: BlockType.EXAMPLE;
  title?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
  code?: CodeBlock;
  explanation?: string;
}

/**
 * Admonition block (note, warning, tip, danger, info)
 */
export interface AdmonitionBlock extends Block {
  type: BlockType.NOTE | BlockType.WARNING | BlockType.TIP | BlockType.DANGER | BlockType.INFO;
  title?: string;
  content: string | Block[];
}

/**
 * Image block
 */
export interface ImageBlock extends Block {
  type: BlockType.IMAGE;
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  align?: 'left' | 'center' | 'right';
}

/**
 * Table block
 */
export interface TableBlock extends Block {
  type: BlockType.TABLE;
  content: Block[]; // thead, tbody
}

/**
 * Tabs block
 */
export interface TabsBlock extends Block {
  type: BlockType.TABS;
  content: TabBlock[];
}

/**
 * Tab block
 */
export interface TabBlock extends Block {
  type: BlockType.TAB;
  label: string;
  content: Block[];
}

/**
 * Math equation block
 */
export interface EquationBlock extends Block {
  type: BlockType.EQUATION;
  equation: string;
  label?: string;
  numbered?: boolean;
}

/**
 * Quiz block
 */
export interface QuizBlock extends Block {
  type: BlockType.QUIZ;
  question: string;
  quizType: 'multiple-choice' | 'true-false' | 'fill-in' | 'code';
  options?: QuizOption[];
  explanation?: string;
}

/**
 * Quiz option
 */
export interface QuizOption {
  value: string;
  correct: boolean;
  explanation?: string;
}

/**
 * Parsed KHML document
 */
export interface KHMLDocument {
  version: string;
  blocks: Block[];
  metadata: {
    title?: string;
    author?: string;
    tags?: string[];
    difficulty?: string;
    estimatedReadingTime?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  variables?: Record<string, string>;
}

/**
 * Parse error
 */
export interface ParseError {
  message: string;
  line: number;
  column: number;
  position: number;
  context?: string;
}

/**
 * Parser result
 */
export interface ParseResult {
  success: boolean;
  document?: KHMLDocument;
  errors?: ParseError[];
}

/**
 * Token types for lexer
 */
export enum TokenType {
  AT = '@',
  LEFT_BRACE = '{',
  RIGHT_BRACE = '}',
  LEFT_BRACKET = '[',
  RIGHT_BRACKET = ']',
  COLON = ':',
  COMMA = ',',
  DELIMITER = '@@@',
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  TEXT = 'TEXT',
  NEWLINE = 'NEWLINE',
  WHITESPACE = 'WHITESPACE',
  COMMENT = 'COMMENT',
  EOF = 'EOF',
}

/**
 * Lexer token
 */
export interface Token {
  type: TokenType;
  value: string;
  position: number;
  line: number;
  column: number;
}
