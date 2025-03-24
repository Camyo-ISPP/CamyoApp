import React, { useContext, useState } from 'react';

interface PaymentContextType {
    id: string | null;
  }

const PaymentContext = React.createContext<PaymentContextType>({id: null});

interface PaymentProviderProps {
  children: React.ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  
  const [id, setId] = useState<string | null>(null);

  const change = (newId: string) => { setId(newId) };

  return (
    <PaymentContext.Provider value={{ id }}>
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => useContext(PaymentContext);
