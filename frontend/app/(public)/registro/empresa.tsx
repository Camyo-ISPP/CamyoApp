import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Modal, ImageBackground, Linking } from "react-native";
import colors from "../../../assets/styles/colors";
import { FontAwesome5, MaterialIcons, Entypo, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import defaultProfileImage from "../../../assets/images/image.png";
import { useAuth } from "../../../contexts/AuthContext";
import * as ImagePicker from 'expo-image-picker';
import SuccessModal from "../../_components/SuccessModal";

const EmpresaRegisterScreen = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const router = useRouter();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    password: "",
    telefono: "",
    localizacion: "",
    descripcion: "",
    foto: null,
    fotoUri: null,
    web: "",
    nif: "",
    aceptaTerminos: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prevState) => ({ ...prevState, [field]: value }));
  };

  const handlePickImage = async () => {
    const base64Image = await pickImageAsync();
    if (base64Image) {
      setFormData((prevState) => ({
        ...prevState,
        foto: base64Image.base64,
        fotoUri: base64Image.uri
      }));
    }
  };

  const pickImageAsync = async (): Promise<{ uri: string; base64: string } | null> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        return { uri: image.uri, base64: image.base64 };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      return null;
    }
  };

  const handleRegister = async () => {
    // Validación de nombre de empresa
    formData.nombre = formData.nombre.trim();

    if (!formData.nombre) {
      setErrorMessage("El campo nombre de empresa es obligatorio.");
      return;
    }

    if (formData.nombre.length > 100) {
      setErrorMessage("El campo nombre de empresa es demasiado largo.");
      return;
    }

    // Validación de nombre de usuario
    if (!formData.username) {
      setErrorMessage("El campo nombre de usuario es obligatorio.");
      return;
    }
    if (formData.username.length > 30) {
      setErrorMessage("El campo nombre de usuario es demasiado largo.");
      return;
    }

    // Validación de correo electrónico
    if (!formData.email) {
      setErrorMessage("El campo correo electrónico es obligatorio.");
      return;
    }
    if (formData.email.length > 255) {
      setErrorMessage("El campo correo electrónico es demasiado largo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage("El formato del correo electrónico no es válido.");
      return;
    }

    // Validación de contraseña
    if (!formData.password) {
      setErrorMessage("El campo contraseña es obligatorio.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (formData.password.length > 255) {
      setErrorMessage("La contraseña no puede tener más de 255 caracteres.");
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      setErrorMessage("La contraseña debe contener al menos una letra minúscula.");
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setErrorMessage("La contraseña debe contener al menos una letra mayúscula.");
      return;
    }

    if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setErrorMessage("La contraseña debe contener al menos un número o un carácter especial.");
      return;
    }

    if (formData.password.toLowerCase().includes(formData.username.toLowerCase()) || formData.password.toLowerCase().includes(formData.nombre.toLowerCase())) {
      setErrorMessage("La contraseña no puede contener el nombre de usuario ni el correo electrónico.");
      return;
    }

    // Validación de número de teléfono
    if (!formData.telefono) {
      setErrorMessage("El campo teléfono es obligatorio.");
      return;
    }
    if (!/^\d{9}$/.test(formData.telefono)) {
      setErrorMessage("El número de teléfono debe tener 9 dígitos numéricos.");
      return;
    }

    // Validación de la localización
    if (!formData.localizacion) {
      setErrorMessage("El campo localización es obligatorio.");
      return;
    }
    if (formData.localizacion.length > 200) {
      setErrorMessage("El campo localización es demasiado largo.");
      return;
    }
    
    if (formData.localizacion.length < 2) {
      setErrorMessage("El campo localización es demasiado pequeño.");
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s-]+$/.test(formData.nombre)) {
      setErrorMessage("La localizacion solo puede contener letras, espacios y guiones.");
      return;
    }

    // Validación de la descripción
    if (formData.descripcion && formData.descripcion.length > 500) {
      setErrorMessage("El campo descripción es demasiado largo.");
      return;
    }

    // Validación y corrección de la URL
    if (!formData.web) {
      setErrorMessage("El campo página web es obligatorio.");
      return;
    }
    let correctedWeb = formData.web;
    if (!formData.web.startsWith('http://') && !formData.web.startsWith('https://')) {
      if (!/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(formData.web)) {
        setErrorMessage('El formato de la URL de la página web no es válido.');
        return;
      }
      correctedWeb = 'https://' + formData.web;
    }

    // Validación del NIF
    if (!formData.nif) {
      setErrorMessage("El campo número de identificación es obligatorio.");
      return;
    }
    if (!/^[A-Z]\d{8}$/.test(formData.nif)) {
      setErrorMessage("El formato del número de identificación no es válido.");
      return;
    }

    // Validación de aceptación de términos
    if (!formData.aceptaTerminos) {
      setErrorMessage("Debes aceptar los términos y condiciones para registrarte.");
      return;
    }

    // Datos del usuario
    const userData = {
      nombre: formData.nombre,
      telefono: formData.telefono,
      username: formData.username,
      email: formData.email,
      localizacion: formData.localizacion,
      descripcion: formData.descripcion,
      foto: formData.foto ? formData.foto : null,
      password: formData.password,
      web: correctedWeb,
      nif: formData.nif
    };

    try {
      const response = await axios.post(`${BACKEND_URL}/auth/signup/empresa`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setErrorMessage("");

        const responseLogin = await axios.post(`${BACKEND_URL}/auth/signin`, {
          username: userData.username,
          password: userData.password,
        });

        const { token } = responseLogin.data;
        login(responseLogin.data, token);

        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          router.replace("/");
        }, 1000);
      }
    } catch (error) {
      console.error('Error en la solicitud', error);
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
        if (error.response.data.message.includes("ya está")) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Los datos introducidos no son correctos. Por favor, compruébalos e inténtalo de nuevo.");
        }
      } else {
        setErrorMessage('Error desconocido');
      }
    }
  };

  // Render input function
  const renderInput = (label, field, icon, keyboardType = "default", secureTextEntry = false, multiline = false, placeholder = "") => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        formData[field] ? styles.inputWrapperFocused : null
      ]}>
        {icon}
        <TextInput
          style={[styles.inputField, { outlineWidth: 0 }]}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor={colors.mediumGray}
          value={formData[field] || ''}
        />
      </View>
    </View>
  );

  // Password input render
  const renderPasswordInput = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Contraseña</Text>
      <View style={[
        styles.inputWrapper,
        formData.password ? styles.inputWrapperFocused : null
      ]}>
        <Entypo name="lock" size={20} color={colors.primary} />
        <TextInput
          style={[styles.inputField, { outlineWidth: 0 }]}
          secureTextEntry={!passwordVisible}
          value={formData.password || ''}
          onChangeText={(value) => handleInputChange("password", value)}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Entypo
            name={passwordVisible ? "eye-with-line" : "eye"}
            size={18}
            color={colors.mediumGray}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const navigateToTerms = () => {
    Linking.openURL(process.env.EXPO_PUBLIC_FRONTEND_URL + '/terminos');
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/auth-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/registro')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.secondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="building" size={32} color={colors.secondary} />
            </View>
            <Text style={styles.title}>Registro de Empresa</Text>
          </View>

          {/* Foto de perfil */}
          <View style={styles.avatarContainer}>
            <Image
              source={formData.fotoUri ? { uri: formData.fotoUri } : defaultProfileImage}
              style={styles.avatarImage}
            />
            <View style={styles.avatarButtons}>
              {!formData.foto ? (
                <TouchableOpacity
                  onPress={handlePickImage}
                  style={[styles.avatarButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="add-a-photo" size={20} color={colors.white} />
                  <Text style={styles.avatarButtonText}>Añadir Foto</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={handlePickImage}
                    style={[styles.avatarButton, { backgroundColor: colors.green }]}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="cached" size={20} color={colors.white} />
                    <Text style={styles.avatarButtonText}>Cambiar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, fotoUri: null, foto: null })}
                    style={[styles.avatarButton, { backgroundColor: colors.red }]}
                    activeOpacity={0.8}
                  >
                    <FontAwesome5 name="trash" size={18} color={colors.white} />
                    <Text style={styles.avatarButtonText}>Borrar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Campos del formulario */}
          {renderInput("Nombre de empresa", "nombre", <FontAwesome5 name="building" size={20} color={colors.primary} />)}
          {renderInput("Nombre de usuario", "username", <FontAwesome5 name="user-alt" size={20} color={colors.primary} />)}
          {renderInput("Correo electrónico", "email", <MaterialIcons name="email" size={20} color={colors.primary} />, "email-address", false, false, "usuario@ejemplo.com")}
          {renderPasswordInput()}
          {renderInput("Teléfono", "telefono", <MaterialIcons name="phone" size={20} color={colors.primary} />, "phone-pad", false, false, "987654321")}
          {renderInput("Localización", "localizacion", <MaterialIcons name="location-pin" size={20} color={colors.primary} />)}
          {renderInput("Descripción", "descripcion", <FontAwesome5 name="align-left" size={20} color={colors.primary} />, "default", false, true)}

          {/* Campos específicos de empresa */}
          {renderInput("Página web", "web", <FontAwesome5 name="globe" size={20} color={colors.primary} />, "url", false, false, "ejemplo.com")}
          {renderInput("Número de identificación", "nif", <FontAwesome5 name="id-card" size={20} color={colors.primary} />, "default", false, false, "A12345678")}

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.termsContainer}>
            <TouchableOpacity
              onPress={() => handleInputChange("aceptaTerminos", !formData.aceptaTerminos)}
              style={[
                styles.checkbox,
                { backgroundColor: formData.aceptaTerminos ? colors.primary : colors.white }
              ]}
              activeOpacity={0.8}
            >
              {formData.aceptaTerminos && (
                <FontAwesome5 name="check" size={14} color="white" />
              )}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text
                style={styles.termsLink}
                onPress={navigateToTerms}
              >
                Términos y Condiciones
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>

          <SuccessModal
            isVisible={successModalVisible}
            onClose={() => setSuccessModalVisible(false)}
            message="¡Registro exitoso!"
          />
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
    marginTop: 50,
  },
  formContainer: {
    width: "90%",
    maxWidth: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginVertical: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.lightGray,
    marginBottom: 12,
  },
  avatarButtons: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  avatarButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 6,
    marginBottom: 8,
  },
  avatarButtonText: {
    color: colors.white,
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 8,
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
  inputWrapperFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  inputField: {
    flex: 1,
    height: "100%",
    paddingLeft: 10,
    color: colors.darkGray,
    fontSize: 16,
  },
  sectionContainer: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: colors.darkGray,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  registerButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  legalModal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  legalModalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 12,
    marginTop: 8,
  },
  modalText: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalCloseButton: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmpresaRegisterScreen;