import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import { reportesService } from '../services/api';

const Reportes = () => {
  const { user } = useAuth();
  const [descargando, setDescargando] = useState('');
  const [parcial, setParcial] = useState('');

  const descargarReporte = async (tipo, params = {}) => {
    try {
      setDescargando(tipo);
      
      let response;
      switch (tipo) {
        case 'planeaciones-excel':
          response = await reportesService.descargarPlaneacionesExcel();
          break;
        case 'avances-pdf':
          response = await reportesService.descargarAvancesPDF(params.parcial);
          break;
        case 'cumplimiento-excel':
          response = await reportesService.descargarCumplimientoExcel();
          break;
        case 'evidencias-excel':
          response = await reportesService.descargarEvidenciasExcel();
          break;
        default:
          return;
      }

      // Crear blob y descargar
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nombre del archivo
      const timestamp = new Date().toISOString().split('T')[0];
      const nombres = {
        'planeaciones-excel': `planeaciones_${timestamp}.xlsx`,
        'avances-pdf': `avances_${params.parcial ? `parcial_${params.parcial}_` : ''}${timestamp}.pdf`,
        'cumplimiento-excel': `cumplimiento_${timestamp}.xlsx`,
        'evidencias-excel': `evidencias_${timestamp}.xlsx`
      };
      
      link.download = nombres[tipo];
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error descargando reporte:', error);
      alert('Error al descargar el reporte');
    } finally {
      setDescargando('');
    }
  };

  if (user.rol !== 'coordinador') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-600">Solo los coordinadores pueden acceder a los reportes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Reportes del Sistema</h1>
        <p className="text-gray-600">
          Genera y descarga reportes en diferentes formatos
        </p>
      </div>

      {/* Tarjetas de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reporte de Planeaciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Planeaciones</h3>
              <p className="text-gray-600 text-sm">
                Reporte detallado de todas las planeaciones registradas en el sistema
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <button
            onClick={() => descargarReporte('planeaciones-excel')}
            disabled={descargando === 'planeaciones-excel'}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {descargando === 'planeaciones-excel' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Descargando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Descargar Excel</span>
              </>
            )}
          </button>
        </div>

        {/* Reporte de Avances */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Avances</h3>
              <p className="text-gray-600 text-sm">
                Reporte de avances académicos por parcial y profesor
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          <div className="space-y-3">
            <select
              value={parcial}
              onChange={(e) => setParcial(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los parciales</option>
              <option value="1">Parcial 1</option>
              <option value="2">Parcial 2</option>
              <option value="3">Parcial 3</option>
            </select>
            
            <button
              onClick={() => descargarReporte('avances-pdf', { parcial: parcial || null })}
              disabled={descargando === 'avances-pdf'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {descargando === 'avances-pdf' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Descargando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Descargar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Reporte de Cumplimiento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cumplimiento General</h3>
              <p className="text-gray-600 text-sm">
                Métricas generales de cumplimiento y estadísticas del sistema
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <button
            onClick={() => descargarReporte('cumplimiento-excel')}
            disabled={descargando === 'cumplimiento-excel'}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {descargando === 'cumplimiento-excel' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Descargando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Descargar Excel</span>
              </>
            )}
          </button>
        </div>

        {/* Reporte de Evidencias */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Evidencias</h3>
              <p className="text-gray-600 text-sm">
                Reporte de capacitaciones y evidencias docentes registradas
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <button
            onClick={() => descargarReporte('evidencias-excel')}
            disabled={descargando === 'evidencias-excel'}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {descargando === 'evidencias-excel' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Descargando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Descargar Excel</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reportes;