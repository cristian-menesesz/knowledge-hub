# Phase 1.1: Rich Text Editor - Design Proposal

**Date**: January 25, 2026  
**Status**: 🔄 Planning & Design  
**Phase**: Content Creation & Editing - Rich Text Editor

---

## Overview

Phase 1.1 focuses on building the **core content creation experience** - a powerful, extensible
block-based rich text editor that will serve as the foundation for all content types in the
Knowledge Hub platform.

**Scope**: CMS-001 through CMS-006 (6 primary tasks, ~30 subtasks)

---

## Critical Design Decisions Required

### 🎯 Decision Points for Discussion

#### 1. Editor Library Selection (CMS-001)

**The Big Question**: Build custom or use existing library?

**Option A: Lexical (Meta/Facebook)**

```
✅ Pros:
- Modern, built by Meta (used in Facebook, Instagram)
- Excellent TypeScript support
- Headless (full UI control)
- Built-in collaboration support (operational transforms)
- Active development and community
- Plugin architecture matches our extensibility goals

❌ Cons:
- Relatively new (2022)
- Smaller ecosystem than Slate
- Learning curve for team
- Some features require custom implementation

Cost: ~40 hours learning + integration
Best for: Long-term maintainability, modern stack
```

**Option B: Slate.js**

```
✅ Pros:
- Mature (2016), battle-tested
- Large plugin ecosystem
- Well-documented patterns
- Used by major companies (Dropbox, GitBook)
- More examples and community solutions

❌ Cons:
- More complex API
- Some design decisions feel dated
- Requires more custom code for modern UX
- TypeScript support improving but not native

Cost: ~30 hours integration
Best for: Faster initial development
```

**Option C: Custom (on top of ContentEditable)**

```
✅ Pros:
- Full control over every aspect
- No external dependencies
- Perfectly tailored to our needs
- Deep understanding of implementation

❌ Cons:
- 200-300 hours development time
- Browser compatibility nightmares
- Cursor position edge cases
- Selection/range management complexity
- No collaboration features out of box

Cost: ~300 hours
Best for: Unique requirements we don't have
```

**💡 Recommendation**: **Lexical**

- Aligns with modern React patterns
- Built-in collaboration (needed for CMS-007)
- Meta's backing ensures longevity
- Headless = full design control

**📋 Discussion Points**:

- [ ] Team JavaScript/React proficiency level?
- [ ] Priority: speed to market vs. long-term maintainability?
- [ ] Real-time collaboration timeline (Phase 1.2)?
- [ ] Any unique editor requirements not covered by Lexical?

---

#### 2. Block Architecture (CMS-001)

**Block Schema Design**:

```typescript
// Proposed Block Structure
interface Block {
  id: string; // UUID for reordering
  type: BlockType; // paragraph, heading, code, image, etc.
  properties: Properties; // Block-specific config
  content: Content; // Block data
  metadata?: Metadata; // Optional metadata
}

type BlockType =
  | 'paragraph'
  | 'heading'
  | 'code'
  | 'image'
  | 'embed'
  | 'list'
  | 'quote'
  | 'divider'
  | 'widget'; // Custom widgets

interface Properties {
  [key: string]: any; // Block-specific props
}

// Example: Code Block
interface CodeBlockProperties {
  language: string;
  showLineNumbers: boolean;
  theme: 'light' | 'dark' | 'auto';
  highlightLines?: number[];
}

// Example: Image Block
interface ImageBlockProperties {
  src: string;
  alt: string;
  caption?: string;
  alignment: 'left' | 'center' | 'right' | 'full';
  width?: number;
  height?: number;
}
```

**📋 Discussion Points**:

- [ ] Should blocks be nested (e.g., lists inside lists)?
- [ ] How deep should nesting go?
- [ ] Block validation: runtime or compile-time?
- [ ] Versioning strategy for block schema changes?

---

#### 3. Storage Format (CMS-001, CMS-008)

**The Question**: How to store editor content?

**Option A: Native Editor Format (Lexical JSON)**

```json
{
  "root": {
    "children": [
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "Hello world",
            "format": ["bold"]
          }
        ]
      }
    ]
  }
}
```

✅ Fast editor loading  
✅ No conversion needed  
❌ Tied to editor library  
❌ Hard to query/search

**Option B: Custom Block Format + Editor Adapter**

```json
{
  "blocks": [
    {
      "id": "uuid-1",
      "type": "paragraph",
      "content": {
        "text": "Hello world",
        "marks": [{ "type": "bold", "offset": 0, "length": 5 }]
      }
    }
  ]
}
```

✅ Editor-agnostic  
✅ Easier to migrate  
✅ Custom querying  
❌ Conversion overhead  
❌ Potential data loss

**Option C: Both (Source of Truth + Rendered)**

```
MongoDB (drafts):
  - Native editor format (fast editing)
  - Auto-save every 3-5 seconds

PostgreSQL (published):
  - Custom block format (querying)
  - Markdown representation (backup)
  - Full-text search indexed
```

✅ Best of both worlds  
✅ Redundancy for safety  
❌ Sync complexity  
❌ More storage

**💡 Recommendation**: **Option C (Hybrid)**

- MongoDB for active editing (Lexical format)
- PostgreSQL for published content (custom format)
- Markdown export for portability

**📋 Discussion Points**:

- [ ] Storage cost vs. complexity trade-off?
- [ ] Expected content volume (100s vs. 10,000s)?
- [ ] Query patterns: full-text search frequency?
- [ ] Backup strategy requirements?

---

#### 4. Code Syntax Highlighting (CMS-003)

**Options**:

**Shiki** (VS Code engine):

- ✅ 150+ languages, themes
- ✅ Accurate syntax highlighting
- ✅ VS Code themes compatibility
- ❌ Server-side rendering required (WASM)
- ❌ ~5MB bundle size

**Prism.js**:

- ✅ Lightweight (~2KB core)
- ✅ Client-side only
- ✅ 250+ languages
- ❌ Less accurate than Shiki
- ❌ Manual theme management

**💡 Recommendation**: **Shiki with lazy loading**

- Load on-demand per language
- Cache on CDN
- Better accuracy for technical content

**📋 Discussion Points**:

- [ ] Supported languages priority list?
- [ ] Code execution in editor (Phase 2)?
- [ ] Theme customization needs?

---

#### 5. Image Handling (CMS-004)

**Upload Flow**:

```
User drops image
    ↓
Client-side validation (size, type)
    ↓
Generate presigned URL (MinIO/S3)
    ↓
Direct upload to object storage
    ↓
Webhook/callback to backend
    ↓
Save metadata to PostgreSQL
    ↓
Return URL to editor
    ↓
Insert image block
```

**Processing Pipeline**:

```
Original Upload → MinIO/S3
    ↓
[Media Service - Go]
    ↓
Image Optimization:
├─ Resize (1920px, 1280px, 640px, 320px)
├─ WebP conversion
├─ Thumbnail generation
├─ Metadata extraction (EXIF)
└─ Virus scan
    ↓
Store variants in CDN path
```

**📋 Discussion Points**:

- [ ] Max image size limit? (5MB, 10MB, 20MB?)
- [ ] Allowed formats? (jpg, png, webp, gif, svg?)
- [ ] CDN strategy (CloudFlare, AWS CloudFront, self-hosted)?
- [ ] Image optimization priority (immediate vs. background)?

---

#### 6. Embed Security (CMS-005)

**Security Concerns**:

- XSS attacks via malicious iframes
- Clickjacking
- Data exfiltration
- Malicious JavaScript execution

**Proposed Solution**:

```typescript
// Embed Allowlist
const TRUSTED_EMBED_PROVIDERS = [
  'youtube.com',
  'youtu.be',
  'codesandbox.io',
  'stackblitz.com',
  'codepen.io',
  'gist.github.com',
  'twitter.com',
  'x.com',
];

// Sandbox attributes
const IFRAME_SANDBOX = [
  'allow-scripts',
  'allow-same-origin', // Needed for YouTube
  'allow-popups', // Needed for some embeds
  'allow-forms', // Needed for interactive embeds
].join(' ');

// Content Security Policy
const CSP_FRAME_ANCESTORS = "frame-ancestors 'self' https://trusted-domains.com";
```

**📋 Discussion Points**:

- [ ] Generic iframe support? (security risk)
- [ ] User-submitted embed URLs validation?
- [ ] Embed preview before insertion?
- [ ] Rate limiting on embed requests?

---

## Architecture Proposal

### Frontend Component Structure

```
packages/content-editor/
├── src/
│   ├── Editor.tsx                    # Main editor component
│   ├── plugins/                      # Lexical plugins
│   │   ├── ToolbarPlugin.tsx        # Formatting toolbar
│   │   ├── BlockPickerPlugin.tsx    # Slash commands
│   │   ├── DragDropPlugin.tsx       # Block reordering
│   │   ├── ImagePlugin.tsx          # Image blocks
│   │   ├── CodePlugin.tsx           # Code blocks
│   │   └── EmbedPlugin.tsx          # Embed blocks
│   ├── blocks/                       # Block components
│   │   ├── ParagraphBlock.tsx
│   │   ├── HeadingBlock.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── ImageBlock.tsx
│   │   └── EmbedBlock.tsx
│   ├── toolbar/                      # Toolbar components
│   │   ├── TextFormatToolbar.tsx
│   │   ├── BlockTypeDropdown.tsx
│   │   └── InsertMenu.tsx
│   ├── utils/
│   │   ├── blockRegistry.ts         # Extensibility system
│   │   ├── serialization.ts         # Save/load format
│   │   └── validation.ts            # Block validation
│   └── types/
│       ├── blocks.ts                # Block type definitions
│       └── editor.ts                # Editor types
```

### Backend Service Structure

```
apps/services/content-service/
├── src/
│   ├── modules/
│   │   ├── drafts/                   # CMS-008, CMS-011
│   │   │   ├── drafts.controller.ts
│   │   │   ├── drafts.service.ts
│   │   │   ├── drafts.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-draft.dto.ts
│   │   │       ├── update-draft.dto.ts
│   │   │       └── draft-response.dto.ts
│   │   ├── content/                  # CMS-012, CMS-017
│   │   │   ├── content.controller.ts
│   │   │   ├── content.service.ts
│   │   │   ├── content.repository.ts
│   │   │   └── types/
│   │   │       └── content-types.ts  # Articles, Experiments, etc.
│   │   └── versions/                 # CMS-013
│   │       ├── versions.controller.ts
│   │       ├── versions.service.ts
│   │       └── versions.repository.ts
│   ├── entities/
│   │   ├── draft.entity.ts           # MongoDB schema
│   │   ├── content.entity.ts         # PostgreSQL schema
│   │   └── version.entity.ts         # PostgreSQL schema
│   └── events/
│       ├── content-published.event.ts
│       └── draft-saved.event.ts
```

---

## Data Models

### MongoDB (Drafts - Active Editing)

```typescript
// MongoDB Collection: content_drafts
interface DraftDocument {
  _id: ObjectId;
  userId: string; // Author
  contentType: 'article' | 'experiment' | 'snippet' | '...';
  status: 'draft' | 'in-review' | 'scheduled';

  // Editor content (Lexical format)
  editorState: {
    root: {
      children: Array<LexicalNode>;
    };
  };

  // Metadata
  metadata: {
    title?: string;
    slug?: string;
    tags?: string[];
    concepts?: string[];
  };

  // Versioning
  version: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastAutoSave: Date;

  // Collaboration (Phase 1.2)
  collaborators?: string[];
  lockedBy?: string;
  lockedAt?: Date;
}
```

### PostgreSQL (Published Content)

```sql
-- Table: contents
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  content_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'published',

  -- Content
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  body JSONB NOT NULL,  -- Custom block format
  body_markdown TEXT,   -- Markdown representation
  excerpt TEXT,

  -- SEO
  meta_description VARCHAR(160),
  canonical_url VARCHAR(1000),

  -- Organization
  tags TEXT[],
  concepts UUID[],

  -- Search
  search_vector TSVECTOR,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_contents_slug ON contents(slug);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_created_at ON contents(created_at DESC);
CREATE INDEX idx_contents_search_vector ON contents USING GIN(search_vector);
CREATE INDEX idx_contents_tags ON contents USING GIN(tags);

-- Table: content_versions
CREATE TABLE content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id),
  version_number INT NOT NULL,

  -- Snapshot
  snapshot JSONB NOT NULL,  -- Complete content snapshot

  -- Change metadata
  changed_by UUID NOT NULL REFERENCES users(id),
  change_summary TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(content_id, version_number)
);

CREATE INDEX idx_versions_content_id ON content_versions(content_id, version_number DESC);
```

---

## API Endpoints Design

### Draft Management

```typescript
// POST /api/v1/drafts
// Create new draft
{
  contentType: 'article',
  metadata: {
    title: 'Getting Started with React'
  }
}
→ { id, userId, contentType, status, createdAt }

// GET /api/v1/drafts/:id
// Load draft for editing
→ { id, editorState, metadata, version, updatedAt }

// PATCH /api/v1/drafts/:id
// Auto-save (every 3-5 seconds)
{
  editorState: {...},
  metadata: {...},
  version: 5  // Optimistic locking
}
→ { version: 6, lastAutoSave }

// POST /api/v1/drafts/:id/publish
// Publish draft
{
  publishAt?: '2026-01-30T10:00:00Z',  // Optional schedule
  metadata: {
    title: 'Final Title',
    slug: 'getting-started-react',
    tags: ['react', 'tutorial'],
    concepts: ['uuid1', 'uuid2']
  }
}
→ { contentId, publishedAt, url }

// GET /api/v1/drafts
// List user's drafts
?status=draft&page=1&limit=20
→ { drafts: [], total, page, limit }
```

### Content Management

```typescript
// GET /api/v1/content/:id
// Get published content
→ { id, title, slug, body, metadata, publishedAt }

// GET /api/v1/content/:id/versions
// Get version history
→ { versions: [{ version, createdAt, changedBy, summary }] }

// GET /api/v1/content/:id/versions/:version
// Get specific version
→ { version, snapshot, diff }

// POST /api/v1/content/:id/versions/:version/restore
// Rollback to version
→ { newVersion, restoredFrom }
```

---

## Technology Stack Recommendations

### Editor Core

- **Lexical** - Meta's modern editor framework
- **React 18** - UI framework
- **TypeScript** - Type safety

### Code Highlighting

- **Shiki** - VS Code syntax engine
- **WASM loader** - Client-side execution

### Drag & Drop

- **@dnd-kit** - Modern DnD library
- **React DnD** - Alternative (more mature)

### Image Upload

- **react-dropzone** - File upload
- **MinIO SDK** - Direct S3-compatible upload

### Embeds

- **oembed-parser** - oEmbed protocol
- **DOMPurify** - XSS sanitization

### State Management

- **Zustand** - Lightweight state
- **React Query** - Server state

---

## Development Phases

### Phase 1.1.1: Core Editor (Weeks 1-2)

- [ ] Set up Lexical editor
- [ ] Basic text formatting (bold, italic, etc.)
- [ ] Paragraph and heading blocks
- [ ] Toolbar implementation
- [ ] Save/load functionality

### Phase 1.1.2: Rich Blocks (Weeks 3-4)

- [ ] Code blocks with syntax highlighting
- [ ] Image blocks with upload
- [ ] Lists and quotes
- [ ] Block drag-and-drop

### Phase 1.1.3: Advanced Features (Weeks 5-6)

- [ ] Embed blocks
- [ ] Custom widgets (callouts, charts)
- [ ] Markdown import/export
- [ ] Auto-save with conflict detection

---

## Testing Strategy

### Unit Tests

```typescript
// Block serialization
describe('CodeBlock', () => {
  it('should serialize to custom format', () => {
    const block = createCodeBlock({ language: 'typescript', code: '...' });
    const serialized = serializeBlock(block);
    expect(serialized).toMatchSnapshot();
  });
});

// Editor operations
describe('Editor', () => {
  it('should insert image block', () => {
    const editor = createEditor();
    editor.insertBlock('image', { src: 'test.jpg' });
    expect(editor.getBlocks()).toHaveLength(1);
  });
});
```

### Integration Tests

```typescript
// Auto-save
describe('Auto-save', () => {
  it('should save after 3 seconds of inactivity', async () => {
    render(<Editor draftId="123" />);
    userEvent.type(screen.getByRole('textbox'), 'Hello');
    await waitFor(() => expect(mockSave).toHaveBeenCalled(), { timeout: 4000 });
  });
});
```

### E2E Tests

```typescript
// Full editing workflow
test('create and publish article', async ({ page }) => {
  await page.goto('/editor/new');
  await page.fill('[data-testid="title"]', 'Test Article');
  await page.fill('.editor', 'Content here');
  await page.click('[data-testid="publish"]');
  await expect(page).toHaveURL(/\/articles\/.+/);
});
```

---

## Performance Targets

- **Editor Load**: < 1s (lazy load plugins)
- **Auto-save**: < 200ms (debounced network)
- **Image Upload**: < 3s for 5MB image
- **Syntax Highlight**: < 100ms (cached)
- **Block Render**: < 16ms (60fps)

---

## Accessibility Requirements

- **Keyboard Navigation**: Full editor control via keyboard
- **Screen Readers**: ARIA labels on all controls
- **Color Contrast**: WCAG AA compliance
- **Focus Indicators**: Visible focus states
- **Keyboard Shortcuts**: Standard shortcuts (Ctrl+B, etc.)

---

## Discussion Topics Summary

### 🔴 High Priority (Must Decide Before Starting)

1. **Editor Library**: Lexical vs. Slate vs. Custom?
2. **Storage Format**: Native vs. Custom vs. Hybrid?
3. **Image Upload Flow**: Direct S3 vs. Backend proxy?

### 🟡 Medium Priority (Can Decide During Development)

4. **Code Syntax**: Shiki vs. Prism?
5. **Block Nesting**: How deep to allow?
6. **Embed Security**: Whitelist vs. sandbox everything?

### 🟢 Low Priority (Can Defer)

7. **Theme System**: Light/dark/custom?
8. **Plugin Marketplace**: Allow user extensions?
9. **Offline Support**: Service worker caching?

---

## Next Steps

### Immediate Actions (This Week)

1. **Team Review**: Schedule design review meeting
2. **Prototyping**: Build simple Lexical proof-of-concept
3. **Architecture Decision Records**: Document key decisions
4. **Setup Repository**: Create `packages/content-editor/`
5. **Initial Stories**: Break down CMS-001 into Jira/Linear tasks

### Week 1 Sprint Goals

- [ ] Initialize content-editor package
- [ ] Set up Lexical with basic config
- [ ] Implement paragraph and heading blocks
- [ ] Create simple toolbar
- [ ] Draft persistence (localStorage for now)

---

## Open Questions

1. **Collaboration**: Real-time co-editing in Phase 1.1 or Phase 1.2?
2. **Mobile**: Mobile editing experience priority? (Could use separate simplified editor)
3. **Templates**: Pre-built content templates needed?
4. **Import**: Import from Medium/Dev.to/Ghost?
5. **AI Integration**: AI writing assistance (future phase)?

---

**Next Document**: [Phase 1.2: Real-time Features Design](./phase-1.2-realtime-design.md) (TBD)
