import mongoose from 'mongoose';

const planeacionSchema = new mongoose.Schema({
  profesorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  materia: {
    type: String,
    required: true
  },
  parcial: {
    type: Number,
    required: true,
    min: 1,
    max: 3
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
  },
  fechaSubida: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Planeacion', planeacionSchema);