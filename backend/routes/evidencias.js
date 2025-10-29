import express from 'express';
import Evidencia from '../models/Evidencia.js';
import { authMiddleware, coordinadorMiddleware } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Obtener todas las evidencias
router.get('/', authMiddleware, async (req, res) => {
  try {
    let evidencias;
    
    if (req.usuario.rol === 'coordinador') {
      evidencias = await Evidencia.find()
        .populate('profesorId', 'nombre email')
        .sort({ createdAt: -1 });
    } else {
      evidencias = await Evidencia.find({ profesorId: req.usuario._id })
        .sort({ createdAt: -1 });
    }
    
    res.json(evidencias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear nueva evidencia
router.post('/', authMiddleware, upload.single('archivo'), async (req, res) => {
  try {
    const { nombreCurso, institucion, fecha, horas } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Debe subir un archivo' });
    }

    const evidencia = new Evidencia({
      profesorId: req.usuario._id,
      nombreCurso,
      institucion,
      fecha,
      horas,
      archivo: req.file.filename
    });

    const nuevaEvidencia = await evidencia.save();
    res.status(201).json(nuevaEvidencia);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Actualizar estado de evidencia (solo coordinador)
router.put('/:id', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const { estado, comentarios } = req.body;
    
    const evidencia = await Evidencia.findByIdAndUpdate(
      req.params.id,
      { estado, comentarios },
      { new: true }
    ).populate('profesorId', 'nombre email');

    if (!evidencia) {
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    }

    res.json(evidencia);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;