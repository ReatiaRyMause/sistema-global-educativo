import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select('-password');
    
    if (!usuario) {
      return res.status(401).json({ error: 'Token inválido.' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

const coordinadorMiddleware = (req, res, next) => {
  if (req.usuario.rol !== 'coordinador') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de coordinador.' });
  }
  next();
};

export { authMiddleware, coordinadorMiddleware };