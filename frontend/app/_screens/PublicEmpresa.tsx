import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView, Modal, Linking, Alert } from "react-native";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { FontAwesome, FontAwesome5, MaterialIcons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import defaultCompanyLogo from "../../assets/images/defaultCompImg.png"
const { unifyUserData } = require("../../utils/unifyData");
import defaultImage from "../../assets/images/empresa.jpg";
import { useAuth } from "../../contexts/AuthContext";
import BackButton from "../_components/BackButton";
import { startChat } from "../(protected)/chat/services";
import SuccessModal from "../_components/SuccessModal";
import ListadoOfertasPublico from "../_components/ListadoOfertasPublico";
import ResenaModal from "../_components/ResenaModal";
import MapLoader from "@/app/_components/MapLoader";

const PublicEmpresa = ({ userId }) => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const router = useRouter();

  const [empresa, setEmpresa] = useState(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [loadingResenas, setLoadingResenas] = useState<boolean>(true);
  const [loadingOpenOffers, setLoadingOpenOffer] = useState<boolean>(false);

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);
  const [resenaAEliminar, setResenaAEliminar] = useState(null);

  // usuario autenticado
  const { user, userToken } = useAuth();

  const [showResenaModal, setShowResenaModal] = useState(false);
  const [resenaForm, setResenaForm] = useState({ valoracion: 5, comentarios: "" });
  const [resenas, setResenas] = useState([]);
  const [editResenaId, setEditResenaId] = useState(null);
  const [yaEscribioResena, setYaEscribioResena] = useState(false);
  const [fueAsignado, setFueAsignado] = useState(false);
  const [valoracionMedia, setValoracionMedia] = useState<number | null>(null);


  useEffect(() => {
    if (user?.id == userId) {
      if (user.rol == "EMPRESA") {
        router.push("/miperfil");
        return;
      }
    }

    const fetchOpenOffers = async () => {
      try {
        setLoadingOpenOffer(true);
        const response = await axios.get(`${BACKEND_URL}/ofertas/empresa/${userId}`);
        setOffers(response.data.filter((offer: any) => offer.estado === "ABIERTA"));
        if (user && user.rol === 'CAMIONERO') {
          setFueAsignado(response.data.filter((offer: any) => offer.estado === "CERRADA").some((offer: any) => offer.camionero.id === user.id))
        }
      } catch (error) {
        console.error("Error al cargar las ofertas:", error);
      } finally {
        setLoadingOpenOffer(false);
      }
    };

    const fetchUser = async () => {
      try {
        setLoadingUser(true);
        const response = await axios.get(`${BACKEND_URL}/empresas/${userId}`);
        const unifiedData = unifyUserData(response.data)
        setEmpresa(unifiedData);
      } catch (error) {
        console.error("Error al cargar los datos de la empresa:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchOpenOffers();
    fetchUser();
  }, [userId]);

  const fetchResenas = async () => {
    try {
      setLoadingResenas(true);
      const response = await axios.get(`${BACKEND_URL}/resenas/comentado/${empresa?.userId}`);
      setResenas(response.data.sort((a, b) => (b.comentador?.id === user?.userId) - (a.comentador?.id === user?.userId)));

      const yaExiste = response.data.some(res => res.comentador?.id === user?.userId);
      setYaEscribioResena(yaExiste);

      const mediaResponse = await axios.get(`${BACKEND_URL}/usuarios/${empresa?.userId}/valoracion`);
      setValoracionMedia(mediaResponse.data);
    } catch (error) {
      console.error("Error al cargar las reseñas:", error);
    } finally {
      setLoadingResenas(false);
    }
  };

  const handleDeleteReview = async () => {
    try {
      const res = await axios.delete(`${BACKEND_URL}/resenas/${resenaAEliminar}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (res.status === 200 || res.status === 204) {
        fetchResenas();
        setConfirmDeleteModalVisible(false);
        setResenaAEliminar(null);
        // Opcional: mostrar mensaje de éxito
        Alert.alert("Éxito", "La reseña ha sido eliminada correctamente");
      }
    } catch (error) {
      console.error("Error al eliminar reseña:", error);
      Alert.alert("Error", "No se pudo eliminar la reseña. Por favor, inténtalo de nuevo.");
    }
  };

  useEffect(() => {
    if (empresa?.userId) {
      fetchResenas();
    }
  }, [empresa]);

  if (loadingUser || loadingOpenOffers || loadingResenas) return (
    <View style={styles.loadingContainer}>
      <MapLoader />
    </View>
  );

  return (
    <>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.rowContainer}>
              <BackButton />

              {/* Logo de empresa */}
              <View style={styles.profileContainer}>
                <Image
                  source={empresa?.foto ? { uri: `data:image/png;base64,${empresa.foto}` } : defaultImage}
                  style={styles.profileImage}
                />
              </View>
              {/* Información de la empresa */}
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{empresa?.nombre}</Text>
                <Text style={styles.username}>@{empresa?.username}</Text>
                <Text style={styles.info}><MaterialIcons name="email" size={18} color={colors.primary} /> {empresa?.email}</Text>
                <Text style={styles.info}><MaterialIcons name="phone" size={18} color={colors.primary} /> {empresa?.telefono}</Text>
                <Text style={styles.info}><MaterialIcons name="location-pin" size={18} color={colors.primary} /> {empresa?.localizacion}</Text>
                <Text style={styles.description}>{empresa?.descripcion}</Text>
              </View>

              <View style={styles.buttonsWrapper}>
                {/* Botón de contactar a la empresa solo si el user autenticado es camionero */}
                {user && user.rol == "CAMIONERO" && (
                  <View>
                    <TouchableOpacity
                      style={styles.publishButton}
                      onPress={async () => {
                        const chatId = await startChat(user.userId, empresa?.userId);
                        if (chatId) {
                          router.push(`/chat`);
                        }
                      }}
                    >
                      <FontAwesome name="comments" size={16} color="white" style={styles.plusIcon} />
                      <Text style={styles.publishButtonText}>Contactar</Text>
                    </TouchableOpacity>

                  </View>
                )}

              </View>
            </View>
            {/* Separador */}
            <View style={styles.separator} />

            <View style={styles.downContainer}>
              {/* Información empresarial */}
              <Text style={styles.sectionTitle2}>Información Empresarial</Text>
              <Text style={styles.info}>
                <FontAwesome5 name="globe" size={18} color={colors.primary} /> Web:
                {' '}
                <TouchableOpacity onPress={() => Linking.openURL(empresa?.web)}>
                  <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>{empresa?.web}</Text>
                </TouchableOpacity>
              </Text>
            </View>

            <View style={styles.separator} />

            {/* Lista de ofertas de la empresa */}
            <View style={styles.offersContainer}>
              <Text style={styles.sectionTitle}>Ofertas Abiertas</Text>

              <ListadoOfertasPublico offers={offers} showPromoted={true} />

            </View>
            <View style={styles.separator} />

            <View style={styles.reseñasContainer}>
              <Text style={styles.sectionTitle}>Reseñas Recibidas</Text>
              {/* Valoración media con estrellas */}
              <View style={styles.ratingSummary}>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesome
                      key={star}
                      name={valoracionMedia && star <= Math.round(valoracionMedia) ? "star" : "star-o"}
                      size={24}
                      color={colors.primary}
                      style={styles.starIcon}
                    />
                  ))}
                </View>
                <Text style={styles.averageRatingText}>
                  {valoracionMedia ? valoracionMedia.toFixed(1) : '0.0'} / 5.0
                  {resenas.length > 0 && (
                    <Text style={styles.reviewCount}> • {resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'}</Text>
                  )}
                </Text>
              </View>


              {resenas.length === 0 ? (
                <View style={styles.emptyReviews}>
                  <FontAwesome5 name="comment-slash" size={40} color={colors.lightGray} />
                  <Text style={styles.emptyText}>Aún no tienes reseñas</Text>
                </View>
              ) : (
                resenas.map((resena) => (
                  <View key={resena.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      {resena.comentador?.foto ? (
                        <Image
                          source={{ uri: `data:image/png;base64,${resena.comentador.foto}` }}
                          style={styles.reviewAvatar}
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <FontAwesome5 name="user" size={20} color="white" />
                        </View>
                      )}
                      <View>
                        <Text style={styles.reviewAuthor}>{resena.comentador?.nombre}</Text>
                        <Text style={styles.reviewDate}>
                          {new Date(resena.fechaCreacion || Date.now()).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FontAwesome
                          key={star}
                          name={star <= resena.valoracion ? "star" : "star-o"}
                          size={16}
                          color={colors.primary}
                        />
                      ))}
                    </View>

                    <Text style={styles.reviewComment}>{resena.comentarios}</Text>
                    {user?.userId === resena.comentador?.id && (
                      <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 8 }}>

                        <TouchableOpacity
                          onPress={() => {
                            setEditResenaId(resena.id);
                            setShowResenaModal(true);
                          }}
                          style={[styles.button, { marginTop: 8, alignSelf: 'flex-end' }]}
                        >
                          <Text style={styles.buttonText}>Editar reseña</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setResenaAEliminar(resena.id);
                            setConfirmDeleteModalVisible(true);
                          }}
                          style={[
                            styles.button,
                            {
                              marginTop: 8,
                              alignSelf: 'flex-end',
                              backgroundColor: '#D14F45',
                            },
                          ]}
                        >
                          <Text style={styles.buttonText}>Eliminar reseña</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    <ResenaModal
                      visible={showResenaModal}
                      onClose={() => {
                        setShowResenaModal(false);
                        setEditResenaId(null);
                      }}
                      onSubmit={async (data) => {
                        try {
                          const headers = {
                            Authorization: `Bearer ${userToken}`,
                            "Content-Type": "application/json",
                          };

                          if (editResenaId) {
                            const res = await axios.put(`${BACKEND_URL}/resenas/${editResenaId}`, data, { headers });
                            if (res.status === 200) {
                              setSuccessModalVisible(true);
                              setTimeout(() => setSuccessModalVisible(false), 1000);
                              setEditResenaId(null);
                              setShowResenaModal(false);
                              fetchResenas();
                            }
                          } else {
                            const res = await axios.post(`${BACKEND_URL}/resenas`, data, { headers });
                            if (res.status === 201) {
                              setSuccessModalVisible(true);
                              setTimeout(() => setSuccessModalVisible(false), 1000);
                              setShowResenaModal(false);
                              fetchResenas();
                            }
                          }
                        } catch (error) {
                          console.error("Error al enviar reseña:", error);
                          alert("No se pudo enviar la reseña.");
                        }
                      }}
                      comentadorId={user?.userId}
                      comentadoId={empresa?.userId}
                      initialRating={editResenaId ? resena.valoracion : 5}
                      initialComment={editResenaId ? resena.comentarios : ""}
                      isEditing={true}
                    />
                  </View>

                ))
              )}

            </View>
          </View>


          {/* Modal de éxito */}
          <SuccessModal
            isVisible={successModalVisible}
            onClose={() => setSuccessModalVisible(false)}
            message="¡Reseña enviada con exito!"
          />
          <Modal
            visible={confirmDeleteModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setConfirmDeleteModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <MaterialIcons
                    name="warning"
                    size={32}
                    color={colors.red}
                    style={styles.warningIcon}
                  />

                  <Text style={styles.modalTitle}>
                    Confirmar eliminación
                  </Text>

                  <Text style={styles.modalText}>
                    ¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.
                  </Text>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      onPress={() => setConfirmDeleteModalVisible(false)}
                      style={[styles.buttonModal, styles.cancelButton]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleDeleteReview}
                      style={[styles.buttonModal, styles.deleteButton]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
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
    paddingTop: 70,
    minHeight: "90%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    // height: '100%',
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
    borderRadius: 75,
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
  sectionTitle2: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 15,
    textAlign: "left",
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
  }, ratingSummary: {
    alignItems: "center",
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  averageRating: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.secondary,
  },
  reviewCount: {
    fontSize: 16,
    color: colors.mediumGray,
    fontWeight: "400",
  },
  emptyReviews: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: colors.extraLightGray,
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.mediumGray,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  reviewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 13,
    color: colors.mediumGray,
  },
  reviewStars: {
    flexDirection: "row",
    marginBottom: 12,
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.darkGray,
  },
  starIcon: {
    marginHorizontal: 4,
    transitionDuration: '400ms',
  },
  averageRatingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    width: "80%",
    maxWidth: 400,
    minHeight: 220,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  warningIcon: {
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: colors.darkText,
    textAlign: "center"
  },
  modalText: {
    fontSize: 16,
    color: colors.mediumText,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonModal: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
    marginRight: 12,
  },
  deleteButton: {
    backgroundColor: colors.red,
  },
  cancelButtonText: {
    color: colors.black,
    fontWeight: "600",
    fontSize: 16,
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default PublicEmpresa;
