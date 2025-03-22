import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, useWindowDimensions } from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import globalStyles from "../../assets/styles/globalStyles";
import colors from "../../assets/styles/colors";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import SuccessModal from "../_components/SuccessModal";

const EditarPerfilEmpresa = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user, userToken, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    localizacion: "",
    descripcion: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchCompanyData = async () => {

      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        telefono: user.telefono || "",
        localizacion: user.localizacion || "",
        descripcion: user.descripcion || "",
      });
    };

    fetchCompanyData();
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prevState) => ({ ...prevState, [field]: value }));
  };

  const handleSaveChanges = async (updatedFormData) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{9}$/;

    if (!updatedFormData.nombre.trim()) {
      setErrorMessage("El nombre no puede estar vacío.");
      return;
    }
  
    if (!updatedFormData.localizacion.trim()) {
      setErrorMessage("La localización no puede estar vacía.");
      return;
    }
  
    if (!emailRegex.test(updatedFormData.email)) {
      setErrorMessage("El correo electrónico no es válido.");
      return;
    }
  
    if (!phoneRegex.test(updatedFormData.telefono)) {
      setErrorMessage("El teléfono debe contener exactamente 9 números.");
      return;
    }

    try {
      const empresaData = {
        userId: user.userId,
        nombre: updatedFormData.nombre || "",
        email: updatedFormData.email || "",
        telefono: updatedFormData.telefono || "000000000",
        username: user.username,
        localizacion: updatedFormData.localizacion || "",
        descripcion: updatedFormData.descripcion || "",
        authority: user.authority || { id: 202, authority: "EMPRESA" },
      };

      const headers = {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      };

      const companyResponse = await axios.put(`${BACKEND_URL}/usuarios/${user.userId}`, empresaData, { headers });

      if (companyResponse.status === 200) {
        setErrorMessage("")
        updateUser(empresaData);
        
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          router.replace("/miperfil");
        }, 1000);
      }
    } catch (error) {
      setErrorMessage("Los datos introducidos no son correctos. Por favor, compruébalos e inténtalo de nuevo.");
      if (error.response) {
        console.error("Error en la respuesta del servidor:", JSON.stringify(error.response.data, null, 2));
        alert(`Error: ${error.response.data.message || "Error desconocido"}`);
      } else if (error.request) {
        console.error("No se recibió respuesta del servidor:", error.request);
        alert("No se recibió respuesta del servidor.");
      } else {
        console.error("Error al realizar la solicitud:", error.message);
        alert("Hubo un problema con la solicitud.");
      }
    }
  };

  const renderInput = (label, field, icon, keyboardType = "default", multiline = false) => (
    <View style={{ width: "90%", marginBottom: 15 }}>
      <Text style={{ fontSize: 12, color: colors.secondary, marginLeft: 8, marginBottom: -6, backgroundColor: colors.white, alignSelf: "flex-start", paddingHorizontal: 5, zIndex: 1 }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.mediumGray, borderRadius: 8, paddingHorizontal: 10, backgroundColor: colors.white }}>
        {icon}
        <TextInput
          style={{ flex: 1, height: multiline ? 80 : 40, paddingLeft: 8, outline: "none", textAlignVertical: multiline ? "top" : "center" }}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          onChangeText={(value) => handleInputChange(field, value)}
          value={formData[field]}
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={[globalStyles.container, { paddingTop: 100 }]}>
      <View style={globalStyles.formContainerHalf}>
        <Text style={globalStyles.title}>Editar Perfil de Empresa</Text>

        {renderInput("Nombre", "nombre", <FontAwesome5 name="building" size={20} color={colors.primary} />)}
        {renderInput("Email", "email", <MaterialIcons name="email" size={20} color={colors.primary} />, "email-address")}
        {renderInput("Teléfono", "telefono", <MaterialIcons name="phone" size={20} color={colors.primary} />, "phone-pad")}
        {renderInput("Localización", "localizacion", <MaterialIcons name="location-pin" size={20} color={colors.primary} />)}
        {renderInput("Descripción", "descripcion", <FontAwesome5 name="align-left" size={20} color={colors.primary} />, "default", true)}

        {errorMessage ? (
            <Text style={{ color: "red", fontSize: 18, marginBottom: 10, justifyContent: "center", textAlign: "center" }}>
              {errorMessage}
            </Text>
          ) : null}

        <TouchableOpacity style={[globalStyles.button, { width: "100%", borderRadius: 12, elevation: 5 }]} onPress={() => handleSaveChanges(formData)}>
          <Text style={[globalStyles.buttonText, { fontSize: 30 }]}>Guardar Cambios</Text>
        </TouchableOpacity>

        {/* Modal de éxito */}
        <SuccessModal
          isVisible={successModalVisible}
          onClose={() => setSuccessModalVisible(false)}
          message="¡Tu perfil se actualizó correctamente!"
        />
      </View>
    </ScrollView>
  );
};

export default EditarPerfilEmpresa;