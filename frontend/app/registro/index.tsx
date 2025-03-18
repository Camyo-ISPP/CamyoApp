import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import colors from "../../assets/styles/colors";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import globalStyles from "../../assets/styles/globalStyles";

const IndexScreen = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.cardContainer}>
          <Text style={globalStyles.title}>Registro</Text>
          <Text style={styles.title}>¿Qué tipo de usuario eres?</Text>

          <View style={styles.buttonContainer}>
            {/* Botón Camionero */}
            <TouchableOpacity
              style={[styles.userTypeButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/registro/camionero")}
            >
              <FontAwesome5 name="truck" size={24} color={colors.white} style={styles.icon} />
              <Text style={styles.userTypeText}>Camionero</Text>
            </TouchableOpacity>

            {/* Botón Empresa */}
            <TouchableOpacity
              style={[styles.userTypeButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/registro/empresa")}
            >
              <MaterialIcons name="business" size={24} color={colors.white} style={styles.icon} />
              <Text style={styles.userTypeText}>Empresa</Text>
            </TouchableOpacity>

            
          </View>

          <View style={globalStyles.separatorContainer}>
          <View style={globalStyles.separator} />
          <Text style={globalStyles.separatorText}>¿Ya tienes cuenta?</Text>
          <View style={globalStyles.separator} />
        </View>
        
        <TouchableOpacity style={globalStyles.buttonBlue} onPress={() => router.push("/login")}>
          <Text style={globalStyles.buttonTextRegister}>Iniciar Sesión</Text>
        </TouchableOpacity>


        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    paddingVertical: 20,
  },
  container: {
    width: "100%",
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  cardContainer: {
    backgroundColor: colors.white,
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 30,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 600,
  },
  userTypeButton: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  userTypeText: {
    fontSize: 16,
    color: colors.white,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  
  separator: {
    height: 1,
    backgroundColor: colors.mediumGray,
    flex: 1,
  },
  
  separatorText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: colors.secondary,
  },
  
  buttonTextRegister: {
    fontSize: 18,
    color: colors.white,
    textAlign: "center",
    paddingVertical: 10,
  },
  
});

export default IndexScreen;
