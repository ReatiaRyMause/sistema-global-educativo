import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

export const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.usuario = await Usuario.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token no válido' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }
};

export const coordinadorMiddleware = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'coordinador') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de coordinador' });
  }
};