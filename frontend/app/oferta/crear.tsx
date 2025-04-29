import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, Modal } from "react-native";
import axios from "axios";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import SuccessModal from "../_components/SuccessModal";
import withNavigationGuard from "@/hoc/withNavigationGuard";
import { useSubscriptionRules } from '../../utils/useSubscriptionRules';
import DatePicker from "@/app/_components/DatePicker";
import CityPicker from "../_components/CityPicker";
import MapLoader from "../_components/MapLoader";

const CrearOfertaScreen = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const { user, userToken } = useAuth();
  const [tipoOferta, setTipoOferta] = useState("TRABAJO");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalVisibleD, setSuccessModalVisibleD] = useState(false);
  const { rules, loading: rulesLoading } = useSubscriptionRules();
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canCreateOffer, setCanCreateOffer] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    experiencia: null,
    licencia: "",
    notas: "",
    estado: "BORRADOR",
    sueldo: null,
    localizacion: "",
    fechaPublicacion: new Date().toISOString(),
    empresa: { id: user?.id ?? null },
    fechaIncorporacion: "",
    jornada: "",
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

  useEffect(() => {
    if (user?.id) {
      setFormData((prevState) => ({
        ...prevState,
        empresa: { id: user.id },
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (!user || !user.rol) {
          router.replace("/login");
          return;
        }

        const offersResponse = await axios.get(`${BACKEND_URL}/ofertas/empresa/${user.id}`);
        const activeOffers = offersResponse.data.filter((offer: any) => offer.estado === "ABIERTA");
        setOffers(activeOffers);

        if (!rulesLoading && rules) {
          const canCreate = activeOffers.length < rules.maxActiveOffers;
          setCanCreateOffer(canCreate);
          
          if (!canCreate) {
            router.push("/suscripcion");
            return;
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, rules, rulesLoading]);

  if (isLoading || rulesLoading) {
    return (
      <View style={styles.fullScreenLoading}>
        <MapLoader message="Gracias por tu paciencia, estamos verificando tu suscripción..." />
      </View>
    );
  }

  if (!canCreateOffer || !user || !user.rol) {
    return null;
  }

  const handleInputChange = (field, value) => {
    let formattedValue = value;

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
    formData.titulo = formData.titulo.trim();
    if (!formData.titulo) {
      setErrorMessage("El campo título es obligatorio.");
      return;
    }
    if (formData.titulo.length > 255) {
      setErrorMessage("El campo titulo es demasiado largo.");
      return;
    }
    if (formData.titulo.length < 2) {
      setErrorMessage("El campo titulo es demasiado corto.");
      return;
    }

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
      setErrorMessage("¿Quieres un alien? El campo años de experiencia debe ser menor que 100.");
      return;
    }

    if (!formData.licencia) {
      setErrorMessage("El campo licencia es obligatorio.");
      return;
    }

    if (!formData.notas) {
      setErrorMessage("El campo descripción es obligatorio.");
      return;
    }
    if (formData.notas.length > 500) {
      setErrorMessage("El campo descripción es demasiado largo.");
      return;
    }

    if (!formData.sueldo) {
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

    if (formData.sueldo > 100000) {
      setErrorMessage("El campo sueldo debe ser menor a 100000, que barbaridad dar 100000 euros al mes.");
      return;
    }

    if (!formData.localizacion) {
      setErrorMessage("El campo localización es obligatorio.");
      return;
    }
    if (formData.localizacion.length > 255) {
      setErrorMessage("El campo localización es demasiado largo.");
      return;
    }

    if (formData.localizacion.length < 2) {
      setErrorMessage("El campo localización es demasiado pequeño.");
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s-]+$/.test(formData.localizacion)) {
      setErrorMessage("La localizacion solo puede contener letras, espacios y guiones.");
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (tipoOferta === "TRABAJO") {
      if (!formData.fechaIncorporacion) {
        setErrorMessage("El campo fecha de incorporación es obligatorio.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.fechaIncorporacion)) {
        setErrorMessage("El formato de la fecha de incorporación no es válido.");
        return;
      }
      const fechaI = convertirFecha(formData.fechaIncorporacion);
      if (fechaI < hoy) {
        setErrorMessage("La fecha de incorporación no puede ser anterior a hoy.");
        return;
      }

      if (!formData.jornada) {
        setErrorMessage("El campo jornada es obligatorio.");
        return;
      }
    }
    if (tipoOferta === "CARGA") {
      if (!formData.mercancia) {
        setErrorMessage("El campo mercancía es obligatorio.");
        return;
      }
      if (formData.mercancia.length > 255) {
        setErrorMessage("El campo mercancía es demasiado largo.");
        return;
      }

      if (!formData.peso) {
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

      if (!formData.origen) {
        setErrorMessage("El campo origen es obligatorio.");
        return;
      }
      if (formData.origen.length > 255) {
        setErrorMessage("El campo origen es demasiado largo.");
        return;
      }

      if (!formData.destino) {
        setErrorMessage("El campo destino es obligatorio.");
        return;
      }
      if (formData.destino.length > 255) {
        setErrorMessage("El campo destino es demasiado largo.");
        return;
      }

      if (!formData.distancia) {
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

      if (!formData.inicio) {
        setErrorMessage("El campo inicio es obligatorio.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.inicio)) {
        setErrorMessage("El formato de la fecha de inicio no es válido.");
        return;
      }
      const fechaI = convertirFecha(formData.inicio);
      if (fechaI < hoy) {
        setErrorMessage("La fecha de inicio no puede ser anterior a hoy.");
        return;
      }
      
      if (!formData.finMinimo) {
        setErrorMessage("El campo fin mínino es obligatorio.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.finMinimo)) {
        setErrorMessage("El formato de la fecha de fin mínimo no es válido.");
        return;
      }
      
      if (!formData.finMaximo) {
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

    let ofertaData: any = {
      oferta: {
        titulo: formData.titulo,
        experiencia: Number(formData.experiencia),
        licencia: Array.isArray(formData.licencia) ? formData.licencia[0] : formData.licencia,
        notas: formData.notas,
        estado: "ABIERTA",
        sueldo: parseFloat(formData.sueldo).toFixed(2),
        localizacion: formData.localizacion,
        fechaPublicacion: formatDate(new Date()),
        empresa: { id: user?.id ?? null },
        tipoOferta: tipoOferta
      }
    };

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
          peso: Number(formData.peso),
          origen: formData.origen,
          destino: formData.destino,
          distancia: Number(formData.distancia),
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
    if (!formData.titulo) {
      setErrorMessage("El campo título es obligatorio para guardar un borrador.");
      return;
    }
    if (formData.titulo.length > 255) {
      setErrorMessage("El campo titulo es demasiado largo.");
      return;
    }

    if (formData.experiencia) {
      if (isNaN(formData.experiencia)) {
        setErrorMessage("El campo años de experiencia debe ser un número.");
        return;
      }
      if (formData.experiencia < 0) {
        setErrorMessage("El campo años de experiencia debe ser 0 o mayor.");
        return;
      }
    }

    if (!formData.licencia) {
      setErrorMessage("El campo licencia es obligatorio para guardar un borrador.");
      return;
    }
    
    if (!formData.notas) {
      setErrorMessage("El campo descripción es obligatorio para guardar un borrador.");
      return;
    }
    if (formData.notas.length > 500) {
      setErrorMessage("El campo descripción es demasiado largo.");
      return;
    }

    if (formData.sueldo) {
      if (isNaN(formData.sueldo)) {
        setErrorMessage("El campo sueldo debe ser un número.");
        return;
      }
      if (formData.sueldo <= 0) {
        setErrorMessage("El campo sueldo debe ser mayor a 0.0.");
        return;
      }
    }

    if (!formData.localizacion) {
      setErrorMessage("El campo localización es obligatorio para guardar un borrador.");
      return;
    }
    if (formData.localizacion.length > 255) {
      setErrorMessage("El campo localización es demasiado largo.");
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (tipoOferta === "TRABAJO") {
      if (!formData.fechaIncorporacion) {
        setErrorMessage("El campo fecha de incorporación es obligatorio para guardar el borrador.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.fechaIncorporacion)) {
        setErrorMessage("El formato de la fecha de incorporación no es válido.");
        return;
      }
      const fechaI = convertirFecha(formData.fechaIncorporacion);
      if (fechaI < hoy) {
        setErrorMessage("La fecha de incorporación no puede ser anterior a hoy.");
        return;
      }
    }

    if (tipoOferta === "CARGA") {
      if (!formData.mercancia) {
        setErrorMessage("El campo mercancía es obligatorio para guardar el borrador.");
        return;
      }
      if (formData.mercancia.length > 255) {
        setErrorMessage("El campo mercancía es demasiado largo.");
        return;
      }

      if (formData.peso) {
        if (isNaN(formData.peso)) {
          setErrorMessage("El campo peso debe ser un número.");
          return;
        }
        if (formData.peso <= 0) {
          setErrorMessage("El campo peso debe ser mayor a 0.0.");
          return;
        }
      }

      if (!formData.origen) {
        setErrorMessage("El campo origen es obligatorio para guardar el borrador.");
        return;
      }
      if (formData.origen.length > 255) {
        setErrorMessage("El campo origen es demasiado largo.");
        return;
      }

      if (!formData.destino) {
        setErrorMessage("El campo destino es obligatorio para guardar el borrador.");
        return;
      }
      if (formData.destino.length > 255) {
        setErrorMessage("El campo destino es demasiado largo.");
        return;
      }

      if (formData.distancia) {
        if (isNaN(formData.distancia)) {
          setErrorMessage("El campo distancia debe ser un número.");
          return;
        }
        if (formData.distancia <= 0) {
          setErrorMessage("El campo distancia debe ser mayor a 0.");
          return;
        }
      }

      if (!formData.inicio) {
        setErrorMessage("El campo inicio es obligatorio para guardar el borrador.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.inicio)) {
        setErrorMessage("El formato de la fecha de inicio no es válido.");
        return;
      }
      const fechaI = convertirFecha(formData.inicio);
      if (fechaI < hoy) {
        setErrorMessage("La fecha de inicio no puede ser anterior a hoy.");
        return;
      }

      if (!formData.finMinimo) {
        setErrorMessage("El campo fin mínino es obligatorio para guardar el borrador.");
        return;
      }
      if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.finMinimo)) {
        setErrorMessage("El formato de la fecha de fin mínimo no es válido.");
        return;
      }

      if (!formData.finMaximo) {
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
    }

    let ofertaData: any = {
      oferta: {
        titulo: formData.titulo,
        experiencia: Number(formData.experiencia),
        licencia: Array.isArray(formData.licencia) ? formData.licencia[0] : formData.licencia,
        notas: formData.notas,
        estado: formData.estado || "BORRADOR",
        sueldo: formData.sueldo ? parseFloat(formData.sueldo).toFixed(2) : null,
        localizacion: formData.localizacion,
        fechaPublicacion: null,
        empresa: { id: user?.id ?? null },
        tipoOferta: tipoOferta
      }
    };

    if (tipoOferta === "TRABAJO") {
      ofertaData = {
        ...ofertaData,
        trabajo: {
          fechaIncorporacion: formData.fechaIncorporacion.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'),
          jornada: formData.jornada ? formData.jornada : null
        }
      };
    } else if (tipoOferta === "CARGA") {
      ofertaData = {
        ...ofertaData,
        carga: {
          mercancia: formData.mercancia,
          peso: formData.peso ? Number(formData.peso) : null,
          origen: formData.origen,
          destino: formData.destino,
          distancia: formData.distancia ? Number(formData.distancia) : null,
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

        setSuccessModalVisibleD(true);
        setTimeout(() => {
          setSuccessModalVisibleD(false);
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

  const renderInput = (label, field, icon, keyboardType = "default", secureTextEntry = false, multiline = false, placeholder = "", disabled = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        formData[field] ? styles.inputWrapperFocused : null,
        disabled && styles.disabledInputContainer
      ]}>
        {React.cloneElement(icon, { color: disabled ? colors.lightGray : colors.primary })}
        <TextInput
          style={[styles.inputField, { outlineWidth: 0 }]}
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
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.secondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="file-alt" size={32} color={colors.secondary} />
            </View>
            <Text style={styles.title}>Crear Nueva Oferta</Text>
          </View>

          {/* Campos generales */}
          {renderInput("Título", "titulo", <FontAwesome5 name="tag" size={20} />)}
          {renderInput("Experiencia (años)", "experiencia", <FontAwesome5 name="briefcase" size={20} />, "numeric")}
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Licencia requerida:</Text>
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
                      {licencia}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {renderInput("Descripción", "notas", <FontAwesome5 name="align-left" size={20} />, "default", false, true)}
          {renderInput("Sueldo (€)", "sueldo", <FontAwesome5 name="money-bill-wave" size={20} />, "numeric")}
          
          <CityPicker
            label="Localización"
            field="localizacion"
            icon={<FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} />}
            formData={formData}
            handleInputChange={handleInputChange}
          />

          {/* Selector de tipo de oferta */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Tipo de oferta:</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.typeButton, tipoOferta === "TRABAJO" ? styles.typeButtonSelected : null]}
                onPress={() => setTipoOferta("TRABAJO")}
              >
                <Text style={[styles.typeButtonText, tipoOferta === "TRABAJO" ? styles.typeButtonTextSelected : null]}>
                  TRABAJO
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, tipoOferta === "CARGA" ? styles.typeButtonSelected : null]}
                onPress={() => setTipoOferta("CARGA")}
              >
                <Text style={[styles.typeButtonText, tipoOferta === "CARGA" ? styles.typeButtonTextSelected : null]}>
                  CARGA
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Campos dinámicos según el tipo de oferta */}
          {tipoOferta === "TRABAJO" ? (
            <>
              <DatePicker
                label="Fecha de incorporación"
                value={formData.fechaIncorporacion}
                onChange={(date) => handleInputChange("fechaIncorporacion", date)}
                icon={<FontAwesome5 name="calendar-check" size={20} color={colors.primary} />}
              />

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Jornada:</Text>
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
              {renderInput("Mercancía", "mercancia", <FontAwesome5 name="box" size={20} />)}
              {renderInput("Peso (kg)", "peso", <FontAwesome5 name="weight" size={20} />, "numeric")}

              <CityPicker
                label="Origen"
                field="origen"
                icon={<FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} />}
                formData={formData}
                handleInputChange={handleInputChange}
              />
              
              <CityPicker
                label="Destino"
                field="destino"
                icon={<FontAwesome5 name="map-marker" size={20} color={colors.primary} />}
                formData={formData}
                handleInputChange={handleInputChange}
              />
              
              {renderInput("Distancia (km)", "distancia", <FontAwesome5 name="road" size={20} />, "numeric")}

              <DatePicker
                label="Fecha de inicio"
                value={formData.inicio}
                onChange={(date) => handleInputChange("inicio", date)}
                icon={<FontAwesome5 name="stopwatch" size={20} color={colors.primary} />}
              />
              
              <DatePicker
                label="Fin mínimo"
                value={formData.finMinimo}
                onChange={(date) => handleInputChange("finMinimo", date)}
                icon={<FontAwesome5 name="calendar-minus" size={20} color={colors.primary} />}
              />
              
              <DatePicker
                label="Fin máximo"
                value={formData.finMaximo}
                onChange={(date) => handleInputChange("finMaximo", date)}
                icon={<FontAwesome5 name="calendar-plus" size={20} color={colors.primary} />}
              />
            </>
          )}

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.draftButton}
              onPress={handleDraft}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Guardar borrador</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.publishButton}
              onPress={handlePublish}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Publicar oferta</Text>
            </TouchableOpacity>
          </View>

          <SuccessModal
            isVisible={successModalVisible}
            onClose={() => setSuccessModalVisible(false)}
            message="¡Oferta creada con éxito!"
          />
          <SuccessModal
            isVisible={successModalVisibleD}
            onClose={() => setSuccessModalVisibleD(false)}
            message="¡Borrador creado con éxito!"
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
  disabledInputContainer: {
    borderColor: colors.lightGray,
    backgroundColor: colors.lightestGray,
  },
  upgradeMessage: {
    color: colors.primary,
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
    textDecorationLine: "underline",
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  typeButtonSelected: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    textAlign: "center",
    color: colors.primary,
    fontWeight: "600",
  },
  typeButtonTextSelected: {
    color: colors.white,
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
  draftButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    flex: 1,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  publishButton: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    flex: 1,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
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
  fullScreenLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 20,
    color: colors.secondary,
    fontSize: 16,
  },
});


export default withNavigationGuard(CrearOfertaScreen);