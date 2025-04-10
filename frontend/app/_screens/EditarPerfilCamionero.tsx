import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Modal, ImageBackground } from "react-native";
import colors from "../../assets/styles/colors";
import { FontAwesome5, MaterialIcons, Entypo, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from "../../contexts/AuthContext";
import SuccessModal from "../_components/SuccessModal";
import defaultProfileImage from "../../assets/images/defaultAvatar.png";
import BooleanSelector from "../_components/BooleanSelector";
import MultiSelector from "../_components/MultiSelector";
import globalStyles from "@/assets/styles/globalStyles";

const licencias = ["AM", "A1", "A2", "A", "B", "C1", "C", "C1+E", "C+E", "D1", "D+E", "D1+E", "D"];
const licencias_backend = ["AM", "A1", "A2", "A", "B", "C1", "C", "C1_E", "C_E", "D1", "D_E", "D1_E", "D"];

const EditarPerfilCamionero = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const { user, userToken, updateUser } = useAuth();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    localizacion: "",
    descripcion: "",
    foto: null,
    fotoUri: null,
    licencias: [],
    experiencia: null,
    dni: "",
    tieneCAP: false,
    expiracionCAP: "",
    isAutonomo: false,
    tarjetas: [],
    curriculum: null
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        telefono: user.telefono || "",
        localizacion: user.localizacion || "",
        descripcion: user.descripcion || "",
        foto: user.foto || null,
        fotoUri: user.foto ? `data:image/png;base64,${user.foto}` : null,
        licencias: user.licencias.map((licencia) => licencias[licencias_backend.indexOf(licencia)]),
        disponibilidad: "NACIONAL",
        experiencia: user.experiencia,
        dni: user.dni,
        tieneCAP: user.tieneCAP,
        expiracionCAP: user.expiracionCAP ? user.expiracionCAP.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3-$2-$1') : null,
        isAutonomo: user.isAutonomo,
        tarjetas: user.tarjetas,
        curriculum: user.curriculum || null
      });
    }
  }, [user]);

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

  const pickPdfAsync = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!result.canceled && result.assets[0].uri.split(',')[0] === "data:application/pdf;base64") {
        const base64PDF = result.assets[0].uri.split(',')[1];
        if (base64PDF) {
          setFormData((prevState) => ({
            ...prevState,
            curriculum: base64PDF
          }));
        }
      }
    } catch (error) {
      console.error('Error picking the document', error);
    }
  };

  const handleUpdate = async () => {
    const licenciasBackend = formData.licencias.map((licencia) => licencias_backend[licencias.indexOf(licencia)]);

    // Validación de nombre y apellidos
    if (!formData.nombre) {
      setErrorMessage("El campo nombre y apellidos es obligatorio.");
      return;
    }
    if (formData.nombre.length > 100) {
      setErrorMessage("El campo nombre y apellidos es demasiado largo.");
      return;
    }
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s-]+$/.test(formData.nombre)) {
      setErrorMessage("El nombre y apellidos solo pueden contener letras, espacios y guiones.");
      return;
    }

    if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,}/.test(formData.nombre)) {
      setErrorMessage("El nombre y apellidos deben contener al menos dos letras.");
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(formData.nombre)) {
      setErrorMessage("El nombre y apellidos deben comenzar con una letra.");
      return;
    }

    formData.nombre = formData.nombre
      .split(/\s+/)
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(" ");

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

    // Validación de número de teléfono
    if (!formData.telefono) {
      setErrorMessage("El campo teléfono es obligatorio.");
      return;
    }
    if (!/^\d{9}$/.test(formData.telefono)) {
      setErrorMessage("El número de teléfono debe tener 9 dígitos.");
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

    // Validación del DNI
    if (!formData.dni) {
      setErrorMessage("El campo DNI es obligatorio.");
      return;
    }
    if (!/^\d{8}[A-Z]$/.test(formData.dni)) {
      setErrorMessage("El formato del DNI no es válido, está compuesto por 8 números y una letra.");
      return;
    }

    const dniLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
    const dniNumber = parseInt(formData.dni.slice(0, 8), 10);
    const dniLetter = formData.dni.slice(8);

    if (dniLetters[dniNumber % 23] !== dniLetter) {
      setErrorMessage("El DNI no es válido. La letra no coincide");
      return;
    }

    // Validación de licencias
    if (formData.licencias.length === 0) {
      setErrorMessage("Debe elegir al menos una licencia.");
      return;
    }

    // Validación de experiencia
    if (!formData.experiencia) {
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

    if (formData.experiencia > 100) {
      setErrorMessage("¿Has nacido trabajando? El campo años de experiencia debe ser menor que 100.");
      return;
    }

    // Validación de fecha de expiración del CAP
    if (formData.tieneCAP) {
      if (!formData.expiracionCAP) {
        setErrorMessage("El campo fecha de expiración del CAP es obligatorio.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.expiracionCAP)) {
        setErrorMessage("El formato de la fecha de expiración del CAP no es válido. Comprueba que sea dd-mm-YYYY");
        return;
      }

      const [day, month, year] = formData.expiracionCAP.split("-").map(num => parseInt(num, 10));
      const currentYear = new Date().getFullYear();

      if (month < 1 || month > 12) {
        setErrorMessage("El mes de la fecha de expiración del CAP no es válido.");
        return;
      }

      const maxDays = new Date(year, month, 0).getDate();
      if (day < 1 || day > maxDays) {
        setErrorMessage("El día de la fecha de expiración del CAP no es válido.");
        return;
      }

      if (year < currentYear) {
        setErrorMessage("El año de la fecha de expiración del CAP no puede estar en el pasado.");
        return;
      }

      if (year > currentYear + 6) {
        setErrorMessage("El año de la fecha de expiración del CAP no puede ser más de 5 años en el futuro.");
        return;
      }
    }

    // Validación de tarjetas de autónomo
    if (formData.isAutonomo) {
      if (formData.tarjetas.length === 0) {
        setErrorMessage("Debe elegir al menos una tarjeta.");
        return;
      }
    }

    // Datos del usuario
    const userData = {
      nombre: formData.nombre,
      telefono: formData.telefono,
      email: formData.email,
      localizacion: formData.localizacion,
      descripcion: formData.descripcion,
      foto: formData.foto ? formData.foto : null,
      curriculum: formData.curriculum ? formData.curriculum : null,
      dni: formData.dni,
      licencias: licenciasBackend,
      disponibilidad: "NACIONAL",
      experiencia: parseInt(formData.experiencia),
      tieneCAP: formData.tieneCAP,
      expiracionCAP: formData.tieneCAP ? formData.expiracionCAP.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1') : null,
      tarjetasAutonomo: formData.isAutonomo ? formData.tarjetas : []
    };

    try {
      const response = await axios.put(`${BACKEND_URL}/auth/edit/camionero`, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
      });

      if (response.status === 200) {
        setErrorMessage("");

        const usuarioData = {
          descripcion: userData.descripcion,
          disponibilidad: "NACIONAL",
          dni: userData.dni,
          email: userData.email,
          experiencia: userData.experiencia,
          expiracionCAP: userData.expiracionCAP,
          foto: userData.foto,
          id: user.id,
          isAutonomo: formData.isAutonomo,
          licencias: userData.licencias,
          localizacion: userData.localizacion,
          nombre: userData.nombre,
          rol: user.rol,
          tarjetas: userData.tarjetasAutonomo,
          telefono: userData.telefono,
          tieneCAP: userData.tieneCAP,
          userId: user.userId,
          username: user.username,
          curriculum: userData.curriculum
        };
        updateUser(usuarioData);
        
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          router.replace("/miperfil");
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

  return (
    <ImageBackground
      source={require('../../assets/images/auth-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/miperfil')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.secondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="truck" size={32} color={colors.secondary} />
            </View>
            <Text style={styles.title}>Editar Perfil de Camionero</Text>
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
          {renderInput("Nombre y apellidos", "nombre", <FontAwesome5 name="user" size={20} color={colors.primary} />)}
          {renderInput("Correo electrónico", "email", <MaterialIcons name="email" size={20} color={colors.primary} />, "email-address", false, false, "usuario@ejemplo.com")}
          {renderInput("Teléfono", "telefono", <MaterialIcons name="phone" size={20} color={colors.primary} />, "phone-pad", false, false, "987654321")}
          {renderInput("Localización", "localizacion", <MaterialIcons name="location-pin" size={20} color={colors.primary} />)}
          {renderInput("Descripción", "descripcion", <FontAwesome5 name="align-left" size={20} color={colors.primary} />, "default", false, true)}

          {/* Campos específicos de camionero */}
          {renderInput("DNI", "dni", <FontAwesome5 name="address-card" size={20} color={colors.primary} />, "default", false, false, "12345678A")}

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Selecciona tu(s) licencia(s) de conducción:</Text>
            <MultiSelector
              value={formData.licencias}
              onChange={(value) => handleInputChange("licencias", value)}
              options={licencias}
              colors={colors}
            />
          </View>

          {renderInput("Años de experiencia", "experiencia", <FontAwesome5 name="briefcase" size={20} color={colors.primary} />, "numeric")}

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>¿Tienes CAP? (Certificado de Aptitud Profesional)</Text>
            <BooleanSelector
              value={formData.tieneCAP}
              onChange={(value) => handleInputChange("tieneCAP", value)}
              colors={colors}
              globalStyles={globalStyles}
            />
            {formData.tieneCAP && (
              <View style={{ marginTop: 10 }}>
                {renderInput("Fecha de expiración CAP", "expiracionCAP", <FontAwesome5 name="calendar" size={20} color={colors.primary} />, "default", false, false, "dd-mm-aaaa")}
              </View>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>¿Eres autónomo/a?</Text>
            <BooleanSelector
              value={formData.isAutonomo}
              onChange={(value) => handleInputChange("isAutonomo", value)}
              colors={colors}
              globalStyles={globalStyles}
            />
            {formData.isAutonomo && (
              <>
                <Text style={styles.sectionSubtitle}>Selecciona tus tarjetas de autónomo:</Text>
                <MultiSelector
                  value={formData.tarjetas}
                  onChange={(value) => handleInputChange("tarjetas", value)}
                  options={["VTC", "VC", "MSL", "MDP"]}
                  colors={colors}
                />
              </>
            )}
          </View>

          <View style={styles.avatarButtons}>
            {!formData.curriculum ? (
              <TouchableOpacity
                onPress={pickPdfAsync}
                style={[styles.avatarButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <MaterialIcons name="upload-file" size={20} color={colors.white} />
                <Text style={styles.avatarButtonText}>Subir CV (PDF)</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, curriculum: null })}
                style={[styles.avatarButton, { backgroundColor: colors.red }]}
                activeOpacity={0.8}
              >
                <FontAwesome5 name="trash" size={18} color={colors.white} />
                <Text style={styles.avatarButtonText}>Borrar CV</Text>
              </TouchableOpacity>
            )}
          </View>

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>

          <SuccessModal
            isVisible={successModalVisible}
            onClose={() => setSuccessModalVisible(false)}
            message="¡Cambios guardados!"
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
    marginBottom: 6,
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
});

export default EditarPerfilCamionero;