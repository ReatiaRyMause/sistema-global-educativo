import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const usuarioSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  password: String,
  rol: String,
  materias: [String]
}, {
  timestamps: true
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

const crearUsuariosPrueba = async () => {
  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI no encontrada en .env');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB Atlas');

    // Limpiar usuarios existentes
    await Usuario.deleteMany({});
    console.log('🗑️  Usuarios anteriores eliminados');
    
    // Crear usuarios de prueba
    const usuarios = [
      {
        nombre: 'Profesor Juan Pérez',
        email: 'profesor@test.com',
        password: await bcrypt.hash('password123', 10),
        rol: 'profesor',
        materias: ['Matemáticas', 'Física']
      },
      {
        nombre: 'Coordinadora María García',
        email: 'coordinador@test.com', 
        password: await bcrypt.hash('password123', 10),
        rol: 'coordinador',
        materias: []
      },
      {
        nombre: 'Profesor Carlos López',
        email: 'profesor2@test.com',
        password: await bcrypt.hash('password123', 10),
        rol: 'profesor',
        materias: ['Química', 'Biología']
      }
    ];
    
    await Usuario.insertMany(usuarios);
    console.log('✅ Usuarios de prueba creados exitosamente');
    console.log('\n📧 CREDENCIALES DE PRUEBA:');
    console.log('   Profesor 1: profesor@test.com / password123');
    console.log('   Profesor 2: profesor2@test.com / password123');
    console.log('   Coordinador: coordinador@test.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando usuarios:', error.message);
    console.log('💡 Verifica tu conexión a MongoDB Atlas');
    process.exit(1);
  }
};

crearUsuariosPrueba();