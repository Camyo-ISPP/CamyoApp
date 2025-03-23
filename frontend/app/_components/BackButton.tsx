import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Componente que muestra un botón de flecha hacia atrás
// USAR CUANDO HAY UNA IMAGEN / COMPONENT Y EVITAR QUE SE SOLAPEN

const BackButton = ({ color = "#0b4f6c", size = 30 }) => {
    const router = useRouter();

    const handlePress = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    };

    return (
        <TouchableOpacity style={[styles.backIcon]} onPress={handlePress}>
            <Ionicons name="arrow-back" size={size} color={color} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    backIcon: {
        padding: 2,
    },
});

export default BackButton;
