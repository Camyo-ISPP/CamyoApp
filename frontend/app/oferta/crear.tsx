import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator
} from "react-native";
import axios from "axios";
import { FontAwesome5 } from "@expo/vector-icons";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import SuccessModal from "../_components/SuccessModal";
import EmpresaRoute from "../../security/EmpresaRoute";
import withNavigationGuard from "@/hoc/withNavigationGuard";
import BackButtonAbsolute from "../_components/BackButtonAbsolute";
import { useSubscriptionRules } from '../../utils/useSubscriptionRules';
import DatePicker from "@/app/_components/DatePicker";

const CrearOfertaScreen = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  
  const { user, userToken } = useAuth();
  const [tipoOferta, setTipoOferta] = useState("TRABAJO");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const { rules, loading } = useSubscriptionRules();
  const [formData, setFormData] = useState({
    titulo: "",
    experiencia: null,
    licencia: "",
    notas: "",
    estado: "BORRADOR",
    sueldo: null,
    localizacion: "",
    fechaPublicacion: new Date().toISOString(), // Fecha actual del sistema
    empresa: { id: user?.id ?? null },
    // Trabajo
    fechaIncorporacion: "",
    jornada: "",
    // Carga
    mercancia: "",
    peso: null,
    origen: "",
    destino: "",
    distancia: null,
    inicio: "",
    finMinimo: "",
    finMaximo: "",
  });

  useEffect(() => {
    if (!user || !user.rol) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user || !user.rol) {
    return null;
  }

  // Cuando `user` cambie, actualizar `empresa.id`
  useEffect(() => {
    if (user?.id) {
      setFormData((prevState) => ({
        ...prevState,
        empresa: { id: user.id },
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    // Si el campo es "licencia", reemplazamos "+" por "_"
    if (field === "licencia") {
      formattedValue = value.replace(/\+/g, "_");
    }

    setFormData((prevState) => ({ ...prevState, [field]: formattedValue }));
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const convertirFecha = (fecha) => {
    const [dia, mes, anio] = fecha.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
  };

  const handlePublish = async () => {
    // Validación de título
    if (!formData.titulo){
      setErrorMessage("El campo título es obligatorio.");
      return;
    }
    if (formData.titulo.length > 255){
      setErrorMessage("El campo titulo es demasiado largo.");
      return;
    }

    // Validación de experiencia
    if (rules.fullFormFields){
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
    }

    // Validación de licencia
    if (!formData.licencia){
      setErrorMessage("El campo licencia es obligatorio.");
      return;
    }

    // Validación de la descripción
    if (!formData.notas){
      setErrorMessage("El campo descripción es obligatorio.");
      return;
    }
    if (formData.notas.length > 500){
      setErrorMessage("El campo descripción es demasiado largo.");
      return;
    }

    // Validación de sueldo
    if (!formData.sueldo){
      setErrorMessage("El campo sueldo es obligatorio.");
      return;
    }
    if (isNaN(formData.sueldo)) {
      setErrorMessage("El campo sueldo debe ser un número.");
      return;
    }
    if (formData.sueldo <= 0) {
      setErrorMessage("El campo sueldo debe ser mayor a 0.0.");
      return;
    }

    // Validación de localización
    if (!formData.localizacion){
      setErrorMessage("El campo localización es obligatorio.");
      return;
    }
    if (formData.localizacion.length > 255){
      setErrorMessage("El campo localización es demasiado largo.");
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if(tipoOferta === "TRABAJO"){
      // Validación fecha de incorporación
      if(!formData.fechaIncorporacion){
        setErrorMessage("El campo fecha de incorporación es obligatorio.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.fechaIncorporacion)) {
        setErrorMessage("El formato de la fecha de incorporación no es válido.");
        return;
      }
      const fechaI = convertirFecha(formData.fechaIncorporacion);
      if(fechaI < hoy){
        setErrorMessage("La fecha de incorporación no puede ser anterior a hoy.");
        return;
      }

      // Validación de jornada
      if (!formData.jornada){
        setErrorMessage("El campo jornada es obligatorio.");
        return;
      }
    }
    if(tipoOferta === "CARGA"){
      // Validación de mercancía
      if (!formData.mercancia){
        setErrorMessage("El campo mercancía es obligatorio.");
        return;
      }
      if (formData.mercancia.length > 255){
        setErrorMessage("El campo mercancía es demasiado largo.");
        return;
      }

      // Validación de peso
      if (!formData.peso){
        setErrorMessage("El campo peso es obligatorio.");
        return;
      }
      if (isNaN(formData.peso)) {
        setErrorMessage("El campo peso debe ser un número.");
        return;
      }
      if (formData.peso <= 0) {
        setErrorMessage("El campo peso debe ser mayor a 0.0.");
        return;
      }
    
      // Validación de origen
      if (!formData.origen){
        setErrorMessage("El campo origen es obligatorio.");
        return;
      }
      if (formData.origen.length > 255){
        setErrorMessage("El campo origen es demasiado largo.");
        return;
      }

      // Validación de destino
      if (!formData.destino){
        setErrorMessage("El campo destino es obligatorio.");
        return;
      }
      if (formData.destino.length > 255){
        setErrorMessage("El campo destino es demasiado largo.");
        return;
      }

      // Validación de distancia
      if (!formData.distancia){
        setErrorMessage("El distancia es obligatorio.");
        return;
      }
      if (isNaN(formData.distancia)) {
        setErrorMessage("El campo distancia debe ser un número.");
        return;
      }
      if (formData.distancia <= 0) {
        setErrorMessage("El campo distancia debe ser mayor a 0.");
        return;
      }

      // Validación inicio
      if(!formData.inicio){
        setErrorMessage("El campo inicio es obligatorio.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.inicio)) {
        setErrorMessage("El formato de la fecha de inicio no es válido.");
        return;
      }
      const fechaI = convertirFecha(formData.inicio);
      if(fechaI < hoy){
        setErrorMessage("La fecha de inicio no puede ser anterior a hoy.");
        return;
      }
      // Validación fin mínimo
      if(!formData.finMinimo){
        setErrorMessage("El campo fin mínino es obligatorio.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.finMinimo)) {
        setErrorMessage("El formato de la fecha de fin mínimo no es válido.");
        return;
      }
      // Validación fin máximo
      if(!formData.finMaximo){
        setErrorMessage("El campo fin máximo es obligatorio.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.finMaximo)) {
        setErrorMessage("El formato de la fecha de fin máximo no es válido.");
        return;
      }
      const fechaFMin = convertirFecha(formData.finMinimo);
      const fechaFMax = convertirFecha(formData.finMaximo);
      if (fechaI > fechaFMin) {
        setErrorMessage("La fecha de inicio no puede ser posterior a la fecha de fin mínimo.");
        return;
      }
      if (fechaFMin > fechaFMax) {
        setErrorMessage("La fecha de fin mínimo no puede ser posterior a la fecha de fin máximo.");
        return;
      }

    }


    // Construcción del objeto base de la oferta
    let ofertaData: any = {
      oferta: {
        titulo: formData.titulo,
        experiencia: rules.fullFormFields ? Number(formData.experiencia): 0, // Convertir a número
        licencia: Array.isArray(formData.licencia) ? formData.licencia[0] : formData.licencia, // Convertir a string
        notas: formData.notas,
        estado: "ABIERTA",
        sueldo: parseFloat(formData.sueldo).toFixed(2), // Convertir a float con 2 decimal
        localizacion: formData.localizacion,
        fechaPublicacion: formatDate(new Date()), // Fecha en formato correcto sin Z y sin decimales
        empresa: { id: user?.id ?? null },
        tipoOferta: tipoOferta
      }
    };

    // Agregar detalles según el tipo de oferta
    if (tipoOferta === "TRABAJO") {
      ofertaData = {
        ...ofertaData,
        trabajo: {
          fechaIncorporacion: formData.fechaIncorporacion.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'),
          jornada: formData.jornada
        }
      };
    } else if (tipoOferta === "CARGA") {
      ofertaData = {
        ...ofertaData,
        carga: {
          mercancia: formData.mercancia,
          peso: Number(formData.peso), // Convertir a número
          origen: formData.origen,
          destino: formData.destino,
          distancia: Number(formData.distancia), // Convertir a número
          inicio: formData.inicio.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'),
          finMinimo: formData.finMinimo.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'),
          finMaximo: formData.finMaximo.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1')
        }
      };
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/ofertas`, ofertaData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.status === 201) {
        setErrorMessage("")

        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          router.replace("/miperfil");
        }, 1000);
      }

    } catch (error) {
      console.error('Error en la solicitud', error);
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      }
    }

  };

  const handleDraft = async () => {
    // Validación de título
    if (!formData.titulo){
      setErrorMessage("El campo título es obligatorio para guardar un borrador.");
      return;
    }
    if (formData.titulo.length > 255){
      setErrorMessage("El campo titulo es demasiado largo.");
      return;
    }

    // Validación de experiencia OPCIONAL
    if (rules.fullFormFields){
      if (formData.experiencia){
        if (isNaN(formData.experiencia)) {
          setErrorMessage("El campo años de experiencia debe ser un número.");
          return;
        }
        if (formData.experiencia < 0) {
          setErrorMessage("El campo años de experiencia debe ser 0 o mayor.");
          return;
        }
      }
    }

    //Sin validación para licencia
    // Validación de la descripción
    if (!formData.notas){
      setErrorMessage("El campo descripción es obligatorio para guardar un borrador.");
      return;
    }
    if (formData.notas.length > 500){
      setErrorMessage("El campo descripción es demasiado largo.");
      return;
    }

    
    // Validación de sueldo OPCIONAL
    if (formData.sueldo){
      if (isNaN(formData.sueldo)) {
        setErrorMessage("El campo sueldo debe ser un número.");
        return;
      }
      if (formData.sueldo <= 0) {
        setErrorMessage("El campo sueldo debe ser mayor a 0.0.");
        return;
      }
    }


    // Validación de localización
    if (!formData.localizacion){
      setErrorMessage("El campo localización es obligatorio para guardar un borrador.");
      return;
    }
    if (formData.localizacion.length > 255){
      setErrorMessage("El campo localización es demasiado largo.");
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if(tipoOferta === "TRABAJO"){
      // Validación fecha de incorporación
      if(!formData.fechaIncorporacion){
        setErrorMessage("El campo fecha de incorporación es obligatorio para guardar el borrador.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.fechaIncorporacion)) {
        setErrorMessage("El formato de la fecha de incorporación no es válido.");
        return;
      }
      const fechaI = convertirFecha(formData.fechaIncorporacion);
      if(fechaI < hoy){
        setErrorMessage("La fecha de incorporación no puede ser anterior a hoy.");
        return;
      }

      // Validación de jornada no, OPCIONAL
    }

    if(tipoOferta === "CARGA"){
      // Validación de mercancía
      if (!formData.mercancia){
        setErrorMessage("El campo mercancía es obligatorio para guardar el borrador.");
        return;
      }
      if (formData.mercancia.length > 255){
        setErrorMessage("El campo mercancía es demasiado largo.");
        return;
      }

      // Validación de peso OPCIONAL
      if (formData.peso){
        if (isNaN(formData.peso)) {
          setErrorMessage("El campo peso debe ser un número.");
          return;
        }
        if (formData.peso <= 0) {
          setErrorMessage("El campo peso debe ser mayor a 0.0.");
          return;
        }
      }

    
      // Validación de origen
      if (!formData.origen){
        setErrorMessage("El campo origen es obligatorio para guardar el borrador.");
        return;
      }
      if (formData.origen.length > 255){
        setErrorMessage("El campo origen es demasiado largo.");
        return;
      }

      // Validación de destino
      if (!formData.destino){
        setErrorMessage("El campo destino es obligatorio para guardar el borrador.");
        return;
      }
      if (formData.destino.length > 255){
        setErrorMessage("El campo destino es demasiado largo.");
        return;
      }

      // Validación de distancia
      if (formData.distancia){
        if (isNaN(formData.distancia)) {
          setErrorMessage("El campo distancia debe ser un número.");
          return;
        }
        if (formData.distancia <= 0) {
          setErrorMessage("El campo distancia debe ser mayor a 0.");
          return;
        }
      }

      // Validación inicio
      if(!formData.inicio){
        setErrorMessage("El campo inicio es obligatorio para guardar el borrador.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.inicio)) {
        setErrorMessage("El formato de la fecha de inicio no es válido.");
        return;
      }
      const fechaI = convertirFecha(formData.inicio);
      if(fechaI < hoy){
        setErrorMessage("La fecha de inicio no puede ser anterior a hoy.");
        return;
      }


      // Validación fin mínimo
      if(!formData.finMinimo){
        setErrorMessage("El campo fin mínino es obligatorio para guardar el borrador.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.finMinimo)) {
        setErrorMessage("El formato de la fecha de fin mínimo no es válido.");
        return;
      }


      // Validación fin máximo
      if(!formData.finMaximo){
        setErrorMessage("El campo fin máximo es obligatorio para guardar el borrador.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.finMaximo)) {
        setErrorMessage("El formato de la fecha de fin máximo no es válido.");
        return;
      }
      const fechaFMin = convertirFecha(formData.finMinimo);
      const fechaFMax = convertirFecha(formData.finMaximo);
      if (fechaI > fechaFMin) {
        setErrorMessage("La fecha de inicio no puede ser posterior a la fecha de fin mínimo.");
        return;
      }
      if (fechaFMin > fechaFMax) {
        setErrorMessage("La fecha de fin mínimo no puede ser posterior a la fecha de fin máximo.");
        return;
      }


    // Construcción del objeto base de la oferta
    let ofertaData: any = {
      oferta: {
        titulo: formData.titulo,
        experiencia: rules.fullFormFields ? Number(formData.experiencia): 0, // Convertir a número
        licencia: Array.isArray(formData.licencia) ? formData.licencia[0] : formData.licencia, // Convertir a string
        notas: formData.notas,
        estado: formData.estado || "BORRADOR",
        sueldo: formData.sueldo ? parseFloat(formData.sueldo).toFixed(2) : null, // Convertir a float con 2 decimal
        localizacion: formData.localizacion,
        fechaPublicacion: formatDate(new Date()), // Fecha en formato correcto sin Z y sin decimales
        empresa: { id: user?.id ?? null },
        tipoOferta: tipoOferta
      }
    };

    
    // Agregar detalles según el tipo de oferta
    if (tipoOferta === "TRABAJO") {
      ofertaData = {
        ...ofertaData,
        trabajo: {
          fechaIncorporacion: formData.fechaIncorporacion.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'),
          jornada: formData.jornada
        }
      };
    } else if (tipoOferta === "CARGA") {
      ofertaData = {
        ...ofertaData,
        carga: {
          mercancia: formData.mercancia,
          peso: Number(formData.peso), // Convertir a número
          origen: formData.origen,
          destino: formData.destino,
          distancia: Number(formData.distancia), // Convertir a número
          inicio: formData.inicio.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'),
          finMinimo: formData.finMinimo.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'),
          finMaximo: formData.finMaximo.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1')
        }
      };
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/ofertas`, ofertaData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.status === 201) {
        setErrorMessage("")

        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          router.replace("/miperfil");
        }, 1000);
      }

    } catch (error) {
      console.error('Error en la solicitud', error);
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      }
    }




    console.log("Guardando como borrador...");
  };

  // Función para renderizar cada input del formulario
  const renderInput = (label, field, icon, keyboardType = "default", secureTextEntry = false, multiline = false, placeholder = "", disabled = false) => {
    const iconColor = disabled ? colors.lightGray : colors.primary;
    return (
    <View style={{ width: '90%', marginBottom: 15 }}>
      <Text style={{ fontSize: 16, color: colors.secondary, marginLeft: 8, marginBottom: -6, backgroundColor: colors.white, alignSelf: 'flex-start', paddingHorizontal: 5, zIndex: 1 }}>{label}</Text>
      <View style={[styles.inputContainerStyle, disabled && styles.disabledInputContainer]}>
        {React.cloneElement(icon, { color: iconColor })}
        <TextInput
          style={{ flex: 1, height: multiline ? 80 : 40, paddingLeft: 8, outline: "none", textAlignVertical: multiline ? 'top' : 'center' }}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          placeholder={disabled ? "Solo disponible para clientes BASICO y PREMIUM." : placeholder}
          placeholderTextColor={colors.mediumGray}
          onChangeText={(value) => !disabled && handleInputChange(field, value)}
          editable={!disabled}
          value={formData[field]}
        />
      </View>

      {disabled && (
        <TouchableOpacity onPress={() => router.replace("/suscripcion")}>
          <Text style={styles.upgradeMessage}>
            ¿Quieres más opciones? Mejora tu plan aquí.
          </Text>
        </TouchableOpacity>
      )}
    </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }  

  return (
    <EmpresaRoute>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.cardContainer}>
            <BackButtonAbsolute />
            <Text style={styles.title}>Crear nueva oferta</Text>

            {/* Campos generales */}
            {renderInput("Título", "titulo", <FontAwesome5 name="tag" size={20} color={colors.primary} />)}
            {renderInput(
                "Experiencia (años)",
                "experiencia",
                <FontAwesome5 name="briefcase" size={20} />,
                "numeric",
                false,
                false,
                "",
                !rules.fullFormFields // Bloquear si no tiene acceso completo
              )}
            <View style={styles.inputContainer}>
              <Text style={{ color: colors.secondary, fontSize: 16, marginBottom: 10 }}>
                Licencia:
              </Text>
              <View style={styles.licenciaContainer}>
                {["AM", "A1", "A2", "A", "B", "C1", "C", "C1+E", "C+E", "D1", "D+E", "E", "D"].map((licencia) => {
                  const storedValue = licencia.replace(/\+/g, "_");
                  const isSelected = formData.licencia === storedValue;

                  return (
                    <TouchableOpacity
                      key={licencia}
                      style={[
                        styles.licenciaButton,
                        isSelected && styles.licenciaButtonSelected
                      ]}
                      onPress={() => handleInputChange("licencia", storedValue)}
                    >
                      <Text style={[
                        styles.licenciaText,
                        isSelected && styles.licenciaTextSelected
                      ]}>
                        {licencia} {/* Mostramos el valor con + en la UI */}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {renderInput("Descripción", "notas", <FontAwesome5 name="align-left" size={20} color={colors.primary} />, "default", false, true)}
            {renderInput("Sueldo (€)", "sueldo", <FontAwesome5 name="money-bill-wave" size={20} color={colors.primary} />)}
            {renderInput("Localización", "localizacion", <FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} />)}

            {/* Selector de tipo de oferta */}
            <Text style={styles.title}>¿Qué tipo de oferta quieres publicar?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.userTypeButton, tipoOferta === "TRABAJO" ? styles.selectedButton : styles.unselectedButton]}
                onPress={() => setTipoOferta("TRABAJO")}
              >
                <FontAwesome5 size={24} color={tipoOferta === "TRABAJO" ? colors.white : colors.secondary} />
                <Text style={[styles.userTypeText, tipoOferta === "TRABAJO" ? styles.selectedText : styles.unselectedText]}>
                  TRABAJO
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.userTypeButton, tipoOferta === "CARGA" ? styles.selectedButton : styles.unselectedButton]}
                onPress={() => setTipoOferta("CARGA")}
              >
                <FontAwesome5 size={24} color={tipoOferta === "CARGA" ? colors.white : colors.secondary} />
                <Text style={[styles.userTypeText, tipoOferta === "CARGA" ? styles.selectedText : styles.unselectedText]}>
                  CARGA
                </Text>
              </TouchableOpacity>
            </View>

            {/* Campos dinámicos según el tipo de oferta */}
            {tipoOferta === "TRABAJO" ? (
              <>
                <DatePicker
                  label="Expiración de incorporación"
                  value={formData.fechaIncorporacion}
                  onChange={(date) => handleInputChange("fechaIncorporacion", date)}
                  iconName="calendar-check"
                />

                <View style={styles.inputContainer}>
                  <Text style={{ color: colors.secondary, fontSize: 16, marginBottom: 10 }}>
                    Jornada:
                  </Text>
                  <View style={styles.jornadaContainer}>
                    {["REGULAR", "FLEXIBLE", "COMPLETA", "NOCTURNA", "RELEVOS", "MIXTA"].map((jornada) => (
                      <TouchableOpacity
                        key={jornada}
                        style={[
                          styles.jornadaButton,
                          formData.jornada === jornada && styles.jornadaButtonSelected
                        ]}
                        onPress={() => handleInputChange("jornada", jornada)}
                      >
                        <Text style={[
                          styles.jornadaText,
                          formData.jornada === jornada && styles.jornadaTextSelected
                        ]}>
                          {jornada}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                {renderInput("Mercancía", "mercancia", <FontAwesome5 name="box" size={20} color={colors.primary} />)}
                {renderInput("Peso (kg)", "peso", <FontAwesome5 name="weight" size={20} color={colors.primary} />)}
                {renderInput("Origen", "origen", <FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} />)}
                {renderInput("Destino", "destino", <FontAwesome5 name="map-marker" size={20} color={colors.primary} />)}
                {renderInput("Distancia (km)", "distancia", <FontAwesome5 name="road" size={20} color={colors.primary} />)}
                {/* Inicio */}
                <DatePicker
                  label="Inicio"
                  value={formData.inicio}
                  onChange={(date) => handleInputChange("inicio", date)}
                  iconName="stopwatch"
                />
                {/* Fin mínimo */}
                <DatePicker
                  label="Fin mínimo"
                  value={formData.finMinimo}
                  onChange={(date) => handleInputChange("finMinimo", date)}
                  iconName="calendar-minus"
                />
                {/* Fin máximo */}
                <DatePicker
                  label="Fin máximo"
                  value={formData.finMaximo}
                  onChange={(date) => handleInputChange("finMaximo", date)}
                  iconName="calendar-plus"
                />
              </>
            )}

            {errorMessage ? (
              <Text style={{ color: "red", fontSize: 18, marginBottom: 10, justifyContent: "center", textAlign: "center" }}>
                {errorMessage}
              </Text>
            ) : null}

            <View style= {styles.buttonContainer}>
            
              {/* Botón de guardar borrador */}
              <TouchableOpacity style={styles.draftButton} onPress={handlePublish}>
                <Text style={styles.draftButtonText}>Guardar borrador</Text>
              </TouchableOpacity>
          
              {/* Botón de publicación */}
              <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
                <Text style={styles.publishButtonText}>Publicar oferta</Text>
              </TouchableOpacity>
            
            </View>



            {/* Modal de éxito */}
            <SuccessModal
              isVisible={successModalVisible}
              onClose={() => setSuccessModalVisible(false)}
              message="¡Oferta creada con éxito!"
            />
          </View>
        </View>
      </ScrollView>
    </EmpresaRoute>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingVertical: 50,
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
    elevation: 5,
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  blockedField: {
    color: colors.mediumGray,
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 20,
    textAlign: "center",
  },
  publishButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 25,
    width: "100%",
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  publishButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  draftButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 25,
    width: "100%",
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  draftButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "90%",
    marginBottom: 15,
  },
  disabledInputContainer: {
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  inputContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  upgradeMessage: {
    color: colors.primary,
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 600,
    marginBottom: 15,
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
  userTypeText: {
    fontSize: 16,
    color: colors.white,
  },
  selectedButton: {
    backgroundColor: colors.primary,
  },
  unselectedButton: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  selectedText: {
    color: colors.white,
  },
  unselectedText: {
    color: colors.secondary,
  },
  licenciaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  licenciaButton: {
    width: "30%",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: "transparent",
  },
  licenciaButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  licenciaText: {
    color: colors.secondary,
    fontSize: 16,
  },
  licenciaTextSelected: {
    color: colors.white,
  },
  jornadaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  jornadaButton: {
    width: "30%",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: "transparent",
  },
  jornadaButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  jornadaText: {
    color: colors.secondary,
    fontSize: 16,
    textAlign: "center",
  },
  jornadaTextSelected: {
    color: colors.white,
  },
});

export default withNavigationGuard(CrearOfertaScreen);
