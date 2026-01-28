# Content Reader MFE

Content reading microfrontend for Knowledge Hub platform. Provides optimized reading experience for
published content.

## Features

- **Content Display**: Render published articles, tutorials, and guides
- **Reading Layout**: Optimized typography and spacing for comfortable reading
- **Table of Contents**: Auto-generated navigation for long-form content
- **Responsive Design**: Mobile-first responsive layout
- **Reading Time**: Estimated reading time display
- **Tags & Categories**: Content organization and filtering
- **Pagination**: Efficient content browsing

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Module Federation** - Microfrontend architecture
- **Axios** - HTTP client

## Development

```bash
# Install dependencies
npm install

# Start dev server (port 3011)
npm run dev

# Type check
npm run type-check

# Build for production
npm run build
```

## API Integration

Connects to Content Service at `/api/v1/contents`:

- `GET /contents` - List published content
- `GET /contents/:id` - Get content by ID
- `GET /contents/slug/:slug` - Get content by slug
- `GET /contents/:id/related` - Get related content

## Module Federation

Exposed modules:

- `./App` - Main application component
- `./ContentReader` - Content reader component

Shared dependencies:

- `react`, `react-dom` - Singleton shared
- `react-router-dom` - Singleton shared

## Routes

- `/` - Content list page
- `/content/:id` - Content reader by ID
- `/content/slug/:slug` - Content reader by slug

## Styling

Reading-optimized CSS:

- Max-width: 800px for comfortable reading
- Line height: 1.7 for better readability
- Font size: 1.125rem (18px)
- Syntax highlighting styles for code blocks
- Responsive typography scaling

## Components

- **ContentReader** - Main content display component
- **ContentList** - Content listing with pagination
- **TableOfContents** - Auto-generated navigation with scroll spy
- **Content API** - API client module

## Port

Default port: **3011**

## Phase

Phase 2.7 - Content Reader MFE
