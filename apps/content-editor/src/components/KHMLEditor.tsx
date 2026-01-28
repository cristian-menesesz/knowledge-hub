import Editor from '@monaco-editor/react';
import {
  FileText,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  Clock,
  Send,
} from 'lucide-react';
import type { editor } from 'monaco-editor';
import { useState, useEffect, useCallback, useRef } from 'react';

import type { ContentType } from '../api/content';
import { contentApi, ContentDifficulty } from '../api/content';
import { draftApi } from '../api/draft';
import { khmlApi } from '../api/khml';
import { useToast } from '../hooks/useToast';

import ConfirmModal from './ConfirmModal';
import ToastContainer from './ToastContainer';

const INITIAL_KHML = `@article{
  @meta[
    title="Getting Started with KHML",
    author="Knowledge Hub",
    difficulty="beginner"
  ]{}
  
  @content{
    @h1{Welcome to KHML Editor}
    
    @paragraph{
      This is a **live KHML editor** with real-time preview. 
      Start typing to see your content rendered on the right!
    }
    
    @note{
      KHML (KHub Markup Language) is our custom markup language 
      designed for educational content.
    }
    
    @h2{Try Some Features}
    
    @paragraph{You can add *italic*, **bold**, \`code\`, __underline__, and ~~strikethrough~~ text.}
    
    @code[lang=javascript]{@@@
function hello() {
  console.log("Hello, KHML!");
}
@@@}
    
    @tip{
      Use **Ctrl+Space** for autocomplete suggestions!
    }
  }
}`;

interface ValidationError {
  line: number;
  column: number;
  message: string;
}

export default function KHMLEditor() {
  const [source, setSource] = useState<string>(INITIAL_KHML);
  const [preview, setPreview] = useState<string>('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toasts, dismissToast, success, error: showError } = useToast();

  // Initialize draft on mount
  useEffect(() => {
    const initializeDraft = async () => {
      try {
        // TODO: Get authorId from auth context
        const draft = await draftApi.create({
          title: 'Untitled Draft',
          content: INITIAL_KHML,
          authorId: 'temp-author-id', // Replace with actual auth
          contentType: 'article',
          tags: [],
          category: 'uncategorized',
        });
        setDraftId(draft.id);
        setLastSaved(new Date(draft.updatedAt));
      } catch (err) {
        console.error('Failed to initialize draft:', err);
        showError('Failed to create draft');
      }
    };

    initializeDraft();
  }, [showError]);

  // Auto-save effect
  useEffect(() => {
    if (!draftId || !hasUnsavedChanges) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new auto-save timer (30 seconds)
    autoSaveTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const result = await draftApi.autoSave(draftId, source);
        setLastSaved(new Date(result.lastSavedAt));
        setHasUnsavedChanges(false);
        success('Draft saved', 2000);
      } catch (err) {
        console.error('Auto-save failed:', err);
        showError('Failed to save draft');
      } finally {
        setIsSaving(false);
      }
    }, 30000); // 30 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [draftId, source, hasUnsavedChanges, success, showError]);

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!source) return;

      setIsValidating(true);
      try {
        const result = await khmlApi.validate(source);
        setErrors(result.valid ? [] : result.errors);
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setIsValidating(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [source]);

  // Debounced rendering
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!source) {
        setPreview('');
        return;
      }

      setIsRendering(true);
      try {
        const result = await khmlApi.render(source);
        setPreview(result.html);

        // Update word count
        const textResult = await khmlApi.extractText(source);
        const words = textResult.text.trim().split(/\s+/).filter(Boolean);
        setWordCount(words.length);
      } catch (error) {
        console.error('Render error:', error);
        setPreview('<div class="error">Failed to render KHML</div>');
      } finally {
        setIsRendering(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [source]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    setSource(value || '');
    setHasUnsavedChanges(true);
  }, []);

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    // Configure Monaco Editor options
    editor.updateOptions({
      fontSize: 14,
      lineNumbers: 'on',
      minimap: { enabled: false },
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
    });

    // Add KHML syntax highlighting (basic)
    // TODO: Add proper KHML language definition
  };

  const validationStatus = errors.length === 0 && !isValidating;

  // Format last saved time
  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Not saved';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Handle publish
  const handlePublish = async () => {
    if (!draftId) {
      showError('No draft to publish');
      return;
    }

    // Save draft first if there are unsaved changes
    if (hasUnsavedChanges) {
      try {
        setIsSaving(true);
        await draftApi.autoSave(draftId, source);
        setHasUnsavedChanges(false);
      } catch (err) {
        showError('Failed to save draft before publishing');
        setIsSaving(false);
        return;
      } finally {
        setIsSaving(false);
      }
    }

    setShowPublishModal(true);
  };

  const confirmPublish = async () => {
    setShowPublishModal(false);
    setIsPublishing(true);

    try {
      // Get draft data to extract metadata
      const draft = await draftApi.getById(draftId!);

      // Create published content
      const content = await contentApi.create({
        title: draft.title,
        slug: draft.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        description: draft.title, // TODO: Extract from meta block
        contentType: draft.contentType as ContentType,
        authorId: draft.authorId,
        tags: draft.tags || [],
        concepts: [],
        category: 'uncategorized',
        difficulty: ContentDifficulty.BEGINNER,
        khmlContent: draft.content,
      });

      success(`Content published successfully! ID: ${content.id}`);

      // Note: Draft status management handled by backend
      // We keep the draft for version history
    } catch (err: any) {
      console.error('Failed to publish content:', err);
      showError(err.response?.data?.message || 'Failed to publish content');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5" />
          <h1 className="text-lg font-semibold">KHML Editor</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Auto-save status */}
          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <Save className="h-4 w-4 animate-pulse text-blue-500" />
                <span className="text-sm text-blue-600">Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600">Unsaved changes</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  Saved {formatLastSaved(lastSaved)}
                </span>
              </>
            ) : null}
          </div>

          {/* Word count */}
          <span className="text-sm text-muted-foreground">
            {wordCount} words
          </span>

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={isPublishing || isSaving || !draftId}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Publish</span>
              </>
            )}
          </button>

          {/* Validation status */}
          <div className="flex items-center gap-2">
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Validating...
                </span>
              </>
            ) : validationStatus ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Valid</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">
                  {errors.length} error(s)
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Editor and Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Pane */}
        <div className="flex w-1/2 flex-col border-r">
          <div className="flex items-center gap-2 border-b bg-muted px-4 py-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            <span>KHML Source</span>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="markdown"
              value={source}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 2,
              }}
            />
          </div>

          {/* Error Panel */}
          {errors.length > 0 && (
            <div className="max-h-40 overflow-y-auto border-t bg-destructive/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Validation Errors</span>
              </div>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div
                    key={index}
                    className="rounded border-l-4 border-destructive bg-background p-2 text-sm"
                  >
                    <div className="font-medium">
                      Line {error.line}, Column {error.column}
                    </div>
                    <div className="text-muted-foreground">{error.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Pane */}
        <div className="flex w-1/2 flex-col">
          <div className="flex items-center gap-2 border-b bg-muted px-4 py-2 text-sm font-medium">
            <Eye className="h-4 w-4" />
            <span>Live Preview</span>
            {isRendering && (
              <Loader2 className="ml-auto h-4 w-4 animate-spin" />
            )}
          </div>

          <div
            className="flex-1 overflow-y-auto p-6"
            dangerouslySetInnerHTML={{ __html: preview }}
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Publish confirmation modal */}
      <ConfirmModal
        isOpen={showPublishModal}
        title="Publish Content"
        message="Are you sure you want to publish this content? It will be publicly visible."
        confirmText="Publish"
        cancelText="Cancel"
        confirmVariant="primary"
        onConfirm={confirmPublish}
        onCancel={() => setShowPublishModal(false)}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
