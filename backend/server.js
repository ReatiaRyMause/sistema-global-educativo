import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import planeacionRoutes from './routes/planeaciones.js';
import avanceRoutes from './routes/avances.js';
import evidenciaRoutes from './routes/evidencias.js';
import usuarioRoutes from './routes/usuarios.js';
import reportesRoutes from './routes/reportes.js';
import dashboardRoutes from './routes/dashboard.js';
import notificacionesRoutes from './routes/notificaciones.js';

// Para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Configuración CORS MÁS PERMISIVA
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Middleware para manejar preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/global')
  .then(() => console.log('✅ MongoDB Atlas conectado'))
  .catch(err => console.error('❌ Error conectando MongoDB:', err));

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/planeaciones', planeacionRoutes);
app.use('/api/avances', avanceRoutes);
app.use('/api/evidencias', evidenciaRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Nuevas rutas para las APIs
app.use('/api/reportes', reportesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Ruta de prueba mejorada
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend funcionando correctamente',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    cors: 'Configurado correctamente'
  });
});

// Ruta de salud mejorada
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    service: 'Global Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
    environment: process.env.NODE_ENV || 'development',
    cors: 'Habilitado'
  };
  
  console.log('✅ Health check ejecutado:', healthStatus);
  res.json(healthStatus);
});

// Ruta de documentación de APIs
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'Global API',
    version: '2.0.0',
    description: 'Sistema de gestión académica para instituciones educativas',
    endpoints: {
      auth: '/api/auth',
      planeaciones: '/api/planeaciones',
      avances: '/api/avances',
      evidencias: '/api/evidencias',
      usuarios: '/api/usuarios',
      reportes: '/api/reportes',
      dashboard: '/api/dashboard',
      notificaciones: '/api/notificaciones'
    },
    health: '/api/health'
  });
});

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Manejo de errores 404
app.use('*', (req, res) => {
  console.log('❌ Ruta no encontrada:', req.originalUrl);
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error global:', error);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Contacte al administrador'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Backend: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`📊 Nuevas APIs implementadas:`);
  console.log(`   ✅ /api/reportes - Sistema de reportes PDF/Excel`);
  console.log(`   ✅ /api/dashboard - Dashboard con gráficos y métricas`);
  console.log(`   ✅ /api/notificaciones - Sistema de notificaciones`);
  console.log(`📚 Documentación: http://localhost:${PORT}/api/docs`);
  console.log(`🔧 CORS configurado para: http://localhost:3000`);
});