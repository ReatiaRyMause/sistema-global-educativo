import { useState, useMemo } from 'react';

export const useFiltros = (datos, tipo) => {
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    parcial: '',
    orden: 'fechaDesc'
  });

  const datosFiltrados = useMemo(() => {
    let resultado = [...datos];

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(item => {
        if (tipo === 'planeaciones' || tipo === 'avances') {
          return item.materia?.toLowerCase().includes(busqueda);
        } else if (tipo === 'evidencias') {
          return item.nombreCurso?.toLowerCase().includes(busqueda) || 
                 item.institucion?.toLowerCase().includes(busqueda);
        }
        return true;
      });
    }

    // Filtro por estado
    if (filtros.estado) {
      const campoEstado = tipo === 'avances' ? 'avance' : 'estado';
      resultado = resultado.filter(item => item[campoEstado] === filtros.estado);
    }

    // Filtro por parcial
    if (filtros.parcial && (tipo === 'planeaciones' || tipo === 'avances')) {
      resultado = resultado.filter(item => item.parcial.toString() === filtros.parcial);
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      switch (filtros.orden) {
        case 'fechaAsc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'fechaDesc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'materiaAsc':
          return (a.materia || a.nombreCurso).localeCompare(b.materia || b.nombreCurso);
        case 'materiaDesc':
          return (b.materia || b.nombreCurso).localeCompare(a.materia || a.nombreCurso);
        default:
          return 0;
      }
    });

    return resultado;
  }, [datos, filtros, tipo]);

  const actualizarFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estado: '',
      parcial: '',
      orden: 'fechaDesc'
    });
  };

  return {
    filtros,
    datosFiltrados,
    actualizarFiltro,
    limpiarFiltros
  };
};