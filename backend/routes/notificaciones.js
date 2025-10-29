import express from 'express';
import { authMiddleware, coordinadorMiddleware } from '../middleware/auth.js';
import Notificacion from '../models/Notificacion.js';
import Usuario from '../models/Usuario.js';

const router = express.Router();

// Obtener notificaciones del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const notificaciones = await Notificacion.find({ 
      usuarioId: req.usuario._id 
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Notificacion.countDocuments({ 
      usuarioId: req.usuario._id 
    });

    res.json({
      notificaciones,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Marcar notificación como leída
router.patch('/:id/leer', authMiddleware, async (req, res) => {
  try {
    const notificacion = await Notificacion.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.usuario._id },
      { leida: true },
      { new: true }
    );

    if (!notificacion) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.json(notificacion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Marcar todas como leídas
router.patch('/marcar-todas-leidas', authMiddleware, async (req, res) => {
  try {
    await Notificacion.updateMany(
      { usuarioId: req.usuario._id, leida: false },
      { leida: true }
    );

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear notificación (solo coordinadores)
router.post('/', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const { titulo, mensaje, tipo, usuariosDestino } = req.body;

    if (!titulo || !mensaje) {
      return res.status(400).json({ message: 'Título y mensaje son requeridos' });
    }

    let notificaciones = [];

    if (usuariosDestino === 'todos') {
      // Enviar a todos los profesores
      const profesores = await Usuario.find({ rol: 'profesor', activo: true });
      
      const notificacionesPromises = profesores.map(profesor => 
        Notificacion.create({
          usuarioId: profesor._id,
          titulo,
          mensaje,
          tipo: tipo || 'sistema'
        })
      );
      
      notificaciones = await Promise.all(notificacionesPromises);
    } else if (usuariosDestino) {
      // Notificación individual
      notificaciones = [await Notificacion.create({
        usuarioId: usuariosDestino,
        titulo,
        mensaje,
        tipo: tipo || 'sistema'
      })];
    } else {
      return res.status(400).json({ message: 'Destinatario no especificado' });
    }

    res.status(201).json({
      message: 'Notificación(es) enviada(s) correctamente',
      notificacionesEnviadas: notificaciones.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Contador de notificaciones no leídas
router.get('/contador-no-leidas', authMiddleware, async (req, res) => {
  try {
    const contador = await Notificacion.countDocuments({
      usuarioId: req.usuario._id,
      leida: false
    });

    res.json({ contador });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Eliminar notificación
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const notificacion = await Notificacion.findOneAndDelete({
      _id: req.params.id,
      usuarioId: req.usuario._id
    });

    if (!notificacion) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;