import { testBackendConnection, comprehensiveBackendTest } from '../services/api';

export const runDiagnostic = async () => {
  console.log('🩺 Iniciando diagnóstico...');
  
  // Test básico
  const basicTest = await testBackendConnection();
  console.log('Basic Test:', basicTest);
  
  // Test comprehensivo
  const comprehensiveTest = await comprehensiveBackendTest();
  console.log('Comprehensive Test:', comprehensiveTest);
  
  // Test con fetch nativo
  try {
    const fetchResponse = await fetch('http://localhost:5000/api/test');
    const fetchData = await fetchResponse.json();
    console.log('✅ Fetch nativo funciona:', fetchData);
  } catch (error) {
    console.error('❌ Fetch nativo falló:', error);
  }
  
  return {
    basicTest,
    comprehensiveTest
  };
};

// Ejecutar automáticamente si se importa
runDiagnostic();