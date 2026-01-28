# KHub Markup Language (KHML) Specification v1.0

**KHub Markup Language** is a LaTeX-inspired markup language designed specifically for educational and technical knowledge content. It provides powerful, precise control over content structure while remaining human-readable and version-control friendly.

## Philosophy

- **Explicit over implicit**: Every element has clear delimiters
- **Structured**: Designed for knowledge management, not just formatting
- **Extensible**: Easy to add new block types
- **Parseable**: Converts to structured JSONB for storage and querying
- **Human-readable**: Source is readable without rendering

## Document Structure

```khml
@article{
  @meta{
    title: "Introduction to Algorithms"
    author: "John Doe"
    difficulty: intermediate
    tags: [algorithms, computer-science, data-structures]
  }

  @content{
    ...blocks...
  }
}
```

## Core Block Types

### 1. Text Blocks

#### Paragraph

```khml
@p{Regular paragraph text with **bold**, *italic*, and `code` inline formatting.}
```

#### Headings

```khml
@h1{Main Title}
@h2{Section Title}
@h3{Subsection Title}
@h4{Minor Heading}
```

#### Quote

```khml
@quote{
  text: "The only way to learn a new programming language is by writing programs in it."
  author: "Dennis Ritchie"
  source: "The C Programming Language"
}
```

### 2. Code Blocks

#### Basic Code Block

```khml
@code{
  lang: typescript
  @@@
  function fibonacci(n: number): number {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
  @@@
}
```

#### Executable Code Block (with output)

```khml
@exec{
  lang: python
  runnable: true
  @@@
  def factorial(n):
      return 1 if n <= 1 else n * factorial(n - 1)

  print(factorial(5))
  @@@

  @output{
    120
  }
}
```

#### Code with Highlights

```khml
@code{
  lang: javascript
  highlight: [2, 3, 5]
  title: "Array Map Example"
  @@@
  const numbers = [1, 2, 3, 4, 5];
  const doubled = numbers.map(n => n * 2);
  console.log(doubled);
  // Output: [2, 4, 6, 8, 10]
  @@@
}
```

### 3. Lists

#### Unordered List

```khml
@ul{
  @li{First item with **bold** text}
  @li{Second item with nested list:
    @ul{
      @li{Nested item 1}
      @li{Nested item 2}
    }
  }
  @li{Third item}
}
```

#### Ordered List

```khml
@ol{
  @li{First step}
  @li{Second step}
  @li{Third step}
}
```

#### Definition List

```khml
@dl{
  @dt{REST API}
  @dd{Representational State Transfer Application Programming Interface}

  @dt{GraphQL}
  @dd{A query language for APIs and runtime for executing queries}
}
```

### 4. Educational Blocks

#### Definition/Concept

```khml
@def{
  term: "Big O Notation"
  type: concept
  @content{
    A mathematical notation describing the limiting behavior of a function
    when the argument tends towards infinity. Used to classify algorithms
    by time or space complexity.
  }
  @example{
    O(1) - constant time
    O(n) - linear time
    O(n²) - quadratic time
  }
}
```

#### Theorem/Lemma/Proof

```khml
@theorem{
  name: "Pythagorean Theorem"
  @statement{
    In a right triangle, the square of the hypotenuse equals
    the sum of squares of the other two sides.
  }
  @formula{
    a² + b² = c²
  }
  @proof{
    [Proof content here...]
  }
}
```

#### Example

```khml
@example{
  title: "Binary Search Implementation"
  difficulty: intermediate
  @description{
    Demonstrates how binary search divides the search space in half
    with each iteration, achieving O(log n) time complexity.
  }
  @code{
    lang: python
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
  @explanation{
    The algorithm maintains two pointers and narrows the search range
    by comparing the middle element with the target.
  }
}
```

### 5. Admonitions (Callouts)

```khml
@note{
  Remember to always validate user input before processing!
}

@warning{
  This operation is **irreversible**. Make sure to backup your data first.
}

@tip{
  Use `async/await` syntax for cleaner asynchronous code.
}

@danger{
  **Never** store passwords in plain text! Always use proper hashing algorithms.
}

@info{
  title: "Performance Consideration"
  This approach has O(n²) complexity. For large datasets, consider using a hash map.
}
```

### 6. Mathematical Expressions

#### Inline Math

```khml
@p{The quadratic formula is @math{x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}}.}
```

#### Block Math

```khml
@equation{
  label: quadratic
  @@@
  x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}
  @@@
}
```

#### Multiple Equations

```khml
@align{
  @@@
  E &= mc^2 \\
  F &= ma \\
  a^2 + b^2 &= c^2
  @@@
}
```

### 7. Media

#### Image

```khml
@img{
  src: "/media/architecture-diagram.png"
  alt: "System Architecture Diagram"
  caption: "Microservices architecture with API Gateway"
  width: 800
  align: center
}
```

#### Figure with Multiple Images

```khml
@figure{
  caption: "Before and After Optimization"
  @img{src: "/media/before.png" alt: "Before optimization"}
  @img{src: "/media/after.png" alt: "After optimization"}
}
```

#### Video

```khml
@video{
  src: "/media/tutorial.mp4"
  poster: "/media/thumbnail.jpg"
  caption: "Getting Started Tutorial"
  controls: true
}
```

### 8. Interactive Elements

#### Tabs

```khml
@tabs{
  @tab{
    label: "JavaScript"
    @code{lang: javascript
      @@@
      const greeting = "Hello, World!";
      console.log(greeting);
      @@@
    }
  }
  @tab{
    label: "Python"
    @code{lang: python
      @@@
      greeting = "Hello, World!"
      print(greeting)
      @@@
    }
  }
  @tab{
    label: "Rust"
    @code{lang: rust
      @@@
      fn main() {
          println!("Hello, World!");
      }
      @@@
    }
  }
}
```

#### Accordion/Collapsible

```khml
@collapse{
  title: "Advanced Details"
  collapsed: true
  @p{This content is hidden by default and can be expanded by the user.}
}
```

#### Quiz/Exercise

```khml
@quiz{
  question: "What is the time complexity of binary search?"
  type: multiple-choice
  @option{value: "O(n)" correct: false}
  @option{value: "O(log n)" correct: true}
  @option{value: "O(n²)" correct: false}
  @option{value: "O(1)" correct: false}
  @explanation{
    Binary search divides the search space in half with each iteration,
    resulting in logarithmic time complexity.
  }
}
```

### 9. Tables

#### Simple Table

```khml
@table{
  @thead{
    @tr{
      @th{Algorithm}
      @th{Best Case}
      @th{Average Case}
      @th{Worst Case}
    }
  }
  @tbody{
    @tr{
      @td{Quick Sort}
      @td{O(n log n)}
      @td{O(n log n)}
      @td{O(n²)}
    }
    @tr{
      @td{Merge Sort}
      @td{O(n log n)}
      @td{O(n log n)}
      @td{O(n log n)}
    }
  }
}
```

### 10. References and Links

#### Internal Link (to other content)

```khml
@link{ref: "content:123" text: "See our guide on Data Structures"}
```

#### External Link

```khml
@link{href: "https://example.com" text: "Official Documentation"}
```

#### Footnote

```khml
@p{
  TypeScript is a superset of JavaScript@footnote{ref: 1}.
}

@footnotes{
  @fn{id: 1 text: "Developed by Microsoft and released in 2012"}
}
```

#### Citation

```khml
@cite{
  key: "knuth1997"
  author: "Donald E. Knuth"
  title: "The Art of Computer Programming"
  year: 1997
  publisher: "Addison-Wesley"
}
```

### 11. Layout Blocks

#### Columns

```khml
@columns{
  count: 2
  @column{
    @h3{Left Column}
    @p{Content for the left side}
  }
  @column{
    @h3{Right Column}
    @p{Content for the right side}
  }
}
```

#### Grid

```khml
@grid{
  cols: 3
  gap: 20
  @card{
    @h4{Card 1}
    @p{First card content}
  }
  @card{
    @h4{Card 2}
    @p{Second card content}
  }
  @card{
    @h4{Card 3}
    @p{Third card content}
  }
}
```

### 12. Advanced Blocks

#### Mermaid Diagrams

```khml
@diagram{
  type: mermaid
  @@@
  graph TD
    A[Client] --> B[API Gateway]
    B --> C[Auth Service]
    B --> D[Content Service]
    D --> E[Database]
  @@@
}
```

#### Interactive Code Playground

```khml
@playground{
  lang: javascript
  template: "react"
  files: {
    "App.js": @@@
      import React from 'react';

      function App() {
        return <h1>Hello World</h1>;
      }

      export default App;
    @@@
    "index.js": @@@
      import React from 'react';
      import ReactDOM from 'react-dom';
      import App from './App';

      ReactDOM.render(<App />, document.getElementById('root'));
    @@@
  }
}
```

## Inline Formatting

### Text Formatting

- `**bold text**` → **bold text**
- `*italic text*` → _italic text_
- `__underline__` → <u>underline</u>
- `~~strikethrough~~` → ~~strikethrough~~
- `` `inline code` `` → `inline code`
- `^superscript^` → <sup>superscript</sup>
- `~subscript~` → <sub>subscript</sub>

### Keyboard Shortcuts

- `@kbd{Ctrl+C}` → <kbd>Ctrl+C</kbd>
- `@kbd{Cmd+V}` → <kbd>Cmd+V</kbd>

### Highlights

- `@mark{highlighted text}` → <mark>highlighted text</mark>

## Metadata and Attributes

All blocks can have attributes:

```khml
@code{
  id: "example-1"
  lang: typescript
  highlight: [1, 2, 3]
  class: "custom-styling"
  data-analytics: "code-snippet"
  @@@
  // code here
  @@@
}
```

## Comments

```khml
// Single-line comment (not rendered)

/*
  Multi-line comment
  Also not rendered
*/
```

## Variables and Reusable Content

```khml
@var{name: "apiEndpoint" value: "https://api.example.com/v1"}

@p{The API is hosted at @{apiEndpoint}/users}
```

## Imports and Includes

```khml
@import{file: "./common/header.khml"}

@include{
  content: "definition:binary-search"
  type: definition
}
```

## JSONB Output Structure

KHML is parsed into structured JSONB stored in the database:

```json
{
  "version": "1.0",
  "blocks": [
    {
      "id": "block-1",
      "type": "heading",
      "level": 1,
      "content": "Introduction to Algorithms"
    },
    {
      "id": "block-2",
      "type": "paragraph",
      "content": "Algorithms are step-by-step procedures...",
      "formatting": [{ "start": 15, "end": 29, "type": "bold" }]
    },
    {
      "id": "block-3",
      "type": "code",
      "language": "python",
      "code": "def binary_search(arr, target):\n    ...",
      "highlight": [1, 2],
      "executable": false
    },
    {
      "id": "block-4",
      "type": "definition",
      "term": "Big O Notation",
      "definitionType": "concept",
      "content": "Mathematical notation...",
      "examples": ["O(1)", "O(n)", "O(n²)"]
    }
  ],
  "metadata": {
    "version": "1.0",
    "createdAt": "2026-01-27T10:00:00Z",
    "updatedAt": "2026-01-27T10:00:00Z"
  }
}
```

## Validation Rules

1. **Block Nesting**: Some blocks cannot be nested (e.g., headings cannot contain code blocks)
2. **Required Attributes**: Certain blocks require specific attributes (e.g., `@code` requires `lang`)
3. **Content Delimiters**: Multi-line content uses `@@@` delimiters
4. **Closing Braces**: All opening `{` must have matching `}`
5. **Escaping**: Use `\` to escape special characters: `\@`, `\{`, `\}`

## Examples

### Complete Article Example

```khml
@article{
  @meta{
    title: "Understanding Binary Search"
    author: "John Doe"
    difficulty: intermediate
    tags: [algorithms, search, binary-search]
    estimatedReadingTime: 10
  }

  @content{
    @h1{Understanding Binary Search}

    @p{
      Binary search is one of the most efficient searching algorithms
      for **sorted arrays**. It works by repeatedly dividing the search
      interval in half.
    }

    @def{
      term: "Binary Search"
      type: algorithm
      @content{
        A search algorithm that finds the position of a target value
        within a sorted array by comparing the target to the middle
        element and eliminating half of the search space.
      }
    }

    @h2{How It Works}

    @ol{
      @li{Compare target with the middle element}
      @li{If target equals middle, return the position}
      @li{If target is less, search the left half}
      @li{If target is greater, search the right half}
      @li{Repeat until found or search space is empty}
    }

    @h2{Implementation}

    @tabs{
      @tab{
        label: "Python"
        @code{
          lang: python
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
      }
      @tab{
        label: "TypeScript"
        @code{
          lang: typescript
          @@@
          function binarySearch(arr: number[], target: number): number {
            let left = 0;
            let right = arr.length - 1;

            while (left <= right) {
              const mid = Math.floor((left + right) / 2);

              if (arr[mid] === target) {
                return mid;
              } else if (arr[mid] < target) {
                left = mid + 1;
              } else {
                right = mid - 1;
              }
            }

            return -1;
          }
          @@@
        }
      }
    }

    @h2{Complexity Analysis}

    @table{
      @thead{
        @tr{
          @th{Case}
          @th{Time Complexity}
          @th{Space Complexity}
        }
      }
      @tbody{
        @tr{
          @td{Best}
          @td{O(1)}
          @td{O(1)}
        }
        @tr{
          @td{Average}
          @td{O(log n)}
          @td{O(1)}
        }
        @tr{
          @td{Worst}
          @td{O(log n)}
          @td{O(1)}
        }
      }
    }

    @warning{
      Binary search **only works on sorted arrays**. If the array is
      unsorted, you must sort it first (which takes O(n log n) time).
    }

    @h2{Interactive Example}

    @playground{
      lang: javascript
      runnable: true
      @@@
      const arr = [1, 3, 5, 7, 9, 11, 13, 15];
      const target = 7;

      const result = binarySearch(arr, target);
      console.log(`Found at index: ${result}`);
      @@@
    }
  }
}
```

## Grammar (EBNF)

```ebnf
document       = block+ ;
block          = "@" identifier "{" attributes? content "}" ;
attributes     = attribute ("," attribute)* ;
attribute      = identifier ":" value ;
value          = string | number | boolean | array | object ;
content        = (text | inline | block | raw_content)* ;
inline         = "**" text "**"
               | "*" text "*"
               | "`" text "`"
               | "@" identifier "{" text "}" ;
raw_content    = "@@@" text "@@@" ;
```

## Parser Implementation Notes

The parser should:

1. **Tokenize** the input into blocks and inline elements
2. **Validate** block types and required attributes
3. **Transform** into structured JSONB
4. **Preserve** source positions for error reporting
5. **Support** incremental parsing for large documents
6. **Handle** gracefully syntax errors with helpful messages

## Renderer Implementation Notes

The renderer should:

1. **Convert** JSONB blocks to HTML
2. **Apply** syntax highlighting for code blocks
3. **Render** math expressions (KaTeX/MathJax)
4. **Handle** interactive elements (tabs, collapsibles)
5. **Support** themes and custom styling
6. **Generate** accessible markup (ARIA labels, semantic HTML)

## Version History

- **v1.0** (2026-01-27): Initial specification

## License

This specification is part of the Knowledge Hub platform.
