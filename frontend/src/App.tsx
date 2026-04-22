import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import Detection from './pages/Detection';
import Upload from './pages/Upload';
import Result from './pages/Result';
import History from './pages/History';
import Recommendation from './pages/Recommendation';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

const App: React.FC = () => (
  <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detection" element={<Detection />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/history" element={<History />} />
        <Route path="/recommendation/:id" element={<Recommendation />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;