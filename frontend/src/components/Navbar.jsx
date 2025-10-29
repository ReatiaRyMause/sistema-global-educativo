import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const isActiveLink = (path) => {
    // Para la raíz, solo coincide si la ruta es exactamente '/'
    if (path === '/') return location.pathname === '/';
    // Para otras rutas, coincide si la ruta comienza con el path (para rutas anidadas)
    return location.pathname.startsWith(path);
  };

  // Clases base mejoradas para mejor contraste y legibilidad
  const baseLinkClasses =
    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 whitespace-nowrap";

  // Clase para enlaces activos
  const activeLinkClasses = "bg-indigo-600 text-white shadow-md";

  // Clase para enlaces inactivos
  const inactiveLinkClasses = "text-gray-700 hover:text-indigo-700 hover:bg-gray-100";


  const getLinkClasses = (path) =>
    isActiveLink(path)
      ? `${baseLinkClasses} ${activeLinkClasses}`
      : `${baseLinkClasses} ${inactiveLinkClasses}`;

  const getMobileLinkClasses = (path) =>
    isActiveLink(path)
      ? `${baseLinkClasses} bg-indigo-100 text-indigo-800 border border-indigo-200 w-full`
      : `${baseLinkClasses} text-gray-800 hover:text-indigo-700 hover:bg-gray-50 w-full`;

  const userRole = user?.role || user?.rol;
  if (!user) return null;

  const userInitials =
    user.nombre?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';

  // Array consolidado de enlaces de navegación (para escritorio y móvil)
  const navLinks = [
    { path: '/', label: 'Dashboard', icon: 'M3 12l9-9 9 9v9a2 2 0 01-2 2H5a2 2 0 01-2-2z', requiredRole: null },
    { path: '/usuarios', label: 'Gestión de Usuarios', icon: 'M17 20h5v-1a6 6 0 00-9-5.197M12 4a4 4 0 110 8 4 4 0 010-8z', requiredRole: 'coordinador' },
    { path: '/reportes', label: 'Reportes', icon: 'M9 17v-2m3 2v-4m3 4v-6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H9L5 7v12a2 2 0 002 2z', requiredRole: 'coordinador' },
    { path: '/planeaciones', label: 'Planeaciones', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5h10l4 4v12a2 2 0 01-2 2z', requiredRole: null },
    { path: '/avances', label: 'Avances', icon: 'M5 13l4 4L19 7', requiredRole: null },
    { path: '/evidencias', label: 'Evidencias', icon: 'M12 4v16m8-8H4', requiredRole: null },
  ].filter(link => !link.requiredRole || userRole === link.requiredRole);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 fixed w-full top-0 left-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LOGO + NAVEGACIÓN PRINCIPAL (IZQUIERDA) */}
          <div className="flex items-center space-x-6">
            {/* LOGO */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 rounded-lg p-1"
            >
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-sm">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                </svg>
              </div>
              <div className="hidden sm:block"> {/* Ocultar textos en pantallas muy pequeñas */}
                <span className="text-xl font-bold text-gray-900 leading-none">Global</span>
                <span className="block text-xs text-gray-600 font-medium leading-none">Plataforma Educativa</span>
              </div>
            </Link>

            {/* NAVEGACIÓN PRINCIPAL DE ESCRITORIO CONSOLIDADOS */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map(({ path, label, icon }) => (
                <Link key={path} to={path} className={getLinkClasses(path)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* PERFIL, NOTIFICACIONES Y CIERRE DE SESIÓN (DERECHA) */}
          <div className="flex items-center space-x-4">
            <NotificationBell />

            {/* Área de Perfil (similar a la imagen) */}
            <div className="hidden lg:flex items-center space-x-3 bg-gray-50 rounded-lg pr-3 py-2 border border-gray-100">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-sm">
                <span className="text-white font-semibold text-xs">{userInitials}</span>
              </div>
              <div className="text-left leading-none">
                <p className="text-sm font-semibold text-gray-900">{user.nombre || 'Usuario'}</p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize mt-1 ${
                    userRole === 'coordinador'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {userRole}
                </span>
              </div>
            </div>

            {/* Botón de Cerrar Sesión (simplicado y separado) */}
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center space-x-1 text-gray-600 hover:text-red-600 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ml-4"
            >
              <span>Cerrar sesión</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4-4-4m-1 8h-10a2 2 0 01-2-2V8a2 2 0 012-2h10" />
              </svg>
            </button>


            {/* BOTÓN MENÚ MÓVIL */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* MENÚ MÓVIL */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg p-4">
            <div className="space-y-2">
              {navLinks.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={getMobileLinkClasses(path)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Usuario y Logout en móvil */}
            <div className="flex items-center justify-between px-2 py-3 border-t border-gray-200 mt-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full">
                  <span className="text-white text-xs font-semibold">{userInitials}</span>
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-gray-900">{user.nombre || 'Usuario'}</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize mt-0.5 ${
                      userRole === 'coordinador'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {userRole}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                aria-label="Cerrar sesión"
              >
                <span>Salir</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4-4-4M3 12h18" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;