# Phase 2.4: KHML (KHub Markup Language) Implementation

**Status**: ✅ Complete  
**Date**: January 27, 2026  
**Version**: 1.0

## Table of Contents

- [Overview](#overview)
- [Philosophy & Design](#philosophy--design)
- [Quick Start](#quick-start)
- [Block Types Reference](#block-types-reference)
- [Inline Formatting](#inline-formatting)
- [API Endpoints](#api-endpoints)
- [Integration Guide](#integration-guide)
- [Migration from Markdown](#migration-from-markdown)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Overview

**KHML (KHub Markup Language)** is a custom LaTeX-inspired markup language designed specifically for educational and technical content on the Knowledge Hub platform. Unlike traditional WYSIWYG block editors, KHML provides:

- **Explicit Structure**: Clear, LaTeX-like syntax for precise content control
- **Educational Focus**: Built-in support for definitions, theorems, examples, code execution
- **Version Control Friendly**: Plain text format works seamlessly with Git
- **Type Safety**: Parsed to structured JSONB with strong TypeScript types
- **Extensibility**: Easy to add new block types without schema migrations

### Architecture

```
┌─────────────────────────┐
│   KHML Source Code      │
│  @article{@content{}}   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│     KHMLLexer           │
│  (Tokenization)         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│     Tokens[]            │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│     KHMLParser          │
│  (Syntax Analysis)      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  KHMLDocument (JSONB)   │
│  Stored in Database     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│    KHMLRenderer         │
│  (HTML Generation)      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Semantic HTML5        │
│  Displayed to User      │
└─────────────────────────┘
```

---

## Philosophy & Design

### Why KHML?

1. **Explicit Over Implicit**: Clear markup that shows structure at a glance
2. **Educational Content Focus**: Built-in blocks for definitions, theorems, examples
3. **Code-Centric**: First-class support for code blocks with execution
4. **Accessibility**: Semantic HTML output with ARIA attributes
5. **Version Control**: Plain text format diffs beautifully in Git
6. **Performance**: Parse once to JSONB, render many times
7. **Extensibility**: Add new block types without breaking existing content

### Design Principles

- **Human-Readable**: You should be able to read KHML without rendering
- **LaTeX-Inspired**: Familiar syntax for technical users
- **Structured**: Explicit nesting and clear block boundaries
- **Type-Safe**: Strong TypeScript types throughout the pipeline
- **Error-Friendly**: Position-aware errors with line/column numbers

---

## Quick Start

### Your First KHML Document

```khml
@article{
  @meta{
    title: "Hello, KHML!"
    author: "Your Name"
    tags: ["tutorial", "getting-started"]
    difficulty: beginner
  }

  @content{
    @h1{Welcome to KHML}

    @p{
      This is your first KHML document. KHML uses **bold**, *italic*,
      and `code` for inline formatting.
    }

    @code{
      lang: "python"
      @@@
def greet(name):
    return f"Hello, {name}!"

print(greet("KHML"))
      @@@
    }

    @tip{
      Check out the examples directory for more complex documents!
    }
  }
}
```

### Parsing KHML

```typescript
import { KHMLService } from './khml/services/khml.service';

const khmlService = new KHMLService();

// Parse to JSONB (for database storage)
const document = khmlService.parseToJSONB(khmlSource);
// Store document.blocks in Article.body or Guide.body

// Render to HTML (for display)
const html = khmlService.renderToHTML(khmlSource);

// Validate syntax (for live checking)
const validation = khmlService.validate(khmlSource);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### Using the API

```bash
# Parse KHML to JSONB
curl -X POST http://localhost:3001/khml/parse \
  -H "Content-Type: application/json" \
  -d '{"source": "@article{@content{@p{Hello!}}}"}'

# Render KHML to HTML
curl -X POST http://localhost:3001/khml/render \
  -H "Content-Type: application/json" \
  -d '{"source": "@article{@content{@p{Hello!}}}"}'

# Validate syntax
curl -X POST http://localhost:3001/khml/validate \
  -H "Content-Type: application/json" \
  -d '{"source": "@article{@content{@p{Hello!}}}"}'
```

---

## Block Types Reference

### Text Blocks

#### Paragraph

```khml
@p{
  This is a paragraph with **bold**, *italic*, and `code` formatting.
}
```

#### Headings

```khml
@h1{Main Title}
@h2{Section Title}
@h3{Subsection Title}
@h4{Sub-subsection Title}
@h5{Minor Heading}
@h6{Smallest Heading}
```

#### Quote

```khml
@quote{
  author: "Donald Knuth"
  source: "The Art of Computer Programming"
  @@@
  Premature optimization is the root of all evil.
  @@@
}
```

### Code Blocks

#### Syntax-Highlighted Code

```khml
@code{
  lang: "python"
  caption: "Binary search implementation"
  lineNumbers: true
  highlight: [5, 6, 7]
  @@@
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
  @@@
}
```

#### Executable Code

```khml
@exec{
  lang: "javascript"
  @@@
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log(`Sum: ${sum}`);
  @@@
  output: |
    Sum: 15
}
```

### Educational Blocks

#### Definition

```khml
@definition{
  term: "Binary Search"
  category: "Algorithm"
  @@@
  An efficient algorithm for finding a target value within a **sorted** array.
  It works by repeatedly dividing the search interval in half.

  **Time Complexity**: O(log n)
  @@@
}
```

#### Theorem

```khml
@theorem{
  name: "Pythagorean Theorem"
  field: "Geometry"
  @@@
  In a right-angled triangle, the square of the hypotenuse equals
  the sum of squares of the other two sides:

  @equation{
    @@@
    a^2 + b^2 = c^2
    @@@
  }
  @@@
}
```

#### Example

```khml
@example{
  difficulty: medium
  @@@
  **Problem**: Find the first occurrence of a target in a sorted array.

  **Solution**: Modify binary search to continue searching left even after finding the target.
  @@@
}
```

### Admonition Blocks

```khml
@note{
  This is an informational note. 📝
}

@warning{
  Be careful with this approach! ⚠️
}

@tip{
  Pro tip: Use keyboard shortcuts for efficiency. 💡
}

@danger{
  This operation is destructive and cannot be undone! 🚨
}

@info{
  For more information, see the documentation. ℹ️
}
```

### Math Blocks

#### Inline Math

```khml
@p{
  The equation @math{E = mc^2} shows the equivalence of mass and energy.
}
```

#### Block Equation

```khml
@equation{
  label: "quadratic-formula"
  @@@
  x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
  @@@
}
```

### Media Blocks

#### Image

```khml
@image{
  src: "/assets/binary-tree.png"
  alt: "Binary tree structure"
  caption: "Example of a complete binary tree"
  width: 600
}
```

#### Figure

```khml
@figure{
  caption: "Binary search visualization"
  @@@
  @image{
    src: "/assets/binary-search.gif"
    alt: "Binary search animation"
  }
  @@@
}
```

### Interactive Blocks

#### Tabs

```khml
@tabs{
  @tab{
    label: "JavaScript"
    @@@
    @code{lang: "javascript" @@@
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
    @@@}
    @@@
  }

  @tab{
    label: "Python"
    @@@
    @code{lang: "python" @@@
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
    @@@}
    @@@
  }
}
```

#### Collapsible

```khml
@collapsible{
  summary: "Click to reveal the solution"
  @@@
  @code{lang: "python" @@@
def solution(arr):
    return sorted(arr)
  @@@}
  @@@
}
```

#### Quiz

```khml
@quiz{
  @@@
## Algorithm Quiz

1. **What is the time complexity of binary search?**
   - [ ] O(n)
   - [x] O(log n)
   - [ ] O(n log n)
   - [ ] O(1)

2. **Binary search requires the array to be:**
   - [ ] Empty
   - [x] Sorted
   - [ ] Reversed
   - [ ] Random
  @@@
}
```

### Table Block

```khml
@table{
  caption: "Time Complexity Comparison"
  @@@
| Algorithm      | Best    | Average | Worst   |
|----------------|---------|---------|---------|
| Binary Search  | O(1)    | O(log n)| O(log n)|
| Linear Search  | O(1)    | O(n)    | O(n)    |
| Jump Search    | O(1)    | O(√n)   | O(√n)   |
  @@@
}
```

### List Blocks

#### Unordered List

```khml
@list{
  type: unordered
  @@@
  - First item
  - Second item with **bold** text
  - Third item with `code`
  @@@
}
```

#### Ordered List

```khml
@list{
  type: ordered
  start: 1
  @@@
  - First step
  - Second step
  - Third step
  @@@
}
```

### Layout Blocks

#### Grid

```khml
@grid{
  columns: 3
  @@@
  @card{title: "Fast" @@@O(log n) performance@@@}
  @card{title: "Simple" @@@Easy to understand@@@}
  @card{title: "Efficient" @@@Memory efficient@@@}
  @@@
}
```

---

## Inline Formatting

KHML supports several inline formatting options:

| Syntax               | Output            | Description         |
| -------------------- | ----------------- | ------------------- |
| `**bold**`           | **bold**          | Strong emphasis     |
| `*italic*`           | _italic_          | Emphasis            |
| `` `code` ``         | `code`            | Inline code         |
| `__underline__`      | underline         | Underlined text     |
| `~~strikethrough~~`  | ~~strikethrough~~ | Deleted text        |
| `^superscript^`      | x²                | Superscript         |
| `~subscript~`        | H₂O               | Subscript           |
| `@mark{highlighted}` | highlighted       | Highlighted text    |
| `@kbd{Ctrl+C}`       | Ctrl+C            | Keyboard shortcut   |
| `@math{E = mc^2}`    | E = mc²           | Inline math (LaTeX) |

---

## API Endpoints

### POST /khml/parse

Convert KHML source to JSONB for database storage.

**Request:**

```json
{
  "source": "@article{@content{@p{Hello, KHML!}}}"
}
```

**Response:**

```json
{
  "version": "1.0",
  "blocks": [
    {
      "id": "block-1",
      "type": "PARAGRAPH",
      "content": "Hello, KHML!",
      "position": { "start": 0, "end": 35 }
    }
  ],
  "metadata": {},
  "variables": {}
}
```

### POST /khml/render

Convert KHML source directly to HTML.

**Request:**

```json
{
  "source": "@article{@content{@p{Hello, **KHML**!}}}"
}
```

**Response:**

```json
{
  "html": "<article class=\"khml-document\"><p class=\"khml-paragraph\" data-block-id=\"block-1\">Hello, <strong>KHML</strong>!</p></article>"
}
```

### POST /khml/validate

Validate KHML syntax without parsing.

**Request:**

```json
{
  "source": "@article{@content{@p{Missing closing brace}"
}
```

**Response:**

```json
{
  "valid": false,
  "errors": [
    {
      "message": "Expected '}' to close block",
      "line": 1,
      "column": 40,
      "position": 40,
      "context": "@article{@content{@p{Missing closing brace}"
    }
  ]
}
```

### POST /khml/extract-text

Extract plain text for search indexing.

**Request:**

```json
{
  "source": "@article{@content{@p{Binary search is efficient.}}}"
}
```

**Response:**

```json
{
  "text": "Binary search is efficient."
}
```

### POST /khml/extract-metadata

Extract document metadata.

**Request:**

```json
{
  "source": "@article{@meta{title: \"Tutorial\" author: \"Jane\"}@content{}}"
}
```

**Response:**

```json
{
  "title": "Tutorial",
  "author": "Jane",
  "tags": [],
  "difficulty": null,
  "estimatedReadingTime": null
}
```

### POST /khml/convert/markdown

Convert Markdown to KHML.

**Request:**

```json
{
  "markdown": "# Hello\n\nThis is **bold** text."
}
```

**Response:**

```json
{
  "khml": "@article{@content{@h1{Hello}@p{This is **bold** text.}}}"
}
```

---

## Integration Guide

### Storing Content in Database

```typescript
// content.service.ts
import { KHMLService } from '../khml/services/khml.service';

@Injectable()
export class ContentService {
  constructor(
    private khmlService: KHMLService,
    // ... other dependencies
  ) {}

  async create(dto: CreateContentDto) {
    // Parse KHML to JSONB before saving
    const parsedBody = this.khmlService.parseToJSONB(dto.bodyKHML);

    const content = this.contentRepository.create({
      ...dto,
      body: parsedBody, // Store as JSONB
    });

    return await this.contentRepository.save(content);
  }
}
```

### Rendering Content

```typescript
async getContentWithHTML(id: string) {
  const content = await this.contentRepository.findOne({ where: { id } });

  if (!content) {
    throw new NotFoundException('Content not found');
  }

  // Render JSONB to HTML
  const html = this.khmlService.renderJSONBToHTML(content.body);

  return {
    ...content,
    html,
  };
}
```

### Frontend Integration

```typescript
// Frontend editor component
const validateKHML = async (source: string) => {
  const response = await fetch('/khml/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  });

  const result = await response.json();
  return result;
};

// Live validation on editor change
const handleEditorChange = async (value: string) => {
  setEditorValue(value);

  const validation = await validateKHML(value);
  if (!validation.valid) {
    setErrors(validation.errors);
  } else {
    setErrors([]);
  }
};
```

---

## Migration from Markdown

KHML includes a basic Markdown converter:

```typescript
const khmlService = new KHMLService();

const markdown = `
# Hello World

This is **bold** and *italic* text.

\`\`\`python
print("Hello")
\`\`\`
`;

const khml = khmlService.convertFromMarkdown(markdown);
console.log(khml);
// Output:
// @article{@content{@h1{Hello World}@p{This is **bold** and *italic* text.}@code{lang: "python" @@@print("Hello")@@@}}}
```

**Supported Conversions:**

- Headings (`#` → `@h1{}`, `##` → `@h2{}`, etc.)
- Bold (`**text**` → `**text**`)
- Italic (`*text*` → `*text*`)
- Code blocks (` ```lang ` → `@code{lang: "..." @@@...@@@}`)
- Inline code (`` `code` `` → `` `code` ``)

---

## Best Practices

### 1. Use Semantic Block Types

✅ **Good**: Use `@definition{}` for definitions

```khml
@definition{
  term: "Binary Search"
  @@@
  An efficient search algorithm...
  @@@
}
```

❌ **Bad**: Use generic paragraph

```khml
@p{
  **Binary Search**: An efficient search algorithm...
}
```

### 2. Keep Inline Formatting Simple

✅ **Good**: Use inline formats sparingly

```khml
@p{
  Binary search has **O(log n)** time complexity.
}
```

❌ **Bad**: Overuse formatting

```khml
@p{
  **Binary** *search* has **O(log n)** __time__ *complexity*.
}
```

### 3. Use Code Blocks for Multi-Line Code

✅ **Good**: Use `@code{}` block

```khml
@code{
  lang: "python"
  @@@
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    # ...
  @@@
}
```

❌ **Bad**: Use inline code

```khml
@p{
  Code: `def binary_search(arr, target): left, right = 0, len(arr) - 1`
}
```

### 4. Leverage Metadata

✅ **Good**: Use `@meta{}` for structured data

```khml
@article{
  @meta{
    title: "Binary Search"
    author: "Jane Doe"
    tags: ["algorithms", "search"]
    difficulty: intermediate
  }
  @content{...}
}
```

### 5. Use Appropriate Admonitions

- `@note{}` - Informational content
- `@tip{}` - Helpful suggestions
- `@warning{}` - Important cautions
- `@danger{}` - Critical warnings
- `@info{}` - Additional information

---

## Examples

See the `examples/khml/` directory for complete examples:

1. **01-simple-article.khml** - Basic article with headings and lists
2. **02-code-tutorial.khml** - Tutorial with code blocks and execution
3. **03-definition-guide.khml** - Guide with definitions and examples
4. **04-interactive-lesson.khml** - Interactive lesson with tabs, quizzes, and playgrounds

---

## Troubleshooting

### Common Errors

**Error**: "Expected '}' to close block"

```
Solution: Check that all blocks have matching braces.
```

**Error**: "Unexpected token '@' at line X"

```
Solution: Ensure block names are valid identifiers (no spaces).
```

**Error**: "Unterminated string"

```
Solution: Close all quoted strings with matching quotes.
```

### Debugging Tips

1. **Use Validation Endpoint**: Validate syntax before rendering
2. **Check Line Numbers**: Error messages include line/column info
3. **Test Incrementally**: Build documents gradually, testing each section
4. **Review Examples**: Compare with working examples in `examples/khml/`

---

## Next Steps

- **Phase 2.5**: Frontend KHML editor with syntax highlighting
- **Phase 2.6**: Content templates library
- **Phase 3**: Full-text search integration
- **Phase 4**: Interactive playground execution

---

## Resources

- [KHML Specification](../KHML_SPECIFICATION.md) - Complete language reference
- [Type Definitions](../src/khml/types/khml.types.ts) - TypeScript types
- [API Documentation](http://localhost:3001/api/docs) - Swagger UI

---

**Questions or Issues?**  
Open an issue in the repository or contact the development team.

**Last Updated**: January 27, 2026  
**Version**: 1.0  
**Status**: Production Ready ✅
