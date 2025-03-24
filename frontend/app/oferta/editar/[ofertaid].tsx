import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import colors from "../../../assets/styles/colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import SuccessModal from "../../_components/SuccessModal";
import EmpresaRoute from "../../../security/EmpresaRoute";
import withNavigationGuard from "@/hoc/withNavigationGuard";
import BackButtonAbsolute from "@/app/_components/BackButtonAbsolute";
import { useSubscriptionRules } from '../../../utils/useSubscriptionRules';

const EditarOfertaScreen = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  
  const [tipoOferta, setTipoOferta] = useState("");
  const router = useRouter();
  const { ofertaid } = useLocalSearchParams();
  const { user, userToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const { rules, loading: subscriptionLoading } = useSubscriptionRules();
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    experiencia: "",
    licencia: "",
    notas: "",
    estado: "",
    sueldo: "",
    localizacion: "",
    fechaPublicacion: "",
    empresa: "",

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
    tipoAnterior: "",

  });

  const fetchOferta = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}`);
      const data = await response.json();

      if (!data || Object.keys(data).length === 0) {
        console.error("Error: La oferta no tiene datos.");
        return;
      }
      let licencia = data.licencia || "";

      let tipoOfertaCargado = "";
      let detallesOferta = {};

      // Intentar obtener datos de carga
      const cargaResponse = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/carga`);
      if (cargaResponse.ok) {
        const text = await cargaResponse.text();
        if (text) {
          const cargaData = JSON.parse(text);
          if (cargaData && Object.keys(cargaData).length > 1) {
            tipoOfertaCargado = "CARGA";
            detallesOferta = cargaData;
          }
        }
      }

      // Intentar obtener datos de trabajo
      const trabajoResponse = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/trabajo`);
      if (trabajoResponse.ok) {
        const text = await trabajoResponse.text();
        if (text) {
          const trabajoData = JSON.parse(text);
          if (trabajoData && Object.keys(trabajoData).length > 1) {
            tipoOfertaCargado = "TRABAJO";
            detallesOferta = trabajoData;
          }
        }
      }

      setTipoOferta(tipoOfertaCargado);
      setFormData(prevState => ({
        ...prevState,
        ...data,
        ...detallesOferta,
        licencia, // Ahora es siempre un string
        tipoAnterior: tipoOfertaCargado, // Guardamos el tipo original
      }));
      setHasPermission(true);
      setLoading(false);

    } catch (error) {
      console.error("Error en fetchOferta:", error);
    }
  };

  useEffect(() => {
    if (user === undefined) {
      return;
    }

    setIsAuthLoaded(true);

  }, [user]);

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    // Esperar hasta que `user` esté disponible
    if (user === undefined) {
      return; // Espera hasta que `user` tenga un valor
    }
    setIsUserLoading(false); // Usuario cargado correctamente

    if (!ofertaid) {
      console.error("Error: ofertaid no está definido.");
      return;
    }
    fetchOferta();
  }, [isAuthLoaded]);

  if (!isAuthLoaded || loading || subscriptionLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!hasPermission) {
    return null;
  }

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    // Si el campo es "licencia", reemplazamos "+" por "_"
    if (field === "licencia") {
      formattedValue = value.replace(/\+/g, "_");
    }
    setFormData((prevState) => ({ ...prevState, [field]: String(value) }));

  };

  const validateForm = () => {
    if (!formData.titulo) {
      alert("El título es obligatorio.");
      return false;
    }
    if (tipoOferta === "TRABAJO" && (formData.mercancia || formData.peso || formData.origen || formData.destino)) {
      alert("No puedes mezclar datos de CARGA y TRABAJO. Por favor, elige solo un tipo.");
      return false;
    }
    if (tipoOferta === "CARGA" && (formData.fechaIncorporacion || formData.jornada)) {
      alert("No puedes mezclar datos de CARGA y TRABAJO. Por favor, elige solo un tipo.");
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
    if (!validateForm()) return;

    try {
      const tipoCambiado = tipoOferta !== formData.tipoAnterior;

      let ofertaData: {
        tipoOferta: string;
        oferta: {
          titulo: string;
          experiencia: number;
          licencia: string;
          notas: string;
          estado: string;
          sueldo: string;
          localizacion: string;
          fechaPublicacion: string;
          empresa: { id: number };
        };
        carga?: {
          mercancia: string;
          peso: number;
          origen: string;
          destino: string;
          distancia: number;
          inicio?: string | null;
          finMinimo?: string | null;
          finMaximo?: string | null;
        };
        trabajo?: {
          fechaIncorporacion: string;
          jornada: string;
        };
      } = {
        tipoOferta,
        oferta: {
          titulo: formData.titulo,
          experiencia: Number(formData.experiencia),
          licencia: Array.isArray(formData.licencia) ? formData.licencia.join(", ") : formData.licencia,
          notas: formData.notas,
          estado: formData.estado || "ABIERTA",
          sueldo: parseFloat(formData.sueldo).toFixed(2),
          localizacion: formData.localizacion,
          fechaPublicacion: formatDate(new Date()),
          empresa: { id: user?.id ?? null },
        },
      };

      if (tipoCambiado) {
        if (formData.tipoAnterior === "TRABAJO") {
          await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/trabajo`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${userToken}`
              }
            });

        } else if (formData.tipoAnterior === "CARGA") {
          await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/carga`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${userToken}`
              }
            }
          );
        }
      }

      if (tipoCambiado) {
        if (tipoOferta === "TRABAJO") {
          await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/trabajo`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
              fechaIncorporacion: formatDate(formData.fechaIncorporacion),
              jornada: formData.jornada,
            }),
          });
        } else if (tipoOferta === "CARGA") {
          await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/carga`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
              mercancia: formData.mercancia,
              peso: Number(formData.peso),
              origen: formData.origen,
              destino: formData.destino,
              distancia: Number(formData.distancia),
              inicio: formData.inicio ? formatDate(formData.inicio) : null,
              finMinimo: formData.finMinimo ? formatDate(formData.finMinimo) : null,
              finMaximo: formData.finMaximo ? formatDate(formData.finMaximo) : null,
            }),
          });
        }
      } else {
        if (tipoOferta === "TRABAJO") {
          await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/trabajo`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
              fechaIncorporacion: formatDate(formData.fechaIncorporacion),
              jornada: formData.jornada,
            }),
          });
        } else if (tipoOferta === "CARGA") {
          await fetch(`${BACKEND_URL}/ofertas/${ofertaid}/carga`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
              mercancia: formData.mercancia,
              peso: Number(formData.peso),
              origen: formData.origen,
              destino: formData.destino,
              distancia: Number(formData.distancia),
              inicio: formData.inicio ? formatDate(formData.inicio) : null,
              finMinimo: formData.finMinimo ? formatDate(formData.finMinimo) : null,
              finMaximo: formData.finMaximo ? formatDate(formData.finMaximo) : null,
            }),
          });
        }
      }

      const response = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(ofertaData),
      });

      if (!response.ok) throw new Error(`Error al editar la oferta: ${response.statusText}`);

      await fetchOferta();

      setSuccessModalVisible(true);
      setTimeout(() => {
        setSuccessModalVisible(false);
        router.replace("/miperfil");
      }, 1000);

    } catch (error) {
      console.error("Error al enviar la oferta:", error);
      alert("Hubo un error al editar la oferta.");
    }
  };
  const handleDeleteOffer = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/ofertas/${ofertaid}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.ok) {
        router.replace("/miperfil");

      } else {
        Alert.alert("Error", "No se pudo eliminar la oferta.");
      }
    } catch (error) {
      console.error("Error al eliminar la oferta:", error);
    }
  };

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
        <TouchableOpacity onPress={() => router.replace("/suscripcion")}>
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
            <BackButtonAbsolute />
            <Text style={styles.title}>Editar oferta</Text>

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
                !rules.fullFormFields
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

            {renderInput("Descripción", "notas", <FontAwesome5 name="align-left" size={20} color={colors.primary} />)}
            {renderInput("Sueldo (€)", "sueldo", <FontAwesome5 name="money-bill-wave" size={20} color={colors.primary} />)}
            {renderInput("Localización", "localizacion", <FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} />)}

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
                {renderInput("Mercancía", "mercancia", <FontAwesome5 name="box" size={20} color={colors.primary} />)}
                {renderInput("Peso (kg)", "peso", <FontAwesome5 name="weight" size={20} color={colors.primary} />)}
                {renderInput("Origen", "origen", <FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} />)}
                {renderInput("Destino", "destino", <FontAwesome5 name="map-marker" size={20} color={colors.primary} />)}
                {renderInput("Distancia (km)", "distancia", <FontAwesome5 name="road" size={20} color={colors.primary} />)}
                {renderInput("Inicio", "inicio", <FontAwesome5 name="clock" size={20} color={colors.primary} />, "default", false, false, "AAAA-mm-dd")}
                {renderInput("Fin mínimo", "finMinimo", <FontAwesome5 name="calendar-minus" size={20} color={colors.primary} />, "default", false, false, "AAAA-mm-dd")}
                {renderInput("Fin máximo", "finMaximo", <FontAwesome5 name="calendar-plus" size={20} color={colors.primary} />, "default", false, false, "AAAA-mm-dd")}
              </>
            )}

            {/* Botón de publicación */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteOffer}>
                <Text style={styles.deleteButtonText}>Eliminar Oferta</Text>
              </TouchableOpacity>
            <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
                <Text style={styles.publishButtonText}>Actualizar oferta</Text>
            </TouchableOpacity>

            {/* Modal de éxito */}
            <SuccessModal
              isVisible={successModalVisible}
              onClose={() => setSuccessModalVisible(false)}
                message="¡Tu oferta se actualizó correctamente!"
            />

            </View>

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
  inputContainer: {
    width: "90%",
    marginBottom: 15,
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
  disabledInputContainer: {
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 600,
  },
  upgradeMessage: {
    color: colors.primary,
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
    textDecorationLine: "underline",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },

  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#D14F45",
  },

  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  publishButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#4CAF50",
  },

  publishButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default withNavigationGuard(EditarOfertaScreen);
