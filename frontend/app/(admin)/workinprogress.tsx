import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import AdminRoute from '../../security/AdminRoute';

const WorkInProgressScreen: React.FC = () => {
    const { logout } = useAuth();

    return (
        <AdminRoute>
            <View style={styles.container}>
                <Text style={styles.title}>Work In Progress...</Text>
                <TouchableOpacity style={styles.button} onPress={() => logout()}>
                    <Text style={styles.buttonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </AdminRoute>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#ff6347',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default WorkInProgressScreen;