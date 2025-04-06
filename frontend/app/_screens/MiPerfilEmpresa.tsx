import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, TouchableWithoutFeedback, Modal, Alert } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import colors from "../../assets/styles/colors";
import { useFocusEffect, useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons, Feather, MaterialCommunityIcons, AntDesign, FontAwesome } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import defaultCompanyLogo from "../../assets/images/defaultCompImg.png"
import defaultImage from "../../assets/images/empresa.jpg";
import BackButton from "../_components/BackButton";
import { useSubscriptionRules } from '../../utils/useSubscriptionRules';
import { usePayment } from "../../contexts/PaymentContext";
import { useSubscription } from '@/contexts/SubscriptionContext';
import SuccessModal from "../_components/SuccessModal";
import { LinearGradient } from "expo-linear-gradient";
import ResenaModal from "../_components/ResenaModal";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;


const MiPerfilEmpresa = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const { setId } = usePayment();
  const { user, userToken } = useAuth();
  const router = useRouter();

  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { rules, loading: subscriptionLoading } = useSubscriptionRules();
  const { subscriptionLevel, refreshSubscriptionLevel } = useSubscription();
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [camioneros, setCamioneros] = useState([]);
  const [showResenaModal, setShowResenaModal] = useState(false);
  const [camioneroAResenar, setCamioneroAResenar] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  useFocusEffect(
    useCallback(() => {
      refreshSubscriptionLevel();
    }, [])
  );

  const [resenas, setResenas] = useState([]);

  const [valoracionMedia, setValoracionMedia] = useState<number | null>(null);
  const fetchResenas = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/resenas/comentado/${user.userId}`);
      setResenas(response.data);
      console.log("reseñas", response.data)
      const resenasFiltradas = response.data.filter(resena =>
        resena.comentado.id === user.userId
      );
      console.log("reseñas filtradas", resenasFiltradas)
      // Obtener valoración media del backend
      const mediaResponse = await axios.get(`${BACKEND_URL}/usuarios/${user.userId}/valoracion`);
      setValoracionMedia(mediaResponse.data);
    } catch (error) {
      console.error("Error al cargar las reseñas o valoración:", error);
    }
  };
  const handleAddResena = async (resenaData) => {
    try {
      if (!user?.userId || !camioneroAResenar) {
        Alert.alert("Error", "Datos incompletos para publicar la reseña");
        return;
      }

      const response = await axios.post(`${BACKEND_URL}/resenas`, {
        ...resenaData,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.status === 201) {
        Alert.alert("Éxito", "Reseña publicada correctamente");
        await fetchResenas();
        setShowResenaModal(false);
        setCamioneroAResenar(null);
      }
    } catch (error) {
      console.error("Error al publicar reseña:", error);
      let errorMessage = "Error al publicar la reseña";

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          errorMessage = "No tienes ofertas comunes con esta empresa para reseñarla";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      Alert.alert("Error", errorMessage);
    }
  };


  useEffect(() => {

    if (user?.id) {
      fetchResenas();
    }
  }, [user]);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/ofertas/empresa/${user.id}`);
      console.log(response.data)
      setOffers(response.data.filter((offer: any) => offer.estado === "ABIERTA"));
      const camionerosUnicos = response.data.reduce((acc, oferta) => {
        if (oferta.camionero && !acc.some(c => c.id === oferta.camionero.id)) {
          acc.push({
            ...oferta.camionero,
            id: oferta.camionero.id,
            usuario: oferta.camionero.usuario,
          });
        }
        return acc;
      }, []);
      setCamioneros(camionerosUnicos)
      console.log(camionerosUnicos)
    } catch (error) {
      console.error("Error al cargar las ofertas:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    setId("");
  }, [])

  const canCreateNewOffer = () => {
    const activeOffersCount = offers.filter((offer) => offer.estado === 'ABIERTA').length;
    return activeOffersCount < rules.maxActiveOffers;
  };

  const canPromoteNewOffer = () => {
    const activeOffersCount = offers.filter((offer) => offer.estado === 'ABIERTA' && offer.promoted === true).length;
    return activeOffersCount < rules.maxSponsoredOffers;

  }

  const promoteOffer = async (ofertaId: number) => {
    try {
      const url = `${BACKEND_URL}/ofertas/${ofertaId}/patrocinar`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.ok) {
        setSuccessModalVisible(true);
        fetchOffers();

        setTimeout(() => {
          setSuccessModalVisible(false);
        }, 1000);
      }

    } catch (err) {
      console.error("Error completo en promoteOffer:", err);
    }
  };
  const unpromoteOffer = async (ofertaId: number | null) => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/ofertas/${ofertaId}/desactivar-patrocinio`,
        {},
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${userToken}`
          }
        }
      );

      if (response.status === 200) {
        fetchOffers();
        setSelectedOfferId(null);
      }
      setIsModalVisibleCancelar(false);

    } catch (err) {
      console.error("Error en unpromoteOffer:", err);
      if (axios.isAxiosError(err) && err.response) {
        console.error("Detalles del error:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }

    }
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.rowContainer}>
            <BackButton />

            {/* Logo de empresa */}
            <View style={styles.profileContainer}>
              <Image
                source={user.foto ? { uri: `data:image/png;base64,${user.foto}` } : defaultImage}
                style={styles.profileImage}
              />
              {/* Botón de edición */}
              <TouchableOpacity style={styles.editIcon} onPress={() => router.push("/miperfil/editar")}>
                <Feather name="edit-3" size={22} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Información de la empresa */}
            <View style={styles.infoContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.name}>{user.nombre}</Text>
                {subscriptionLevel === 'PREMIUM' && (
                  <View style={styles.verifiedBadgePremium}>
                    <MaterialIcons name="verified" size={20} color="#FFD700" />
                  </View>
                )}
                {subscriptionLevel === 'BASICO' && (
                  <View style={styles.verifiedBadgeBasic}>
                    <MaterialIcons name="verified" size={20} color="#C0C0C0" />
                  </View>
                )}
              </View>
              <Text style={styles.username}>@{user.username}</Text>
              <Text style={styles.info}><MaterialIcons name="email" size={18} color={colors.primary} /> {user.email}</Text>
              <Text style={styles.info}><MaterialIcons name="phone" size={18} color={colors.primary} /> {user.telefono}</Text>
              <Text style={styles.info}><MaterialIcons name="location-pin" size={18} color={colors.primary} /> {user.localizacion}</Text>
              <Text style={styles.description}>{user.descripcion}</Text>
            </View>

            <View style={styles.buttonsWrapper}>

              {/* Botón de publicar nueva oferta */}
              <View>
                <TouchableOpacity
                  style={[styles.publishButton, !canCreateNewOffer() && styles.disabledButton]}
                  onPress={() => {
                    if (canCreateNewOffer()) {
                      router.push(`/oferta/crear`);
                    } else {
                      alert(`Has alcanzado el límite de ofertas abiertas (${rules.maxActiveOffers}).`);
                    }
                  }}
                  disabled={!canCreateNewOffer()}
                >
                  {canCreateNewOffer() &&
                    <FontAwesome5 name="plus" size={16} color="white" style={styles.plusIcon} />
                  }

                  <Text style={styles.publishButtonText}>
                    {canCreateNewOffer() ? 'Publicar Nueva Oferta' : 'Máximo Alcanzado'}
                  </Text>
                </TouchableOpacity>

              </View>


              {/* Botón de mejorar plan */}
              <View>
                {(() => {
                  if (!canCreateNewOffer() && !canPromoteNewOffer()) {
                    return (
                      <Text style={styles.limitMessage}>
                        Has alcanzado tu límite de{'\n'}
                        ofertas abiertas ({rules.maxActiveOffers}) y patrocinadas ({rules.maxSponsoredOffers}).{'\n'}
                        ¿Quieres más opciones?
                      </Text>
                    );
                  } else if (!canCreateNewOffer()) {
                    return (
                      <Text style={styles.limitMessage}>
                        Has alcanzado tu límite de{'\n'}
                        ofertas abiertas ({rules.maxActiveOffers}).{'\n'}
                        ¿Quieres más opciones?
                      </Text>
                    );
                  } else if (!canPromoteNewOffer()) {
                    return (
                      <Text style={styles.limitMessage}>
                        Has alcanzado tu límite de{'\n'}
                        ofertas patrocinadas ({rules.maxSponsoredOffers}).{'\n'}
                        ¿Quieres más opciones?
                      </Text>
                    );
                  }
                  return null;
                })()}


                <TouchableOpacity
                  style={styles.mejorarPlanButton}
                  onPress={() => router.push(`/suscripcion`)}
                >
                  <FontAwesome5 name="rocket" size={16} color="white" style={styles.plusIcon} />
                  <Text style={styles.publishButtonText}>Mejora tu plan aquí</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Separador */}
          <View style={styles.separator} />

          <View style={styles.downContainer}>
            {/* Información empresarial */}
            <Text style={styles.sectionTitle}>Información Empresarial</Text>
            <Text style={styles.info}><FontAwesome5 name="globe" size={18} color={colors.primary} /> Web: {user.web}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.offersContainer}>
            <Text style={styles.sectionTitle}>Ofertas Activas</Text>
            <ListadoOfertasEmpresa
              offers={offers}
              canPromoteNewOffer={canPromoteNewOffer}
              canCancelPromotedOffer={true}
              fetchOffers={fetchOffers}
            />
          </View>
          {/* Separador */}
          <View style={styles.separator} />
          <View style={styles.camionerosSection}>
            <Text style={styles.sectionTitle}>Camioneros Recientes</Text>
            <View style={{ flexDirection: "row", gap: 7 }}>

              {camioneros.length === 0 ? (
                <Text style={styles.emptyMessage}>No has trabajado con camioneros recientemente</Text>
              ) : (
                camioneros.map(camionero => (
                  <View key={`camionero-${camionero.id}`} style={styles.camioneroCard}>
                    {/* Header con imagen y nombre */}
                    <View style={styles.camioneroHeader}>
                      {camionero.usuario?.foto ? (
                        <Image
                          source={{ uri: `data:image/png;base64,${camionero.usuario.foto}` }}
                          style={styles.camioneroAvatar}
                        />
                      ) : (
                        <View style={styles.camioneroAvatarPlaceholder}>
                          <FontAwesome5 name="truck" size={20} color={colors.white} />
                        </View>
                      )}
                      <View style={styles.camioneroInfo}>
                        <Text style={styles.camioneroNombre}>{camionero.usuario?.nombre}</Text>
                        <Text style={styles.camioneroUbicación}>
                          <MaterialIcons name="location-on" size={14} color={colors.secondary} />
                          {camionero.usuario?.localizacion || 'Ubicación no disponible'}
                        </Text>

                      </View>
                    </View>
                    <View style={styles.valoracionSection}>
                      <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={`star-${star}`}
                            onPress={() => {
                              setCamioneroAResenar(camionero);
                              setShowResenaModal(true);
                            }}
                            onPressIn={() => setHoverRating(star)}
                            onPressOut={() => setHoverRating(0)}
                            activeOpacity={1}
                          >
                            <FontAwesome
                              name={star <= hoverRating ? "star" : "star-o"}
                              size={27}
                              color={star <= hoverRating ? colors.primary : colors.primaryLight}
                              style={styles.starIcon}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>


                    {/* Botones de acción */}
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity
                        style={styles.fullWidthButton}
                        onPress={() => router.push(`/camionero/${camionero.id}`)}
                      >
                        <FontAwesome5 name="user" size={14} color={colors.white} />
                        <Text style={styles.actionButtonText}>Ver perfil</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.reviewsContainer}>
            <Text style={styles.sectionTitle}>Reseñas de tus camioneros</Text>

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

            {/* Lista de reseñas */}
            {resenas.length === 0 ? (
              <View style={styles.emptyReviews}>
                <FontAwesome5 name="comment-slash" size={40} color={colors.lightGray} />
                <Text style={styles.emptyText}>Aún no tienes reseñas</Text>
              </View>
            ) : (
              <>
                {resenas.map((resena) => (
                  <View key={resena.id} style={styles.reviewCard}>
                    {/* Encabezado con avatar y nombre */}
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

                    {/* Valoración con estrellas */}
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

                    {/* Comentario */}
                    <Text style={styles.reviewComment}>{resena.comentarios}</Text>

                    {/* Divider */}
                    <View style={styles.reviewDivider} />
                  </View>
                ))}
              </>
            )}
          </View>
        </View >
      </View >
      {/* Modal para añadir reseñas */}
      <ResenaModal
        visible={showResenaModal}
        onClose={() => {
          setShowResenaModal(false);
          setCamioneroAResenar(null);
        }}
        onSubmit={handleAddResena}
        comentadorId={user?.userId}
        comentadoId={camioneroAResenar?.usuario?.id}
      />
    </ScrollView >
  );
};

const styles = StyleSheet.create({
  offersContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 15,
    textAlign: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingTop: 70,
    minHeight: "100%",
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
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  profileContainer: {
    position: "relative",
    marginRight: 40,
    alignItems: "center",
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
    color: colors.mediumGray,
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
    textAlign: "center",
    color: colors.secondary,
    marginBottom: 15,
    textAlign: "center",
  },
  downContainer: {
    paddingHorizontal: 30,
    marginLeft: 30,
  },
  companyLogo: {
    height: 120,
    width: 120,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  plusIcon: {
    marginRight: 6,
  },
  publishButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  mejorarPlanButton: {
    backgroundColor: '#0993A8FF',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitMessage: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: colors.mediumGray,
    marginVertical: 20,
  },
  downContainer: {
    paddingHorizontal: 30,
    marginLeft: 30,
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
  verifiedBadgePremium: {
    marginLeft: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 50,
    padding: 2,
  },
  offersContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  noOffersText: {
    textAlign: 'center',
    color: colors.mediumGray,
    marginVertical: 20,
    fontSize: 16,
  },
  offersList: {
    width: '100%',
  },
  offerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  promotedOfferCard: {
    borderLeftColor: colors.secondary,
    backgroundColor: '#F8F9FF',
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerTitleContainer: {
    flex: 1,
  },
  offerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerLocation: {
    fontSize: 14,
    color: colors.mediumGray,
    marginLeft: 4,
  },
  offerSalary: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.secondary,
  },
  offerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  offerTagType: {
    backgroundColor: colors.primary,
    color: colors.white,
    paddingHorizontal: 10,
    display: "flex",
    flexDirection: "row",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  offerTagLicense: {
    backgroundColor: colors.secondary,
    color: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  offerTagExperience: {
    borderWidth: 1,
    borderColor: colors.primary,
    color: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  offerDescription: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  offerActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    width: 150,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  promoteButton: {
    backgroundColor: '#D4AF37',
  },
  unpromoteButton: {
    backgroundColor: colors.red,
  },
  detailsButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    textAlign: "left",
    fontWeight: '500',
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: '#F5F7FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  offerCompany: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  promotedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  promotedText: {
    color: '#D4A017',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  offerContent: {
    paddingHorizontal: 5,
  },
  offerMainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  offerPosition: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 5,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  offerDetails: {
    marginTop: 12,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 9,
    color: colors.white,
    fontWeight: 700,
    marginRight: 10,
    marginLeft: 4,
  },
  // Estilos del Modal
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  }, camioneroInfo: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
  },
  camioneroAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  }, actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  }, camioneroCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.lightGray,
    position: 'relative',
    paddingBottom: 60,
  },
  camioneroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  camioneroAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  camioneroNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
  },
  camioneroUbicación: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
  }, fullWidthButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }, valoracionSection: {
    marginBottom: 16,
  },
  valoracionTitle: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starIcon: {
    marginHorizontal: 4,
    transitionDuration: '400ms',
  }, camionerosSection: {
    marginTop: 25,
    width: "50%",
    paddingHorizontal: 15,
  },
  reviewsContainer: {
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 30,
  },
  ratingSummary: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 25,
  },
  averageRatingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
  },
  reviewCount: {
    fontSize: 16,
    color: colors.mediumGray,
    fontWeight: '400',
  },
  emptyReviews: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: colors.extraLightGray,
    borderRadius: 12,
    marginTop: 10,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.mediumGray,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 13,
    color: colors.mediumGray,
  },
  reviewStars: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.darkGray,
    marginBottom: 15,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: colors.extraLightGray,
    marginHorizontal: -20,
  },

});


export default MiPerfilEmpresa;