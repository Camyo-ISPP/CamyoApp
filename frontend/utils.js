
// Función que unifica los datos de usuario recibidos del backend
const unifyUserData = (data) => {
    if (!data || !data.usuario || !data.usuario.authority) {
      throw new Error("Datos de usuario inválidos");
    }
    
    const unifiedData = {
      id: data.id, // El ID corresponde al del rol (camioneroId o empresaId)
      rol: data.usuario.authority.authority, // Rol del usuario (CAMIONERO o EMPRESA)
      userId: data.usuario.id,
      nombre: data.usuario.nombre,
      telefono: data.usuario.telefono,
      username: data.usuario.username,
      email: data.usuario.email,
      localizacion: data.usuario.localizacion,
      descripcion: data.usuario.descripcion,
      foto: data.usuario.foto,
    };
  
    // Si el usuario es un CAMIONERO
    if (unifiedData.rol === "CAMIONERO") {
      Object.assign(unifiedData, {
        experiencia: data.experiencia,
        dni: data.dni,
        licencias: data.licencias,
        disponibilidad: data.disponibilidad,
        tieneCAP: data.tieneCAP,
        expiracionCAP: data.expiracionCAP,
        isAutonomo: Array.isArray(data.tarjetasAutonomo) && data.tarjetasAutonomo.length > 0,
        isAutonomo: data.tarjetasAutonomo && Array.isArray(data.tarjetasAutonomo) && data.tarjetasAutonomo.length > 0,
        tarjetas: data.tarjetasAutonomo || [],
      });
    } 
    
    // Si el usuario es una EMPRESA
    else if (unifiedData.rol === "EMPRESA") {
      Object.assign(unifiedData, {
        nif: data.nif,
        web: data.web,
      });
    }
  
    return unifiedData;
  };
  
  module.exports = { unifyUserData };