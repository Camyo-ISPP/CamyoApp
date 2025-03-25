import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Modal } from "react-native";
import globalStyles from "../../../assets/styles/globalStyles";
import colors from "../../../assets/styles/colors";
import BooleanSelector from "../../_components/BooleanSelector";
import Selector from "../../_components/Selector";
import MultiSelector from "../../_components/MultiSelector";
import { FontAwesome5, MaterialIcons, Entypo } from "@expo/vector-icons";
import axios from 'axios';
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import SuccessModal from "../../_components/SuccessModal";
import defaultProfileImage from "../../../assets/images/defaultAvatar.png";

const licencias = ["AM", "A1", "A2", "A", "B", "C1", "C", "C1+E", "C+E", "D1", "D+E", "D1+E", "D"];
const licencias_backend = ["AM", "A1", "A2", "A", "B", "C1", "C", "C1_E", "C_E", "D1", "D_E", "D1_E", "D"];

const CamioneroRegisterScreen = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

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

    // Camionero
    dni: "",
    licencias: [],
    disponibilidad: "",
    experiencia: null,
    tieneCAP: false,
    expiracionCAP: "",
    isAutonomo: false,
    tarjetas: []
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
    const licenciasBackend = formData.licencias.map((licencia) => licencias_backend[licencias.indexOf(licencia)]);

    // Validación de nombre y apellidos
    if (!formData.nombre){
      setErrorMessage("El campo nombre y apellidos es obligatorio.");
      return;
    }
    if (formData.nombre.length > 100){
      setErrorMessage("El campo nombre y apellidos es demasiado largo.");
      return; 
    }

    // Validación de nombre de usuario
    if (!formData.username){
      setErrorMessage("El campo nombre de usuario es obligatorio.");
      return;
    }
    if (formData.username.length > 30){
      setErrorMessage("El campo nombre de usuario es demasiado largo.");
      return;
    }

    // Validación de correo electrónico
    if (!formData.email){
      setErrorMessage("El campo correo electrónico es obligatorio.");
      return;
    }
    if (formData.email.length > 255){
      setErrorMessage("El campo correo electrónico es demasiado largo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage("El formato del correo electrónico no es válido.");
      return;
    }

    // Validación de contraseña
    if (!formData.password){
      setErrorMessage("El campo contraseña es obligatorio.");
      return;
    }

    // Validación de número de teléfono
    if (!formData.telefono){
      setErrorMessage("El campo teléfono es obligatorio.");
      return;
    }
    if (!/^\d{9}$/.test(formData.telefono)) {
      setErrorMessage("El número de teléfono debe tener 9 dígitos.");
      return;
    }

    // Validación de la localización
    if (!formData.localizacion){
      setErrorMessage("El campo localización es obligatorio.");
      return;
    }
    if (formData.localizacion.length > 200){
      setErrorMessage("El campo localización es demasiado largo.");
      return;
    }

    // Validación de la descripción
    if (formData.descripcion && formData.descripcion.length > 500){
      setErrorMessage("El campo descripción es demasiado largo.");
      return;
    }

    // Validación del DNI
    if (!formData.dni){
      setErrorMessage("El campo DNI es obligatorio.");
      return;
    }
    if (!/^\d{8}[A-Z]$/.test(formData.dni)) {
      setErrorMessage("El formato del DNI no es válido.");
      return;
    }

    // Validación de licencias
    if (formData.licencias.length === 0){
      setErrorMessage("Debe elegir al menos una licencia.");
      return;
    }

    // Validación de disponibilidad
    if (!formData.disponibilidad){
      setErrorMessage("El campo disponibilidad es obligatorio.");
      return;
    }

    // Validación de experiencia
    if (!formData.experiencia){
      setErrorMessage("El campo años de experiencia es obligatorio.");
      return;
    }
    if (isNaN(formData.experiencia)) {
      setErrorMessage("El campo años de experiencia debe ser un número.");
      return;
    }
    if (formData.experiencia < 0) {
      setErrorMessage("El campo años de experiencia debe ser 0 o mayor.");
      return;
    }

    // Validación de fecha de expiración del CAP
    if (formData.tieneCAP){
      if(!formData.expiracionCAP){
        setErrorMessage("El campo fecha de expiración del CAP es obligatorio.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.expiracionCAP)) {
        setErrorMessage("El formato de la fecha de expiración del CAP no es válido.");
        return;
      }
    }

    // Validación de tarjetas de autónomo
    if (formData.isAutonomo){
      if(formData.tarjetas.length === 0){
        setErrorMessage("Debe elegir al menos una tarjeta.");
        return;
      }
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

      dni: formData.dni,
      licencias: licenciasBackend,
      disponibilidad: formData.disponibilidad,
      experiencia: parseInt(formData.experiencia),
      tieneCAP: formData.tieneCAP,
      expiracionCAP: formData.tieneCAP? formData.expiracionCAP.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'): null,
      tarjetasAutonomo: formData.isAutonomo? formData.tarjetas: []
    };

    try {
      const response = await axios.post(`${BACKEND_URL}/auth/signup/camionero`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setErrorMessage("")
      } else {
        console.error('Error al registrar el camionero/a', response);
      }

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
          placeholder={placeholder}
          placeholderTextColor="gray"
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

          <Text style={styles.title}>Registro como Camionero</Text>

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

                <TouchableOpacity onPress={() => setFormData({ ...formData, fotoUri: null, foto: null })} style={[globalStyles.button, { backgroundColor: colors.red, flexDirection: "row", alignItems: "center", justifyContent: "center", width: 120, paddingHorizontal: 15 }]}>
                  <FontAwesome5 name="trash" size={18} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={globalStyles.buttonText}>Borrar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Campos del formulario */}
          {renderInput("Nombre y apellidos", "nombre", <FontAwesome5 name="user" size={20} color={colors.primary} />)}
          {renderInput("Nombre de usuario", "username", <FontAwesome5 name="user-alt" size={20} color={colors.primary} />)}
          {renderInput("Correo electrónico", "email", <MaterialIcons name="email" size={20} color={colors.primary} />, "email-address", false, false, "usuario@ejemplo.com")}
          {renderPasswordInput()}
          {renderInput("Teléfono", "telefono", <MaterialIcons name="phone" size={20} color={colors.primary} />, "phone-pad", false, false, "987654321")}
          {renderInput("Localización", "localizacion", <MaterialIcons name="location-pin" size={20} color={colors.primary} />)}
          {renderInput("Descripción", "descripcion", <FontAwesome5 name="align-left" size={20} color={colors.primary} />, "default", false, true)}

          {/* Campos del formulario específicos de camionero */}
          {renderInput("DNI", "dni", <FontAwesome5 name="address-card" size={20} color={colors.primary} />, "default", false, false, "12345678A")}
          <View style={styles.inputContainer}>
            <Text style={{ color: colors.secondary, fontSize: 16, marginRight: 10, flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              Selecciona tus licencias:
            </Text>
            <MultiSelector
              value={formData.licencias}
              onChange={(value) => handleInputChange("licencias", value)}
              options={licencias}
              colors={colors}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={{ color: colors.secondary, fontSize: 16, marginRight: 10, flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              Disponibilidad:
            </Text>
            <Selector
              value={formData.disponibilidad}
              onChange={(value) => handleInputChange("disponibilidad", value)}
              options={["NACIONAL", "INTERNACIONAL"]}
              colors={colors}
              globalStyles={globalStyles}
            />
          </View>

          {renderInput("Años de experiencia", "experiencia", <FontAwesome5 name="briefcase" size={20} color={colors.primary} />, "numeric")}

          {/* ¿Tiene CAP? */}
          <View style={styles.inputContainer}>
            <Text style={{ color: colors.secondary, fontSize: 16, marginRight: 10, flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              ¿Tiene CAP (Certificado de Aptitud Profesional)?:
            </Text>
            <BooleanSelector
              value={formData.tieneCAP}
              onChange={(value) => handleInputChange("tieneCAP", value)}
              colors={colors}
              globalStyles={globalStyles}
            />
          </View>

          {/* Mostrar campo de tarjetas solo si tiene CAP */}
          {formData.tieneCAP && (
            <>
              {/* Expiración del CAP */}
              {renderInput("Fecha de expiración del CAP", "expiracionCAP", <FontAwesome5 name="calendar" size={20} color={colors.primary} />, "default", false, false, "dd-mm-aaaa")}
            </>
          )}

          {/* Es autónomo/a? */}
          <View style={styles.inputContainer}>
            <Text style={{ color: colors.secondary, fontSize: 16, marginRight: 10, flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              ¿Eres autónomo/a?:
            </Text>
            <BooleanSelector
              value={formData.isAutonomo}
              onChange={(value) => handleInputChange("isAutonomo", value)}
              colors={colors}
              globalStyles={globalStyles}
            />
          </View>

          {/* Mostrar campo de tarjetas solo si es autónomo */}
          {formData.isAutonomo && (
            <View style={styles.inputContainer}>
              <Text style={{ color: colors.secondary, fontSize: 16, marginRight: 10, flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                Selecciona tus tarjetas:
              </Text>
              <MultiSelector
                value={formData.tarjetas}
                onChange={(value) => handleInputChange("tarjetas", value)}
                options={["VTC", "VC", "MSL", "MDP"]}
                colors={colors}
              />
            </View>
          )}

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
    backgroundColor: colors.white,
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
    borderWidth: 1,
    borderColor: colors.lightGray,
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

export default CamioneroRegisterScreen;
