import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface TituloProps {
  texto: string;    // Propiedad que recibirá el texto para mostrar
  marginTop?: number;  // Propiedad opcional para el margen superior
}

const Titulo: React.FC<TituloProps> = ({ texto, marginTop = 100 }) => {
  return <Text style={[styles.title, { marginTop }]}>{texto}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default Titulo;
