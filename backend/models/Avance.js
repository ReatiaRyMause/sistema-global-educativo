import mongoose from 'mongoose';

const avanceSchema = new mongoose.Schema({
  profesorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  parcial: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  materia: {
    type: String,
    required: true
  },
  avance: {
    type: String,
    enum: ['cumplido', 'parcial', 'no cumplido'],
    required: true
  },
  porcentaje: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  comentarios: {
    type: String,
    default: ''
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Avance', avanceSchema);