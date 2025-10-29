import express from 'express';
import Usuario from '../models/Usuario.js';
import { authMiddleware, coordinadorMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los usuarios (solo coordinador)
router.get('/', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password').sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear nuevo usuario (solo coordinador)
router.post('/', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const { nombre, email, password, rol, materias } = req.body;

    // Validar que el email no exista
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Validar rol
    if (!['profesor', 'coordinador'].includes(rol)) {
      return res.status(400).json({ message: 'Rol no válido' });
    }

    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      rol,
      materias: materias || []
    });

    // Devolver usuario sin password
    const usuarioCreado = await Usuario.findById(usuario._id).select('-password');
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: usuarioCreado
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Actualizar usuario (solo coordinador)
router.put('/:id', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const { nombre, email, rol, materias, activo } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { 
        nombre, 
        email, 
        rol, 
        materias: materias || [],
        activo: activo !== undefined ? activo : true
      },
      { new: true }
    ).select('-password');

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar usuario (solo coordinador)
router.delete('/:id', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cambiar estado de usuario (activar/desactivar)
router.patch('/:id/estado', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const { activo } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { activo },
      { new: true }
    ).select('-password');

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
      usuario
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;