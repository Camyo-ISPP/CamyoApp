import { router, useFocusEffect } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, StatusBar, TextInput, Image, ScrollView, Dimensions, Animated, Easing } from "react-native";
import colors from "frontend/assets/styles/colors";
import axios from 'axios';
import React, { useEffect, useState, useRef } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
const heroBackground = require("../../assets/images/lonely-road.jpg");
import { useAuth } from "../../contexts/AuthContext";
import Testimonios from "../_components/Testimonios";
import WebFooter from "../_components/_layout/WebFooter";
import { useSubscriptionRules } from '../../utils/useSubscriptionRules';
import ListadoOfertasPublicoSmall from "../_components/ListadoOfertasPublicoSmall";
import AdSense from "../_components/AdSense";
import MapLoader from "../_components/MapLoader";

const Index = () => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const { user, logout } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [isCompact, setIsCompact] = useState(Dimensions.get("window").width < 1040);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [offers, setOffers] = useState<any[]>([]);
  const { rules, loading: subscriptionLoading } = useSubscriptionRules();
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/ofertas/empresa/${user.id}`);
      setOffers(response.data.filter((offer: any) => offer.estado === "ABIERTA"));
    } catch (error) {
      console.error("Error al cargar las ofertas:", error);
    } finally {
      setLoadingOffers(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/ofertas/recientes`);
      setData(response.data);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user]);

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setLoadingOffers(true);
      setLoadingData(true);
      fetchOffers();
      fetchData();
    }, [user])
  );

  useEffect(() => {
    const updateSize = () => setIsCompact(Dimensions.get("window").width < 1040);
    Dimensions.addEventListener("change", updateSize);

    // Animación de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad)
    }).start();

    return () => Dimensions.removeEventListener("change", updateSize);
  }, []);

  const generalLoading = loadingOffers || loadingData || subscriptionLoading || !rules;

  if (generalLoading) {
    return (
      <View style={styles.loadingContainer}>
        <MapLoader />
      </View>
    );
  }

  const StatsSection = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <FontAwesome name="comments" size={32} color={colors.primary} />
        <Text style={styles.statNumber}>100%</Text>
        <Text style={styles.statLabel}>Feedback Real</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="chatbubbles" size={32} color={colors.primary} />
        <Text style={styles.statNumber}>Contacto</Text>
        <Text style={styles.statLabel}>Directo</Text>
      </View>
      <View style={styles.statItem}>
        <MaterialIcons name="local-shipping" size={32} color={colors.primary} />
        <Text style={styles.statNumber}>24/7</Text>
        <Text style={styles.statLabel}>Disponibilidad</Text>
      </View>
    </View>
  );

  const canCreateNewOffer = () => {
    const activeOffersCount = offers.filter((offer) => offer.estado === 'ABIERTA').length;
    return activeOffersCount < rules.maxActiveOffers;
  };

  const ofertasTrabajo = data.filter(item => item.tipoOferta === "TRABAJO");
  const ofertasCarga = data.filter(item => item.tipoOferta === "CARGA");

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
    <head>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4434133815240639"
     crossOrigin="anonymous"></script>
     </head>
      <View style={styles.webContainer}>
        <ScrollView style={styles.scrollview} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <Image source={heroBackground} style={styles.heroBackground} blurRadius={5} />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                {(!user || !user.rol)
                  ? "Donde los profesionales del transporte y las empresas se encuentran"
                  : `¡Bienvenido de nuevo, ${user.nombre}!`}
              </Text>
              <Text style={styles.heroSubtitle}>
                Conectamos el talento con las mejores oportunidades del sector
              </Text>

              <View style={styles.heroButtons}>
                {(!user || !user.rol) ? (
                  <>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/login")}>
                      <MaterialIcons name="login" size={20} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>Iniciar sesión</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/explorar")}>
                      <FontAwesome5 name="search" size={18} color="#f15025" style={{ marginRight: 8 }} />
                      <Text style={styles.secondaryButtonText}>Explorar ofertas</Text>
                    </TouchableOpacity>
                  </>
                ) : user.rol === "CAMIONERO" ? (
                  <>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/misofertas")}>
                      <FontAwesome5 name="briefcase" size={18} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>Mis ofertas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/explorar")}>
                      <FontAwesome5 name="search" size={18} color="#f15025" style={{ marginRight: 8 }} />
                      <Text style={styles.secondaryButtonText}>Explorar ofertas</Text>
                    </TouchableOpacity>
                  </>
                ) : user.rol === "EMPRESA" ? (
                  <>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/misofertas")}>
                      <FontAwesome5 name="briefcase" size={18} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>Mis ofertas</Text>
                    </TouchableOpacity>

                    {(!canCreateNewOffer()) ? (
                      <TouchableOpacity style={styles.mejorarPlanButton} onPress={() => router.push("/suscripcion")}>
                        <FontAwesome5 name="rocket" size={16} color="#f15025" style={styles.plusIcon} />
                        <Text style={styles.publishButtonText}>Mejorar mi plan</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/oferta/crear")}>
                        <MaterialIcons name="post-add" size={20} color="#f15025" style={{ marginRight: 8 }} />
                        <Text style={styles.secondaryButtonText}>Publicar nueva oferta</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/admin")}>
                    <FontAwesome5 name="wrench" size={18} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>Panel de Administración</Text>
                  </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => logout()}>
                      <MaterialIcons name="logout" size={20} color="#f15025" style={{ marginRight: 8 }} />
                      <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
                    </TouchableOpacity>
                  </>
                )}

              </View>
            </View>
          </View>

          {/* Stats Section */}
          <StatsSection />
          {(!user || user?.ads) && (
          <View style={styles.adContainer}>
            <Image
              source={require("../../assets/images/truck_mockup_ad.jpg")} // Replace with your ad image path
              style={styles.adImage}
              resizeMode="cover"
            />
          </View>
        )}

          {/* Ofertas Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ofertas Recientes</Text>
            <Text style={styles.sectionSubtitle}>Las mejores oportunidades del mercado</Text>

            <View style={styles.listaContainer}>
              {/* Columna de Carga */}
              <View style={styles.columna}>
                <View style={styles.columnaHeader}>
                  <FontAwesome5 name="route" size={24} color={colors.secondary} />
                  <Text style={styles.columnaTitulo}>Transporte de Carga</Text>
                </View>
                <ListadoOfertasPublicoSmall offers={ofertasCarga} showPromoted={true} />

              </View>

              {/* Columna de Trabajo */}
              <View style={styles.columna}>
                <View style={styles.columnaHeader}>
                  <MaterialIcons name="work" size={24} color={colors.secondary} />
                  <Text style={styles.columnaTitulo}>Ofertas de Trabajo</Text>
                </View>

                <ListadoOfertasPublicoSmall offers={ofertasTrabajo} showPromoted={true} />
              </View>
            </View>
          </View>

          {/* Testimonios */}
          <section style={{ fontFamily: 'inherit' }}>
            <Testimonios />
          </section>



          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>¿Listo para encontrar tu próxima oportunidad?</Text>

            {user ? (
              <Text style={styles.ctaSubtitle}>¡Bienvenido de nuevo, {user.nombre}!</Text>
            ) : (
              <Text style={styles.ctaSubtitle}>Regístrate ahora y accede a las mejores ofertas del sector</Text>
            )}

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => {
                if (!user) {
                  router.push("/registro");
                } else if (user.rol === "CAMIONERO") {
                  router.push("/explorar");
                } else if (user.rol === "EMPRESA") {
                  router.push("/misofertas");
                } else if (user.rol === "ADMIN") {
                  logout();
                }
              }}
            >
              <Text style={styles.ctaButtonText}>
                {!user
                  ? "Regístrate Gratis"
                  : user.rol === "CAMIONERO"
                    ? "Explorar Ofertas"
                    : user.rol === "EMPRESA"
                      ? "Ver Mis Ofertas"
                      : user.rol === "ADMIN"
                        ? "Cerrar Sesión"
                        : "Continuar"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Renderiza el anuncio */}
      <AdSense />
          <WebFooter />

        </ScrollView>
      </View >


    </Animated.View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white
  },
  webContainer: {
    flex: 1,
  },
  scrollview: {
    flex: 1,
  },

  /* Hero Section */
  heroContainer: {
    height: 600,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    width: '80%',
    maxWidth: 1200,
    zIndex: 2,
    padding: 20,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 22,
    color: colors.white,
    marginBottom: 30,
    opacity: 0.9,
    maxWidth: 600,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  mejorarPlanButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    backgroundColor: colors.white,
  },
  publishButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  plusIcon: {
    marginRight: 6,
  },
  /* Stats Section */
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 50,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginTop: -50,
    marginHorizontal: 40,
    borderRadius: 12,
    zIndex: 3,
  },
  statItem: {
    alignItems: 'center',
    padding: 15,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.secondary,
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
  },

  /* General Section */
  section: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 40,
  },

  /* Ofertas Section */
  listaContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    flexWrap: 'wrap',
  },
  columna: {
    width: '45%',
    minWidth: 350,
  },
  columnaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.lightGray,
  },
  columnaTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
    color: colors.secondary,
  },

  /* Card Oferta */
  card: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    transition: 'transform 0.3s ease',
    position: 'relative', // Para el badge de patrocinado
  },
  promotedCard: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  patrocinadoBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.secondary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  patrocinadoText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
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
  offerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 8,
  },
  offerCompany: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 5,
  },
  whiteTransition: {
    height: '4%',
    backgroundColor: colors.white,
    width: '100%',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  offerDetailsTagLicense: {
    fontSize: 12,
    backgroundColor: colors.secondary,
    color: colors.white,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontWeight: "bold",
    overflow: 'hidden',
  },
  offerDetailsTagExperience: {
    fontSize: 12,
    borderColor: colors.primary,
    borderWidth: 1,
    color: colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  localizacion: {
    fontSize: 14,
    color: "#696969",
    marginLeft: 5,
  },
  offerActions: {
    alignItems: 'center',
    marginLeft: 15,
  },
  offerSueldo: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 15,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  /* Testimonials */
  testimonialsSection: {
    backgroundColor: '#f5f7fa',
  },
  testimonialsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 20,
    marginHorizontal: 30,
  },
  testimonialCard: {
    backgroundColor: colors.white,
    padding: 25,
    borderRadius: 12,
    width: '30%',
    minWidth: 300,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.darkGray,
    lineHeight: 24,
    marginBottom: 15,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.secondary,
  },

  /* CTA Section */
  ctaSection: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 15,
  },
  ctaSubtitle: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
    maxWidth: 600,
  },
  ctaButton: {
    backgroundColor: colors.white,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },

  /* Mobile Styles */
  phoneContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: colors.mediumGray,
  },
  searchView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: "5%",
    paddingRight: 15,
    paddingLeft: 15,
    marginBottom: 20,
  },
  menuIcon: {
    marginRight: 10,
  },
  barraSuperior: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.lightGray,
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 50,
    borderColor: "transparent",
    marginRight: 3,
    outlineStyle: "none",
    flex: 1,
  },
  searchIcon: {
    color: colors.primary,
    marginRight: 10,
  },
  adContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    outlineColor: "black",
    outlineStyle: "solid",
  },
  adImage: {
    width: "100%", // Adjust width as needed
    outlineColor: "black",
    outlineStyle: "solid",
  },

});

export default Index;
