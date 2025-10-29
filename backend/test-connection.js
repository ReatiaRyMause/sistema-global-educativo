import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔗 Probando conexión a MongoDB Atlas...');
    console.log('📝 URI:', process.env.MONGO_URI ? 'Presente' : 'Faltante');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI no encontrada en .env');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 segundos timeout
    });
    
    console.log('✅ CONEXIÓN EXITOSA a MongoDB Atlas!');
    console.log('📊 Base de datos:', mongoose.connection.db.databaseName);
    console.log('🏠 Host:', mongoose.connection.host);
    console.log('👤 Usuario:', mongoose.connection.user);
    
    // Probar si podemos crear una colección
    const testDoc = await mongoose.connection.db.collection('test').insertOne({
      message: 'Conexión exitosa',
      timestamp: new Date()
    });
    console.log('📝 Documento de prueba insertado ID:', testDoc.insertedId);
    
    // Limpiar el documento de prueba
    await mongoose.connection.db.collection('test').deleteOne({_id: testDoc.insertedId});
    
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR de conexión:', error.message);
    
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.log('\n💡 PROBLEMA DE AUTENTICACIÓN:');
      console.log('   1. Ve a MongoDB Atlas → Database Access');
      console.log('   2. Encuentra el usuario: manueam1805_db_user');
      console.log('   3. Haz clic en "Edit" → "Change Password"');
      console.log('   4. Crea una nueva contraseña');
      console.log('   5. Actualiza el archivo .env con la nueva contraseña');
    } else if (error.message.includes('getaddrinfo') || error.message.includes('network')) {
      console.log('\n💡 PROBLEMA DE RED:');
      console.log('   1. Ve a MongoDB Atlas → Network Access');
      console.log('   2. Agrega tu IP actual o 0.0.0.0/0 (para todas las IPs)');
      console.log('   3. Espera 1-2 minutos para que los cambios surtan efecto');
    }
    
    process.exit(1);
  }
};

testConnection();