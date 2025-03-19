import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

type SubscriptionLevel = 'GRATIS' | 'BASIC' | 'PREMIUM';

// Definir el tipo para el valor del contexto
interface SubscriptionContextType {
  subscriptionLevel: SubscriptionLevel | null;
  loading: boolean;
}

// Crear el contexto con valores iniciales
const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptionLevel: null,
  loading: true,
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscriptionLevel, setSubscriptionLevel] = useState<SubscriptionLevel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuth();
  // Función para cargar el nivel de suscripción del backend
  const fetchSubscriptionLevel = async (empresaId: number) => {
    try {
      const response = await axios.get<SubscriptionLevel>(`/suscripciones/nivel/${empresaId}`);
      setSubscriptionLevel(response.data);
    } catch (error) {
      console.error('Error al obtener el nivel de suscripción:', error);
      setSubscriptionLevel('GRATIS'); // Default si hay error
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar la suscripción al iniciar
  useEffect(() => {
    const fetchEmpresaAndSubscription = async () => {
      if (!user?.id) {
        console.error('Usuario no autenticado');
        setLoading(false);
        return;
      }
      try {
        const empresaId = user.userId;
        await fetchSubscriptionLevel(empresaId);
      } catch (err) {
        console.error('Error al obtener datos de la empresa o suscripción:', err);
        setSubscriptionLevel('GRATIS'); // Default si hay error
        setLoading(false);
      }
    };

    fetchEmpresaAndSubscription();
  }, [user?.id]);

  return (
    <SubscriptionContext.Provider value={{ subscriptionLevel, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
};