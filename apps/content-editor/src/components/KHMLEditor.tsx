import Editor from '@monaco-editor/react';
import { FileText, Eye, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import type { editor } from 'monaco-editor';
import { useState, useEffect, useCallback } from 'react';

import { khmlApi } from '../api/khml';

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

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5" />
          <h1 className="text-lg font-semibold">KHML Editor</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Word count */}
          <span className="text-sm text-muted-foreground">
            {wordCount} words
          </span>

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
    </div>
  );
}
