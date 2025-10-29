import React, { useState, useEffect } from 'react';
import { usuariosService } from '../services/api'; // Cambio aquí

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'profesor',
    materias: ['']
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const { data } = await usuariosService.getUsuarios(); // Cambio aquí
      setUsuarios(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMateriaChange = (index, value) => {
    const nuevasMaterias = [...formData.materias];
    nuevasMaterias[index] = value;
    setFormData(prev => ({
      ...prev,
      materias: nuevasMaterias
    }));
  };

  const agregarMateria = () => {
    setFormData(prev => ({
      ...prev,
      materias: [...prev.materias, '']
    }));
  };

  const eliminarMateria = (index) => {
    const nuevasMaterias = formData.materias.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      materias: nuevasMaterias
    }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'profesor',
      materias: ['']
    });
    setUsuarioEditando(null);
    setMostrarFormulario(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');

      // Filtrar materias vacías
      const datosEnviar = {
        ...formData,
        materias: formData.materias.filter(materia => materia.trim() !== '')
      };

      if (usuarioEditando) {
        // Actualizar usuario existente
        const datosActualizar = { ...datosEnviar };
        if (!datosActualizar.password) {
          delete datosActualizar.password;
        }
        await usuariosService.actualizarUsuario(usuarioEditando._id, datosActualizar); // Cambio aquí
      } else {
        // Crear nuevo usuario
        await usuariosService.crearUsuario(datosEnviar); // Cambio aquí
      }

      resetForm();
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEditar = (usuario) => {
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      materias: usuario.materias && usuario.materias.length > 0 ? usuario.materias : ['']
    });
    setUsuarioEditando(usuario);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        await usuariosService.eliminarUsuario(id); // Cambio aquí
        cargarUsuarios();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  const handleCambiarEstado = async (id, activo) => {
    try {
      await usuariosService.cambiarEstado(id, activo); // Cambio aquí
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          onClick={() => setMostrarFormulario(true)}
        >
          Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre:
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña:
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!usuarioEditando}
                    placeholder={usuarioEditando ? "Dejar vacío para no cambiar" : ""}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol:
                  </label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="profesor">Profesor</option>
                    <option value="coordinador">Coordinador</option>
                  </select>
                </div>

                {formData.rol === 'profesor' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Materias:
                    </label>
                    {formData.materias.map((materia, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={materia}
                          onChange={(e) => handleMateriaChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Materia ${index + 1}`}
                        />
                        {formData.materias.length > 1 && (
                          <button
                            type="button"
                            onClick={() => eliminarMateria(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={agregarMateria}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Agregar otra materia
                    </button>
                  </div>
                )}

                <div className="flex gap-2 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
                  >
                    {usuarioEditando ? 'Actualizar' : 'Registrar'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-600">Cargando usuarios...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map(usuario => (
                <tr key={usuario._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{usuario.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      usuario.rol === 'coordinador' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {usuario.materias && usuario.materias.length > 0 
                        ? usuario.materias.join(', ')
                        : '-'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      usuario.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditar(usuario)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </button>
                    {usuario.activo ? (
                      <button
                        onClick={() => handleCambiarEstado(usuario._id, false)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCambiarEstado(usuario._id, true)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Activar
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminar(usuario._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Usuarios;