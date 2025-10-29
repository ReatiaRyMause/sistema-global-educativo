import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['profesor', 'coordinador'],
    default: 'profesor'
  },
  materias: [{
    type: String
  }],
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Encriptar password antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Comparar password
usuarioSchema.methods.compararPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('Usuario', usuarioSchema);