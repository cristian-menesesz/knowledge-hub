/* eslint-disable @typescript-eslint/no-explicit-any */
import { KHMLParser } from './khml.parser';
import { BlockType } from '../types/khml.types';

describe('KHMLParser', () => {
  let parser: KHMLParser;

  beforeEach(() => {
    parser = new KHMLParser();
  });

  describe('Basic Parsing', () => {
    it('should parse simple paragraph', () => {
      const source = '@paragraph{Hello, World!}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.document?.blocks).toHaveLength(1);
      expect(result.document?.blocks[0].type).toBe(BlockType.PARAGRAPH);
      expect(result.document?.blocks[0].content).toBe('Hello, World!');
    });

    it('should parse multiple blocks', () => {
      const source = `@h1{Title}
@paragraph{First paragraph}
@paragraph{Second paragraph}`;
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      expect(result.document?.blocks).toHaveLength(3);
      expect(result.document?.blocks[0].type).toBe(BlockType.H1);
      expect(result.document?.blocks[1].type).toBe(BlockType.PARAGRAPH);
      expect(result.document?.blocks[2].type).toBe(BlockType.PARAGRAPH);
    });
  });

  describe('Headings', () => {
    it.each([
      ['@h1{Title}', BlockType.H1, 1],
      ['@h2{Subtitle}', BlockType.H2, 2],
      ['@h3{Section}', BlockType.H3, 3],
      ['@h4{Subsection}', BlockType.H4, 4],
      ['@h5{Minor}', BlockType.H5, 5],
      ['@h6{Smallest}', BlockType.H6, 6],
    ])('should parse %s correctly', (source, expectedType, expectedLevel) => {
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      expect(result.document?.blocks[0].type).toBe(expectedType);
      expect((result.document?.blocks[0] as any).level).toBe(expectedLevel);
    });

    it('should generate anchor for heading', () => {
      const source = '@h1{My Test Title}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const heading = result.document?.blocks[0] as any;
      expect(heading.anchor).toBeDefined();
      expect(heading.anchor).toMatch(/^my-test-title/);
    });
  });

  describe('Block Attributes', () => {
    it('should parse single attribute', () => {
      const source = '@code[lang=javascript]{const x = 42;}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const codeBlock = result.document?.blocks[0] as any;
      expect(codeBlock.language).toBe('javascript');
    });

    it('should parse multiple attributes', () => {
      const source = '@code[lang=typescript, line-numbers=true, start=10]{code}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const codeBlock = result.document?.blocks[0] as any;
      expect(codeBlock.language).toBe('typescript');
      expect(codeBlock.lineNumbers).toBe(true);
      expect(codeBlock.startLine).toBe(10);
    });

    it('should parse quoted attribute values', () => {
      const source = '@image[alt="Beautiful sunset", width=800]{image.jpg}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const imageBlock = result.document?.blocks[0] as any;
      expect(imageBlock.alt).toBe('Beautiful sunset');
      expect(imageBlock.width).toBe(800);
    });
  });

  describe('Code Blocks', () => {
    it('should parse code block with language', () => {
      const source = '@code[lang=python]{@@@\ndef hello():\n    print("Hello")\n@@@}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const codeBlock = result.document?.blocks[0] as any;
      expect(codeBlock.type).toBe(BlockType.CODE);
      expect(codeBlock.language).toBe('python');
      expect(codeBlock.code).toContain('def hello()');
    });

    it('should parse executable code block', () => {
      const source = '@exec[lang=javascript]{@@@console.log("test");@@@}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const execBlock = result.document?.blocks[0] as any;
      expect(execBlock.type).toBe(BlockType.EXEC);
      expect(execBlock.executable).toBe(true);
    });

    it('should parse code with expected output', () => {
      const source = '@exec[lang=javascript, output="42"]{@@@console.log(42);@@@}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const execBlock = result.document?.blocks[0] as any;
      expect(execBlock.expectedOutput).toBe('42');
    });
  });

  describe('Educational Blocks', () => {
    it('should parse definition block', () => {
      const source = '@definition[term="Algorithm"]{A step-by-step procedure.}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const defBlock = result.document?.blocks[0] as any;
      expect(defBlock.type).toBe(BlockType.DEFINITION);
      expect(defBlock.term).toBe('Algorithm');
    });

    it('should parse theorem block', () => {
      const source = '@theorem[name="Pythagorean Theorem"]{a² + b² = c²}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const theoremBlock = result.document?.blocks[0] as any;
      expect(theoremBlock.type).toBe(BlockType.THEOREM);
      expect(theoremBlock.name).toBe('Pythagorean Theorem');
    });

    it('should parse example with difficulty', () => {
      const source = '@example[difficulty=2]{This is intermediate.}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const exampleBlock = result.document?.blocks[0] as any;
      expect(exampleBlock.type).toBe(BlockType.EXAMPLE);
      expect(exampleBlock.difficulty).toBe(2);
    });
  });

  describe('Admonitions', () => {
    it.each([
      ['@note{Note content}', BlockType.NOTE],
      ['@warning{Warning content}', BlockType.WARNING],
      ['@tip{Tip content}', BlockType.TIP],
      ['@danger{Danger content}', BlockType.DANGER],
      ['@info{Info content}', BlockType.INFO],
    ])('should parse %s correctly', (source, expectedType) => {
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      expect(result.document?.blocks[0].type).toBe(expectedType);
    });

    it('should parse admonition with custom title', () => {
      const source = '@warning[title="Important Security Notice"]{Be careful!}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const warningBlock = result.document?.blocks[0] as any;
      expect(warningBlock.title).toBe('Important Security Notice');
    });
  });

  describe('Math Blocks', () => {
    it('should parse inline math', () => {
      const source = '@paragraph{The formula is @math{E = mc^2} here.}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const paragraph = result.document?.blocks[0] as any;
      expect(paragraph.content).toContain('@math{E = mc^2}');
    });

    it('should parse equation block', () => {
      const source = '@equation[label="einstein"]{E = mc^2}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const equation = result.document?.blocks[0] as any;
      expect(equation.type).toBe(BlockType.EQUATION);
      expect(equation.label).toBe('einstein');
    });
  });

  describe('Lists', () => {
    it('should parse unordered list', () => {
      const source = `@ul{
  @li{First item}
  @li{Second item}
  @li{Third item}
}`;
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const list = result.document?.blocks[0] as any;
      expect(list.type).toBe(BlockType.UL);
      expect(list.items).toHaveLength(3);
    });

    it('should parse ordered list', () => {
      const source = `@ol{
  @li{First step}
  @li{Second step}
}`;
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const list = result.document?.blocks[0] as any;
      expect(list.type).toBe(BlockType.OL);
      expect(list.items).toHaveLength(2);
    });

    it('should parse nested lists', () => {
      const source = `@ul{
  @li{Parent 1}
  @li{Parent 2
    @ul{
      @li{Child 1}
      @li{Child 2}
    }
  }
}`;
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const list = result.document?.blocks[0] as any;
      expect(list.type).toBe(BlockType.UL);
      // Should handle nested structure
    });
  });

  describe('Interactive Blocks', () => {
    it('should parse tabs', () => {
      const source = `@tabs{
  @tab[label="JavaScript"]{JS content}
  @tab[label="TypeScript"]{TS content}
}`;
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const tabs = result.document?.blocks[0] as any;
      expect(tabs.type).toBe(BlockType.TABS);
      expect(tabs.tabs).toHaveLength(2);
    });

    it('should parse collapsible', () => {
      const source = '@collapsible[title="Click to expand"]{Hidden content}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const collapsible = result.document?.blocks[0] as any;
      expect(collapsible.type).toBe(BlockType.COLLAPSIBLE);
      expect(collapsible.title).toBe('Click to expand');
    });

    it('should parse quiz', () => {
      const source = `@quiz[question="What is 2+2?"]{
  @option[correct=true]{4}
  @option{3}
  @option{5}
}`;
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const quiz = result.document?.blocks[0] as any;
      expect(quiz.type).toBe(BlockType.QUIZ);
      expect(quiz.question).toBe('What is 2+2?');
    });
  });

  describe('Document Structure', () => {
    it('should parse article with meta and content', () => {
      const source = `@article{
  @meta[
    title="Test Article",
    author="John Doe",
    date="2024-01-01"
  ]{}
  
  @content{
    @h1{Introduction}
    @paragraph{Content here}
  }
}`;
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      expect(result.document?.version).toBe('1.0');
      expect(result.document?.metadata).toBeDefined();
      expect(result.document?.metadata?.title).toBe('Test Article');
      expect(result.document?.metadata?.author).toBe('John Doe');
      expect(result.document?.blocks).toBeDefined();
    });
  });

  describe('Inline Formatting', () => {
    it('should preserve inline formatting markers', () => {
      const source = '@paragraph{This is **bold** and *italic* text.}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const paragraph = result.document?.blocks[0] as any;
      expect(paragraph.content).toContain('**bold**');
      expect(paragraph.content).toContain('*italic*');
    });

    it('should preserve multiple inline formats', () => {
      const source = '@paragraph{**Bold**, *italic*, `code`, __underline__, ~~strikethrough~~}';
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      const paragraph = result.document?.blocks[0] as any;
      expect(paragraph.content).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should report unknown block type', () => {
      const source = '@unknownblock{content}';
      const result = parser.parse(source);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Unknown block type');
    });

    it('should report missing required attribute', () => {
      const source = '@image{image.jpg}'; // Missing alt attribute
      const result = parser.parse(source);

      // Should still parse but may have warnings
      expect(result.document?.blocks[0].type).toBe(BlockType.IMAGE);
    });

    it('should handle malformed syntax gracefully', () => {
      const source = '@paragraph{Unclosed block';
      const result = parser.parse(source);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Complex Documents', () => {
    it('should parse complete tutorial', () => {
      const source = `@article{
  @meta[title="Complete Tutorial", author="Test"]{}
  
  @content{
    @h1{Tutorial Title}
    
    @note{Prerequisites section}
    
    @h2{Step 1}
    @paragraph{Instructions here}
    
    @code[lang=javascript]{@@@
const example = "code";
@@@}
    
    @definition[term="Key Concept"]{Explanation}
    
    @quiz[question="Test question"]{
      @option[correct=true]{Right}
      @option{Wrong}
    }
  }
}`;
      const result = parser.parse(source);

      expect(result.success).toBe(true);
      expect(result.document?.blocks.length).toBeGreaterThan(5);
      expect(result.document?.metadata).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should parse large documents efficiently', () => {
      const blocks = Array(100)
        .fill(null)
        .map((_, i) => `@paragraph{Paragraph ${i}}`)
        .join('\n');

      const start = Date.now();
      const result = parser.parse(blocks);
      const duration = Date.now() - start;

      expect(result.success).toBe(true);
      expect(result.document?.blocks).toHaveLength(100);
      expect(duration).toBeLessThan(1000); // Should parse in less than 1 second
    });
  });
});
