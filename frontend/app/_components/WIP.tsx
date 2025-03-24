import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WIP: React.FC = () => {

    return (
            <View style={styles.container}>
                <Text style={styles.title}>Trabajo en progreso...</Text>
            </View>
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
});

export default WIP;