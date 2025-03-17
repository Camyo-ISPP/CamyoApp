import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../assets/styles/colors";
import globalStyles from "../../assets/styles/globalStyles";

const AccessDeniedScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MaterialIcons name="lock" size={80} color={colors.red} style={styles.icon} />
      <Text style={styles.title}>Acceso Denegado</Text>
      <Text style={styles.subtitle}>
        No tienes permisos para acceder a esta página.
      </Text>
      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => router.replace("/")}
      >
        <Text style={globalStyles.buttonText}>Volver al Inicio</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.secondary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.red,
    textAlign: "center",
    marginBottom: 20,
  },
});

export default AccessDeniedScreen;
