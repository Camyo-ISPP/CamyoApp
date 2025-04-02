import React, { useContext, useEffect, useState } from 'react';

interface PaymentContextType {
    id: string | null;
    setId: (id: string) => void;
  }

const PaymentContext = React.createContext<PaymentContextType>({id: null, setId: () => {}});

interface PaymentProviderProps {
  children: React.ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    
  }, [id]);

  return (
    <PaymentContext.Provider value={{ id, setId }}>
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => useContext(PaymentContext);
