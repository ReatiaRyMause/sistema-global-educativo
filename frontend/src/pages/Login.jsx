import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { testBackendConnection } from '../services/api';

// Componentes SVG como funciones separadas
const SistemaIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const EmailIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PasswordIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ConnectedIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const DisconnectedIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const CheckingIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const LoadingSpinner = ({ className = "h-4 w-4" }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, connected, disconnected
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Verificar si el backend está disponible al cargar la página
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const result = await testBackendConnection();
        if (result.success) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('disconnected');
          setError(`No se puede conectar al servidor: ${result.error}`);
        }
      } catch {
        setBackendStatus('disconnected');
        setError('Error verificando conexión con el servidor');
      }
    };

    checkBackend();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si el backend no está disponible, no intentar login
    if (backendStatus === 'disconnected') {
      setError('El servidor no está disponible. Verifica que el backend esté corriendo en el puerto 5000.');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const result = await login({ email, password });
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (backendStatus) {
      case 'connected': return <ConnectedIcon />;
      case 'disconnected': return <DisconnectedIcon />;
      default: return <CheckingIcon />;
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return 'Backend conectado';
      case 'disconnected': return 'Backend no disponible';
      default: return 'Verificando conexión...';
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <div className="text-indigo-600">
                <SistemaIcon />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema Global
          </h2>
          <p className="text-gray-600 mb-6">
            Plataforma de Gestión Educativa
          </p>
          
          {/* Indicador de estado del backend */}
          <div className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        </div>
        
        {/* Formulario de login */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <DisconnectedIcon />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="text-gray-400">
                    <EmailIcon />
                  </div>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="text-gray-400">
                    <PasswordIcon />
                  </div>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Botón de login */}
            <div>
              <button
                type="submit"
                disabled={loading || backendStatus === 'disconnected'}
                className="group relative w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <ShieldIcon />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Sistema diseñado para la gestión educativa de planeaciones, avances y evidencias docentes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;