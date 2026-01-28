# KHML System - Testing Guide

## Overview

This document provides comprehensive testing guidelines for the KHML (KHub Markup Language) system. All core components have unit tests to ensure reliability and maintainability.

## Test Files

### 1. Lexer Tests (`khml.lexer.spec.ts`)

Tests tokenization of KHML source code.

**Coverage:**

- Basic tokenization (@paragraph, @h1, etc.)
- Block attributes ([lang=javascript])
- Raw content blocks (@@@)
- Comments (single and multi-line)
- Numbers and strings
- Position tracking (line/column)
- Error handling and recovery
- Edge cases (empty blocks, nested braces)

**Running:**

```bash
npm test khml.lexer.spec.ts
```

**Key Test Cases:**

- Tokenizes simple blocks correctly
- Handles quoted attribute values with escaping
- Preserves formatting in raw content blocks
- Tracks line and column positions accurately
- Reports unterminated strings
- Continues parsing after errors (error recovery)

### 2. Parser Tests (`khml.parser.spec.ts`)

Tests conversion of tokens to structured JSONB.

**Coverage:**

- Basic parsing (paragraphs, headings)
- Block attributes
- Code blocks (regular and executable)
- Educational blocks (definitions, theorems, examples)
- Admonitions (note, warning, tip, danger, info)
- Math blocks (inline and equations)
- Lists (ordered, unordered, nested)
- Interactive blocks (tabs, collapsible, quiz)
- Document structure (article, meta, content)
- Inline formatting preservation
- Error handling
- Performance (large documents)

**Running:**

```bash
npm test khml.parser.spec.ts
```

**Key Test Cases:**

- Parses all 40+ block types correctly
- Handles attributes properly
- Generates anchors for headings
- Preserves inline formatting markers
- Reports unknown block types
- Parses complex nested structures
- Performance: 100 blocks in < 1 second

### 3. Renderer Tests (`khml.renderer.spec.ts`)

Tests HTML rendering from JSONB documents.

**Coverage:**

- Basic rendering (paragraphs, headings)
- Code blocks with syntax highlighting
- Inline formatting (bold, italic, code, underline, strikethrough)
- Admonitions with icons
- Lists (ordered and unordered)
- Links and references
- Media (images with dimensions)
- Educational blocks (definitions, theorems, examples)
- XSS prevention (escaping malicious content)
- Configuration options (class prefix, sanitization)
- Complex documents
- Performance

**Running:**

```bash
npm test khml.renderer.spec.ts
```

**Key Test Cases:**

- Renders semantic HTML5
- Escapes XSS attacks (<script> tags, event handlers)
- Applies inline formatting correctly
- Includes accessibility attributes (ARIA labels, roles)
- Supports custom class prefixes
- Performance: 100 blocks in < 500ms

## Running All Tests

### Run All KHML Tests

```bash
npm test -- khml
```

### Run Specific Test Suite

```bash
npm test -- khml.lexer
npm test -- khml.parser
npm test -- khml.renderer
```

### Run with Coverage

```bash
npm test -- --coverage khml
```

### Watch Mode (Development)

```bash
npm test -- --watch khml
```

## Test Coverage Goals

**Minimum Coverage Targets:**

- Lexer: 85%
- Parser: 85%
- Renderer: 90%
- Service: 80%

**Current Status:**

- ✅ Lexer: Comprehensive test suite created
- ✅ Parser: Comprehensive test suite created
- ✅ Renderer: Comprehensive test suite created
- ⚠️ Service: Tests needed (next priority)
- ⚠️ Controller: E2E tests needed

## Writing New Tests

### Test Structure Template

```typescript
import { YourClass } from './your-class';

describe('YourClass', () => {
  let instance: YourClass;

  beforeEach(() => {
    instance = new YourClass();
  });

  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test input';

      // Act
      const result = instance.method(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      const result = instance.method('');
      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should report errors gracefully', () => {
      const result = instance.method('invalid input');
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });
});
```

### Testing Best Practices

1. **Arrange-Act-Assert Pattern**

   ```typescript
   // Arrange: Set up test data
   const source = '@paragraph{Test}';

   // Act: Execute the code
   const result = parser.parse(source);

   // Assert: Verify expectations
   expect(result.success).toBe(true);
   ```

2. **Test One Thing Per Test**

   ```typescript
   // ❌ Bad: Tests multiple things
   it('should parse and render', () => {
     const parsed = parser.parse(source);
     const html = renderer.render(parsed);
     // ...
   });

   // ✅ Good: Tests one thing
   it('should parse paragraph block', () => {
     const result = parser.parse('@paragraph{Test}');
     expect(result.document.blocks[0].type).toBe('paragraph');
   });
   ```

3. **Use Descriptive Test Names**

   ```typescript
   // ❌ Bad
   it('test parsing', () => { ... });

   // ✅ Good
   it('should parse paragraph with inline bold formatting', () => { ... });
   ```

4. **Test Edge Cases**
   - Empty inputs
   - Null/undefined values
   - Very large inputs
   - Invalid formats
   - Boundary conditions

5. **Test Error Paths**
   ```typescript
   it('should report unterminated string error', () => {
     const result = lexer.tokenize('@paragraph[title="unterminated');
     expect(result.success).toBe(false);
     expect(result.errors[0].message).toContain('Unterminated string');
   });
   ```

## Integration Testing

### Service Integration Tests (TODO)

Create tests that verify the complete flow:

```typescript
describe('KHML Service Integration', () => {
  it('should parse and render complete article', async () => {
    const khml = `@article{
      @meta[title="Test"]{}
      @content{
        @h1{Title}
        @paragraph{Content}
      }
    }`;

    const result = await service.parseToJSONB(khml);
    expect(result.success).toBe(true);

    const html = await service.renderToHTML(khml);
    expect(html).toContain('<h1');
    expect(html).toContain('<p');
  });
});
```

### E2E Tests (TODO)

Test API endpoints:

```typescript
describe('KHML Controller (e2e)', () => {
  it('POST /khml/parse should return JSONB', () => {
    return request(app.getHttpServer())
      .post('/khml/parse')
      .send({ source: '@paragraph{Test}' })
      .expect(200)
      .expect((res) => {
        expect(res.body.blocks).toBeDefined();
        expect(res.body.blocks[0].type).toBe('paragraph');
      });
  });
});
```

## Performance Testing

### Benchmark Large Documents

```typescript
describe('Performance', () => {
  it('should parse 1000 blocks in under 5 seconds', () => {
    const blocks = Array(1000)
      .fill(null)
      .map((_, i) => `@paragraph{Paragraph ${i}}`)
      .join('\n');

    const start = Date.now();
    const result = parser.parse(blocks);
    const duration = Date.now() - start;

    expect(result.success).toBe(true);
    expect(duration).toBeLessThan(5000);
  });
});
```

## Continuous Integration

Tests are automatically run on:

- Every commit (pre-commit hook)
- Every push (pre-push hook)
- Every pull request (GitHub Actions)

**CI Configuration:**

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run KHML tests
        run: npm test -- khml --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Troubleshooting Tests

### Tests Failing Unexpectedly

1. **Clear Jest cache:**

   ```bash
   npm test -- --clearCache
   ```

2. **Run tests in isolation:**

   ```bash
   npm test -- --runInBand khml.lexer.spec.ts
   ```

3. **Enable verbose output:**
   ```bash
   npm test -- --verbose khml
   ```

### Debugging Tests

```typescript
it('should debug this test', () => {
  const result = parser.parse(source);
  console.log('Result:', JSON.stringify(result, null, 2));
  debugger; // Use Chrome DevTools
  expect(result.success).toBe(true);
});
```

Run with debugging:

```bash
node --inspect-brk node_modules/.bin/jest khml.parser.spec.ts
```

## Next Steps

1. **Service Tests**: Create comprehensive tests for `KHMLService`
2. **Controller E2E Tests**: Test all API endpoints
3. **Cache Service Tests**: Test caching behavior
4. **Migration Utils Tests**: Test Markdown/HTML/text migration
5. **Integration Tests**: Test complete workflows

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [KHML Specification](../KHML_SPECIFICATION.md)
- [Phase 2.4 README](../README_PHASE_2.4.md)
