import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsPath = path.join(__dirname, 'uploads');

console.log('🔍 Verificando carpeta uploads...');
console.log('📁 Ruta:', uploadsPath);

try {
  const exists = fs.existsSync(uploadsPath);
  console.log('✅ Existe:', exists);
  
  if (exists) {
    const stats = fs.statSync(uploadsPath);
    console.log('📊 Es directorio:', stats.isDirectory());
    console.log('🔐 Permisos:', stats.mode.toString(8));
    
    const files = fs.readdirSync(uploadsPath);
    console.log('📄 Archivos:', files);
  } else {
    console.log('⚠️  Creando carpeta uploads...');
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Carpeta creada');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}