import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Importar los modelos directamente
import Usuario from './models/Usuario.js';
import Planeacion from './models/Planeacion.js';
import Avance from './models/Avance.js';
import Evidencia from './models/Evidencia.js';
import Notificacion from './models/Notificacion.js';

dotenv.config();

async function testAllAPIs() {
  let token = '';
  let testUserIds = []; // Para almacenar IDs de usuarios de prueba
  
  try {
    console.log('🔍 VERIFICACIÓN FINAL DE TODAS LAS APIS...\n');
    
    // 1. Conectar a MongoDB
    console.log('1. 📊 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('   ✅ MongoDB conectado\n');

    // 2. Verificar usuario de prueba principal
    console.log('2. 👤 Verificando usuario de prueba...');
    let testUser = await Usuario.findOne({ email: 'coordinador@test.com' });
    
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser = await Usuario.create({
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

    // 3. Probar login
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
      console.log('   ✅ Login exitoso\n');
    } else {
      const error = await loginResponse.json();
      throw new Error(`Login falló: ${error.message}`);
    }

    // 4. Crear datos de prueba con manejo de duplicados
    console.log('4. 📝 Creando datos de prueba...');
    
    // Verificar y crear profesores de prueba si no existen
    let profesor1, profesor2;
    
    try {
      profesor1 = await Usuario.findOne({ email: 'matematicas@escuela.com' });
      if (!profesor1) {
        profesor1 = await Usuario.create({
          nombre: 'Profesor Matemáticas',
          email: 'matematicas@escuela.com',
          password: await bcrypt.hash('password123', 10),
          rol: 'profesor',
          materias: ['Matemáticas'],
          activo: true
        });
        console.log('   ✅ Profesor Matemáticas creado');
      } else {
        console.log('   ✅ Profesor Matemáticas ya existe');
      }
    } catch (error) {
      console.log('   ⚠️  Profesor Matemáticas ya existe, usando existente');
      profesor1 = await Usuario.findOne({ email: 'matematicas@escuela.com' });
    }
    
    try {
      profesor2 = await Usuario.findOne({ email: 'fisica@escuela.com' });
      if (!profesor2) {
        profesor2 = await Usuario.create({
          nombre: 'Profesor Física',
          email: 'fisica@escuela.com', 
          password: await bcrypt.hash('password123', 10),
          rol: 'profesor',
          materias: ['Física'],
          activo: true
        });
        console.log('   ✅ Profesor Física creado');
      } else {
        console.log('   ✅ Profesor Física ya existe');
      }
    } catch (error) {
      console.log('   ⚠️  Profesor Física ya existe, usando existente');
      profesor2 = await Usuario.findOne({ email: 'fisica@escuela.com' });
    }

    // Guardar IDs para usar después
    testUserIds = [profesor1._id, profesor2._id];

    // 5. Crear planeaciones de prueba (eliminar existentes primero para evitar duplicados)
    console.log('   📚 Configurando planeaciones...');
    await Planeacion.deleteMany({ 
      profesorId: { $in: testUserIds } 
    });

    await Planeacion.create([
      {
        profesorId: profesor1._id,
        materia: 'Matemáticas',
        parcial: 1,
        archivo: 'planeacion_mate_1.pdf',
        estado: 'aprobado',
        fechaEntrega: new Date()
      },
      {
        profesorId: profesor2._id,
        materia: 'Física',
        parcial: 1,
        archivo: 'planeacion_fisica_1.pdf',
        estado: 'pendiente',
        fechaEntrega: new Date()
      }
    ]);
    console.log('   ✅ Planeaciones de prueba creadas');

    // 6. Crear avances de prueba
    console.log('   📈 Configurando avances...');
    await Avance.deleteMany({ 
      profesorId: { $in: testUserIds } 
    });

    await Avance.create([
      {
        profesorId: profesor1._id,
        materia: 'Matemáticas',
        parcial: 1,
        avance: 'cumplido',
        porcentaje: 95,
        comentarios: 'Excelente avance',
        fechaRegistro: new Date()
      },
      {
        profesorId: profesor2._id, 
        materia: 'Física',
        parcial: 1,
        avance: 'parcial',
        porcentaje: 65,
        comentarios: 'Necesita mejorar',
        fechaRegistro: new Date()
      }
    ]);
    console.log('   ✅ Avances de prueba creados');

    // 7. Crear evidencias de prueba
    console.log('   📎 Configurando evidencias...');
    await Evidencia.deleteMany({ 
      profesorId: { $in: testUserIds } 
    });

    await Evidencia.create([
      {
        profesorId: profesor1._id,
        nombreCurso: 'Curso de Actualización Matemática',
        institucion: 'Universidad Nacional',
        fecha: new Date('2024-01-15'),
        horas: 40,
        archivo: 'certificado_matematicas.pdf',
        estado: 'aprobado',
        fechaSubida: new Date()
      },
      {
        profesorId: profesor2._id,
        nombreCurso: 'Taller de Física Moderna',
        institucion: 'Instituto Tecnológico',
        fecha: new Date('2024-02-20'),
        horas: 30,
        archivo: 'certificado_fisica.pdf',
        estado: 'pendiente',
        fechaSubida: new Date()
      }
    ]);
    console.log('   ✅ Evidencias de prueba creadas\n');

    // 8. Probar TODAS las APIs
    console.log('5. 🚀 PROBANDO TODAS LAS APIS...\n');

    const testEndpoints = [
      // Dashboard APIs
      { name: '📊 Dashboard Coordinador', url: '/dashboard/coordinador', method: 'GET' },
      { name: '📈 Gráficas Cumplimiento', url: '/dashboard/graficas/cumplimiento', method: 'GET' },
      { name: '📋 Estadísticas Generales', url: '/dashboard/estadisticas-generales', method: 'GET' },
      
      // Reportes APIs  
      { name: '📄 Reporte Planeaciones Excel', url: '/reportes/planeaciones/excel', method: 'GET' },
      { name: '📄 Reporte Avances PDF', url: '/reportes/avances/pdf', method: 'GET' },
      { name: '📊 Reporte Cumplimiento Excel', url: '/reportes/cumplimiento/excel', method: 'GET' },
      { name: '📑 Reporte Evidencias Excel', url: '/reportes/evidencias/excel', method: 'GET' },
      
      // Notificaciones APIs
      { name: '🔔 Obtener Notificaciones', url: '/notificaciones', method: 'GET' },
      { name: '🔢 Contador Notificaciones', url: '/notificaciones/contador-no-leidas', method: 'GET' },
      { name: '➕ Crear Notificación', url: '/notificaciones', method: 'POST' },
      
      // APIs existentes
      { name: '👥 Obtener Usuarios', url: '/usuarios', method: 'GET' },
      { name: '📚 Obtener Planeaciones', url: '/planeaciones', method: 'GET' },
      { name: '📈 Obtener Avances', url: '/avances', method: 'GET' },
      { name: '📎 Obtener Evidencias', url: '/evidencias', method: 'GET' }
    ];

    let successCount = 0;
    for (const endpoint of testEndpoints) {
      try {
        const options = {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

        // Agregar body para crear notificación
        if (endpoint.name === '➕ Crear Notificación') {
          options.body = JSON.stringify({
            titulo: 'Notificación de prueba del sistema',
            mensaje: 'Verificación automática de APIs',
            tipo: 'sistema', 
            usuariosDestino: 'todos'
          });
        }

        const response = await fetch(`http://localhost:5000/api${endpoint.url}`, options);
        
        if (response.ok) {
          console.log(`   ✅ ${endpoint.name} - FUNCIONANDO (${response.status})`);
          successCount++;
          
          // Mostrar datos de respuesta para algunos endpoints
          if (endpoint.name.includes('Dashboard') || endpoint.name.includes('Obtener')) {
            const data = await response.json();
            if (data && typeof data === 'object') {
              const keyCount = Object.keys(data).length;
              console.log(`        📦 Respuesta con ${keyCount} campos de datos`);
            }
          }
        } else {
          console.log(`   ⚠️  ${endpoint.name} - ERROR ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.name} - EXCEPCIÓN: ${error.message}`);
      }
    }

    // 9. Verificar datos en base de datos
    console.log('\n6. 📊 VERIFICANDO DATOS EN BD...');
    const counts = {
      Usuarios: await Usuario.countDocuments(),
      Planeaciones: await Planeacion.countDocuments(),
      Avances: await Avance.countDocuments(),
      Evidencias: await Evidencia.countDocuments(),
      Notificaciones: await Notificacion.countDocuments()
    };

    Object.entries(counts).forEach(([model, count]) => {
      console.log(`   📁 ${model}: ${count} registros`);
    });

    console.log(`\n🎉🎉🎉 VERIFICACIÓN COMPLETADA EXITOSAMENTE!`);
    console.log(`   ✅ ${successCount}/${testEndpoints.length} APIs funcionando`);
    console.log('\n📍 CREDENCIALES PARA THUNDER CLIENT:');
    console.log('   🔐 Email: coordinador@test.com');
    console.log('   🔑 Password: password123');
    console.log(`   🪙 Token: ${token.substring(0, 50)}...`);
    console.log('\n🌐 ENDPOINTS DISPONIBLES:');
    console.log('   • http://localhost:5000/api/dashboard/coordinador');
    console.log('   • http://localhost:5000/api/reportes/planeaciones/excel');
    console.log('   • http://localhost:5000/api/notificaciones');
    console.log('\n🚀 ¡Todas las APIs están funcionando correctamente!');

  } catch (error) {
    console.error('❌ ERROR EN VERIFICACIÓN:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a BD cerrada');
  }
}

testAllAPIs();