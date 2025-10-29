import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

async function testAllAPIs() {
  let token = '';
  let userId = '';
  
  try {
    console.log('🔍 INICIANDO VERIFICACIÓN COMPLETA DE APIS...\n');
    
    // 1. Conectar a MongoDB
    console.log('1. 📊 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('   ✅ MongoDB conectado\n');

    // 2. Crear usuario de prueba si no existe
    console.log('2. 👤 Verificando usuario de prueba...');
    const User = mongoose.model('Usuario', new mongoose.Schema({
      nombre: String,
      email: String,
      password: String,
      rol: String,
      materias: [String],
      activo: Boolean
    }));

    let testUser = await User.findOne({ email: 'coordinador@test.com' });
    
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser = await User.create({
        nombre: 'Coordinador Test',
        email: 'coordinador@test.com',
        password: hashedPassword,
        rol: 'coordinador',
        materias: ['Matemáticas', 'Física'],
        activo: true
      });
      console.log('   ✅ Usuario de prueba creado');
    } else {
      console.log('   ✅ Usuario de prueba ya existe');
    }
    userId = testUser._id;

    // 3. Probar login para obtener token
    console.log('3. 🔐 Probando login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'coordinador@test.com',
        password: 'password123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      token = loginData.token;
      console.log('   ✅ Login exitoso - Token obtenido');
    } else {
      const error = await loginResponse.json();
      throw new Error(`Login falló: ${error.message}`);
    }

    // 4. Probar APIs con autenticación
    console.log('\n4. 🚀 Probando nuevas APIs...');
    
    const endpoints = [
      { name: 'Dashboard Coordinador', url: '/dashboard/coordinador', method: 'GET' },
      { name: 'Gráficas Cumplimiento', url: '/dashboard/graficas/cumplimiento', method: 'GET' },
      { name: 'Estadísticas Generales', url: '/dashboard/estadisticas-generales', method: 'GET' },
      { name: 'Notificaciones', url: '/notificaciones', method: 'GET' },
      { name: 'Contador Notificaciones', url: '/notificaciones/contador-no-leidas', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`http://localhost:5000/api${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        console.log(`   ✅ ${endpoint.name} - FUNCIONANDO`);
      } else {
        console.log(`   ❌ ${endpoint.name} - ERROR: ${response.status}`);
      }
    }

    // 5. Probar creación de notificación
    console.log('\n5. 📨 Probando creación de notificación...');
    const notifResponse = await fetch('http://localhost:5000/api/notificaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        titulo: 'Notificación de prueba del sistema',
        mensaje: 'Esta es una notificación automática de verificación',
        tipo: 'sistema',
        usuariosDestino: 'todos'
      })
    });

    if (notifResponse.ok) {
      console.log('   ✅ Creación de notificación - FUNCIONANDO');
    } else {
      console.log('   ❌ Creación de notificación - ERROR');
    }

    // 6. Verificar modelos necesarios
    console.log('\n6. 📋 Verificando modelos...');
    const requiredModels = ['Usuario', 'Planeacion', 'Avance', 'Evidencia', 'Notificacion'];
    const existingModels = mongoose.modelNames();
    
    requiredModels.forEach(model => {
      if (existingModels.includes(model)) {
        console.log(`   ✅ Modelo ${model} - CARGADO`);
      } else {
        console.log(`   ❌ Modelo ${model} - FALTANTE`);
      }
    });

    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    console.log('📍 Usa estas credenciales para probar en Thunder Client:');
    console.log('   Email: coordinador@test.com');
    console.log('   Password: password123');
    console.log(`   Token: ${token.substring(0, 50)}...`);

  } catch (error) {
    console.error('❌ ERROR EN VERIFICACIÓN:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

testAllAPIs();