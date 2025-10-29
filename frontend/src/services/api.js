import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configuración base de axios MEJORADA
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
});

// Variable para evitar redirecciones múltiples
let isRedirecting = false;

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // No loguear requests de health check para evitar spam
    if (!config.url.includes('/health')) {
      console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación CORREGIDO
api.interceptors.response.use(
  (response) => {
    // No loguear responses de health check para evitar spam
    if (!response.config.url.includes('/health')) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // No loguear errores de health check para evitar spam
    if (!error.config?.url.includes('/health')) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        code: error.code
      });
    }

    if (error.code === 'ERR_NETWORK') {
      console.error('🚨 Error de red - Verifica que el backend esté ejecutándose en puerto 5000');
    }

    // Manejar error 401 solo si no estamos ya redirigiendo y no es una ruta pública
    if (error.response?.status === 401 && !isRedirecting) {
      const currentPath = window.location.pathname;
      
      // Solo redirigir si no estamos ya en login
      if (!currentPath.includes('/login')) {
        isRedirecting = true;
        console.log('🔐 Sesión expirada, redirigiendo a login...');
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Usar timeout para evitar problemas de react
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    return Promise.reject(error);
  }
);

// Función para probar conexión con el backend MEJORADA
export const testBackendConnection = async () => {
  try {
    console.log('🔍 Probando conexión con backend...');
    
    // Usar axios directamente para evitar el interceptor en health checks
    const response = await axios.get(`${API_URL}/health`, {
      timeout: 5000,
      withCredentials: true
    });
    
    console.log('✅ Backend conectado correctamente');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Error conectando al backend:', error.message);
    
    let errorMessage = 'No se puede conectar al servidor';
    
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'El servidor backend no está disponible. Verifica que esté ejecutándose en http://localhost:5000';
    } else if (error.response) {
      errorMessage = `Error del servidor: ${error.response.status}`;
    }
    
    return { 
      success: false, 
      error: errorMessage,
      details: error.message
    };
  }
};

// Función para resetear el flag de redirección (usar en el componente Login)
export const resetRedirectFlag = () => {
  isRedirecting = false;
};

// Servicios para las nuevas APIs
export const dashboardService = {
  getDashboardCoordinador: () => 
    api.get('/dashboard/coordinador'),
  
  getDashboardProfesor: () => 
    api.get('/dashboard/profesor'),
  
  getGraficasCumplimiento: () => 
    api.get('/dashboard/graficas/cumplimiento'),
  
  getEstadisticasGenerales: () => 
    api.get('/dashboard/estadisticas-generales')
};

export const reportesService = {
  descargarPlaneacionesExcel: () => 
    api.get('/reportes/planeaciones/excel', { responseType: 'blob' }),
  
  descargarAvancesPDF: (parcial = null) => {
    const params = parcial ? { parcial } : {};
    return api.get('/reportes/avances/pdf', { 
      responseType: 'blob',
      params 
    });
  },
  
  descargarCumplimientoExcel: () => 
    api.get('/reportes/cumplimiento/excel', { responseType: 'blob' }),
  
  descargarEvidenciasExcel: () => 
    api.get('/reportes/evidencias/excel', { responseType: 'blob' })
};

export const notificacionesService = {
  getNotificaciones: (page = 1, limit = 10) => 
    api.get('/notificaciones', { params: { page, limit } }),
  
  crearNotificacion: (data) => 
    api.post('/notificaciones', data),
  
  marcarComoLeida: (id) => 
    api.patch(`/notificaciones/${id}/leer`),
  
  marcarTodasLeidas: () => 
    api.patch('/notificaciones/marcar-todas-leidas'),
  
  getContadorNoLeidas: () => 
    api.get('/notificaciones/contador-no-leidas'),
  
  eliminarNotificacion: (id) => 
    api.delete(`/notificaciones/${id}`)
};

// Servicios existentes (mantener)
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  registro: (userData) => api.post('/auth/registro', userData),
  getPerfil: () => api.get('/auth/perfil')
};

export const usuariosService = {
  getUsuarios: () => api.get('/usuarios'),
  crearUsuario: (data) => api.post('/usuarios', data),
  actualizarUsuario: (id, data) => api.put(`/usuarios/${id}`, data),
  eliminarUsuario: (id) => api.delete(`/usuarios/${id}`),
  cambiarEstado: (id, activo) => 
    api.patch(`/usuarios/${id}/estado`, { activo })
};

export const planeacionesService = {
  getPlaneaciones: () => api.get('/planeaciones'),
  crearPlaneacion: (formData) => 
    api.post('/planeaciones', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  actualizarEstado: (id, data) => api.put(`/planeaciones/${id}`, data),
  eliminarPlaneacion: (id) => api.delete(`/planeaciones/${id}`)
};

export const avancesService = {
  getAvances: () => api.get('/avances'),
  getAvancesPorParcial: (parcial) => api.get(`/avances/parcial/${parcial}`),
  crearAvance: (data) => api.post('/avances', data)
};

export const evidenciasService = {
  getEvidencias: () => api.get('/evidencias'),
  crearEvidencia: (formData) => 
    api.post('/evidencias', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  actualizarEstado: (id, data) => api.put(`/evidencias/${id}`, data)
};

export default api;