import React from 'react';

const FiltrosBusqueda = ({ filtros, onFiltrosChange, tipo }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda general */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            type="text"
            placeholder="Buscar..."
            value={filtros.busqueda}
            onChange={(e) => onFiltrosChange('busqueda', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={filtros.estado}
            onChange={(e) => onFiltrosChange('estado', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos</option>
            {tipo === 'planeaciones' || tipo === 'evidencias' ? (
              <>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </>
            ) : (
              <>
                <option value="cumplido">Cumplido</option>
                <option value="parcial">Parcial</option>
                <option value="no cumplido">No Cumplido</option>
              </>
            )}
          </select>
        </div>

        {/* Filtro por parcial (solo para planeaciones y avances) */}
        {(tipo === 'planeaciones' || tipo === 'avances') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parcial</label>
            <select
              value={filtros.parcial}
              onChange={(e) => onFiltrosChange('parcial', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              <option value="1">Primer Parcial</option>
              <option value="2">Segundo Parcial</option>
              <option value="3">Tercer Parcial</option>
            </select>
          </div>
        )}

        {/* Filtro por fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
          <select
            value={filtros.orden}
            onChange={(e) => onFiltrosChange('orden', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="fechaDesc">Más recientes primero</option>
            <option value="fechaAsc">Más antiguos primero</option>
            <option value="materiaAsc">Materia (A-Z)</option>
            <option value="materiaDesc">Materia (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FiltrosBusqueda;