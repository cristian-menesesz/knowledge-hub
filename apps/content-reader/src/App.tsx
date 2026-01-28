import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ContentList from './components/ContentList';
import ContentReader from './components/ContentReader';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<ContentList />} />
          <Route path="/content/:id" element={<ContentReader />} />
          <Route path="/content/slug/:slug" element={<ContentReader />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
