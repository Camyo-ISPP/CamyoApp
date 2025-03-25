import axios from 'axios';

export const fetchUserData = async (userRole, userId) => {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    try {
        if (userRole === "ADMIN") {
            return await axios.get(`${BACKEND_URL}/usuarios/${userId}`);
        } else if (userRole === "EMPRESA") {
            return await axios.get(`${BACKEND_URL}/empresas/por_usuario/${userId}`);
        } else if (userRole === "CAMIONERO") {
            return await axios.get(`${BACKEND_URL}/camioneros/por_usuario/${userId}`);
        } else {
            throw new Error("Rol de usuario no reconocido");
        }
    } catch (error) {
        throw new Error(`Error al obtener los datos: ${error.message}`);
    }
};
