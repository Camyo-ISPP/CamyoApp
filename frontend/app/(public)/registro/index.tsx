import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import colors from "../../../assets/styles/colors";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import globalStyles from "../../../assets/styles/globalStyles";

const IndexScreen = () => {
  const router = useRouter();

  // Estado para manejar el hover
  const [hoveredButton, setHoveredButton] = useState(null);

  // Funciones para manejar el hover
  const handleMouseEnter = (button) => {
    setHoveredButton(button);
  };

  const handleMouseLeave = () => {
    setHoveredButton(null);
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/auth-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="user-plus" size={32} color={colors.secondary} />
            </View>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Selecciona tu tipo de usuario</Text>
          </View>

          <View style={styles.buttonsGrid}>
            {/* Botón Camionero */}
            <TouchableOpacity
              style={[
                styles.userButton,
                hoveredButton === "camionero" && styles.userButtonHovered
              ]}
              onPress={() => router.push("/registro/camionero")}
              activeOpacity={0.8}
              onMouseEnter={() => handleMouseEnter("camionero")}
              onMouseLeave={handleMouseLeave}
            >
              <View style={[styles.iconCircleSmall, { backgroundColor: colors.primaryLight }]}>
                <FontAwesome5 name="truck" size={24} color={colors.primary} />
              </View>
              <Text style={styles.userButtonText}>Camionero</Text>
            </TouchableOpacity>

            {/* Botón Empresa */}
            <TouchableOpacity
              style={[
                styles.userButton,
                hoveredButton === "empresa" && styles.userButtonHovered
              ]}
              onPress={() => router.push("/registro/empresa")}
              activeOpacity={0.8}
              onMouseEnter={() => handleMouseEnter("empresa")}
              onMouseLeave={handleMouseLeave}
            >
              <View style={[styles.iconCircleSmall, { backgroundColor: colors.secondaryLight }]}>
                <MaterialIcons name="business" size={24} color={colors.secondary} />
              </View>
              <Text style={styles.userButtonText}>Empresa</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>¿Ya tienes cuenta?</Text>
            <View style={styles.separatorLine} />
          </View>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push("/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    minHeight: '100%',
  },
  formContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconCircle: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.secondary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: '500',
    textAlign: "center",
  },
  buttonsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  userButton: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.lightGray,
    transition: "transform 0.3s ease-in-out", // Transición más suave
  },
  userButtonHovered: {
    transform: [{ scale: 1.05 }] // Efecto más suave al ampliar
  },
  userButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.darkGray,
    marginTop: 10,
    textAlign: "center",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  separatorText: {
    color: colors.mediumGray,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default IndexScreen;
