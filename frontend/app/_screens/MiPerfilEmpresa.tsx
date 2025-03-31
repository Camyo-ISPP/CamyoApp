import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, TouchableWithoutFeedback, Modal } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import colors from "../../assets/styles/colors";
import { useFocusEffect, useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons, Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
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

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;


// queda arreglar pk no va el delete offer que sale server 500 y añadir patrocinado
const MiPerfilEmpresa = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const { setId } = usePayment();
  const { user, userToken } = useAuth();
  const router = useRouter();

  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { rules, loading: subscriptionLoading } = useSubscriptionRules();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const { refreshSubscriptionLevel } = useSubscription();
  const [isModalVisibleCancelar, setIsModalVisibleCancelar] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);

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
              <Text style={styles.name}>{user.nombre}</Text>
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
            {offers.length === 0 ? (
              <Text style={styles.noOffersText}>No hay ofertas activas en este momento</Text>
            ) : (
              <View style={styles.offersList}>
                {offers.map((item: any) => (
                  <View key={item.id} style={[
                    styles.offerCard
                  ]}>
                    {/* Encabezado con estado de patrocinio */}


                    {/* Contenido principal */}
                    <View style={styles.offerContent}>
                      <View style={styles.offerHeader}>
                        <Image source={defaultCompanyLogo} style={styles.companyLogo} />
                        <View style={styles.offerMainInfo}>
                          <Text style={styles.offerPosition}>{item.titulo}</Text>
                          <View style={styles.companyInfo}>
                            <FontAwesome5 name="building" size={14} color={colors.primary} />
                            <Text style={{ ...styles.companyName, fontSize: 15, fontWeight: 700 }}>{user.nombre}</Text>
                            <Text style={{ color: colors.secondary }}>  |  </Text>
                            <MaterialIcons name="location-on" size={16} color={colors.secondary} />
                            <Text style={{ ...styles.detailText, color: colors.secondary, fontSize: 15 }}>{item.localizacion}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <View style={styles.offerDetailsTagType}>
                              <MaterialIcons name="work-outline" size={12} color={colors.white} />
                              <Text style={styles.detailText}>{item.tipoOferta}</Text>
                            </View>
                            <View style={styles.offerDetailsTagLicense}>
                              <AntDesign name="idcard" size={12} color={colors.white} />
                              <Text style={styles.detailText}>{item.licencia.replace(/_/g, '+')}</Text>
                            </View>
                            <View style={styles.offerDetailsTagExperience}>
                              <MaterialIcons name="timelapse" size={12} color={colors.white} />
                              <Text style={styles.detailText}>{'>' + item.experiencia} años</Text>
                            </View>
                          </View>

                        </View>
                        <View style={{ display: "flex", alignItems: "flex-end" }}>
                          {item.promoted && (
                            <View style={styles.promotedBadge}>
                              <AntDesign name="star" size={14} color="#FFD700" />
                              <Text style={styles.promotedText}>PATROCINADA</Text>
                            </View>
                          )}
                          <View style={{ display: "flex", flexDirection: "row", gap: 30, alignItems: "center" }}>
                            <Text style={styles.offerSalary}>{item.sueldo}€</Text>
                            <View style={styles.offerActions}>
                              {
                                item.promoted ? (
                                  <TouchableOpacity
                                    style={[styles.actionButton, styles.unpromoteButton]}
                                    onPress={() => {setIsModalVisibleCancelar(true); setSelectedOfferId(item.id)}}
                                  >
                                    <AntDesign name="closecircleo" size={14} color={colors.white} style={{ paddingRight: 19 }} />
                                    <Text style={styles.actionButtonText}>Cancelar</Text>
                                  </TouchableOpacity>
                                ) : canPromoteNewOffer() ? (
                                  <TouchableOpacity
                                    style={[styles.actionButton,]}
                                    onPress={() => promoteOffer(item.id)}
                                  >

                                    <LinearGradient
                                      colors={['#D4AF37', '#F0C674', '#B8860B', '#F0C674']}
                                      start={{ x: 0, y: 0 }}
                                      end={{ x: 1, y: 1 }}
                                      style={[styles.actionButton]}
                                    >
                                      <AntDesign name="star" size={14} color={colors.white} style={{ paddingRight: 9 }} />
                                      <Text style={styles.actionButtonText}>Patrocinar</Text>

                                    </LinearGradient>
                                  </TouchableOpacity>

                                ) : null}
                              <SuccessModal
                                isVisible={successModalVisible}
                                onClose={() => setSuccessModalVisible(false)}
                                message="¡Oferta patrocinada con éxito!"
                              />
                              <Modal
                                animationType="fade"
                                transparent={true}
                                visible={isModalVisibleCancelar}
                                onRequestClose={() => setIsModalVisibleCancelar(false)}
                              >
                                <TouchableWithoutFeedback onPress={() => setIsModalVisibleCancelar(false)}>
                                  <View style={styles.modalBackground}>
                                    <TouchableWithoutFeedback>
                                      <View style={styles.modalContainer}>
                                        <Text style={styles.modalText}>¿Estás seguro/a de que quieres dejar de patrocinar la oferta?</Text>
                                        <View style={styles.modalButtons}>
                                          <TouchableOpacity onPress={() => setIsModalVisibleCancelar(false)} style={styles.modalButton}>
                                            <Text style={styles.modalButtonText}>Cancelar</Text>
                                          </TouchableOpacity>
                                          <TouchableOpacity onPress={() => unpromoteOffer(selectedOfferId)} style={styles.modalButton}>
                                            <Text style={styles.modalButtonText}>Confirmar</Text>
                                          </TouchableOpacity>
                                        </View>
                                      </View>
                                    </TouchableWithoutFeedback>
                                  </View>
                                </TouchableWithoutFeedback>
                              </Modal>

                              <TouchableOpacity
                                style={[styles.actionButton, styles.detailsButton]}
                                onPress={() => router.push(`/oferta/${item.id}`)}
                              >
                                <MaterialCommunityIcons name="eye-outline" size={14} color={colors.white} />
                                <Text style={styles.actionButtonText}>Ver detalles</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>



                    </View>


                  </View>
                ))}
              </View>
            )}
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
    </ScrollView >
  );
};

const styles = StyleSheet.create({
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
  mejorarPlanButton: {
    backgroundColor: '#0993A8FF',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    marginRight: 6,
  },
  publishButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
  },
  offerDetailsTagLicense: {
    backgroundColor: colors.primary,
    display: "flex",
    flexDirection: "row",
    color: colors.white,
    borderRadius: 10,
    paddingTop: 2,
    alignItems: "center",
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 2,
    paddingLeft: 5,
    marginRight: 5,
  },
  offerDetailsTagExperience: {
    backgroundColor: colors.green,
    display: "flex",
    flexDirection: "row",
    color: colors.white,
    borderRadius: 10,
    paddingTop: 2,
    alignItems: "center",
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 2,
    paddingLeft: 5,
    marginRight: 5,
  },
  offerDetailsTagType: {
    backgroundColor: colors.secondary,
    display: "flex",
    flexDirection: "row",
    color: colors.white,
    borderRadius: 10,
    paddingTop: 2,
    textAlign: "center",
    textAlignVertical: "center",
    paddingBottom: 2,
    paddingLeft: 5,
    marginRight: 5,
  },
  offerInfo: {
    fontSize: 12,
    color: colors.secondary,
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
  upgradeMessage: {
    color: colors.primary,
    marginTop: 1,
    textAlign: "left",
    textDecorationLine: "underline",
  },
  editButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  limitMessage: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
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
  }, offersContainer: {
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
    fontSize: 20,
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
    paddingVertical: 4,
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  promoteButton: {
    backgroundColor: colors.secondary,
  },
  unpromoteButton: {
    backgroundColor: '#6c757d',
  },
  detailsButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
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
  }, promotedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 10,
    alignSelf: 'flex-start',
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
    backgroundColor: '#F5F7FF',
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
    fontSize: 13,
    color: colors.darkGray,
    marginRight: 15,
    marginLeft: 4,
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
    width: 150, // Ancho fijo para todos los botones
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
  },
});


export default MiPerfilEmpresa;


