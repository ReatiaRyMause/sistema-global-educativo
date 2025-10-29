import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; // Cambio aquí
import ProtectedRoute from '../components/ProtectedRoute';
import { planeacionesService } from '../services/api'; // Cambio aquí
import { useFiltros } from '../hooks/useFiltros';
import FiltrosBusqueda from '../components/FiltrosBusqueda';

// Iconos SVG
const Iconos = {
  planeacion: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  archivo: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  calendario: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
  comentarios: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  )
};

const Planeaciones = () => {
  const { user } = useAuth(); // Cambio aquí
  const [planeaciones, setPlaneaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    materia: '',
    parcial: 1,
    archivo: null
  });
  const [comentarios, setComentarios] = useState('');

  // Usar el hook de filtros
  const { filtros, datosFiltrados, actualizarFiltro } = useFiltros(planeaciones, 'planeaciones');

  useEffect(() => {
    cargarPlaneaciones();
  }, []);

  const cargarPlaneaciones = async () => {
    try {
      const response = await planeacionesService.getPlaneaciones(); // Cambio aquí
      setPlaneaciones(response.data);
    } catch (error) {
      console.error('Error cargando planeaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('materia', formData.materia);
      formDataToSend.append('parcial', formData.parcial);
      formDataToSend.append('archivo', formData.archivo);

      await planeacionesService.crearPlaneacion(formDataToSend); // Cambio aquí
      
      setMostrarFormulario(false);
      setFormData({ materia: '', parcial: 1, archivo: null });
      cargarPlaneaciones();
      
      alert('Planeación subida exitosamente');
    } catch (error) {
      console.error('Error subiendo planeación:', error);
      alert('Error al subir la planeación');
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      archivo: e.target.files[0]
    });
  };

  // Nueva función para manejar cambio de estado
  const handleCambiarEstado = async (planeacionId, nuevoEstado) => {
    try {
      await planeacionesService.actualizarEstado(planeacionId, { // Cambio aquí
        estado: nuevoEstado,
        comentarios: comentarios
      });
      
      setComentarios('');
      cargarPlaneaciones();
      alert(`Planeación ${nuevoEstado} correctamente`);
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar el estado de la planeación');
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

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Cargando planeaciones...</div>
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
                  Gestión de Planeaciones
                </h1>
                <p className="text-gray-600">
                  {user?.rol === 'profesor' ? 'Administra tus planeaciones didácticas' : 'Revisa y aprueba planeaciones del personal docente'}
                </p>
              </div>
              {user?.rol === 'profesor' && (
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  {Iconos.agregar}
                  <span>Nueva Planeación</span>
                </button>
              )}
            </div>

            {/* Componente de Filtros */}
            <FiltrosBusqueda 
              filtros={filtros}
              onFiltrosChange={actualizarFiltro}
              tipo="planeaciones"
            />

            {/* Formulario de nueva planeación */}
            {mostrarFormulario && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    {Iconos.planeacion}
                    <span className="ml-2">Subir Nueva Planeación</span>
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
                        Materia *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.materia}
                        onChange={(e) => setFormData({...formData, materia: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Ej: Matemáticas, Física, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parcial *
                      </label>
                      <select
                        value={formData.parcial}
                        onChange={(e) => setFormData({...formData, parcial: parseInt(e.target.value)})}
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value={1}>Primer Parcial</option>
                        <option value={2}>Segundo Parcial</option>
                        <option value={3}>Tercer Parcial</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Archivo *
                    </label>
                    <input
                      type="file"
                      required
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      accept=".pdf,.doc,.docx,image/*"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos aceptados: PDF, Word (DOC/DOCX), imágenes. Máximo 10MB.
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {Iconos.planeacion}
                      <span>Subir Planeación</span>
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

            {/* Lista de planeaciones */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              {datosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-3">
                    {Iconos.planeacion}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {planeaciones.length === 0 ? 'No hay planeaciones registradas' : 'No se encontraron resultados'}
                  </h3>
                  <p className="text-gray-500">
                    {planeaciones.length === 0 
                      ? 'Comienza subiendo tu primera planeación didáctica.' 
                      : 'Intenta ajustar los filtros de búsqueda.'
                    }
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {datosFiltrados.map((planeacion) => (
                    <li key={planeacion._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {planeacion.materia} - Parcial {planeacion.parcial}
                            </h3>
                            <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(planeacion.estado)}`}>
                              {getEstadoIcono(planeacion.estado)}
                              <span className="ml-1 capitalize">{planeacion.estado}</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                            <div className="flex items-center">
                              {Iconos.calendario}
                              <span className="ml-1">
                                Subido: {new Date(planeacion.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {planeacion.updatedAt && planeacion.estado !== 'pendiente' && (
                              <div className="flex items-center">
                                {Iconos.calendario}
                                <span className="ml-1">
                                  Revisado: {new Date(planeacion.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {planeacion.profesorId?.nombre && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="ml-1">{planeacion.profesorId.nombre}</span>
                              </div>
                            )}
                          </div>

                          {planeacion.comentarios && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center text-sm text-blue-800 mb-1">
                                {Iconos.comentarios}
                                <span className="ml-1 font-medium">Comentarios:</span>
                              </div>
                              <p className="text-sm text-blue-700">{planeacion.comentarios}</p>
                            </div>
                          )}

                          {/* Campo de comentarios para coordinadores */}
                          {user?.rol === 'coordinador' && planeacion.estado === 'pendiente' && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                {Iconos.comentarios}
                                <span className="ml-1">Comentarios (opcional)</span>
                              </label>
                              <textarea
                                value={comentarios}
                                onChange={(e) => setComentarios(e.target.value)}
                                placeholder="Agrega comentarios para el profesor..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                rows="2"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 ml-4">
                          <a
                            href={`http://localhost:5000/uploads/${planeacion.archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                          >
                            {Iconos.archivo}
                            <span>Ver archivo</span>
                          </a>
                          
                          {user?.rol === 'coordinador' && planeacion.estado === 'pendiente' && (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleCambiarEstado(planeacion._id, 'aprobado')}
                                className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                {Iconos.aprobar}
                                <span>Aprobar</span>
                              </button>
                              <button 
                                onClick={() => handleCambiarEstado(planeacion._id, 'rechazado')}
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

export default Planeaciones;