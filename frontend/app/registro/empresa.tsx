import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Modal } from "react-native";
import globalStyles from "../../assets/styles/globalStyles";
import colors from "../../assets/styles/colors";
import { FontAwesome5, MaterialIcons, Entypo } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import defaultProfileImage from "../../assets/images/companyDefaultAvatar.png";
import { useAuth } from "../../contexts/AuthContext";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import SuccessModal from "../_components/SuccessModal";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const EmpresaScreen = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const [successModalVisible, setSuccessModalVisible] = useState(false);

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

    // Empresa
    web: "",
    nif: "",
  });

  const handleInputChange = (field: string, value: string | boolean | any[]) => {
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
    // Validación de número de teléfono
    if (!/^\d{9}$/.test(formData.telefono)) {
      setErrorMessage("El número de teléfono debe tener 9 dígitos.");
      return;
    }

    // Validación y corrección de la URL
    if (formData.web && !formData.web.startsWith('http://') && !formData.web.startsWith('https://')) {
      if (!/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(formData.web)) {
        setErrorMessage('La URL de la web no es válida');
        return;
      }
      formData.web = 'https://' + formData.web; // Añadir https:// si no tiene esquema
    }

    // Datos del usuario
    const userData = {
      nombre: formData.nombre,
      telefono: formData.telefono,
      username: formData.username,
      email: formData.email,
      localizacion: formData.localizacion,
      descripcion: formData.descripcion,
      foto: formData.foto ? formData.foto : "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/57T3goAAAAASUVORK5CYII=",
      password: formData.password,

      web: formData.web,
      nif: formData.nif
    };

    try {
      const response = await axios.post(`${BACKEND_URL}/auth/signup/empresa`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        console.log('Empresa registrada correctamente', response.data.message);
        setErrorMessage("")

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
  const renderInput = (label, field, icon, keyboardType = "default", secureTextEntry = false, multiline = false) => (
    <View style={{ width: '90%', marginBottom: 15 }}>
      <Text style={{ fontSize: 16, color: colors.secondary, marginLeft: 8, marginBottom: -6, backgroundColor: colors.white, alignSelf: 'flex-start', paddingHorizontal: 5, zIndex: 1 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.mediumGray, borderRadius: 8, paddingHorizontal: 10, backgroundColor: colors.white }}>
        {icon}
        <TextInput
          style={{ flex: 1, height: multiline ? 80 : 40, paddingLeft: 8, outline: "none", textAlignVertical: multiline ? 'top' : 'center' }}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          onChangeText={(value) => handleInputChange(field, value)}
        />
      </View>
    </View>
  );

  // Password input render
  const renderPasswordInput = () => (
    <View style={{ width: "90%", marginBottom: 15 }}>
      <Text style={{ fontSize: 16, color: colors.secondary, marginLeft: 8, marginBottom: -6, backgroundColor: colors.white, alignSelf: "flex-start", paddingHorizontal: 5, zIndex: 1 }}>Contraseña</Text>
      <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.mediumGray, borderRadius: 8, paddingHorizontal: 10, backgroundColor: colors.white }}>
        <Entypo name="lock" size={20} color={colors.primary} />
        <TextInput
          style={{ flex: 1, height: 40, paddingLeft: 8, outline: "none", textAlignVertical: "center" }}
          secureTextEntry={!passwordVisible}
          value={formData.password || ''}
          onChangeText={(value) => handleInputChange("password", value)}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Entypo name={passwordVisible ? "eye-with-line" : "eye"} size={18} color={colors.mediumGray} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.cardContainer}>

          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/registro')}>
            <Ionicons name="arrow-back" size={30} color="#0b4f6c" />
          </TouchableOpacity>

          <Text style={styles.title}>Registro como Empresa</Text>

          {/* Foto de perfil */}
          <View style={{ alignItems: "center", marginBottom: 20, marginTop: 10 }}>
            <Image
              source={formData.fotoUri ? { uri: formData.fotoUri } : defaultProfileImage}
              style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 8, borderWidth: 1, borderColor: colors.mediumGray }}
            />

            {!formData.foto ? (
              <TouchableOpacity onPress={handlePickImage} style={[globalStyles.button, { backgroundColor: colors.secondary, flexDirection: "row", alignItems: "center", justifyContent: "center", width: 140, paddingHorizontal: 15 }]}>
                <MaterialIcons name="add-a-photo" size={20} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={globalStyles.buttonText}>Añadir Foto</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={handlePickImage} style={[globalStyles.button, { backgroundColor: colors.green, marginRight: 7, flexDirection: "row", alignItems: "center", justifyContent: "center", width: 120, paddingHorizontal: 15 }]}>
                  <MaterialIcons name="cached" size={20} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={globalStyles.buttonText}>Cambiar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setFormData({ ...formData, fotoUri: null })} style={[globalStyles.button, { backgroundColor: colors.red, flexDirection: "row", alignItems: "center", justifyContent: "center", width: 120, paddingHorizontal: 15 }]}>
                  <FontAwesome5 name="trash" size={18} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={globalStyles.buttonText}>Borrar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Campos del formulario */}
          {renderInput("Nombre de Empresa", "nombre", <FontAwesome5 name="user" size={20} color={colors.primary} />)}
          {renderInput("Nombre de Usuario", "username", <FontAwesome5 name="user-alt" size={20} color={colors.primary} />)}
          {renderInput("Email", "email", <MaterialIcons name="email" size={20} color={colors.primary} />, "email-address")}
          {renderPasswordInput()}
          {renderInput("Teléfono", "telefono", <MaterialIcons name="phone" size={20} color={colors.primary} />, "phone-pad")}
          {renderInput("Localización", "localizacion", <MaterialIcons name="location-pin" size={20} color={colors.primary} />)}
          {renderInput("Descripción", "descripcion", <FontAwesome5 name="align-left" size={20} color={colors.primary} />, "default", false, true)}

          {/* Campos del formulario específicos de la empresa */}
          {renderInput("Página web", "web", <FontAwesome5 name="globe" size={20} color={colors.primary} />, "url")}
          {renderInput("Número de Identificación (A12345678)", "nif", <FontAwesome5 name="id-card" size={20} color={colors.primary} />, "default")}

          {errorMessage ? (
            <Text style={{ color: "red", fontSize: 18, marginBottom: 10, justifyContent: "center", textAlign: "center" }}>
              {errorMessage}
            </Text>
          ) : null}

          {/* Botón de registro */}
          <TouchableOpacity style={[globalStyles.button, { width: "100%", borderRadius: 12, elevation: 5 }]}
            onPress={handleRegister}
          >
            <Text style={[globalStyles.buttonText, { fontSize: 25 }]}>Registrarse</Text>
          </TouchableOpacity>

          {/* Modal de éxito */}
          <SuccessModal
            isVisible={successModalVisible}
            onClose={() => setSuccessModalVisible(false)}
            message="¡Registro exitoso!"
          />

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
    paddingTop: 80,
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
    fontSize: 28,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    width: "90%",
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.secondary,
    marginLeft: 8,
    marginBottom: -6,
    backgroundColor: colors.white,
    paddingHorizontal: 5,
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  inputField: {
    flex: 1,
    height: 40,
    paddingLeft: 8,
    outline: "none",
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: colors.green,
    padding: 20,
    borderRadius: 10,
    width: 250,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
});

export default EmpresaScreen;
