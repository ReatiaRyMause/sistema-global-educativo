import express from 'express';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// Registrar usuario
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, rol, materias } = req.body;

    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      rol,
      materias
    });

    if (usuario) {
      res.status(201).json({
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        materias: usuario.materias,
        token: generarToken(usuario._id),
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    
    if (usuario && (await usuario.compararPassword(password))) {
      res.json({
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        materias: usuario.materias,
        token: generarToken(usuario._id),
      });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtener perfil
router.get('/perfil', authMiddleware, async (req, res) => {
  res.json(req.usuario);
});

export default router;