import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

type SubscriptionLevel = 'GRATIS' | 'BASICO' | 'PREMIUM';

interface SubscriptionContextType {
  subscriptionLevel: SubscriptionLevel | null;
  loading: boolean;
  refreshSubscriptionLevel: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptionLevel: null,
  loading: true,
  refreshSubscriptionLevel: () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  
  const [subscriptionLevel, setSubscriptionLevel] = useState<SubscriptionLevel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { user, userToken } = useAuth();

  const isCamionero = user?.roles?.includes('CAMIONERO');

  const fetchSubscriptionLevel = async (empresaId: number) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/suscripciones/nivel/${empresaId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setSubscriptionLevel(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener el nivel de suscripción:', error);
      setSubscriptionLevel('GRATIS'); // Default si hay error
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscriptionLevel = async () => {
    if (!user?.id || user.rol === 'CAMIONERO') {
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/empresas/${user.id}`);
      const empresaId = response.data.id;
      await fetchSubscriptionLevel(empresaId);
    } catch (err) {
      console.error('Error al refrescar suscripción:', err);
      setSubscriptionLevel('GRATIS');
    }
  };

  useEffect(() => {
    const fetchEmpresaAndSubscription = async () => {
      if (!user?.id) {
        setSubscriptionLevel('GRATIS');
        setLoading(false);
        return;
      }

      try {
        if (isCamionero) {
          setSubscriptionLevel('GRATIS');
          setLoading(false);
          return;
        }

        // If user has userId field
        if (user?.userId) {
          const response = await axios.get(`${BACKEND_URL}/empresas/${user.id}`);
          const empresaId = response.data.id;
          await fetchSubscriptionLevel(empresaId);
        } else {
          setSubscriptionLevel('GRATIS');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error al obtener datos de la empresa o suscripción:', err);
        setSubscriptionLevel('GRATIS'); // Default si hay error
        setLoading(false);
      }
    };

    fetchEmpresaAndSubscription();
  }, [user?.id]);

  return (
    <SubscriptionContext.Provider value={{ subscriptionLevel, loading, refreshSubscriptionLevel }}>
      {children}
    </SubscriptionContext.Provider>
  );
};