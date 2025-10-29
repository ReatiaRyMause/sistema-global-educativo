import express from 'express';
import Planeacion from '../models/Planeacion.js';
import { authMiddleware, coordinadorMiddleware } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Obtener todas las planeaciones
router.get('/', authMiddleware, async (req, res) => {
  try {
    let planeaciones;
    
    if (req.usuario.rol === 'coordinador') {
      planeaciones = await Planeacion.find()
        .populate('profesorId', 'nombre email')
        .sort({ createdAt: -1 });
    } else {
      planeaciones = await Planeacion.find({ profesorId: req.usuario._id })
        .sort({ createdAt: -1 });
    }
    
    res.json(planeaciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear nueva planeación
router.post('/', authMiddleware, upload.single('archivo'), async (req, res) => {
  try {
    const { materia, parcial } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Debe subir un archivo' });
    }

    // Validar campos requeridos
    if (!materia || !parcial) {
      return res.status(400).json({ message: 'Materia y parcial son requeridos' });
    }

    const planeacion = new Planeacion({
      profesorId: req.usuario._id,
      materia,
      parcial: parseInt(parcial),
      archivo: req.file.filename
    });

    const nuevaPlaneacion = await planeacion.save();
    
    // Populate para devolver datos del profesor
    await nuevaPlaneacion.populate('profesorId', 'nombre email');
    
    res.status(201).json(nuevaPlaneacion);
  } catch (error) {
    console.error('Error subiendo planeación:', error);
    res.status(400).json({ message: error.message });
  }
});

// Actualizar estado de planeación (solo coordinador)
router.put('/:id', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const { estado, comentarios } = req.body;
    
    if (!['aprobado', 'rechazado', 'pendiente'].includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const planeacion = await Planeacion.findByIdAndUpdate(
      req.params.id,
      { estado, comentarios },
      { new: true }
    ).populate('profesorId', 'nombre email');

    if (!planeacion) {
      return res.status(404).json({ message: 'Planeación no encontrada' });
    }

    res.json(planeacion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar planeación (solo profesor propietario)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const planeacion = await Planeacion.findById(req.params.id);
    
    if (!planeacion) {
      return res.status(404).json({ message: 'Planeación no encontrada' });
    }

    // Solo el profesor propietario puede eliminar
    if (planeacion.profesorId.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ message: 'No autorizado para eliminar esta planeación' });
    }

    await Planeacion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Planeación eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;