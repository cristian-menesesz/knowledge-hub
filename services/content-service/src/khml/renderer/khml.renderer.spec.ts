/* eslint-disable @typescript-eslint/no-explicit-any */
import { KHMLRenderer } from './khml.renderer';
import {
  BlockType,
  KHMLDocument,
  ParagraphBlock,
  HeadingBlock,
  CodeBlock,
} from '../types/khml.types';

describe('KHMLRenderer', () => {
  let renderer: KHMLRenderer;

  beforeEach(() => {
    renderer = new KHMLRenderer();
  });

  describe('Basic Rendering', () => {
    it('should render simple paragraph', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: 'Hello, World!',
          } as ParagraphBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<article');
      expect(html).toContain('<p');
      expect(html).toContain('Hello, World!');
      expect(html).toContain('</p>');
      expect(html).toContain('</article>');
    });

    it('should render multiple blocks', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: 'First',
          } as ParagraphBlock,
          {
            id: 'p2',
            type: BlockType.PARAGRAPH,
            content: 'Second',
          } as ParagraphBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('First');
      expect(html).toContain('Second');
      expect((html.match(/<p/g) || []).length).toBe(2);
    });
  });

  describe('Headings', () => {
    it.each([
      [BlockType.H1, 1, '<h1'],
      [BlockType.H2, 2, '<h2'],
      [BlockType.H3, 3, '<h3'],
      [BlockType.H4, 4, '<h4'],
      [BlockType.H5, 5, '<h5'],
      [BlockType.H6, 6, '<h6'],
    ])('should render %s correctly', (type, level, expectedTag) => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'h1',
            type,
            level,
            content: 'Heading',
            anchor: 'heading',
          } as HeadingBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain(expectedTag);
      expect(html).toContain('id="heading"');
      expect(html).toContain('Heading');
    });

    it('should generate anchor link for heading', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'h1',
            type: BlockType.H1,
            level: 1,
            content: 'My Heading',
            anchor: 'my-heading',
          } as HeadingBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('id="my-heading"');
      expect(html).toContain('aria-label=');
    });
  });

  describe('Code Blocks', () => {
    it('should render code block with language', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'c1',
            type: BlockType.CODE,
            code: 'const x = 42;',
            language: 'javascript',
            lineNumbers: false,
          } as CodeBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<pre');
      expect(html).toContain('<code');
      expect(html).toContain('language-javascript');
      expect(html).toContain('const x = 42;');
    });

    it('should escape HTML in code', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'c1',
            type: BlockType.CODE,
            code: '<script>alert("xss")</script>',
            language: 'html',
            lineNumbers: false,
          } as CodeBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&lt;/script&gt;');
      expect(html).not.toContain('<script>alert');
    });

    it('should render with line numbers when specified', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'c1',
            type: BlockType.CODE,
            code: 'line 1\nline 2\nline 3',
            language: 'text',
            lineNumbers: true,
            startLine: 1,
          } as CodeBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('line-numbers');
    });
  });

  describe('Inline Formatting', () => {
    it('should render bold text', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: 'This is **bold** text',
          } as ParagraphBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<strong>bold</strong>');
    });

    it('should render italic text', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: 'This is *italic* text',
          } as ParagraphBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<em>italic</em>');
    });

    it('should render inline code', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: 'Use `code` here',
          } as ParagraphBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<code>code</code>');
    });

    it('should render underline', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: 'This is __underlined__ text',
          } as ParagraphBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<u>underlined</u>');
    });

    it('should render strikethrough', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: 'This is ~~deleted~~ text',
          } as ParagraphBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<del>deleted</del>');
    });

    it('should render multiple inline formats', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: '**Bold**, *italic*, `code`, __underline__, ~~strike~~',
          } as ParagraphBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<strong>Bold</strong>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('<code>code</code>');
      expect(html).toContain('<u>underline</u>');
      expect(html).toContain('<del>strike</del>');
    });

    it('should handle nested formatting', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: '**This is *nested* formatting**',
          } as ParagraphBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<strong>');
      expect(html).toContain('<em>');
    });
  });

  describe('Admonitions', () => {
    it.each([
      [BlockType.NOTE, 'note', 'ℹ️'],
      [BlockType.WARNING, 'warning', '⚠️'],
      [BlockType.TIP, 'tip', '💡'],
      [BlockType.DANGER, 'danger', '🚨'],
      [BlockType.INFO, 'info', 'ℹ️'],
    ])('should render %s with correct icon', (type, className, icon) => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'a1',
            type,
            content: 'Admonition content',
          } as any,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain(`khml-${className}`);
      expect(html).toContain(icon);
      expect(html).toContain('Admonition content');
    });

    it('should render admonition with custom title', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'w1',
            type: BlockType.WARNING,
            title: 'Custom Warning',
            content: 'Warning content',
          } as any,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('Custom Warning');
    });
  });

  describe('Lists', () => {
    it('should render unordered list', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'ul1',
            type: BlockType.UL,
            items: [{ content: 'Item 1' }, { content: 'Item 2' }],
          } as any,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<ul');
      expect(html).toContain('<li');
      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
      expect(html).toContain('</ul>');
    });

    it('should render ordered list', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'ol1',
            type: BlockType.OL,
            items: [{ content: 'First' }, { content: 'Second' }],
          } as any,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<ol');
      expect(html).toContain('<li');
      expect(html).toContain('First');
      expect(html).toContain('Second');
      expect(html).toContain('</ol>');
    });
  });

  describe('Links and References', () => {
    it('should render link', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'l1',
            type: BlockType.LINK,
            href: 'https://example.com',
            text: 'Example Link',
          } as any,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<a');
      expect(html).toContain('href="https://example.com"');
      expect(html).toContain('Example Link');
    });

    it('should render external link with target blank', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'l1',
            type: BlockType.LINK,
            href: 'https://external.com',
            text: 'External',
            external: true,
          } as any,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    });
  });

  describe('Media', () => {
    it('should render image', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'img1',
            type: BlockType.IMAGE,
            src: 'image.jpg',
            alt: 'Test image',
          } as any,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<img');
      expect(html).toContain('src="image.jpg"');
      expect(html).toContain('alt="Test image"');
    });

    it('should render image with dimensions', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'img1',
            type: BlockType.IMAGE,
            src: 'image.jpg',
            alt: 'Test',
            width: 800,
            height: 600,
          } as any,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('width="800"');
      expect(html).toContain('height="600"');
    });
  });

  describe('Educational Blocks', () => {
    it('should render definition', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'd1',
            type: BlockType.DEFINITION,
            term: 'Algorithm',
            content: 'A step-by-step procedure',
          } as any,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('khml-definition');
      expect(html).toContain('Algorithm');
      expect(html).toContain('A step-by-step procedure');
    });

    it('should render theorem', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 't1',
            type: BlockType.THEOREM,
            name: 'Pythagorean Theorem',
            content: 'a² + b² = c²',
          } as any,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('khml-theorem');
      expect(html).toContain('Pythagorean Theorem');
    });

    it('should render example with difficulty', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'e1',
            type: BlockType.EXAMPLE,
            difficulty: 2,
            content: 'Example content',
          } as any,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('khml-example');
      expect(html).toContain('difficulty-2');
    });
  });

  describe('XSS Prevention', () => {
    it('should escape malicious script tags', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: '<script>alert("xss")</script>',
          } as ParagraphBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should escape event handlers', () => {
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: '<img src=x onerror="alert(1)">',
          } as ParagraphBlock,
        ],
      };

      const html = renderer.render(document);

      expect(html).not.toContain('onerror=');
      expect(html).toContain('&lt;');
      expect(html).toContain('&gt;');
    });
  });

  describe('Configuration Options', () => {
    it('should use custom class prefix', () => {
      const customRenderer = new KHMLRenderer({ classPrefix: 'custom-' });
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: 'Test',
          } as ParagraphBlock,
        ],
      };

      const html = customRenderer.render(document);

      expect(html).toContain('custom-');
    });

    it('should skip sanitization when disabled', () => {
      const unsafeRenderer = new KHMLRenderer({ sanitize: false });
      const document: KHMLDocument = {
        version: '1.0',
        blocks: [
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: '<span>Raw HTML</span>',
          } as ParagraphBlock,
        ],
      };

      const html = unsafeRenderer.render(document);

      expect(html).toContain('<span>Raw HTML</span>');
    });
  });

  describe('Complex Documents', () => {
    it('should render complete article structure', () => {
      const document: KHMLDocument = {
        version: '1.0',
        metadata: {
          title: 'Test Article',
          author: 'John Doe',
        },
        blocks: [
          {
            id: 'h1',
            type: BlockType.H1,
            level: 1,
            content: 'Title',
            anchor: 'title',
          } as HeadingBlock,
          {
            id: 'p1',
            type: BlockType.PARAGRAPH,
            content: 'Introduction paragraph',
          } as ParagraphBlock,
          {
            id: 'c1',
            type: BlockType.CODE,
            code: 'const x = 42;',
            language: 'javascript',
            lineNumbers: false,
          } as CodeBlock,
          {
            id: 'n1',
            type: BlockType.NOTE,
            content: 'Important note',
          } as any,
        ],
      };

      const html = renderer.render(document);

      expect(html).toContain('<article');
      expect(html).toContain('<h1');
      expect(html).toContain('<p');
      expect(html).toContain('<pre');
      expect(html).toContain('khml-note');
      expect(html).toContain('</article>');
    });
  });

  describe('Performance', () => {
    it('should render large documents efficiently', () => {
      const blocks = Array(100)
        .fill(null)
        .map((_, i) => ({
          id: `p${i}`,
          type: BlockType.PARAGRAPH,
          content: `Paragraph ${i}`,
        }));

      const document: KHMLDocument = {
        version: '1.0',
        blocks: blocks as ParagraphBlock[],
      };

      const start = Date.now();
      const html = renderer.render(document);
      const duration = Date.now() - start;

      expect(html).toBeTruthy();
      expect(duration).toBeLessThan(500); // Should render in less than 500ms
    });
  });
});
