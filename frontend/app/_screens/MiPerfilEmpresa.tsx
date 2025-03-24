import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import colors from "../../assets/styles/colors";
import { useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import defaultCompanyLogo from "../../assets/images/defaultCompImg.png"
import defaultImage from "../../assets/images/empresa.jpg";
import BackButton from "../_components/BackButton";
import { useSubscriptionRules } from '../../utils/useSubscriptionRules';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useFocusEffect } from '@react-navigation/native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const MiPerfilEmpresa = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { rules, loading: subscriptionLoading } = useSubscriptionRules();
  const { refreshSubscriptionLevel } = useSubscription();

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



  useEffect(() => {
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

    fetchOffers();
  }, []);

  const canCreateNewOffer = () => {
    const activeOffersCount = offers.filter((offer) => offer.estado === 'ABIERTA').length;
    return activeOffersCount < rules.maxActiveOffers;
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
                source={user.foto ? { uri: user.foto } : defaultImage}
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
                {!canCreateNewOffer() && (
                  <>
                    <Text style={styles.limitMessage}>
                      Has alcanzado tu límite de{'\n'}
                      ofertas abiertas ({rules.maxActiveOffers}).{'\n'}
                      ¿Quieres más opciones? {'\n'}
                    </Text>
                  </>
                )}

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
            <Text style={styles.sectionTitle}>Mis Ofertas Abiertas</Text>
            {offers.length === 0 ? (
              <Text style={styles.info}>No hay ofertas abiertas</Text>
            ) : (
              <ScrollView>
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
        </View>
      </View>
    </ScrollView >
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
  },
});

export default MiPerfilEmpresa;
