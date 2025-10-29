import React, { useState, useEffect } from 'react';
import { NotificationContext } from './NotificationContext';
import { notificacionesService } from '../services/api';

const NotificationProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [contadorNoLeidas, setContadorNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar notificaciones
  const cargarNotificaciones = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await notificacionesService.getNotificaciones(page, limit);
      setNotificaciones(response.data.notificaciones);
      return response.data;
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cargar contador de no leídas
  const cargarContadorNoLeidas = async () => {
    try {
      const response = await notificacionesService.getContadorNoLeidas();
      setContadorNoLeidas(response.data.contador);
    } catch (error) {
      console.error('Error cargando contador:', error);
    }
  };

  // Marcar como leída
  const marcarComoLeida = async (id) => {
    try {
      await notificacionesService.marcarComoLeida(id);
      setNotificaciones(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, leida: true } : notif
        )
      );
      setContadorNoLeidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marcando como leída:', error);
      throw error;
    }
  };

  // Marcar todas como leídas
  const marcarTodasLeidas = async () => {
    try {
      await notificacionesService.marcarTodasLeidas();
      setNotificaciones(prev => 
        prev.map(notif => ({ ...notif, leida: true }))
      );
      setContadorNoLeidas(0);
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      throw error;
    }
  };

  // Crear notificación
  const crearNotificacion = async (notificacionData) => {
    try {
      const response = await notificacionesService.crearNotificacion(notificacionData);
      return response.data;
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  };

  // Eliminar notificación
  const eliminarNotificacion = async (id) => {
    try {
      await notificacionesService.eliminarNotificacion(id);
      setNotificaciones(prev => prev.filter(notif => notif._id !== id));
      // Recargar contador por si la notificación eliminada no estaba leída
      await cargarContadorNoLeidas();
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      throw error;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarNotificaciones();
    cargarContadorNoLeidas();
  }, []);

  const value = {
    notificaciones,
    contadorNoLeidas,
    loading,
    cargarNotificaciones,
    cargarContadorNoLeidas,
    marcarComoLeida,
    marcarTodasLeidas,
    crearNotificacion,
    eliminarNotificacion
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;