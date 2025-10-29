import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthProvider from './contexts/AuthProvider';
import NotificationProvider from './contexts/NotificationProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Planeaciones from './pages/Planeaciones';
import Avances from './pages/Avances';
import Evidencias from './pages/Evidencias';
import Reportes from './pages/Reportes';
import './App.css';

// Layout component para rutas protegidas
const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <ProtectedRoute>
        <Navbar />
        <main className="pt-16 w-full min-h-screen">
          <Outlet />
        </main>
      </ProtectedRoute>
    </div>
  );
};

// Layout para login (sin navbar)
const LoginLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <div className="w-full">
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Ruta pública con layout sin navbar */}
              <Route element={<LoginLayout />}>
                <Route path="/login" element={<Login />} />
              </Route>
              
              {/* Rutas protegidas con layout común */}
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/planeaciones" element={<Planeaciones />} />
                <Route path="/avances" element={<Avances />} />
                <Route path="/evidencias" element={<Evidencias />} />
                <Route path="/reportes" element={<Reportes />} />
              </Route>
              
              {/* Redirección para rutas no encontradas */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;