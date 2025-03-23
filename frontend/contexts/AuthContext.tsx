import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { unifyUserData } from "../utils/unifyData"

interface AuthContextType {
  user: any | null;
  userToken: string | null;
  login: (userData: any, token: string) => void;
  logout: () => void;
  validateToken: (token: string) => Promise<boolean>;
  getUserData: (userRole: string, userId: number) => void;
  updateUser: (updatedUserData: any) => void;
  isAuthenticated: () => Promise<boolean>; // Nueva función
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userToken: null,
  login: () => {},
  logout: () => {},
  validateToken: async () => false,
  getUserData: () => {},
  updateUser: () => {},
  isAuthenticated: async () => false, // Valor por defecto
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  
  const [user, setUser] = useState<any | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("userToken");
  
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setUserToken(storedToken);
  
          const rol = parsedUser.roles[0] === "EMPRESA" ? "empresas" :
            parsedUser.roles[0] === "ADMIN" ? "admin" : "camioneros";
          getUserData(rol, parsedUser.id);
        }
      } catch (error) {
        console.error("Error cargando la autentificación:", error);
      }
    };
  
    loadAuthData();
  }, []);

  const login = async (userData: any, token: string) => {
    setUser(userData);
    setUserToken(token);
    
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    await AsyncStorage.setItem("userToken", token);

    const rol = userData.roles[0] === "EMPRESA" ? "empresas" : 
            userData.roles[0] === "ADMIN" ? "admin" : 
            "camioneros";

    getUserData(rol, userData.id);
  };

  const logout = async () => {
    setUser(null);
    setUserToken(null);

    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("userToken");

    router.replace("/login");
  };

  const validateToken = async (token: string) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;  // true or false
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  };

  const updateUser = (updatedUserData: any) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedUserData }));
    AsyncStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  const getUserData = async (userRole: string, userId: number) => {
    try {
      const response = await axios.get(
        userRole === "admin" 
            ? `${BACKEND_URL}/usuarios/${userId}` 
            : `${BACKEND_URL}/${userRole}/por_usuario/${userId}`
      );

      const unifiedUser = userRole === "admin" 
          ? { ...response.data, rol: response.data.authority.authority } 
          : unifyUserData(response.data);
      
      setUser(unifiedUser);
      await AsyncStorage.setItem("user", JSON.stringify(unifiedUser));

    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const isAuthenticated = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      return false;
    }
    return await validateToken(token);
  };

  return (
    <AuthContext.Provider value={{ user, userToken, login, logout, validateToken, getUserData, updateUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);