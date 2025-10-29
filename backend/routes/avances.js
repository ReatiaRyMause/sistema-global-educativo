import express from 'express';
import Avance from '../models/Avance.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los avances
router.get('/', authMiddleware, async (req, res) => {
  try {
    let avances;
    
    if (req.usuario.rol === 'coordinador') {
      avances = await Avance.find()
        .populate('profesorId', 'nombre email')
        .sort({ createdAt: -1 });
    } else {
      avances = await Avance.find({ profesorId: req.usuario._id })
        .sort({ createdAt: -1 });
    }
    
    res.json(avances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener avances por parcial
router.get('/parcial/:parcial', authMiddleware, async (req, res) => {
  try {
    const { parcial } = req.params;
    let avances;
    
    if (req.usuario.rol === 'coordinador') {
      avances = await Avance.find({ parcial })
        .populate('profesorId', 'nombre email materias');
    } else {
      avances = await Avance.find({ 
        profesorId: req.usuario._id, 
        parcial 
      });
    }
    
    res.json(avances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear nuevo avance
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { parcial, materia, avance, porcentaje, comentarios } = req.body;

    const nuevoAvance = new Avance({
      profesorId: req.usuario._id,
      parcial,
      materia,
      avance,
      porcentaje,
      comentarios
    });

    const avanceGuardado = await nuevoAvance.save();
    res.status(201).json(avanceGuardado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;