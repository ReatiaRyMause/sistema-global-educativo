import express from 'express';
import { authMiddleware, coordinadorMiddleware } from '../middleware/auth.js';
import Planeacion from '../models/Planeacion.js';
import Avance from '../models/Avance.js';
import Evidencia from '../models/Evidencia.js';
import Usuario from '../models/Usuario.js';

const router = express.Router();

// Dashboard para coordinador
router.get('/coordinador', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const [
      totalProfesores,
      totalPlaneaciones,
      totalAvances,
      totalEvidencias,
      planeacionesPorEstado,
      avancesPorParcial,
      evidenciasRecientes
    ] = await Promise.all([
      Usuario.countDocuments({ rol: 'profesor', activo: true }),
      Planeacion.countDocuments(),
      Avance.countDocuments(),
      Evidencia.countDocuments(),
      Planeacion.aggregate([
        { $group: { _id: '$estado', count: { $sum: 1 } } }
      ]),
      Avance.aggregate([
        { $group: { _id: '$parcial', count: { $sum: 1 }, avgPorcentaje: { $avg: '$porcentaje' } } }
      ]),
      Evidencia.find().populate('profesorId', 'nombre').sort({ createdAt: -1 }).limit(5)
    ]);

    // Calcular porcentajes de cumplimiento
    const planeacionesAprobadas = planeacionesPorEstado.find(p => p._id === 'aprobado')?.count || 0;
    const porcentajeCumplimiento = totalPlaneaciones > 0 
      ? Math.round((planeacionesAprobadas / totalPlaneaciones) * 100) 
      : 0;

    res.json({
      metricasGenerales: {
        totalProfesores,
        totalPlaneaciones,
        totalAvances,
        totalEvidencias,
        porcentajeCumplimiento
      },
      planeacionesPorEstado: planeacionesPorEstado.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      avancesPorParcial: avancesPorParcial.reduce((acc, curr) => {
        acc[curr._id] = {
          cantidad: curr.count,
          promedioPorcentaje: Math.round(curr.avgPorcentaje || 0)
        };
        return acc;
      }, {}),
      actividadReciente: {
        ultimasEvidencias: evidenciasRecientes,
        planeacionesPendientes: await Planeacion.countDocuments({ estado: 'pendiente' })
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard para profesor
router.get('/profesor', authMiddleware, async (req, res) => {
  try {
    const profesorId = req.usuario._id;

    const [
      misPlaneaciones,
      misAvances,
      misEvidencias,
      planeacionesPorEstado,
      avancesPorParcial
    ] = await Promise.all([
      Planeacion.countDocuments({ profesorId }),
      Avance.countDocuments({ profesorId }),
      Evidencia.countDocuments({ profesorId }),
      Planeacion.aggregate([
        { $match: { profesorId } },
        { $group: { _id: '$estado', count: { $sum: 1 } } }
      ]),
      Avance.aggregate([
        { $match: { profesorId } },
        { $group: { _id: '$parcial', count: { $sum: 1 }, avgPorcentaje: { $avg: '$porcentaje' } } }
      ])
    ]);

    const ultimasActividades = await Promise.all([
      Planeacion.find({ profesorId }).sort({ createdAt: -1 }).limit(3),
      Avance.find({ profesorId }).sort({ createdAt: -1 }).limit(3),
      Evidencia.find({ profesorId }).sort({ createdAt: -1 }).limit(3)
    ]);

    res.json({
      metricasPersonales: {
        totalPlaneaciones: misPlaneaciones,
        totalAvances: misAvances,
        totalEvidencias: misEvidencias
      },
      planeacionesPorEstado: planeacionesPorEstado.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      avancesPorParcial: avancesPorParcial.reduce((acc, curr) => {
        acc[curr._id] = {
          cantidad: curr.count,
          promedioPorcentaje: Math.round(curr.avgPorcentaje || 0)
        };
        return acc;
      }, {}),
      actividadReciente: {
        ultimasPlaneaciones: ultimasActividades[0],
        ultimosAvances: ultimasActividades[1],
        ultimasEvidencias: ultimasActividades[2]
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Gráficas específicas para coordinador
router.get('/graficas/cumplimiento', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const cumplimientoPorProfesor = await Avance.aggregate([
      {
        $group: {
          _id: '$profesorId',
          promedioAvance: { $avg: '$porcentaje' },
          totalAvances: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'profesor'
        }
      },
      {
        $unwind: '$profesor'
      },
      {
        $project: {
          profesor: '$profesor.nombre',
          promedioAvance: { $round: ['$promedioAvance', 2] },
          totalAvances: 1
        }
      }
    ]);

    const planeacionesPorMateria = await Planeacion.aggregate([
      {
        $group: {
          _id: '$materia',
          total: { $sum: 1 },
          aprobadas: {
            $sum: { $cond: [{ $eq: ['$estado', 'aprobado'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          materia: '$_id',
          total: 1,
          aprobadas: 1,
          porcentajeAprobacion: {
            $round: [{ $multiply: [{ $divide: ['$aprobadas', '$total'] }, 100] }, 2]
          }
        }
      }
    ]);

    const evidenciasPorEstado = await Evidencia.aggregate([
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      cumplimientoPorProfesor,
      planeacionesPorMateria,
      evidenciasPorEstado: evidenciasPorEstado.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Estadísticas generales del sistema
router.get('/estadisticas-generales', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const [
      totalUsuarios,
      usuariosActivos,
      totalPlaneaciones,
      planeacionesEsteMes,
      totalAvances,
      totalEvidencias
    ] = await Promise.all([
      Usuario.countDocuments(),
      Usuario.countDocuments({ activo: true }),
      Planeacion.countDocuments(),
      Planeacion.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      Avance.countDocuments(),
      Evidencia.countDocuments()
    ]);

    const porcentajeActivos = totalUsuarios > 0 ? Math.round((usuariosActivos / totalUsuarios) * 100) : 0;

    res.json({
      totalUsuarios,
      usuariosActivos,
      porcentajeActivos,
      totalPlaneaciones,
      planeacionesEsteMes,
      totalAvances,
      totalEvidencias
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;