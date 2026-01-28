import { BookOpen } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export default function EditorLayout() {
  return (
    <div className="flex h-screen flex-col">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between border-b bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Knowledge Hub</h1>
          <span className="text-sm text-muted-foreground">Content Editor</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Placeholder for user menu */}
          <div className="h-8 w-8 rounded-full bg-primary/10" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
