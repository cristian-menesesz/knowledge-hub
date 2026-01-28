import { Clock, Calendar, Tag, ArrowLeft, Loader2 } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHighlighter, type Highlighter } from 'shiki';

import type { ContentDetail } from '../api/content';
import { contentApi } from '../api/content';

import TableOfContents from './TableOfContents';

const ContentReader: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState<ContentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const highlighterRef = useRef<Highlighter | null>(null);

  // Initialize Shiki highlighter
  useEffect(() => {
    const initHighlighter = async () => {
      try {
        highlighterRef.current = await getHighlighter({
          themes: ['github-dark', 'github-light'],
          langs: [
            'javascript',
            'typescript',
            'python',
            'java',
            'go',
            'rust',
            'json',
            'yaml',
            'markdown',
            'bash',
            'sql',
            'html',
            'css',
          ],
        });
      } catch (err) {
        console.error('Failed to initialize syntax highlighter:', err);
      }
    };

    initHighlighter();
  }, []);

  // Fetch content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let data: ContentDetail;
        if (id) {
          data = await contentApi.getById(id);
        } else if (slug) {
          data = await contentApi.getBySlug(slug);
        } else {
          throw new Error('No ID or slug provided');
        }

        setContent(data);
      } catch (err) {
        console.error('Failed to fetch content:', err);
        setError('Failed to load content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id, slug]);

  // Apply syntax highlighting to code blocks
  useEffect(() => {
    if (!content || !contentRef.current || !highlighterRef.current) return;

    const applyHighlighting = () => {
      const codeBlocks = contentRef.current!.querySelectorAll('pre code');

      codeBlocks.forEach((block) => {
        const codeElement = block as HTMLElement;
        const preElement = codeElement.parentElement as HTMLPreElement;

        // Extract language from class name (e.g., "language-typescript")
        const className = codeElement.className;
        const langMatch = className.match(/language-(\w+)/);
        const lang = langMatch ? langMatch[1] : 'text';

        // Get code content
        const code = codeElement.textContent || '';

        try {
          // Generate highlighted HTML
          const html = highlighterRef.current!.codeToHtml(code, {
            lang: lang,
            theme: 'github-light',
          });

          // Replace pre element with highlighted version
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          const highlightedPre = tempDiv.firstChild as HTMLPreElement;

          if (highlightedPre) {
            // Copy any existing classes
            highlightedPre.className = preElement.className;
            preElement.replaceWith(highlightedPre);
          }
        } catch (err) {
          console.error(`Failed to highlight code block (lang: ${lang}):`, err);
        }
      });
    };

    // Small delay to ensure DOM is ready
    setTimeout(applyHighlighting, 50);
  }, [content]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Content Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'The content you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Table of Contents */}
          {content.tableOfContents && content.tableOfContents.length > 0 && (
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                <TableOfContents items={content.tableOfContents} />
              </div>
            </aside>
          )}

          {/* Article Content */}
          <article
            className={`${
              content.tableOfContents && content.tableOfContents.length > 0
                ? 'lg:col-span-3'
                : 'lg:col-span-4 max-w-reading mx-auto'
            }`}
          >
            {/* Article Header */}
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {content.title}
              </h1>

              {content.description && (
                <p className="text-xl text-gray-600 mb-6">
                  {content.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {content.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(content.publishedAt)}</span>
                  </div>
                )}

                {content.readingTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{content.readingTime} min read</span>
                  </div>
                )}

                {content.category && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                    {content.category}
                  </span>
                )}
              </div>

              {/* Tags */}
              {content.tags && content.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </header>

            {/* Article Body */}
            <div
              ref={contentRef}
              className="reading-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content.html }}
            />
          </article>
        </div>
      </div>
    </div>
  );
};

export default ContentReader;
