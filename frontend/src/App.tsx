import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing      from './pages/Landing';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import Detection    from './pages/Detection';
import Upload       from './pages/Upload';
import Result       from './pages/Result';
import History      from './pages/History';
import Recommendation from './pages/Recommendation';

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ─── Public ─── */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ─── Protected — tampil prompt login jika belum auth ─── */}
          <Route path="/dashboard"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/detection"          element={<ProtectedRoute><Detection /></ProtectedRoute>} />
          <Route path="/upload"             element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/result/:id"         element={<ProtectedRoute><Result /></ProtectedRoute>} />
          <Route path="/history"            element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/recommendation/:id" element={<ProtectedRoute><Recommendation /></ProtectedRoute>} />

          {/* fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;