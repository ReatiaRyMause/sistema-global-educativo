import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import ProtectedRoute from "../components/ProtectedRoute";
import { 
  planeacionesService, 
  avancesService, 
  evidenciasService 
} from "../services/api";

// Componentes SVG como funciones (se mantienen igual)
const PlaneacionIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AvanceIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EvidenciaIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const AprobadoIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const PendienteIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const RechazadoIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const UsuarioIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalendarioIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const RevisionIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ValidarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [estadisticas, setEstadisticas] = useState({
    planeaciones: { total: 0, aprobadas: 0, pendientes: 0, rechazadas: 0 },
    avances: { total: 0, cumplidos: 0, parciales: 0, noCumplidos: 0 },
    evidencias: { total: 0, aprobadas: 0, pendientes: 0, rechazadas: 0 },
  });
  const [cargando, setCargando] = useState(true);
  const [ultimasActividades, setUltimasActividades] = useState([]);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      const [planeacionesRes, avancesRes, evidenciasRes] = await Promise.all([
        planeacionesService.getPlaneaciones(),
        avancesService.getAvances(),
        evidenciasService.getEvidencias(),
      ]);

      const planeaciones = planeacionesRes.data;
      const avances = avancesRes.data;
      const evidencias = evidenciasRes.data;

      // Filtrar por usuario si es profesor
      const planeacionesFiltradas =
        user?.rol === "profesor"
          ? planeaciones.filter((p) => p.profesorId?._id === user._id)
          : planeaciones;

      const avancesFiltrados =
        user?.rol === "profesor"
          ? avances.filter((a) => a.profesorId?._id === user._id)
          : avances;

      const evidenciasFiltradas =
        user?.rol === "profesor"
          ? evidencias.filter((e) => e.profesorId?._id === user._id)
          : evidencias;

      // Calcular estadísticas
      setEstadisticas({
        planeaciones: {
          total: planeacionesFiltradas.length,
          aprobadas: planeacionesFiltradas.filter((p) => p.estado === "aprobado").length,
          pendientes: planeacionesFiltradas.filter((p) => p.estado === "pendiente").length,
          rechazadas: planeacionesFiltradas.filter((p) => p.estado === "rechazado").length,
        },
        avances: {
          total: avancesFiltrados.length,
          cumplidos: avancesFiltrados.filter((a) => a.avance === "cumplido").length,
          parciales: avancesFiltrados.filter((a) => a.avance === "parcial").length,
          noCumplidos: avancesFiltrados.filter((a) => a.avance === "no cumplido").length,
        },
        evidencias: {
          total: evidenciasFiltradas.length,
          aprobadas: evidenciasFiltradas.filter((e) => e.estado === "aprobado").length,
          pendientes: evidenciasFiltradas.filter((e) => e.estado === "pendiente").length,
          rechazadas: evidenciasFiltradas.filter((e) => e.estado === "rechazado").length,
        },
      });

      // Últimas actividades
      const actividades = [
        ...planeacionesFiltradas.map((p) => ({
          tipo: "planeacion",
          titulo: `${p.materia} - Parcial ${p.parcial}`,
          estado: p.estado,
          fecha: p.createdAt,
          usuario: p.profesorId?.nombre,
        })),
        ...avancesFiltrados.map((a) => ({
          tipo: "avance",
          titulo: `${a.materia} - Parcial ${a.parcial}`,
          estado: a.avance,
          fecha: a.createdAt,
          usuario: a.profesorId?.nombre,
        })),
        ...evidenciasFiltradas.map((e) => ({
          tipo: "evidencia",
          titulo: e.nombreCurso,
          estado: e.estado,
          fecha: e.createdAt,
          usuario: e.profesorId?.nombre,
        })),
      ]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);

      setUltimasActividades(actividades);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "aprobado":
      case "cumplido":
        return "text-green-800 bg-green-100 border-green-200";
      case "pendiente":
      case "parcial":
        return "text-yellow-800 bg-yellow-100 border-yellow-200";
      case "rechazado":
      case "no cumplido":
        return "text-red-800 bg-red-100 border-red-200";
      default:
        return "text-gray-800 bg-gray-100 border-gray-200";
    }
  };

  const getIcono = (tipo) => {
    switch (tipo) {
      case "planeacion":
        return <PlaneacionIcon />;
      case "avance":
        return <AvanceIcon />;
      case "evidencia":
        return <EvidenciaIcon />;
      default:
        return <PlaneacionIcon />;
    }
  };

  const getIconoEstado = (estado) => {
    switch (estado) {
      case "aprobado":
      case "cumplido":
        return <AprobadoIcon />;
      case "pendiente":
      case "parcial":
        return <PendienteIcon />;
      case "rechazado":
      case "no cumplido":
        return <RechazadoIcon />;
      default:
        return <PendienteIcon />;
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div className="text-lg text-gray-600">Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header Mejorado */}
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Panel de Control
            </h1>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center text-gray-700 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-200">
                <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                  <UsuarioIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-lg">
                  Bienvenido, <strong className="text-gray-900">{user?.nombre}</strong> 
                </span>
                <span className="ml-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium capitalize shadow-sm">
                  {user?.rol}
                </span>
              </div>
              
              {/* Resumen rápido */}
              <div className="flex items-center gap-6 text-sm text-gray-600 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-200">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{estadisticas.planeaciones.pendientes}</div>
                  <div className="text-xs">Pendientes</div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{estadisticas.planeaciones.aprobadas}</div>
                  <div className="text-xs">Aprobadas</div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{estadisticas.evidencias.pendientes}</div>
                  <div className="text-xs">Por validar</div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas principales - Mejorado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                titulo: "Planeaciones",
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50",
                icono: <PlaneacionIcon className="w-8 h-8 text-white" />,
                data: estadisticas.planeaciones,
                estados: [
                  { label: "Aprobadas", value: estadisticas.planeaciones.aprobadas, color: "text-green-600" },
                  { label: "Pendientes", value: estadisticas.planeaciones.pendientes, color: "text-yellow-600" },
                  { label: "Rechazadas", value: estadisticas.planeaciones.rechazadas, color: "text-red-600" }
                ]
              },
              {
                titulo: "Avances",
                color: "from-green-500 to-green-600",
                bgColor: "bg-green-50",
                icono: <AvanceIcon className="w-8 h-8 text-white" />,
                data: estadisticas.avances,
                estados: [
                  { label: "Cumplidos", value: estadisticas.avances.cumplidos, color: "text-green-600" },
                  { label: "Parciales", value: estadisticas.avances.parciales, color: "text-yellow-600" },
                  { label: "No cumplidos", value: estadisticas.avances.noCumplidos, color: "text-red-600" }
                ]
              },
              {
                titulo: "Evidencias",
                color: "from-amber-500 to-amber-600",
                bgColor: "bg-amber-50",
                icono: <EvidenciaIcon className="w-8 h-8 text-white" />,
                data: estadisticas.evidencias,
                estados: [
                  { label: "Aprobadas", value: estadisticas.evidencias.aprobadas, color: "text-green-600" },
                  { label: "Pendientes", value: estadisticas.evidencias.pendientes, color: "text-yellow-600" },
                  { label: "Rechazadas", value: estadisticas.evidencias.rechazadas, color: "text-red-600" }
                ]
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-r ${item.color} rounded-t-2xl p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm font-medium opacity-90">{item.titulo}</h4>
                      <p className="text-3xl font-bold text-white mt-2">
                        {item.data.total}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                      {item.icono}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    {item.estados.map((estado, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`text-lg font-bold ${estado.color}`}>
                          {estado.value}
                        </div>
                        <div className="text-gray-500 mt-1">{estado.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Grid de contenido principal */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Últimas actividades - Mejorado */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Actividades Recientes
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {ultimasActividades.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg">No hay actividades recientes</p>
                      <p className="text-gray-400 text-sm mt-2">Las actividades aparecerán aquí</p>
                    </div>
                  ) : (
                    ultimasActividades.map((actividad, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors group"
                      >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 group-hover:border-gray-300">
                            <div className="text-gray-600">
                              {getIcono(actividad.tipo)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {actividad.titulo}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mt-1 flex-wrap gap-2">
                              <div className="flex items-center">
                                <CalendarioIcon className="w-4 h-4 mr-1" />
                                <span>{new Date(actividad.fecha).toLocaleDateString()}</span>
                              </div>
                              {actividad.usuario && (
                                <>
                                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                  <span className="truncate">{actividad.usuario}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border capitalize ml-4 flex-shrink-0 ${getEstadoColor(
                            actividad.estado
                          )}`}
                        >
                          {getIconoEstado(actividad.estado)}
                          <span className="ml-1.5">{actividad.estado}</span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Acciones rápidas - Mejorado */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Acciones Rápidas
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {user?.rol === "profesor" && (
                    <>
                      <a
                        href="/planeaciones"
                        className="flex items-center p-5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all duration-200 group"
                      >
                        <div className="bg-white p-3 rounded-lg mr-4 shadow-sm border border-blue-200 group-hover:border-blue-300">
                          <div className="text-blue-600">
                            <PlaneacionIcon />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Subir Planeación</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Registrar nueva planeación didáctica
                          </p>
                        </div>
                        <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </a>
                      <a
                        href="/avances"
                        className="flex items-center p-5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all duration-200 group"
                      >
                        <div className="bg-white p-3 rounded-lg mr-4 shadow-sm border border-green-200 group-hover:border-green-300">
                          <div className="text-green-600">
                            <AvanceIcon />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Registrar Avance</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Actualizar progreso del parcial
                          </p>
                        </div>
                        <div className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </a>
                      <a
                        href="/evidencias"
                        className="flex items-center p-5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all duration-200 group"
                      >
                        <div className="bg-white p-3 rounded-lg mr-4 shadow-sm border border-amber-200 group-hover:border-amber-300">
                          <div className="text-amber-600">
                            <EvidenciaIcon />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Subir Evidencia</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Compartir constancias de capacitación
                          </p>
                        </div>
                        <div className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </a>
                    </>
                  )}

                  {user?.rol === "coordinador" && (
                    <>
                      <a
                        href="/planeaciones"
                        className="flex items-center p-5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all duration-200 group"
                      >
                        <div className="bg-white p-3 rounded-lg mr-4 shadow-sm border border-blue-200 group-hover:border-blue-300">
                          <div className="text-blue-600">
                            <RevisionIcon />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Revisar Planeaciones</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {estadisticas.planeaciones.pendientes} pendientes de revisión
                          </p>
                        </div>
                        <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </a>
                      <a
                        href="/evidencias"
                        className="flex items-center p-5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all duration-200 group"
                      >
                        <div className="bg-white p-3 rounded-lg mr-4 shadow-sm border border-amber-200 group-hover:border-amber-300">
                          <div className="text-amber-600">
                            <ValidarIcon />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Validar Evidencias</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {estadisticas.evidencias.pendientes} por validar
                          </p>
                        </div>
                        <div className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;