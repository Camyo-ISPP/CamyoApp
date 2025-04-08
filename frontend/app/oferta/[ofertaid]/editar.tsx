import React, { useEffect, useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
    ActivityIndicator, ScrollView as RNScrollView
} from "react-native";
import axios from "axios";
import { FontAwesome5 } from "@expo/vector-icons";
import colors from "../../../assets/styles/colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import SuccessModal from "../../_components/SuccessModal";
import EmpresaRoute from "../../../security/EmpresaRoute";
import withNavigationGuard from "@/hoc/withNavigationGuard";
import BackButtonAbsolute from "../../_components/BackButtonAbsolute";
import { useSubscriptionRules } from "../../../utils/useSubscriptionRules";
import DatePicker from "@/app/_components/DatePicker";
import { useFocusEffect } from "expo-router";
import CityPicker from "../../_components/CityPicker";

const EditarOfertaScreen = () => {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const params = useLocalSearchParams();
    const { ofertaid } = params;

    const { user, userToken } = useAuth();
    const router = useRouter();
    const { rules, loading } = useSubscriptionRules();
    const [tipoOferta, setTipoOferta] = useState("TRABAJO");
    const [errorMessage, setErrorMessage] = useState("");
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    // Estado para mantener los datos de la oferta
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

    // Redirige a login si no hay usuario
    useEffect(() => {
        if (!user || !user.rol) {
            router.replace("/login");
        }
    }, [user, router]);

    // Actualiza la empresa si cambia el usuario
    useEffect(() => {
        if (user?.id) {
            setFormData((prevState) => ({
                ...prevState,
                empresa: { id: user.id },
            }));
        }
    }, [user]);

    const formatToDDMMYYYY = (dateInput) => {
        const date = new Date(dateInput);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/ofertas/${ofertaid}`, {
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${userToken}`
                    }
                });
                const data = response.data;

                const responseTrabajo = await axios.get(`${BACKEND_URL}/ofertas/${ofertaid}/trabajo`, {
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${userToken}`
                    }
                });
                const dataTrabajo = responseTrabajo.data;

                const responseCarga = await axios.get(`${BACKEND_URL}/ofertas/${ofertaid}/carga`, {
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${userToken}`
                    }
                });
                
                const dataCarga = responseCarga.data;
                setFormData({
                    titulo: data.titulo || "",
                    experiencia: data.experiencia || "",
                    licencia: data.licencia || "",
                    notas: data.notas || "",
                    estado: data.estado || "BORRADOR",
                    sueldo: data.sueldo !== undefined && data.sueldo !== null ? data.sueldo.toString() : "",
                    localizacion: data.localizacion || "",
                    fechaPublicacion: data.fechaPublicacion || new Date().toISOString(),
                    empresa: data.empresa || { id: user?.id ?? null },
                    // Trabajo
                    fechaIncorporacion: dataTrabajo.fechaIncorporacion
                        ? formatToDDMMYYYY(dataTrabajo.fechaIncorporacion)
                        : "",
                    jornada: dataTrabajo ? dataTrabajo.jornada : "",
                    // Carga
                    mercancia: dataCarga ? dataCarga.mercancia : "",
                    peso: dataCarga !== undefined && dataCarga.peso !== undefined ? dataCarga.peso.toString() : "",
                    origen: dataCarga ? dataCarga.origen : "",
                    destino: dataCarga ? dataCarga.destino : "",
                    distancia: dataCarga !== undefined && dataCarga.distancia !== undefined ? dataCarga.distancia.toString() : "",
                    inicio: dataCarga.inicio
                        ? formatToDDMMYYYY(dataCarga.inicio)
                        : "",
                    finMinimo: dataCarga.finMinimo
                        ? formatToDDMMYYYY(dataCarga.finMinimo)
                        : "",                
                    finMaximo: dataCarga.finMaximo
                        ? formatToDDMMYYYY(dataCarga.finMaximo)
                        : "",                
                });

                setTipoOferta(data.tipoOferta || "TRABAJO");
            } catch (error) {
                console.error("Error al cargar la oferta:", error);
            }
        };

        if (user && userToken && ofertaid) {
            fetchOffer();
        }
    }, [user, userToken, ofertaid, BACKEND_URL]);

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

        if (!formData.titulo) {
            setErrorMessage("El campo título es obligatorio.");
            return;
        }
        if (formData.titulo.length > 255) {
            setErrorMessage("El campo título es demasiado largo.");
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
        if (!formData.localizacion) {
            setErrorMessage("El campo localización es obligatorio.");
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
                setErrorMessage("El campo distancia es obligatorio.");
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
            const fechaInicio = convertirFecha(formData.inicio);
            if (fechaInicio < hoy) {
                setErrorMessage("La fecha de inicio no puede ser anterior a hoy.");
                return;
            }
            if (!formData.finMinimo) {
                setErrorMessage("El campo fin mínimo es obligatorio.");
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
            if (fechaInicio > fechaFMin) {
                setErrorMessage("La fecha de inicio no puede ser posterior a la fecha de fin mínimo.");
                return;
            }
            if (fechaFMin > fechaFMax) {
                setErrorMessage("La fecha de fin mínimo no puede ser posterior a la fecha de fin máximo.");
                return;
            }
        }

        let ofertaData = {
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
                    fechaIncorporacion: formData.fechaIncorporacion.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"),
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
                    inicio: formData.inicio.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"),
                    finMinimo: formData.finMinimo.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"),
                    finMaximo: formData.finMaximo.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1")
                }
            };
        }

        try {

            const response = await axios.put(`${BACKEND_URL}/ofertas/${ofertaid}`, ofertaData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userToken}`
                }
            });

            if (response.status === 200) {
                setErrorMessage("");
                setSuccessModalVisible(true);
                setTimeout(() => {
                    setSuccessModalVisible(false);
                    router.replace("/miperfil");
                }, 1000);
            }
        } catch (error) {
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
            setErrorMessage("El campo título es demasiado largo.");
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
                setErrorMessage("El campo fin mínimo es obligatorio para guardar el borrador.");
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

        let ofertaData = {
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
                    fechaIncorporacion: formData.fechaIncorporacion.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"),
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
                    inicio: formData.inicio.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"),
                    finMinimo: formData.finMinimo.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"),
                    finMaximo: formData.finMaximo.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1")
                }
            };
        }

        try {
            const response = await axios.put(`${BACKEND_URL}/ofertas/${ofertaid}`, ofertaData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userToken}`
                }
            });

            if (response.status === 200) {
                setErrorMessage("");
                setSuccessModalVisible(true);
                setTimeout(() => {
                    setSuccessModalVisible(false);
                    router.replace("/miperfil");
                }, 1000);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            }
        }
    };

    const renderInput = (label, field, icon, keyboardType = "default", secureTextEntry = false, multiline = false, placeholder = "", disabled = false) => {
        const iconColor = disabled ? colors.lightGray : colors.primary;
        return (
            <View style={{ width: "90%", marginBottom: 15 }}>
                <Text style={{
                    fontSize: 16,
                    color: colors.secondary,
                    marginLeft: 8,
                    marginBottom: -6,
                    backgroundColor: colors.white,
                    alignSelf: "flex-start",
                    paddingHorizontal: 5,
                    zIndex: 1
                }}>
                    {label}
                </Text>
                <View style={[styles.inputContainerStyle, disabled && styles.disabledInputContainer]}>
                    {React.cloneElement(icon, { color: iconColor })}
                    <TextInput
                        style={{ flex: 1, height: multiline ? 80 : 40, paddingLeft: 8, outline: "none", textAlignVertical: multiline ? "top" : "center" }}
                        keyboardType={keyboardType}
                        secureTextEntry={secureTextEntry}
                        multiline={multiline}
                        numberOfLines={multiline ? 3 : 1}
                        placeholder={disabled ? "Solo disponible para clientes BASICO y PREMIUM." : placeholder}
                        placeholderTextColor={colors.mediumGray}
                        onChangeText={(value) => !disabled && handleInputChange(field, value)}
                        editable={!disabled}
                        value={formData[field] ?? ""}
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
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const renderPicker = (label, field, icon) => {
        const [cities, setCities] = useState([]);
        const [loadingPicker, setLoadingPicker] = useState(false);
        const [searchText, setSearchText] = useState("");

        const searchCities = async (query) => {
            if (query.length < 3) return;
            setLoadingPicker(true);
            try {
                const response = await axios.get(`https://nominatim.openstreetmap.org/search?`, {
                    params: {
                        q: query,
                        format: "json",
                        addressdetails: 1,
                        limit: 10,
                        countrycodes: "es",
                    }
                });
                const uniqueCities = [];
                const seen = new Set();
                response.data.forEach(item => {
                    const cityName = item.address.city || item.address.town || item.address.village;
                    if (cityName && !seen.has(cityName)) {
                        seen.add(cityName);
                        uniqueCities.push({
                            name: cityName,
                            state: item.address.state,
                            country: item.address.country
                        });
                    }
                });
                setCities(uniqueCities);
            } catch (error) {
                console.error("Error fetching cities:", error);
            } finally {
                setLoadingPicker(false);
            }
        };

        useEffect(() => {
            const timer = setTimeout(() => {
                if (searchText) {
                    searchCities(searchText);
                }
            }, 500);
            return () => clearTimeout(timer);
        }, [searchText]);

        return (
            <View style={{ width: "90%", marginBottom: 15 }}>
                <Text style={{
                    fontSize: 16,
                    color: colors.secondary,
                    marginLeft: 8,
                    marginBottom: -6,
                    backgroundColor: colors.white,
                    alignSelf: "flex-start",
                    paddingHorizontal: 5,
                    zIndex: 1
                }}>
                    {label}
                </Text>
                <View style={styles.inputContainerStyle}>
                    {React.cloneElement(icon, { color: colors.primary })}
                    <TextInput
                        style={{
                            flex: 1,
                            height: 40,
                            paddingLeft: 8,
                            color: colors.primary,
                        }}
                        placeholder="Busca una ciudad..."
                        value={searchText}
                        onChangeText={(text) => {
                            setSearchText(text);
                            if (text === "") {
                                handleInputChange(field, "");
                                setCities([]);
                            }
                        }}
                    />
                    {loadingPicker && <ActivityIndicator size="small" color={colors.primary} />}
                </View>
                {cities.length > 0 && (
                    <View style={{
                        maxHeight: 200,
                        borderWidth: 1,
                        borderColor: colors.lightGray,
                        borderRadius: 5,
                        marginTop: 5,
                        backgroundColor: colors.white,
                        zIndex: 1000
                    }}>
                        <RNScrollView>
                            {cities.map((city, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        padding: 10,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.lightGray
                                    }}
                                    onPress={() => {
                                        handleInputChange(field, city.name);
                                        setSearchText(city.name);
                                        setCities([]);
                                    }}
                                >
                                    <Text style={{ color: colors.primary }}>
                                        {city.name}
                                        {city.state && `, ${city.state}`}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </RNScrollView>
                    </View>
                )}
            </View>
        );
    };

    return (
        <EmpresaRoute>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <View style={styles.cardContainer}>
                        <BackButtonAbsolute />
                        <Text style={styles.title}>Editar oferta</Text>

                        {/* Campos generales */}
                        {renderInput("Título", "titulo", <FontAwesome5 name="tag" size={20} color={colors.primary} />)}
                        {renderInput("Experiencia (años)", "experiencia", <FontAwesome5 name="briefcase" size={20} />, "numeric")}
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
                                            style={[styles.licenciaButton, isSelected && styles.licenciaButtonSelected]}
                                            onPress={() => handleInputChange("licencia", storedValue)}
                                        >
                                            <Text style={[styles.licenciaText, isSelected && styles.licenciaTextSelected]}>
                                                {licencia}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                        {renderInput("Descripción", "notas", <FontAwesome5 name="align-left" size={20} color={colors.primary} />, "default", false, true)}
                        {renderInput("Sueldo (€)", "sueldo", <FontAwesome5 name="money-bill-wave" size={20} color={colors.primary} />)}
                        <CityPicker
                            label="Localizacion"
                            field="localizacion"
                            icon={<FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} />}
                            formData={formData}
                            handleInputChange={handleInputChange}
                        />

                        {/* Mostrar el tipo de oferta */}
                        <Text style={styles.title}>Tipo de oferta: {tipoOferta}</Text>

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
                                                style={[styles.jornadaButton, formData.jornada === jornada && styles.jornadaButtonSelected]}
                                                onPress={() => handleInputChange("jornada", jornada)}
                                            >
                                                <Text style={[styles.jornadaText, formData.jornada === jornada && styles.jornadaTextSelected]}>
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
                                    icon={<FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} />}
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                />
                                {renderInput("Distancia (km)", "distancia", <FontAwesome5 name="road" size={20} color={colors.primary} />)}
                                <DatePicker
                                    label="Inicio"
                                    value={formData.inicio}
                                    onChange={(date) => handleInputChange("inicio", date)}
                                    iconName="stopwatch"
                                />
                                <DatePicker
                                    label="Fin mínimo"
                                    value={formData.finMinimo}
                                    onChange={(date) => handleInputChange("finMinimo", date)}
                                    iconName="calendar-minus"
                                />
                                <DatePicker
                                    label="Fin máximo"
                                    value={formData.finMaximo}
                                    onChange={(date) => handleInputChange("finMaximo", date)}
                                    iconName="calendar-plus"
                                />
                            </>
                        )}

                        {errorMessage ? (
                            <Text style={{ color: "red", fontSize: 18, marginBottom: 10, textAlign: "center" }}>
                                {errorMessage}
                            </Text>
                        ) : null}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.draftButton} onPress={handleDraft}>
                                <Text style={styles.draftButtonText}>Guardar borrador</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
                                <Text style={styles.publishButtonText}>Publicar oferta</Text>
                            </TouchableOpacity>
                        </View>

                        <SuccessModal
                            isVisible={successModalVisible}
                            onClose={() => setSuccessModalVisible(false)}
                            message="¡Oferta actualizada con éxito!"
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

export default withNavigationGuard(EditarOfertaScreen);
