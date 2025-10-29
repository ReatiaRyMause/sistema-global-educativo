import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';

const usuariosController = {
  registrarUsuario: async (req, res) => {
    try {
      const { nombre, email, password, rol, materias } = req.body;

      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'El email ya está registrado.' });
      }

      // Crear nuevo usuario (el hash se hace automáticamente en el modelo)
      const nuevoUsuario = new Usuario({
        nombre,
        email,
        password,
        rol,
        materias: rol === 'profesor' ? materias : undefined
      });

      await nuevoUsuario.save();

      // No retornar la contraseña
      const usuarioResponse = {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        materias: nuevoUsuario.materias,
        activo: nuevoUsuario.activo,
        fechaCreacion: nuevoUsuario.createdAt
      };

      res.status(201).json({
        mensaje: 'Usuario registrado exitosamente.',
        usuario: usuarioResponse
      });

    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  obtenerUsuarios: async (req, res) => {
    try {
      const usuarios = await Usuario.find()
        .select('-password')
        .sort({ createdAt: -1 });

      res.json(usuarios);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  obtenerUsuario: async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.params.id).select('-password');
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  actualizarUsuario: async (req, res) => {
    try {
      const { nombre, email, rol, materias, activo } = req.body;
      
      const datosActualizar = {
        nombre,
        email,
        rol,
        materias: rol === 'profesor' ? materias : undefined,
        activo
      };

      const usuario = await Usuario.findByIdAndUpdate(
        req.params.id,
        datosActualizar,
        { new: true, runValidators: true }
      ).select('-password');

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      res.json({
        mensaje: 'Usuario actualizado exitosamente.',
        usuario
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  eliminarUsuario: async (req, res) => {
    try {
      const usuario = await Usuario.findByIdAndUpdate(
        req.params.id,
        { activo: false },
        { new: true }
      ).select('-password');

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      res.json({ mensaje: 'Usuario desactivado exitosamente.' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
};

export default usuariosController;