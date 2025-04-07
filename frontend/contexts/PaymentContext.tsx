import React, { useContext, useEffect, useState } from 'react';

interface PaymentContextType {
    id: string | null;
    setId: (id: string) => void;
    ofertaId: number | null;
    setOfertaId: (ofertaId: number) => void;
  }

const PaymentContext = React.createContext<PaymentContextType>({id: null, setId: () => {}, ofertaId: null, setOfertaId: () => {}});

interface PaymentProviderProps {
  children: React.ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [id, setId] = useState<string | null>(null);
  const [ofertaId, setOfertaId] = useState<number | null>(null);

  useEffect(() => {
    
  }, [id, ofertaId]);

  return (
    <PaymentContext.Provider value={{ id, setId, ofertaId, setOfertaId }}>
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => useContext(PaymentContext);
