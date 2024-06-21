import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Checklist from './components/Checklist';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checklist/:id" element={<Checklist />} />
      </Routes>
    </Router>
  );
}

export default App;
