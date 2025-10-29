import mongoose from 'mongoose';

const notificacionSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  mensaje: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['sistema', 'planeacion', 'avance', 'evidencia', 'importante'],
    default: 'sistema'
  },
  leida: {
    type: Boolean,
    default: false
  },
  relacionadoCon: {
    tipo: String,
    id: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: true
});

// Índices para mejor performance
notificacionSchema.index({ usuarioId: 1, createdAt: -1 });
notificacionSchema.index({ usuarioId: 1, leida: 1 });

export default mongoose.model('Notificacion', notificacionSchema);