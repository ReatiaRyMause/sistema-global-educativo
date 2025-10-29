import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; // Cambio aquí
import ProtectedRoute from '../components/ProtectedRoute';
import { avancesService } from '../services/api'; // Cambio aquí
import { useFiltros } from '../hooks/useFiltros';
import FiltrosBusqueda from '../components/FiltrosBusqueda';

// Iconos SVG
const Iconos = {
  avance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  comentarios: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  ),
  cumplido: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
  parcial: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  noCumplido: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
};

const Avances = () => {
  const { user } = useAuth(); // Cambio aquí
  const [avances, setAvances] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    materia: '',
    parcial: 1,
    avance: 'cumplido',
    porcentaje: 100,
    comentarios: ''
  });

  // Usar el hook de filtros
  const { filtros, datosFiltrados, actualizarFiltro } = useFiltros(avances, 'avances');

  useEffect(() => {
    cargarAvances();
  }, []);

  const cargarAvances = async () => {
    try {
      const response = await avancesService.getAvances(); // Cambio aquí
      setAvances(response.data);
    } catch (error) {
      console.error('Error cargando avances:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await avancesService.crearAvance(formData); // Cambio aquí
      
      setMostrarFormulario(false);
      setFormData({
        materia: '',
        parcial: 1,
        avance: 'cumplido',
        porcentaje: 100,
        comentarios: ''
      });
      await cargarAvances();
      
      alert('Avance registrado exitosamente');
    } catch (error) {
      console.error('Error registrando avance:', error);
      alert('Error al registrar el avance: ' + (error.response?.data?.message || error.message));
    }
  };

  const getAvanceColor = (avance) => {
    switch (avance) {
      case 'cumplido': return 'bg-green-100 text-green-800 border-green-200';
      case 'parcial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'no cumplido': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvanceIcono = (avance) => {
    switch (avance) {
      case 'cumplido': return Iconos.cumplido;
      case 'parcial': return Iconos.parcial;
      case 'no cumplido': return Iconos.noCumplido;
      default: return Iconos.parcial;
    }
  };

  const getAvanceTexto = (avance) => {
    switch (avance) {
      case 'cumplido': return 'Cumplido';
      case 'parcial': return 'Parcial';
      case 'no cumplido': return 'No Cumplido';
      default: return avance;
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Cargando avances...</div>
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
                  Control de Avances
                </h1>
                <p className="text-gray-600">
                  {user?.rol === 'profesor' 
                    ? 'Registra y monitorea el progreso de tus clases' 
                    : 'Consulta los avances del personal docente'
                  }
                </p>
              </div>
              {user?.rol === 'profesor' && (
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  {Iconos.agregar}
                  <span>Registrar Avance</span>
                </button>
              )}
            </div>

            {/* Componente de Filtros */}
            <FiltrosBusqueda 
              filtros={filtros}
              onFiltrosChange={actualizarFiltro}
              tipo="avances"
            />

            {/* Formulario de nuevo avance */}
            {mostrarFormulario && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    {Iconos.avance}
                    <span className="ml-2">Registrar Nuevo Avance</span>
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
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value={1}>Primer Parcial</option>
                        <option value={2}>Segundo Parcial</option>
                        <option value={3}>Tercer Parcial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado del Avance *
                      </label>
                      <select
                        value={formData.avance}
                        onChange={(e) => setFormData({...formData, avance: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="cumplido">Cumplido</option>
                        <option value="parcial">Parcialmente Cumplido</option>
                        <option value="no cumplido">No Cumplido</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Porcentaje de Avance *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={formData.porcentaje}
                          onChange={(e) => setFormData({...formData, porcentaje: parseInt(e.target.value)})}
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="0-100%"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 text-sm">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      {Iconos.comentarios}
                      <span className="ml-1">Comentarios</span>
                    </label>
                    <textarea
                      value={formData.comentarios}
                      onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Observaciones sobre el avance del parcial..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {Iconos.avance}
                      <span>Registrar Avance</span>
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

            {/* Lista de avances */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              {datosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-3">
                    {Iconos.avance}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {avances.length === 0 ? 'No hay avances registrados' : 'No se encontraron resultados'}
                  </h3>
                  <p className="text-gray-500">
                    {avances.length === 0 
                      ? 'Comienza registrando el primer avance del período.' 
                      : 'Intenta ajustar los filtros de búsqueda.'
                    }
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {datosFiltrados.map((avance) => (
                    <li key={avance._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {avance.materia} - Parcial {avance.parcial}
                            </h3>
                            <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getAvanceColor(avance.avance)}`}>
                              {getAvanceIcono(avance.avance)}
                              <span className="ml-1">
                                {getAvanceTexto(avance.avance)} ({avance.porcentaje}%)
                              </span>
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                            <div className="flex items-center">
                              {Iconos.calendario}
                              <span className="ml-1">
                                Registrado: {new Date(avance.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {avance.profesorId?.nombre && (
                              <div className="flex items-center">
                                {Iconos.usuario}
                                <span className="ml-1">por {avance.profesorId.nombre}</span>
                              </div>
                            )}
                          </div>

                          {avance.comentarios && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center text-sm text-blue-800 mb-1">
                                {Iconos.comentarios}
                                <span className="ml-1 font-medium">Observaciones:</span>
                              </div>
                              <p className="text-sm text-blue-700">{avance.comentarios}</p>
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

export default Avances;