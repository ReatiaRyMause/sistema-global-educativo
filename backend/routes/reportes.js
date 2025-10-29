import express from 'express';
import { authMiddleware, coordinadorMiddleware } from '../middleware/auth.js';
import Planeacion from '../models/Planeacion.js';
import Avance from '../models/Avance.js';
import Evidencia from '../models/Evidencia.js';
import Usuario from '../models/Usuario.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Reporte de planeaciones en Excel
router.get('/planeaciones/excel', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const planeaciones = await Planeacion.find()
      .populate('profesorId', 'nombre email')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Planeaciones');

    worksheet.columns = [
      { header: 'Profesor', key: 'profesor', width: 25 },
      { header: 'Materia', key: 'materia', width: 20 },
      { header: 'Parcial', key: 'parcial', width: 10 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Comentarios', key: 'comentarios', width: 30 }
    ];

    planeaciones.forEach(planeacion => {
      worksheet.addRow({
        profesor: planeacion.profesorId.nombre,
        materia: planeacion.materia,
        parcial: planeacion.parcial,
        estado: planeacion.estado,
        fecha: planeacion.createdAt.toLocaleDateString('es-MX'),
        comentarios: planeacion.comentarios || 'Sin comentarios'
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=planeaciones.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reporte de avances en PDF
router.get('/avances/pdf', authMiddleware, async (req, res) => {
  try {
    const { parcial } = req.query;
    let query = {};
    
    if (parcial) query.parcial = parseInt(parcial);
    if (req.usuario.rol !== 'coordinador') {
      query.profesorId = req.usuario._id;
    }

    const avances = await Avance.find(query)
      .populate('profesorId', 'nombre email')
      .sort({ createdAt: -1 });

    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=avances_${parcial || 'general'}.pdf`);
    
    doc.pipe(res);

    doc.fontSize(20).text('Reporte de Avances Académicos', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generado: ${new Date().toLocaleDateString('es-MX')}`);
    doc.text(`Total de registros: ${avances.length}`);
    doc.moveDown();

    avances.forEach((avance, index) => {
      doc.text(`${index + 1}. ${avance.profesorId.nombre} - ${avance.materia}`)
         .text(`   Parcial ${avance.parcial}: ${avance.avance}`)
         .text(`   Porcentaje: ${avance.porcentaje}%`)
         .text(`   Comentarios: ${avance.comentarios || 'Ninguno'}`)
         .moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reporte general de cumplimiento en Excel
router.get('/cumplimiento/excel', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const [planeaciones, avances, usuarios] = await Promise.all([
      Planeacion.find().populate('profesorId', 'nombre'),
      Avance.find().populate('profesorId', 'nombre'),
      Usuario.find({ rol: 'profesor' })
    ]);

    const workbook = new ExcelJS.Workbook();
    
    // Estadísticas generales
    const statsSheet = workbook.addWorksheet('Estadísticas Generales');
    statsSheet.columns = [
      { header: 'Métrica', key: 'metrica', width: 35 },
      { header: 'Valor', key: 'valor', width: 20 }
    ];

    const planeacionesAprobadas = planeaciones.filter(p => p.estado === 'aprobado').length;
    const promedioAvance = avances.length > 0 ? 
      (avances.reduce((sum, a) => sum + a.porcentaje, 0) / avances.length).toFixed(2) : 0;

    const estadisticas = [
      { metrica: 'Total de Profesores', valor: usuarios.length },
      { metrica: 'Total de Planeaciones', valor: planeaciones.length },
      { metrica: 'Total de Avances', valor: avances.length },
      { metrica: 'Planeaciones Aprobadas', valor: planeacionesAprobadas },
      { metrica: 'Planeaciones Pendientes', valor: planeaciones.filter(p => p.estado === 'pendiente').length },
      { metrica: 'Promedio de Avance', valor: `${promedioAvance}%` },
      { metrica: 'Porcentaje de Cumplimiento', valor: `${((planeacionesAprobadas / planeaciones.length) * 100).toFixed(2)}%` }
    ];

    estadisticas.forEach(stat => {
      statsSheet.addRow(stat);
    });

    statsSheet.getRow(1).font = { bold: true };

    // Hoja de detalle por profesor
    const detalleSheet = workbook.addWorksheet('Detalle por Profesor');
    detalleSheet.columns = [
      { header: 'Profesor', key: 'profesor', width: 25 },
      { header: 'Planeaciones', key: 'planeaciones', width: 15 },
      { header: 'Aprobadas', key: 'aprobadas', width: 15 },
      { header: 'Avances', key: 'avances', width: 15 },
      { header: 'Promedio Avance', key: 'promedio', width: 15 }
    ];

    usuarios.forEach(usuario => {
      const planesProfesor = planeaciones.filter(p => p.profesorId._id.toString() === usuario._id.toString());
      const avancesProfesor = avances.filter(a => a.profesorId._id.toString() === usuario._id.toString());
      const promedioProfesor = avancesProfesor.length > 0 ? 
        (avancesProfesor.reduce((sum, a) => sum + a.porcentaje, 0) / avancesProfesor.length).toFixed(2) : 0;

      detalleSheet.addRow({
        profesor: usuario.nombre,
        planeaciones: planesProfesor.length,
        aprobadas: planesProfesor.filter(p => p.estado === 'aprobado').length,
        avances: avancesProfesor.length,
        promedio: `${promedioProfesor}%`
      });
    });

    detalleSheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_cumplimiento.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reporte de evidencias en Excel
router.get('/evidencias/excel', authMiddleware, coordinadorMiddleware, async (req, res) => {
  try {
    const evidencias = await Evidencia.find()
      .populate('profesorId', 'nombre email')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Evidencias');

    worksheet.columns = [
      { header: 'Profesor', key: 'profesor', width: 25 },
      { header: 'Curso', key: 'curso', width: 30 },
      { header: 'Institución', key: 'institucion', width: 25 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Horas', key: 'horas', width: 10 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Archivo', key: 'archivo', width: 25 }
    ];

    evidencias.forEach(evidencia => {
      worksheet.addRow({
        profesor: evidencia.profesorId.nombre,
        curso: evidencia.nombreCurso,
        institucion: evidencia.institucion,
        fecha: new Date(evidencia.fecha).toLocaleDateString('es-MX'),
        horas: evidencia.horas,
        estado: evidencia.estado,
        archivo: evidencia.archivo
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=evidencias.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;