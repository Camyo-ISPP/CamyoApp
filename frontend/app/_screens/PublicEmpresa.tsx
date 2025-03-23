import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { FontAwesome, FontAwesome5, MaterialIcons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import defaultCompanyLogo from "../../assets/images/defaultCompImg.png"
const { unifyUserData } = require("../../utils");
import defaultImage from "../../assets/images/empresa.jpg";
import { useAuth } from "../../contexts/AuthContext";
import BackButton from "../_components/BackButton";
import { startChat } from "../chat/services";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const PublicEmpresa = ({ userId }) => {
  const router = useRouter();

  // user2 es la empresa
  const [user2, setUser2] = useState(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // usuario autenticado
  const { user } = useAuth();

  const [showResenaModal, setShowResenaModal] = useState(false);
  const [resenaForm, setResenaForm] = useState({ valoracion: 5, comentarios: "" });


  const [resenas, setResenas] = useState([]);


  useEffect(() => {
    // Si el usuario autenticado es la empresa, redirigir a su perfil
    if (user?.id == userId) {
      router.push("/miperfil");
      return;
    }

    const fetchOffers = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/ofertas/empresa/${userId}`);
        setOffers(response.data.filter((offer: any) => offer.estado === "ABIERTA"));
      } catch (error) {
        console.error("Error al cargar las ofertas:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/empresas/${userId}`);
        const unifiedData = unifyUserData(response.data)
        setUser2(unifiedData);
      } catch (error) {
        console.error("Error al cargar los datos de la empresa:", error);
      }
    };

    fetchOffers();
    fetchUser();
  }, [userId]);

  const fetchResenas = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/resenas/comentado/${user2?.userId}`);
      setResenas(response.data);
    } catch (error) {
      console.error("Error al cargar las reseñas:", error);
    }
  };

  useEffect(() => {
    if (user2?.userId) {
      fetchResenas();
    }
  }, [user2]);
  

  return (
    <>

      <Modal visible={showResenaModal} transparent animationType="fade">
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}>
          <View style={{
            width: "85%",
            backgroundColor: colors.white,
            padding: 25,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 10,
          }}>
            <Text style={{
              fontSize: 22,
              fontWeight: "bold",
              color: colors.secondary,
              marginBottom: 15,
              textAlign: "center"
            }}>
              Escribir Reseña
            </Text>

            <Text style={{ fontSize: 16, color: colors.secondary }}>Valoración (0-5)</Text>
            <TextInput
              keyboardType="numeric"
              maxLength={1}
              value={resenaForm.valoracion.toString()}
              onChangeText={(val) =>
                setResenaForm({ ...resenaForm, valoracion: parseInt(val) || 0 })
              }
              style={{
                borderWidth: 1,
                borderColor: colors.mediumGray,
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 8,
                fontSize: 16,
                marginBottom: 15,
                color: colors.secondary
              }}
            />

            <Text style={{ fontSize: 16, color: colors.secondary }}>Comentarios</Text>
            <TextInput
              multiline
              numberOfLines={4}
              value={resenaForm.comentarios}
              onChangeText={(text) =>
                setResenaForm({ ...resenaForm, comentarios: text })
              }
              placeholder="Escribe tu experiencia con esta empresa..."
              placeholderTextColor={colors.mediumGray}
              style={{
                borderWidth: 1,
                borderColor: colors.mediumGray,
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 8,
                fontSize: 16,
                marginBottom: 20,
                color: colors.secondary,
                textAlignVertical: "top"
              }}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  marginRight: 8,
                  backgroundColor: "#D14F45",
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                }}
                onPress={() => setShowResenaModal(false)}
              >
                <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  marginLeft: 8,
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                }}
                onPress={async () => {
                  try {
                    const payload = {
                      valoracion: resenaForm.valoracion,
                      comentarios: resenaForm.comentarios,
                      comentador: { id: user.userId },
                      comentado: { id: user2?.userId },
                    };

                    const headers = {
                      Authorization: `Bearer ${user.token}`, // Usa userToken si lo tienes separado
                      "Content-Type": "application/json",
                    };

                    const res = await axios.post(`${BACKEND_URL}/resenas`, payload, { headers });

                    if (res.status === 201) {
                      alert("¡Reseña enviada con éxito!");
                      setShowResenaModal(false);
                      setResenaForm({ valoracion: 5, comentarios: "" });
                      fetchResenas();
                    }
                  } catch (error) {
                    console.error("Error al enviar reseña:", error);
                    alert("No se pudo enviar la reseña.");
                  }
                }}
              >
                <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.rowContainer}>
              <BackButton />

              {/* Logo de empresa */}
              <View style={styles.profileContainer}>
                <Image
                  source={user2?.foto ? { uri: user2.foto } : defaultImage}
                  style={styles.profileImage}
                />
              </View>
              {/* Información de la empresa */}
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{user2?.nombre}</Text>
                <Text style={styles.username}>@{user2?.username}</Text>
                <Text style={styles.info}><MaterialIcons name="email" size={18} color={colors.primary} /> {user2?.email}</Text>
                <Text style={styles.info}><MaterialIcons name="phone" size={18} color={colors.primary} /> {user2?.telefono}</Text>
                <Text style={styles.info}><MaterialIcons name="location-pin" size={18} color={colors.primary} /> {user2?.localizacion}</Text>
                <Text style={styles.description}>{user2?.descripcion}</Text>
              </View>

              <View style={styles.buttonsWrapper}>
                {/* Botón de contactar a la empresa solo si el user autenticado es camionero */}
                {user && user.rol == "CAMIONERO" && (
                  <View>
                    <TouchableOpacity
                      style={styles.publishButton}
                      onPress={async () => {
                        const chatId = await startChat(user.id, user2?.userId);
                        if (chatId) {
                          router.replace(`/chat?otherUserId=${user2?.userId}`);
                        }
                      }}
                    >
                      <FontAwesome name="comments" size={16} color="white" style={styles.plusIcon} />
                      <Text style={styles.publishButtonText}>Contactar</Text>
                    </TouchableOpacity>
                    {user && user.rol === "CAMIONERO" && (
                      <TouchableOpacity
                        style={[styles.publishButton, { marginTop: 10 }]}
                        onPress={() => setShowResenaModal(true)}
                      >
                        <FontAwesome name="star" size={16} color="white" style={styles.plusIcon} />
                        <Text style={styles.publishButtonText}>Escribir Reseña</Text>
                      </TouchableOpacity>
                    )}

                  </View>
                )}

              </View>
            </View>
            {/* Separador */}
            <View style={styles.separator} />

            <View style={styles.downContainer}>
              {/* Información empresarial */}
              <Text style={styles.sectionTitle}>Información Empresarial</Text>
              <Text style={styles.info}><FontAwesome5 name="globe" size={18} color={colors.primary} /> Web: {user2?.web}</Text>
            </View>

            <View style={styles.separator} />

            {/* Lista de ofertas de la empresa */}
            <View style={styles.offersContainer}>
              <Text style={styles.sectionTitle}>Ofertas Abiertas</Text>
              {offers.length === 0 ? (
                <Text style={styles.info}>No hay ofertas abiertas</Text>
              ) : (
                <ScrollView style={styles.scrollview}>
                  <View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {offers && offers.map((item) => (
                      <View key={item.id} style={styles.card2}>
                        <Image source={defaultCompanyLogo} style={styles.companyLogo} />
                        <View style={{ width: "30%" }}>
                          <Text style={styles.offerTitle}>{item.titulo}</Text>

                          <View style={{ display: "flex", flexDirection: "row" }}>
                            <Text style={styles.offerDetailsTagType}>{item.tipoOferta}</Text>
                            <Text style={styles.offerDetailsTagLicense}>{item.licencia.replace(/_/g, '+')}</Text>
                            <Text style={styles.offerDetailsTagExperience}>{">"}{item.experiencia} años</Text>

                            <View style={{ display: "flex", alignItems: "center", flexDirection: "row" }}>
                              <Text style={styles.localizacion}>|</Text>
                              <MaterialIcons name="location-on" size={20} color="#696969" />
                              <Text style={styles.localizacion}>{item.localizacion}</Text>
                            </View>
                          </View>

                          <Text style={styles.offerInfo}>{item.notas}</Text>

                          <View />
                        </View>
                        <Text style={styles.offerSueldo}>{item.sueldo}€</Text>
                        <TouchableOpacity style={styles.button} onPress={() => router.push(`/oferta/${item.id}`)}>
                          <MaterialCommunityIcons name="eye" size={15} color="white" style={styles.detailsIcon} />
                          <Text style={styles.buttonText}>Ver Detalles</Text>

                        </TouchableOpacity>
                      </View>
                    ))}
                  </View >
                </ScrollView >
              )}
            </View>
            <View style={styles.separator} />

            <View style={styles.reseñasContainer}>
              <Text style={styles.sectionTitle}>Reseñas</Text>

              {resenas.length === 0 ? (
                <Text style={styles.info}>Todavía no tienes reseñas.</Text>
              ) : (
                resenas.map((resena) => (
                  <View key={resena.id} style={styles.reseñaCard}>
                    <Text style={styles.reseñaAutor}>
                      <FontAwesome5 name="user" size={14} color={colors.primary} /> {resena.comentador?.nombre}
                    </Text>
                    <Text style={styles.reseñaValoracion}>⭐ {resena.valoracion}/5</Text>
                    <Text style={styles.reseñaComentario}>{resena.comentarios}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: colors.white,
    marginTop: 20,
    paddingTop: 70,
  },
  card: {
    backgroundColor: colors.white,
    padding: 30,
    borderRadius: 15,
    elevation: 6,
    width: "80%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  buttonsWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    gap: 15,
  },
  publishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  plusIcon: {
    marginRight: 6,
  },
  publishButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  profileContainer: {
    position: "relative",
    marginRight: 40,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: colors.primary,
    marginLeft: 30,
  },
  editIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 10,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.secondary,
  },
  username: {
    fontSize: 18,
    color: colors.darkGray,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 6,
  },
  info: {
    fontSize: 16,
    color: colors.darkGray,
    marginVertical: 4,
  },
  description: {
    fontSize: 15,
    color: colors.darkGray,
    marginTop: 6,
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: colors.mediumGray,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 15,
    textAlign: "center",
  },
  downContainer: {
    paddingHorizontal: 30,
    marginLeft: 30,
  },
  offersContainer: {
    paddingHorizontal: 30,
  },
  companyLogo: {
    height: 90,
    width: 90,
    marginRight: 10,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flexWrap: "wrap",
    marginBottom: 2,
    color: colors.secondary
  },
  offerDate: {
    fontSize: 12,
    color: "gray", flexWrap: "wrap",
  },
  offerDetails: {
    fontSize: 12,
    fontWeight: "bold",
    flexWrap: "wrap",
  },
  offerDetailsTagLicense: {
    fontSize: 9,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    color: colors.white,
    paddingTop: 2,
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 3,
    paddingLeft: 5,
    paddingRight: 6,
    marginRight: 3,
    fontWeight: "bold",
    flexWrap: "wrap",
  },
  offerDetailsTagExperience: {
    fontSize: 9,
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 10,
    color: colors.primary,
    paddingTop: 2,
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 6,
    marginRight: 3,
    fontWeight: "bold",
    flexWrap: "wrap",
  },
  offerDetailsTagType: {
    fontSize: 9,
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: 10,
    paddingTop: 2,
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 6,
    marginRight: 3,
    fontWeight: "700",
    flexWrap: "wrap",
  },
  offerInfo: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
    flexWrap: "wrap",
  },
  offerSueldo: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "right",
    paddingLeft: 3,
    color: colors.secondary,
    textAlignVertical: "center",
    width: "35%",
    alignSelf: "center"
  },
  localizacion: {
    fontSize: 15,
    color: "#696969",
  },
  button: {
    backgroundColor: colors.primary,
    color: colors.white,
    paddingLeft: 5,
    paddingRight: 5,
    marginLeft: "2%",
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "nowrap",
    height: 40,
    width: 150,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold"
  },
  detailsIcon: {
    color: colors.white,
    alignSelf: "center",
    marginLeft: 3,
    marginTop: 3,
    marginRight: 5,
  },
  card2: {
    backgroundColor: colors.white,
    padding: 20,
    marginVertical: 10,
    width: "100%",
    borderRadius: 10,
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    borderLeftWidth: 4,
    borderColor: "red",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reseñasContainer: {
    paddingHorizontal: 30,
    marginTop: 20,
  },
  reseñaCard: {
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reseñaAutor: {
    fontWeight: "bold",
    marginBottom: 5,
    color: colors.secondary,
  },
  reseñaValoracion: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  reseñaComentario: {
    fontSize: 14,
    color: colors.darkGray,
  },
});

export default PublicEmpresa;
