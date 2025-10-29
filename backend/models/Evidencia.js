import mongoose from 'mongoose';

const evidenciaSchema = new mongoose.Schema({
  profesorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  nombreCurso: {
    type: String,
    required: true
  },
  institucion: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  horas: {
    type: Number,
    required: true,
    min: 1
  },
  archivo: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  comentarios: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Evidencia', evidenciaSchema);