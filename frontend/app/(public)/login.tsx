import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, ImageBackground } from "react-native";
import { Entypo, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import colors from "../../assets/styles/colors";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import SuccessModal from "../_components/SuccessModal";
import withNavigationGuard from "@/hoc/withNavigationGuard";

const LoginScreen = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);


  const handleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (!username.trim()) {
        setErrorMessage("Por favor escribe tu nombre de usuario.");
        return;
      } else if (!password.trim()) {
        setErrorMessage("Por favor escribe tu contraseña.");
        return;
      }

      const response = await axios.post(`${BACKEND_URL}/auth/signin`, {
        username,
        password,
      });

      const { token } = response.data;
      login(response.data, token);

      const rol = response.data.roles[0];
      setSuccessModalVisible(true);

      setTimeout(() => {
        setSuccessModalVisible(false);
        router.replace(rol === "ADMIN" ? "/workinprogress" : "/");
      }, 1000);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'Credenciales incorrectas. Por favor, inténtalo de nuevo.');
      } else {
        setErrorMessage('Ocurrió un error inesperado. Por favor, inténtalo más tarde.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/auth-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={"height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name="user-circle" size={32} color={colors.secondary} />
              </View>
              <Text style={styles.title}>Iniciar Sesión</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre de Usuario</Text>
              <View style={[styles.inputWrapper, isUsernameFocused && styles.inputWrapperFocused]}>
                <MaterialIcons name="person" size={20} color={colors.mediumGray} />
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Escribe tu usuario"
                  placeholderTextColor={colors.mediumGray}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setIsUsernameFocused(true)}
                  onBlur={() => setIsUsernameFocused(false)}
                  accessibilityLabel="Campo para escribir nombre de usuario"
                  selectionColor={colors.primary} // Color del cursor
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={[styles.inputWrapper, isPasswordFocused && styles.inputWrapperFocused]}>
                <Entypo name="lock" size={20} color={colors.mediumGray} />
                <TextInput
                  style={styles.input}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Escribe tu contraseña"
                  placeholderTextColor={colors.mediumGray}
                  onSubmitEditing={handleLogin}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  accessibilityLabel="Campo para escribir contraseña"
                  selectionColor={colors.primary} // Color del cursor
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  accessibilityLabel={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <Entypo
                    name={passwordVisible ? "eye-with-line" : "eye"}
                    size={18}
                    color={colors.mediumGray}
                  />
                </TouchableOpacity>
              </View>
            </View>


            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.loginButton,
                isSubmitting && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={isSubmitting}
              accessibilityLabel="Botón para iniciar sesión"
            >
              <Text style={styles.loginButtonText}>
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Text>
            </TouchableOpacity>

            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>o</Text>
              <View style={styles.separatorLine} />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.replace("/registro")}
              accessibilityLabel="Botón para ir al registro"
            >
              <Text style={styles.registerButtonText}>Crear nueva cuenta</Text>
            </TouchableOpacity>
          </View>

          <SuccessModal
            isVisible={successModalVisible}
            onClose={() => setSuccessModalVisible(false)}
            message="¡Inicio de sesión exitoso!"
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 30,
    paddingVertical: 24,
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
    marginBottom: 24,
  },
  iconCircle: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.secondary,
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
    marginBottom: 6,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 6,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    height: 48,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingLeft: 10,
    color: colors.darkGray,
    fontSize: 16,
    outlineStyle: 'none',
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 6,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
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
  registerButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  registerButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 15,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },  
});

export default withNavigationGuard(LoginScreen);