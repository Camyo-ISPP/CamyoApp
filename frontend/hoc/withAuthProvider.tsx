import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';

const withAuthProvider = (Component) => (props) => {
  return (
    <AuthProvider>
      <Component {...props} />
    </AuthProvider>
  );
};

export default withAuthProvider;