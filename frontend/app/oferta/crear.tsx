import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import SuccessModal from "../_components/SuccessModal";
import EmpresaRoute from "../../security/EmpresaRoute";
import withNavigationGuard from "@/hoc/withNavigationGuard";
import { useSubscriptionRules } from '../../utils/useSubscriptionRules';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const CrearOfertaScreen = () => {
  const { user, userToken } = useAuth();
  const [tipoOferta, setTipoOferta] = useState("TRABAJO");
  const router = useRouter();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const { rules, loading } = useSubscriptionRules();
  const [formData, setFormData] = useState({
    titulo: "",
    experiencia: "",
    licencia: "",
    notas: "",
    estado: "ABIERTA",
    sueldo: "",
    localizacion: "",
    fechaPublicacion: new Date().toISOString(), // Fecha actual del sistema
    empresa: { id: user?.id ?? null },
    // Trabajo
    fechaIncorporacion: "",
    jornada: "",
    // Carga
    mercancia: "",
    peso: "",
    origen: "",
    destino: "",
    distancia: "",
    inicio: "",
    finMinimo: "",
    finMaximo: "",
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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

  const validateForm = () => {
    if (!formData.titulo) {
      alert("El título es obligatorio.");
      return false;
    }
    return true;
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


  const handlePublish = async () => {
    if (validateForm()) {
      // Construcción del objeto base de la oferta
      let ofertaData: any = {
        tipoOferta,
        oferta: {
          titulo: formData.titulo,
          experiencia: Number(formData.experiencia), // Convertir a número
          licencia: Array.isArray(formData.licencia) ? formData.licencia[0] : formData.licencia, // Convertir a string
          notas: formData.notas,
          estado: formData.estado || "ABIERTA",
          sueldo: parseFloat(formData.sueldo).toFixed(2), // Convertir a float con 2 decimal
          localizacion: formData.localizacion,
          fechaPublicacion: formatDate(new Date()), // Fecha en formato correcto sin Z y sin decimales
          empresa: { id: user?.id ?? null }
        }
      };

      // Agregar detalles según el tipo de oferta
      if (tipoOferta === "TRABAJO" && formData.fechaIncorporacion && formData.jornada) {
        ofertaData = {
          ...ofertaData,
          trabajo: {
            fechaIncorporacion: formatDate(formData.fechaIncorporacion), // Aplicar formato correcto
            jornada: formData.jornada
          }
        };
      } else if (tipoOferta === "CARGA" && formData.mercancia && formData.origen && formData.destino) {
        ofertaData = {
          ...ofertaData,
          carga: {
            mercancia: formData.mercancia,
            peso: Number(formData.peso), // Convertir a número
            origen: formData.origen,
            destino: formData.destino,
            distancia: Number(formData.distancia), // Convertir a número
            inicio: formData.inicio ? formatDate(formData.inicio) : null,
            finMinimo: formData.finMinimo ? formatDate(formData.finMinimo) : null,
            finMaximo: formData.finMaximo ? formatDate(formData.finMaximo) : null
          }
        };
      } else {
        alert("Faltan datos obligatorios para este tipo de oferta.");
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/ofertas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify(ofertaData),
        });

        if (!response.ok) {
          throw new Error(`Error al crear la oferta: ${response.statusText}`);
        }

        const data = await response.json();

        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          router.replace("/miperfil");
        }, 1000);

      } catch (error) {
        console.error("Error al enviar la oferta:", error);
        alert("Hubo un error al publicar la oferta.");
      }
    }

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
          placeholder={disabled ? "Solo disponible para clientes BASIC y PREMIUM." : placeholder}
          placeholderTextColor={colors.mediumGray}
          onChangeText={(value) => !disabled && handleInputChange(field, value)}
          editable={!disabled}
          value={formData[field]}
        />
      </View>

      {disabled && (
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Text style={styles.upgradeMessage}>
            ¿Quieres más opciones? Mejora tu plan aquí.
          </Text>
        </TouchableOpacity>
      )}
    </View>
    );
  };

  return (
    <EmpresaRoute>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.cardContainer}>
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
              {rules.fullFormFields ? (
              <View style={styles.inputContainer}>
                <View style={styles.licenciaContainer}>
                  {["AM", "A1", "A2", "A", "B", "C1", "C", "C1+E", "C+E", "D1", "D+E", "E", "D"].map((licencia) => {
                    const storedValue = licencia.replace(/\+/g, "_");
                    const isSelected = formData.licencia === storedValue;

                    return (
                      <TouchableOpacity
                        key={licencia}
                        style={[
                          styles.licenciaButton,
                          isSelected && styles.licenciaButtonSelected,
                        ]}
                        onPress={() => handleInputChange("licencia", storedValue)}
                      >
                        <Text
                          style={[
                            styles.licenciaText,
                            isSelected && styles.licenciaTextSelected,
                          ]}
                        >
                          {licencia}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <View style={styles.licenciaContainer}>
                  {["AM", "A1", "A2", "A", "B", "C1", "C", "C1+E", "C+E", "D1", "D+E", "E", "D"].map((licencia) => (
                    <View
                      key={licencia}
                      style={[
                        styles.licenciaButton,
                        styles.disabledButton, // Aplicar estilo deshabilitado
                      ]}
                    >
                      <Text style={[styles.licenciaText, styles.disabledButtonText]}>
                        {licencia}
                      </Text>
                    </View>
                  ))}
                </View>
                {/* Mensaje informativo */}
                <TouchableOpacity onPress={() => router.push("/")}>
                  <Text style={styles.upgradeMessage}>
                    ¿Quieres más opciones? Mejora tu plan aquí.
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            </View>

            {renderInput("Descripción", "notas", <FontAwesome5 name="align-left" size={20} color={colors.primary} />)}
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
                {renderInput("Fecha de incorporación", "fechaIncorporacion", <FontAwesome5 name="calendar-check" size={20} color={colors.primary} />, "default", false, false, "AAAA-mm-dd")}

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
                {renderInput(
                  "Experiencia (años)",
                  "experiencia",
                  <FontAwesome5 name="briefcase" size={20} />,
                  "default",
                  false,
                  false,
                  "Ingresa años de experiencia",
                  !rules.fullFormFields
                )}
                {renderInput(
                  "Peso (kg)",
                  "peso",
                  <FontAwesome5 name="weight" size={20} />,
                  "numeric",
                  false,
                  false,
                  "Ingresa el peso en kg",
                  !rules.fullFormFields
                )}
                {renderInput("Origen", "origen", <FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} />)}
                {renderInput("Destino", "destino", <FontAwesome5 name="map-marker" size={20} color={colors.primary} />)}
                {renderInput("Distancia (km)", "distancia", <FontAwesome5 name="road" size={20} color={colors.primary} />)}
                {renderInput("Inicio", "inicio", <FontAwesome5 name="clock" size={20} color={colors.primary} />, "default", false, false, "AAAA-mm-dd")}
                {renderInput(
                    "Fin mínimo",
                    "finMinimo",
                    <FontAwesome5 name="calendar-minus" size={20}/>,
                    "default",
                    false,
                    false,
                    "AAAA-mm-dd",
                    !rules.fullFormFields
                )}
                {renderInput(
                    "Fin máximo",
                    "finMaximo",
                    <FontAwesome5 name="calendar-plus" size={20}/>,
                    "default",
                    false,
                    false,
                    "AAAA-mm-dd",
                    !rules.fullFormFields
                  )}
              </>
            )}

            {/* Botón de publicación */}
            <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
              <Text style={styles.publishButtonText}>Publicar oferta</Text>
            </TouchableOpacity>

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
    elevation: 5,
    alignItems: "center",
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
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    width: "100%",
    alignItems: "center",
  },
  publishButtonText: {
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
  disabledButton: {
    width: "30%",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    backgroundColor: colors.lightGray,
  },
  licenciaButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  licenciaText: {
    color: colors.secondary,
    fontSize: 16,
  },
  disabledButtonText: {
    color: colors.mediumGray,
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
