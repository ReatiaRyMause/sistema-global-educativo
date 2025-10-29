import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications'; // Cambio aquí

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { 
    notificaciones, 
    contadorNoLeidas, 
    loading, 
    marcarComoLeida, 
    marcarTodasLeidas 
  } = useNotifications();

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notificacion) => {
    if (!notificacion.leida) {
      await marcarComoLeida(notificacion._id);
    }
    // Aquí puedes agregar lógica para redirigir según el tipo de notificación
  };

  const handleMarkAllAsRead = async () => {
    await marcarTodasLeidas();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.78 1.44 5.97 5.97 0 01-3.78-1.44M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        {/* Badge de notificaciones no leídas */}
        {contadorNoLeidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {contadorNoLeidas}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
              {contadorNoLeidas > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Cargando...</div>
            ) : notificaciones.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No hay notificaciones
              </div>
            ) : (
              notificaciones.map((notificacion) => (
                <div
                  key={notificacion._id}
                  onClick={() => handleNotificationClick(notificacion)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    !notificacion.leida ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        !notificacion.leida ? 'text-blue-800' : 'text-gray-800'
                      }`}>
                        {notificacion.titulo}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notificacion.mensaje}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          notificacion.tipo === 'importante' ? 'bg-red-500' :
                          notificacion.tipo === 'sistema' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}></span>
                        <span>{new Date(notificacion.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {!notificacion.leida && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;