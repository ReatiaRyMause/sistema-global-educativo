## Descripción
Sistema web para gestión de planeaciones didácticas, avances académicos y evidencias de capacitación docente.

## 🌐 Demo en Vivo
- **Frontend:** http://13.217.227.80:3000
- **Backend API:** http://13.217.227.80:5000/api
- **Health Check:** http://13.217.227.80:5000/api/health

## 🚀 Características Principales

### Para Profesores
- Gestión de planeaciones didácticas por parcial
- Registro de avances académicos
- Carga de evidencias de capacitación
- Dashboard personalizado

### Para Coordinadores
- Revisión y aprobación de planeaciones
- Generación de reportes PDF/Excel
- Gestión de usuarios
- Dashboard institucional

## 🛠️ Tecnologías

### Frontend
- React 18 + Vite
- TailwindCSS
- React Router DOM
- Axios

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer para uploads

### DevOps
- Docker + Docker Compose
- GitHub Actions CI/CD
- AWS EC2
- Nginx

## 📁 Estructura del Proyecto

\`\`\`
profesores/
├── frontend/                 # React Application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/                  # Node.js API
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── package.json
├── .github/workflows/        # CI/CD Pipelines
└── docs/                     # Documentación
\`\`\`

## ⚙️ Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- MongoDB
- Docker (opcional)

### Desarrollo Local
\`\`\`bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
\`\`\`

### Producción con Docker
\`\`\`bash
docker-compose up -d --build
\`\`\`

## 📊 APIs y Endpoints

### Autenticación
- \`POST /api/auth/login\` - Iniciar sesión
- \`POST /api/auth/registro\` - Registrar usuario
- \`GET /api/auth/perfil\` - Obtener perfil

### Planeaciones
- \`GET /api/planeaciones\` - Listar planeaciones
- \`POST /api/planeaciones\` - Crear planeación
- \`PUT /api/planeaciones/:id\` - Actualizar estado

### Reportes
- \`GET /api/reportes/planeaciones/excel\` - Excel de planeaciones
- \`GET /api/reportes/avances/pdf\` - PDF de avances
- \`GET /api/reportes/cumplimiento/excel\` - Reporte general

