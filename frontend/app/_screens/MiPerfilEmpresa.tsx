import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import colors from "../../assets/styles/colors";
import { useFocusEffect, useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import defaultImage from "../../assets/images/empresa.jpg";
import BackButton from "../_components/BackButton";
import { useSubscriptionRules } from '../../utils/useSubscriptionRules';
import { usePayment } from "../../contexts/PaymentContext";
import { useSubscription } from '@/contexts/SubscriptionContext';
import ListadoOfertasEmpresa from "../_components/ListadoOfertasEmpresa";
import ConfirmDeleteModal from "../_components/ConfirmDeleteModal";
import ErrorModal from "../_components/ErrorModal";
import SuccessModal from "../_components/SuccessModal";

const MiPerfilEmpresa = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const { setId } = usePayment();
  const { user, userToken, logout } = useAuth();
  const router = useRouter();

  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { rules, loading: subscriptionLoading } = useSubscriptionRules();
  const { subscriptionLevel, refreshSubscriptionLevel } = useSubscription();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshSubscriptionLevel();
    }, [])
  );

  const [resenas, setResenas] = useState([]);
  const [valoracionMedia, setValoracionMedia] = useState<number | null>(null);

  useEffect(() => {
    const fetchResenas = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/resenas/comentado/${user.userId}`);
        setResenas(response.data);

        // Obtener valoración media del backend
        const mediaResponse = await axios.get(`${BACKEND_URL}/usuarios/${user.userId}/valoracion`);
        setValoracionMedia(mediaResponse.data);
      } catch (error) {
        console.error("Error al cargar las reseñas o valoración:", error);
      }
    };

    if (user?.id) {
      fetchResenas();
    }
  }, [user]);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/ofertas/empresa/${user.id}`);
      setOffers(response.data.filter((offer: any) => offer.estado === "ABIERTA"));
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

  }

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
            <Text style={styles.sectionTitle2}>Información Empresarial</Text>
            <Text style={styles.info}><FontAwesome5 name="globe" size={18} color={colors.primary} /> Web: {user.web}</Text>
          </View>

          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={() => setShowDeleteModal(true)}
          >
            <MaterialIcons name="delete" size={20} color={colors.white} />
            <Text style={styles.deleteAccountButtonText}>Eliminar Cuenta</Text>
          </TouchableOpacity>

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

          <View style={styles.separator} />

          <View style={styles.reseñasContainer}>
            <Text style={styles.sectionTitle}>Reseñas</Text>
            {resenas.length > 0 ? (
              valoracionMedia !== null && (
                <Text style={{ fontSize: 16, color: colors.primary, textAlign: 'center', marginBottom: 10 }}>
                  ⭐ Valoración media: {valoracionMedia.toFixed(1)} / 5
                </Text>
              )
            ) : (
              <Text style={{ fontSize: 16, color: colors.mediumGray, textAlign: 'center', marginBottom: 10 }}>
                Valoración media: No hay datos suficientes
              </Text>
            )}

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
        </View >
      </View >

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
  verifiedBadgeBasic: {
    marginLeft: 8,
    backgroundColor: 'rgba(192, 192, 192, 0.2)',
    borderRadius: 50,
    padding: 2,
  },
  deleteAccountButton: {
    backgroundColor: colors.red,
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  deleteAccountButtonText: {
    color: colors.white,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default MiPerfilEmpresa;