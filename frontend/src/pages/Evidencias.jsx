import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; // Cambio aquí
import ProtectedRoute from '../components/ProtectedRoute';
import { evidenciasService } from '../services/api'; // Cambio aquí
import { useFiltros } from '../hooks/useFiltros';
import FiltrosBusqueda from '../components/FiltrosBusqueda';

// Iconos SVG
const Iconos = {
  evidencia: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  agregar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  cancelar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  calendario: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  usuario: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  institucion: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  horas: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  archivo: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  aprobar: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
  rechazar: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  ),
  comentarios: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  )
};

const Evidencias = () => {
  const { user } = useAuth(); // Cambio aquí
  const [evidencias, setEvidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [formData, setFormData] = useState({
    nombreCurso: '',
    institucion: '',
    fecha: '',
    horas: '',
    archivo: null
  });
  const [comentarios, setComentarios] = useState('');

  // Usar el hook de filtros
  const { filtros, datosFiltrados, actualizarFiltro } = useFiltros(evidencias, 'evidencias');

  useEffect(() => {
    cargarEvidencias();
  }, []);

  const cargarEvidencias = async () => {
    try {
      const response = await evidenciasService.getEvidencias(); // Cambio aquí
      setEvidencias(response.data);
    } catch (error) {
      console.error('Error cargando evidencias:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.archivo) {
      alert('Por favor selecciona un archivo de evidencia');
      return;
    }

    setSubiendo(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombreCurso', formData.nombreCurso);
      formDataToSend.append('institucion', formData.institucion);
      formDataToSend.append('fecha', formData.fecha);
      formDataToSend.append('horas', formData.horas);
      formDataToSend.append('archivo', formData.archivo);

      await evidenciasService.crearEvidencia(formDataToSend); // Cambio aquí
      
      setMostrarFormulario(false);
      setFormData({
        nombreCurso: '',
        institucion: '',
        fecha: '',
        horas: '',
        archivo: null
      });
      await cargarEvidencias();
      
      alert('Evidencia subida exitosamente');
    } catch (error) {
      console.error('Error subiendo evidencia:', error);
      alert('Error al subir la evidencia: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubiendo(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB.');
        e.target.value = '';
        return;
      }
      
      setFormData({
        ...formData,
        archivo: file
      });
    }
  };

  // Nueva función para manejar cambio de estado
  const handleCambiarEstado = async (evidenciaId, nuevoEstado) => {
    try {
      await evidenciasService.actualizarEstado(evidenciaId, { // Cambio aquí
        estado: nuevoEstado,
        comentarios: comentarios
      });
      
      setComentarios('');
      cargarEvidencias();
      alert(`Evidencia ${nuevoEstado} correctamente`);
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar el estado de la evidencia');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado': return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getEstadoIcono = (estado) => {
    switch (estado) {
      case 'aprobado': return Iconos.aprobar;
      case 'rechazado': return Iconos.rechazar;
      default: return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      default: return 'Pendiente';
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Cargando evidencias...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Evidencias de Capacitación
                </h1>
                <p className="text-gray-600">
                  {user?.rol === 'profesor' 
                    ? 'Comparte tus constancias y certificaciones de formación' 
                    : 'Valida las evidencias de capacitación del personal docente'
                  }
                </p>
              </div>
              {user?.rol === 'profesor' && (
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors shadow-sm"
                >
                  {Iconos.agregar}
                  <span>Subir Evidencia</span>
                </button>
              )}
            </div>

            {/* Componente de Filtros */}
            <FiltrosBusqueda 
              filtros={filtros}
              onFiltrosChange={actualizarFiltro}
              tipo="evidencias"
            />

            {/* Formulario de nueva evidencia */}
            {mostrarFormulario && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    {Iconos.evidencia}
                    <span className="ml-2">Subir Nueva Evidencia</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {Iconos.cancelar}
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Curso *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombreCurso}
                        onChange={(e) => setFormData({...formData, nombreCurso: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Ej: Curso de Actualización Docente"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institución *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.institucion}
                        onChange={(e) => setFormData({...formData, institucion: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Ej: Universidad Nacional"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        {Iconos.calendario}
                        <span className="ml-1">Fecha del Curso *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.fecha}
                        onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        {Iconos.horas}
                        <span className="ml-1">Horas Acreditadas *</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          required
                          value={formData.horas}
                          onChange={(e) => setFormData({...formData, horas: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Ej: 40"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 text-sm">horas</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      {Iconos.archivo}
                      <span className="ml-1">Constancia o Evidencia *</span>
                    </label>
                    <input
                      type="file"
                      required
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                      accept=".pdf,.doc,.docx,image/jpeg,image/png,image/jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos: PDF, Word (DOC/DOCX), JPEG, PNG. Máximo 10MB.
                    </p>
                    {formData.archivo && (
                      <div className="flex items-center mt-2 text-green-600 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Archivo seleccionado: {formData.archivo.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={subiendo}
                      className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {Iconos.evidencia}
                      <span>{subiendo ? 'Subiendo...' : 'Subir Evidencia'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMostrarFormulario(false)}
                      className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      {Iconos.cancelar}
                      <span>Cancelar</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de evidencias */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              {datosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-3">
                    {Iconos.evidencia}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {evidencias.length === 0 ? 'No hay evidencias registradas' : 'No se encontraron resultados'}
                  </h3>
                  <p className="text-gray-500">
                    {evidencias.length === 0 
                      ? 'Comienza subiendo tu primera evidencia de capacitación.' 
                      : 'Intenta ajustar los filtros de búsqueda.'
                    }
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {datosFiltrados.map((evidencia) => (
                    <li key={evidencia._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {evidencia.nombreCurso}
                            </h3>
                            <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(evidencia.estado)}`}>
                              {getEstadoIcono(evidencia.estado)}
                              <span className="ml-1 capitalize">{getEstadoTexto(evidencia.estado)}</span>
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mb-3">
                            <div className="flex items-center">
                              {Iconos.institucion}
                              <span className="ml-1">{evidencia.institucion}</span>
                            </div>
                            <div className="flex items-center">
                              {Iconos.calendario}
                              <span className="ml-1">{new Date(evidencia.fecha).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              {Iconos.horas}
                              <span className="ml-1">{evidencia.horas} horas</span>
                            </div>
                            {evidencia.profesorId?.nombre && (
                              <div className="flex items-center">
                                {Iconos.usuario}
                                <span className="ml-1">por {evidencia.profesorId.nombre}</span>
                              </div>
                            )}
                          </div>

                          {evidencia.comentarios && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center text-sm text-blue-800 mb-1">
                                {Iconos.comentarios}
                                <span className="ml-1 font-medium">Comentarios:</span>
                              </div>
                              <p className="text-sm text-blue-700">{evidencia.comentarios}</p>
                            </div>
                          )}

                          {/* Campo de comentarios para coordinadores */}
                          {user?.rol === 'coordinador' && evidencia.estado === 'pendiente' && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                {Iconos.comentarios}
                                <span className="ml-1">Comentarios (opcional)</span>
                              </label>
                              <textarea
                                value={comentarios}
                                onChange={(e) => setComentarios(e.target.value)}
                                placeholder="Agrega comentarios para el profesor..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                rows="2"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 ml-4">
                          <a
                            href={`http://localhost:5000/uploads/${evidencia.archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-yellow-600 hover:text-yellow-800 text-sm font-medium transition-colors"
                          >
                            {Iconos.archivo}
                            <span>Ver constancia</span>
                          </a>
                          
                          {user?.rol === 'coordinador' && evidencia.estado === 'pendiente' && (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleCambiarEstado(evidencia._id, 'aprobado')}
                                className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                {Iconos.aprobar}
                                <span>Aprobar</span>
                              </button>
                              <button 
                                onClick={() => handleCambiarEstado(evidencia._id, 'rechazado')}
                                className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                              >
                                {Iconos.rechazar}
                                <span>Rechazar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Evidencias;