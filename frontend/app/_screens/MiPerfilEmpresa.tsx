import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking, Dimensions } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import colors from "../../assets/styles/colors";
import { useFocusEffect, useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons, Feather, FontAwesome } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import defaultImage from "../../assets/images/empresa.jpg";
import BackButton from "../_components/BackButton";
import { useSubscriptionRules } from '../../utils/useSubscriptionRules';
import { usePayment } from "../../contexts/PaymentContext";
import { useSubscription } from '@/contexts/SubscriptionContext';
import ListadoOfertasEmpresa from "../_components/ListadoOfertasEmpresa";
import ResenaModal from "../_components/ResenaModal";
import ConfirmDeleteModal from "../_components/ConfirmDeleteModal";
import ErrorModal from "../_components/ErrorModal";
import SuccessModal from "../_components/SuccessModal";
import DraftModal from "../_components/DraftModal";
import MapLoader from "@/app/_components/MapLoader";
import { set } from "date-fns";

const windowWidth = Dimensions.get('window').width;

const MiPerfilEmpresa = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const { setId } = usePayment();
  const { user, userToken, logout } = useAuth();
  const router = useRouter();

  const [offers, setOffers] = useState<any[]>([]);
  const { rules, loading: subscriptionLoading } = useSubscriptionRules();
  const [camioneros, setCamioneros] = useState([]);
  const [showResenaModal, setShowResenaModal] = useState(false);
  const [camioneroAResenar, setCamioneroAResenar] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [resenas, setResenas] = useState([]);
  const [valoracionMedia, setValoracionMedia] = useState<number | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  //const [isModalVisibleCancelar, setIsModalVisibleCancelar] = useState(false);
  const { subscriptionLevel, refreshSubscriptionLevel } = useSubscription();
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]); const [resenados, setResenados] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [successDeleteAccModalVisible, setSuccessDeleteAccModalVisible] = useState(false);
  const [showDraftsChoiceModal, setShowDraftsChoiceModal] = useState(false);

  const [loadingResenas, setLoadingResenas] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState<boolean>(false);
  const [loadingCamionerosResenados, setLoadingCamionerosResenados] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshSubscriptionLevel();
      fetchOffers();
      fetchCamionerosResenados();
    }, [])
  );

  useEffect(() => {
    if (user?.id) {
      fetchResenas();
    }
  }, [user]);
  

  const fetchResenas = async () => {
    try {
      setLoadingResenas(true);
      const response = await axios.get(`${BACKEND_URL}/resenas/comentado/${user.userId}`);
      setResenas(response.data);
      const resenasFiltradas = response.data.filter(resena =>
        resena.comentado.id === user.userId

      );
      const mediaResponse = await axios.get(`${BACKEND_URL}/usuarios/${user.userId}/valoracion`);
      setValoracionMedia(mediaResponse.data);
    } catch (error) {
      console.error("Error al cargar las reseñas o valoración:", error);
    } finally {
      setLoadingResenas(false);
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
  const fetchCamionerosResenados = async () => {
    try {
      setLoadingCamionerosResenados(true);
      const response = await axios.get(`${BACKEND_URL}/resenas/resenados/${user.userId}`);
      const ids = response.data.map(camionero => camionero.id);
      setResenados(ids)
    } catch (error) {
      console.error("Error al obtener los camioneros reseñados:", error);
      return [];
    } finally {
      setLoadingCamionerosResenados(false);
    }
  }

  const fetchOffers = async () => {
    try {
      setLoadingOffers(true);
      const response = await axios.get(`${BACKEND_URL}/ofertas/empresa/${user.id}`);
      const ofertasCerradas = response.data.filter((offer: any) => offer.estado === "CERRADA");
      setOffers(response.data.filter((offer: any) => offer.estado === "ABIERTA"));

      const camionerosUnicos = ofertasCerradas.reduce((acc, oferta) => {
        if (oferta.camionero && !acc.some(c => c.id === oferta.camionero.id)) {
          acc.push({
            ...oferta.camionero,
            id: oferta.camionero.id,
            usuario: oferta.camionero.usuario,
            userId: oferta.camionero.usuario.id
          });
        }
        return acc;
      }, []);

      setCamioneros(camionerosUnicos)
      setDrafts(response.data.filter((offer: any) => offer.estado === "BORRADOR"));
    } catch (error) {
      console.error("Error al cargar las ofertas:", error);
    } finally {
      setLoadingOffers(false);
    }
  };
  useEffect(() => {
    fetchOffers();
    fetchCamionerosResenados();
  }, []);

  useEffect(() => {
    // If the user goes to the checkout page, does not subscribe and clicks on their profile, 
    // the subscription they wanted will remain saved.
    // This will reset the subscription ID chosen.
    setId("");
  }, [])

  const canCreateNewOffer = () => {
    const activeOffersCount = offers.filter((offer) => offer.estado === 'ABIERTA').length;
    return activeOffersCount < rules.maxActiveOffers;
  };

  const canPromoteNewOffer = () => {
    const activeOffersCount = offers.filter((offer) => offer.estado === 'ABIERTA' && offer.promoted === true).length;
    return activeOffersCount < rules.maxSponsoredOffers;
  };

  const handleRemoveAds = () => {
    setId("ELIMINAR_ANUNCIOS");
    router.push("/pago/checkout");
  }
  const handleSubmitResenaWrapper = async (resenaData: any) => {
    try {
      await handleAddResena(resenaData);
      await fetchOffers();
      await fetchCamionerosResenados();
      setShowResenaModal(false);
      setCamioneroAResenar(null);
    } catch (error) {
      console.error("Error en el proceso completo:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/usuarios/${user.userId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.status === 200) {
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          logout();
        }, 2500);
      }

    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      setErrorModalVisible(true);
      setTimeout(() => {
        setErrorModalVisible(false);
      }, 2500);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handlePublishButtonPress = () => {
    if (!canCreateNewOffer()) {
      alert(`Has alcanzado el límite de ofertas abiertas (${rules.maxActiveOffers}).`);
      return;
    }

    if (drafts.length > 0) {
      setShowDraftsChoiceModal(true);
    } else {
      router.push(`/oferta/crear`);
    }
  };

  const handleViewDrafts = () => {
    setShowDraftsChoiceModal(false);

    router.push({ pathname: "/misofertas", params: { tab: "BORRADOR" } });
  };
  const handleCreateNew = () => {
    setShowDraftsChoiceModal(false);
    router.push(`/oferta/crear`);
  };

  const getUpgradeMessage = () => {
    if (!canCreateNewOffer() && !canPromoteNewOffer()) {
      return "Límite de ofertas activas y patrocinadas alcanzado";
    } else if (!canPromoteNewOffer()) {
      return "Límite de ofertas patrocinadas alcanzado";
    } else if (!canCreateNewOffer()) {
      return "Límite de ofertas activas alcanzado";
    }
    return null;
  };
  const upgradeMessage = getUpgradeMessage();

  return (
    loadingResenas || loadingOffers || loadingCamionerosResenados ? (
      <View style={styles.loadingContainer}>
        <MapLoader />
      </View>
    ) : (
    <ScrollView>
      <View style={styles.pageContainer}>
        {/* Left Ad */}
        {(user?.ads &&
          <View style={styles.adContainer}>
            <Image
              source={require("../../assets/images/truck_mockup_ad.jpg")} // Replace with your ad image path
              style={styles.adImage}
              resizeMode="cover"
            />
          </View>
        )}
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.rowContainer}>
              <BackButton />

              <View>
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

                {/* Botón de eliminar cuenta */}
                <TouchableOpacity
                  style={styles.deleteAccountButton}
                  onPress={() => setShowDeleteModal(true)}
                >
                  <MaterialIcons name="delete" size={20} color={colors.white} />
                  <Text style={styles.deleteAccountButtonText}>Eliminar Cuenta</Text>
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
                {canCreateNewOffer() &&
                  <View>
                    <TouchableOpacity
                      style={styles.publishButton}
                      onPress={handlePublishButtonPress}
                      disabled={!canCreateNewOffer()}
                    >
                      <FontAwesome5 name="plus" size={16} color="white" style={styles.plusIcon} />
                      <Text style={styles.publishButtonText}>Publicar Nueva Oferta</Text>
                    </TouchableOpacity>
                  </View>
                }

                {/* Botón de mejorar plan */}
                <View>
                  {upgradeMessage && (
                    <View style={styles.upgradeCard}>
                      <View style={styles.upgradeHeader}>
                        <MaterialIcons name="error-outline" size={24} color={colors.primary} />
                        <Text style={styles.upgradeTitle}>{upgradeMessage}</Text>
                      </View>
                    </View>
                  )}
                <View style={styles.upgradeButtonContainer}>
                  <TouchableOpacity
                    style={styles.mejorarPlanButton}
                    onPress={() => router.push(`/suscripcion`)}
                  >
                    <FontAwesome5 name="crown" size={16} color="white" />
                    <Text style={styles.upgradeButtonText}>
                      {!canCreateNewOffer() || !canPromoteNewOffer() ? "Mejora tu plan aquí" : "Gestiona tu plan aquí"}
                    </Text>
                  </TouchableOpacity>
                </View>
                </View>
              </View>

              {/* Botón de eliminar anuncios */}
              {user?.ads &&
                <View>
                  <TouchableOpacity
                    style={styles.anunciosButton}
                    onPress={handleRemoveAds}
                  >
                    <FontAwesome5 name="ban" size={16} color="white" style={styles.plusIcon} />
                    <Text style={styles.publishButtonText}>Eliminar anuncios</Text>
                  </TouchableOpacity>
                </View>
              }
            </View>


            {/* Separador */}
            <View style={styles.separator} />

            <View style={styles.downContainer}>
              {/* Información empresarial */}
              <Text style={styles.sectionTitle2}>Información Empresarial</Text>
              <Text style={styles.info}>
                <FontAwesome5 name="globe" size={18} color={colors.primary} /> Web:
                {' '}
                <TouchableOpacity onPress={() => Linking.openURL(user.web)}>
                  <Text style={{ color: colors.secondary, textDecorationLine: 'underline' }}>{user.web}</Text>
                </TouchableOpacity>
              </Text>
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
            {/* Recent Truckers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Camioneros Recientes</Text>
              {camioneros.filter(camionero => !(resenados.includes(camionero.userId))).length === 0 ? (
                <Text style={styles.emptyMessage}>No has trabajado con camioneros recientemente</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {camioneros
                    .filter(camionero => !(resenados.includes(camionero.userId)))
                    .map(camionero => (
                      <View key={`camionero-${camionero.id}`} style={styles.personCard}>
                        <View style={styles.personHeader}>
                          {camionero.usuario?.foto ? (
                            <Image
                              source={{ uri: `data:image/png;base64,${camionero.usuario.foto}` }}
                              style={styles.personAvatar}
                            />
                          ) : (
                            <View style={styles.personAvatarPlaceholder}>
                              <FontAwesome5 name="truck" size={20} color={colors.white} />
                            </View>
                          )}
                          <View style={styles.personInfo}>
                            <Text style={styles.personName}>{camionero.usuario?.nombre}</Text>
                            <View style={styles.locationRow}>
                              <MaterialIcons name="location-on" size={14} color={colors.secondary} />
                              <Text style={styles.locationText}>{camionero.usuario?.localizacion || 'Ubicación no disponible'}</Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.ratingContainer}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                              key={`star-${star}`}
                              onPress={() => {
                                setSelectedRating(star); // Guarda la estrella seleccionada
                                setCamioneroAResenar(camionero);
                                setShowResenaModal(true);
                              }}
                              onPressIn={() => setHoverRating(star)}
                              onPressOut={() => setHoverRating(0)}
                              activeOpacity={1}
                            >
                              <FontAwesome
                                name={
                                  star <= (hoverRating || selectedRating) // Muestra rellena si está en hover O seleccionada
                                    ? "star"
                                    : "star-o"
                                }
                                size={24}
                                color={
                                  star <= (hoverRating || selectedRating)
                                    ? colors.primary
                                    : colors.primaryLight
                                }
                              />
                            </TouchableOpacity>
                          ))}
                        </View>

                        <TouchableOpacity
                          style={styles.profileButton}
                          onPress={() => router.push(`/camionero/${camionero.id}`)}
                        >
                          <FontAwesome5 name="user" size={14} color={colors.white} />
                          <Text style={styles.profileButtonText}>Ver perfil</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                </ScrollView>
              )}

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

                    </View>
                  ))
                )}
              </View>
            </View >
          </View >
        </View >

        {/* Modals */}
        <ResenaModal
          visible={showResenaModal}
          onClose={() => {
            setShowResenaModal(false);
            setCamioneroAResenar(null);
            setSelectedRating(false);

          }}
          initialRating={selectedRating}
          onSubmit={handleSubmitResenaWrapper}
          comentadorId={user?.userId}
          comentadoId={camioneroAResenar?.usuario?.id}
          isEditing={false}
        />

        <ConfirmDeleteModal
          isVisible={showDeleteModal}
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          message="Esta acción eliminará permanentemente tu cuenta y todos tus datos asociados. ¿Deseas continuar?"
        />

        <ErrorModal
          isVisible={errorModalVisible}
          message="No se pudo eliminar la cuenta. Por favor, inténtalo de nuevo más tarde."
        />

        <SuccessModal
          isVisible={successModalVisible}
          onClose={() => setSuccessModalVisible(false)}
          message="¡Tu cuenta se ha eliminado correctamente, te echaremos de menos!"
        />
        <DraftModal
          isVisible={showDraftsChoiceModal}
          onClose={() => setShowDraftsChoiceModal(false)}
          onViewDrafts={handleViewDrafts}
          onCreateNew={handleCreateNew}
        />
        {/* Right Ad */}
        { (user?.ads &&
          <View style={styles.adContainer}>
            <Image
              source={require("../../assets/images/truck_mockup_ad.jpg")} // Replace with your ad image path
              style={styles.adImage}
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    </ScrollView >
  )
);
};

const styles = StyleSheet.create({
  offersContainer: {
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    minHeight: "100%",
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
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: 40,
    minHeight: "100%",
  },
  card: {
    backgroundColor: colors.white,
    padding: 30,
    borderRadius: 15,
    elevation: 6,
    width: windowWidth < 1400 ? '90%' : '80%',
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
  buttonsWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    gap: 10,
    maxWidth: windowWidth < 1400 ? 300 : 500,
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
    fontSize: 16,
    fontWeight: "bold",
  },
  upgradeButtonContainer: {
    width: 250,
    minWidth: 250,
  },
  mejorarPlanButton: {
    backgroundColor: '#0993A8FF',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  anunciosButton: {
    backgroundColor: '#0993A8FF',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginRight:10,
  },
  upgradeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    padding: 2,
    borderRadius: 8,
  },
  upgradeTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  upgradeButtonText: {
    color: colors.white,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: colors.mediumGray,
    marginVertical: 55,
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
  verifiedBadgeBasic: {
    marginLeft: 8,
    backgroundColor: 'rgba(192, 192, 192, 0.2)',
    borderRadius: 50,
    padding: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
  },

  actionsContainer: {
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  upgradePrompt: {
    backgroundColor: colors.extraLightGray,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  emptyMessage: {
    textAlign: "center",
    color: colors.mediumGray,
    fontSize: 16,
    marginVertical: 20,
    fontStyle: "italic",
  },
  offersList: {
    marginTop: 10,
  },
  offerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  promotedOfferCard: {
    borderLeftColor: colors.gold,
    backgroundColor: colors.extraLightPrimary,
  },
  offerHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  offerContent: {
    flex: 1,
  },
  offerPosition: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 5,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  companyName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: colors.secondary,
    marginLeft: 5,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: colors.white,
    marginLeft: 4,
  },
  offerRightSection: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  promotedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGold,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  promotedText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  offerSalary: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.secondary,
  },
  offerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  offerActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  promoteButton: {
    backgroundColor: colors.gold,
  },
  unpromoteButton: {
    backgroundColor: colors.red,
  },
  detailsButton: {
    backgroundColor: colors.primary,
  },
  offerActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  personCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    width: 200,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  personHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  personAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  personAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 6,
  },
  profileButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  ratingSummary: {
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
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 120,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  draftMessageText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: "center",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  deleteAccountButton: {
    backgroundColor: colors.red,
    padding: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#d32f2f",
    width: '70%',
    maxWidth: 250,
    alignSelf: "center",
  },
  deleteAccountButtonText: {
    color: colors.white,
    fontWeight: "600",
    marginLeft: 5,
    fontSize: 14,
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
  pageContainer: {
    flexDirection: "row", // Arrange ads and main content in a row
    justifyContent: "space-between", // Space between ads and main content
    alignItems: "flex-start", // Align items at the top
    backgroundColor: colors.white,
    paddingHorizontal: 10, // Add padding on both sides
  },
  adContainer: {
    width: "10%", // Adjust width of the ad container
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  adImage: {
    width: "100%",
    height: "100%", // Adjust height as needed
    borderRadius: 10,
  },
});

export default MiPerfilEmpresa;