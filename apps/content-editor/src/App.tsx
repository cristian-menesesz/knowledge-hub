import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import EditorLayout from './components/EditorLayout';
import KHMLEditor from './components/KHMLEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EditorLayout />}>
          <Route index element={<Navigate to="/editor" replace />} />
          <Route path="editor" element={<KHMLEditor />} />
          <Route path="editor/:draftId" element={<KHMLEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
