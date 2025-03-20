import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Componente que muestra un botón de flecha hacia atrás
// SOLO USAR CUANDO NO HAY UNA IMAGEN / COMPONENTE QUE PUEDA SOLAPAR

const BackButtonAbsolute = ({ color = "#0b4f6c", size = 30 }) => {
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
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 10,
        padding: 8,
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        borderRadius: 50,
    },
});


export default BackButtonAbsolute;
